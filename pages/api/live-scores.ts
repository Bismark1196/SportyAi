// pages/api/live-scores.ts
// ─────────────────────────────────────────────────────────────────────────────
// Server-Sent Events (SSE) endpoint that streams live scores to the browser.
// Polls the sports API every 30s while games are live, 60s otherwise.
// A shared in-memory cache means all connected users share one API call.
// ─────────────────────────────────────────────────────────────────────────────

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../lib/auth';

// ── In-memory cache (shared across connections) ───────────────────────────────
let cachedData: LiveData | null = null;
let lastFetch = 0;
const CACHE_TTL_LIVE     = 30_000;  // 30s when games are live
const CACHE_TTL_IDLE     = 60_000;  // 60s when nothing is live
const POLL_LIVE          = 30_000;  // client poll interval when live
const POLL_IDLE          = 60_000;  // client poll interval when idle

export interface LiveFixture {
  id: string;
  league: string;
  flag: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;          // elapsed minutes, null if not started
  statusCode: string;             // 'NS', '1H', 'HT', '2H', 'ET', 'FT', 'AET', 'PEN'
  statusLabel: string;            // human-readable: "45'", "HT", "FT", "19:30"
  kickoffISO: string;             // original kickoff UTC ISO string
  isLive: boolean;
  isFinished: boolean;
}

interface LiveData {
  fixtures: LiveFixture[];
  hasLive: boolean;
  fetchedAt: number;
  source: string;
}

// ── Flag / league helpers ─────────────────────────────────────────────────────
function leagueFlag(leagueName: string): string {
  const n = leagueName.toLowerCase();
  if (n.includes('premier') || n.includes('england'))  return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (n.includes('la liga') || n.includes('spain'))    return '🇪🇸';
  if (n.includes('bundesliga') || n.includes('germany')) return '🇩🇪';
  if (n.includes('serie a') || n.includes('italy'))    return '🇮🇹';
  if (n.includes('ligue 1') || n.includes('france'))   return '🇫🇷';
  if (n.includes('champions'))                          return '⭐';
  if (n.includes('europa'))                             return '🟠';
  if (n.includes('portugal'))                           return '🇵🇹';
  if (n.includes('netherlands') || n.includes('eredivisie')) return '🇳🇱';
  return '🌍';
}

function statusMeta(code: string, elapsed: number | null, kickoffISO: string) {
  switch (code) {
    case '1H': return { label: elapsed ? `${elapsed}'` : '1H', isLive: true,     isFinished: false };
    case 'HT': return { label: 'HT',                           isLive: false,    isFinished: false };
    case '2H': return { label: elapsed ? `${elapsed}'` : '2H', isLive: true,     isFinished: false };
    case 'ET': return { label: elapsed ? `${elapsed}'` : 'ET', isLive: true,     isFinished: false };
    case 'P':  return { label: 'PEN',                          isLive: true,     isFinished: false };
    case 'FT':
    case 'AET':
    case 'PEN': return { label: code,                          isLive: false,    isFinished: true  };
    case 'NS': {
      const kt = new Date(kickoffISO).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi',
      });
      return { label: kt, isLive: false, isFinished: false };
    }
    default:   return { label: code || '?', isLive: false, isFinished: false };
  }
}

// ── API-Football via RapidAPI — live + today's fixtures ──────────────────────
async function fetchFromAPIFootball(): Promise<LiveData | null> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key || key === 'your-rapidapi-key' || key === 'fb47539a3fmsheae35a1a14d4200p1fca10jsnf5c0d55bcecd') {
    // The key in the example is a placeholder — treat as missing
    return null;
  }

  const TOP_LEAGUE_IDS = [39, 140, 78, 135, 61, 2, 3]; // PL, La Liga, Bundesliga, Serie A, Ligue 1, UCL, UEL

  try {
    // 1) Live scores
    const liveRes = await fetch(
      'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all',
      {
        headers: {
          'X-RapidAPI-Key':  key,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      }
    );

    let liveItems: any[] = [];
    if (liveRes.ok) {
      const d = await liveRes.json();
      liveItems = (d.response || []).filter((i: any) => TOP_LEAGUE_IDS.includes(i.league?.id));
    }

    // 2) Today's scheduled fixtures
    const today = new Date().toISOString().slice(0, 10);
    const todayRes = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}&status=NS`,
      {
        headers: {
          'X-RapidAPI-Key':  key,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      }
    );

    let todayItems: any[] = [];
    if (todayRes.ok) {
      const d = await todayRes.json();
      todayItems = (d.response || []).filter((i: any) => TOP_LEAGUE_IDS.includes(i.league?.id));
    }

    // Merge (live first, avoid duplicates)
    const seen = new Set<number>();
    const all: any[] = [];
    for (const item of [...liveItems, ...todayItems]) {
      const fid = item.fixture?.id;
      if (fid && !seen.has(fid)) { seen.add(fid); all.push(item); }
    }

    const fixtures: LiveFixture[] = all.map((item: any) => {
      const code    = item.fixture?.status?.short || 'NS';
      const elapsed = item.fixture?.status?.elapsed ?? null;
      const kick    = item.fixture?.date || new Date().toISOString();
      const { label, isLive, isFinished } = statusMeta(code, elapsed, kick);

      return {
        id:           `af-${item.fixture.id}`,
        league:       item.league?.name || '',
        flag:         leagueFlag(item.league?.name || ''),
        home:         item.teams?.home?.name || 'Home',
        away:         item.teams?.away?.name || 'Away',
        homeScore:    item.goals?.home ?? null,
        awayScore:    item.goals?.away ?? null,
        minute:       elapsed,
        statusCode:   code,
        statusLabel:  label,
        kickoffISO:   kick,
        isLive,
        isFinished,
      };
    });

    return {
      fixtures,
      hasLive: fixtures.some(f => f.isLive),
      fetchedAt: Date.now(),
      source: 'api-football',
    };
  } catch (e) {
    console.error('[live-scores] API-Football error:', e);
    return null;
  }
}

// ── football-data.org — free fallback ────────────────────────────────────────
async function fetchFromFootballData(): Promise<LiveData | null> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  // Works without a key (10 req/min anon) but better with one
  const headers: Record<string, string> = {};
  if (key) headers['X-Auth-Token'] = key;

  const COMP_IDS = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL'];
  const today    = new Date().toISOString().slice(0, 10);

  const allFixtures: LiveFixture[] = [];

  for (const comp of COMP_IDS) {
    try {
      const url = `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${today}&dateTo=${today}`;
      const res = await fetch(url, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.matches?.length) continue;

      for (const m of data.matches) {
        const rawStatus = m.status; // 'SCHEDULED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'TIMED'
        let code = 'NS';
        if (rawStatus === 'IN_PLAY')                     code = '1H';
        else if (rawStatus === 'PAUSED')                 code = 'HT';
        else if (rawStatus === 'FINISHED')               code = 'FT';
        else if (rawStatus === 'SCHEDULED' || rawStatus === 'TIMED') code = 'NS';

        const kick = m.utcDate || new Date().toISOString();
        const { label, isLive, isFinished } = statusMeta(code, null, kick);

        allFixtures.push({
          id:          `fd-${m.id}`,
          league:      m.competition?.name || comp,
          flag:        leagueFlag(m.competition?.name || comp),
          home:        m.homeTeam?.shortName || m.homeTeam?.name || 'Home',
          away:        m.awayTeam?.shortName || m.awayTeam?.name || 'Away',
          homeScore:   m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
          awayScore:   m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
          minute:      null,
          statusCode:  code,
          statusLabel: label,
          kickoffISO:  kick,
          isLive,
          isFinished,
        });
      }
    } catch { continue; }
  }

  if (allFixtures.length === 0) return null;

  return {
    fixtures: allFixtures,
    hasLive:  allFixtures.some(f => f.isLive),
    fetchedAt: Date.now(),
    source:   'football-data.org',
  };
}

// ── Smart mock for when no API keys are set ───────────────────────────────────
function getMockLiveData(): LiveData {
  const now  = new Date();
  const hour = now.getUTCHours();

  // Simulate something "live" in the evening (17-21 UTC = 20-00 EAT)
  const isEveningKO = hour >= 17 && hour <= 21;

  const fixtures: LiveFixture[] = [
    {
      id: 'mock-live-1', league: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      home: 'Arsenal', away: 'Bournemouth',
      homeScore: isEveningKO ? 1 : null, awayScore: isEveningKO ? 0 : null,
      minute: isEveningKO ? 67 : null,
      statusCode: isEveningKO ? '2H' : 'NS',
      statusLabel: isEveningKO ? "67'" : '14:30',
      kickoffISO: now.toISOString(),
      isLive: isEveningKO, isFinished: false,
    },
    {
      id: 'mock-live-2', league: 'La Liga', flag: '🇪🇸',
      home: 'FC Barcelona', away: 'Espanyol',
      homeScore: isEveningKO ? 2 : null, awayScore: isEveningKO ? 0 : null,
      minute: isEveningKO ? 58 : null,
      statusCode: isEveningKO ? '2H' : 'NS',
      statusLabel: isEveningKO ? "58'" : '19:30',
      kickoffISO: now.toISOString(),
      isLive: isEveningKO, isFinished: false,
    },
    {
      id: 'mock-live-3', league: 'Bundesliga', flag: '🇩🇪',
      home: 'FC St. Pauli', away: 'Bayern Munich',
      homeScore: isEveningKO ? 0 : null, awayScore: isEveningKO ? 3 : null,
      minute: isEveningKO ? 74 : null,
      statusCode: isEveningKO ? '2H' : 'NS',
      statusLabel: isEveningKO ? "74'" : '16:30',
      kickoffISO: now.toISOString(),
      isLive: isEveningKO, isFinished: false,
    },
    {
      id: 'mock-live-4', league: 'Champions League', flag: '⭐',
      home: 'PSG', away: 'Liverpool',
      homeScore: null, awayScore: null,
      minute: null,
      statusCode: 'NS',
      statusLabel: '21:00',
      kickoffISO: now.toISOString(),
      isLive: false, isFinished: false,
    },
  ];

  return {
    fixtures,
    hasLive: isEveningKO,
    fetchedAt: Date.now(),
    source: 'mock',
  };
}

// ── Cached fetcher ────────────────────────────────────────────────────────────
async function getLiveData(): Promise<LiveData> {
  const ttl = cachedData?.hasLive ? CACHE_TTL_LIVE : CACHE_TTL_IDLE;
  if (cachedData && Date.now() - lastFetch < ttl) {
    return cachedData;
  }

  let data: LiveData | null = null;

  // Try API-Football first
  data = await fetchFromAPIFootball();

  // Fall back to football-data.org
  if (!data) {
    data = await fetchFromFootballData();
  }

  // Fall back to mock
  if (!data) {
    data = getMockLiveData();
  }

  cachedData = data;
  lastFetch  = Date.now();
  return data;
}

// ── SSE handler ───────────────────────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth guard
  const token = req.cookies['betai_token'];
  if (!token) { res.status(401).end(); return; }
  const session = await verifyToken(token);
  if (!session) { res.status(401).end(); return; }

  // SSE headers
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering

  const send = (payload: object) => {
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      // @ts-ignore — flush is needed for some proxies
      if (typeof (res as any).flush === 'function') (res as any).flush();
    } catch { /* client disconnected */ }
  };

  // Send immediately on connect
  try {
    const data = await getLiveData();
    const pollInterval = data.hasLive ? POLL_LIVE : POLL_IDLE;
    send({ type: 'live', payload: data.fixtures, hasLive: data.hasLive, source: data.source, pollInterval });
  } catch (e) {
    send({ type: 'error', message: 'Failed to fetch live scores' });
  }

  // Poll and push
  const interval = setInterval(async () => {
    try {
      const data = await getLiveData();
      const pollInterval = data.hasLive ? POLL_LIVE : POLL_IDLE;
      send({ type: 'live', payload: data.fixtures, hasLive: data.hasLive, source: data.source, pollInterval });
    } catch {
      send({ type: 'error', message: 'Poll error' });
    }
  }, POLL_LIVE); // check every 30s; cache decides if real fetch needed

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}

// IMPORTANT: disable body parser for SSE
export const config = { api: { bodyParser: false } };