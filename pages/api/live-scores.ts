// pages/api/live-scores.ts
// Server-Sent Events endpoint — pushes live score updates to connected clients.
// Polls API-Football every 30s when games are live, 60s otherwise.
// Uses a shared in-memory cache so multiple browser tabs share one API call.

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../lib/auth';

// ── In-process cache shared across all SSE connections ───────────────────────
interface CachedScore {
  fixtureId:    number;
  homeTeam:     string;
  awayTeam:     string;
  league:       string;
  flag:         string;
  kickoff:      string;           // ISO
  statusShort:  string;           // NS, 1H, HT, 2H, ET, P, FT, AET, PEN
  statusLong:   string;
  elapsed:      number | null;    // minutes played, null if not started/finished
  homeScore:    number | null;
  awayScore:    number | null;
  homeEvents:   ScoreEvent[];
  awayEvents:   ScoreEvent[];
}

interface ScoreEvent {
  minute: number;
  type:   string;    // Goal, Card, subst
  player: string;
}

let cache: CachedScore[] = [];
let cacheTime = 0;
let activePoll: NodeJS.Timeout | null = null;
let activeConnections = 0;

// League → flag mapping
const LEAGUE_FLAGS: Record<number, string> = {
  39:  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', // Premier League
  140: '🇪🇸',          // La Liga
  78:  '🇩🇪',          // Bundesliga
  135: '🇮🇹',          // Serie A
  61:  '🇫🇷',          // Ligue 1
  2:   '⭐',           // UCL
  3:   '⭐',           // UEL
};

const TOP_LEAGUES = new Set([39, 140, 78, 135, 61, 2, 3]);

// ── Fetch today's fixtures + live scores from API-Football ───────────────────
async function fetchFromAPIFootball(): Promise<CachedScore[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key || key === 'your-rapidapi-key') return fetchFromFootballData();

  const today = new Date().toISOString().split('T')[0];

  try {
    const res = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}&timezone=Africa/Nairobi`,
      {
        headers: {
          'X-RapidAPI-Key':  key,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      }
    );
    if (!res.ok) throw new Error(`API-Football ${res.status}`);
    const data = await res.json();
    if (!data.response?.length) return [];

    return (data.response as any[])
      .filter(item => TOP_LEAGUES.has(item.league?.id))
      .map(item => ({
        fixtureId:   item.fixture.id,
        homeTeam:    item.teams.home.name,
        awayTeam:    item.teams.away.name,
        league:      item.league.name,
        flag:        LEAGUE_FLAGS[item.league.id] || '⚽',
        kickoff:     item.fixture.date,
        statusShort: item.fixture.status.short,
        statusLong:  item.fixture.status.long,
        elapsed:     item.fixture.status.elapsed ?? null,
        homeScore:   item.goals.home,
        awayScore:   item.goals.away,
        homeEvents:  (item.events || [])
          .filter((e: any) => e.team?.id === item.teams.home.id && e.type === 'Goal')
          .map((e: any) => ({ minute: e.time.elapsed, type: e.type, player: e.player.name })),
        awayEvents:  (item.events || [])
          .filter((e: any) => e.team?.id === item.teams.away.id && e.type === 'Goal')
          .map((e: any) => ({ minute: e.time.elapsed, type: e.type, player: e.player.name })),
      }));
  } catch (err) {
    console.error('[live-scores] API-Football error:', err);
    return fetchFromFootballData();
  }
}

// ── Fallback: football-data.org (free, no live scores but has today's matches) ─
async function fetchFromFootballData(): Promise<CachedScore[]> {
  const fdKey = process.env.FOOTBALL_DATA_API_KEY || '';
  const today = new Date().toISOString().split('T')[0];

  const comps = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL'];
  const flagMap: Record<string, string> = {
    PL: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', PD: '🇪🇸', BL1: '🇩🇪', SA: '🇮🇹', FL1: '🇫🇷', CL: '⭐',
  };
  const nameMap: Record<string, string> = {
    PL: 'Premier League', PD: 'La Liga', BL1: 'Bundesliga',
    SA: 'Serie A', FL1: 'Ligue 1', CL: 'Champions League',
  };

  const results: CachedScore[] = [];
  let i = 0;
  for (const comp of comps) {
    try {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${today}&dateTo=${today}`,
        { headers: { 'X-Auth-Token': fdKey } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const m of (data.matches || [])) {
        const st = m.status;
        const statusShort =
          st === 'IN_PLAY' ? '1H' :
          st === 'HALFTIME' ? 'HT' :
          st === 'FINISHED' ? 'FT' :
          st === 'PAUSED' ? 'HT' : 'NS';
        results.push({
          fixtureId:   m.id,
          homeTeam:    m.homeTeam?.shortName || m.homeTeam?.name || 'Home',
          awayTeam:    m.awayTeam?.shortName || m.awayTeam?.name || 'Away',
          league:      nameMap[comp],
          flag:        flagMap[comp],
          kickoff:     m.utcDate,
          statusShort,
          statusLong:  st,
          elapsed:     null,
          homeScore:   m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
          awayScore:   m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
          homeEvents:  [],
          awayEvents:  [],
        });
        i++;
      }
    } catch { continue; }
  }
  return results;
}

// ── Determine poll interval based on whether any game is live ────────────────
function getPollIntervalMs(scores: CachedScore[]): number {
  const liveStatuses = new Set(['1H', '2H', 'HT', 'ET', 'P', 'BT']);
  const hasLive = scores.some(s => liveStatuses.has(s.statusShort));
  return hasLive ? 30_000 : 60_000;
}

// ── Refresh cache ─────────────────────────────────────────────────────────────
async function refreshCache(): Promise<CachedScore[]> {
  const fresh = await fetchFromAPIFootball();
  cache = fresh;
  cacheTime = Date.now();
  return fresh;
}

function getCacheAge(): number {
  return Date.now() - cacheTime;
}

// ── SSE handler ───────────────────────────────────────────────────────────────
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  // Auth check
  const token = req.cookies['betai_token'];
  if (!token) return res.status(401).end();
  const session = await verifyToken(token);
  if (!session) return res.status(401).end();

  // SSE headers
  res.setHeader('Content-Type',  'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  activeConnections++;

  const send = (type: string, payload: unknown) => {
    try {
      res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
    } catch { /* client disconnected */ }
  };

  // Send current cache immediately (or fetch if stale > 55s)
  const initial = getCacheAge() > 55_000 ? await refreshCache() : cache;
  send('scores', initial);
  send('connected', { connections: activeConnections });

  // Set up per-connection polling interval
  const tick = async () => {
    const maxAge = getPollIntervalMs(cache);
    if (getCacheAge() >= maxAge) {
      await refreshCache();
    }
    send('scores', cache);
  };

  const interval = setInterval(tick, 30_000);

  // Heartbeat to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { /* ok */ }
  }, 25_000);

  req.on('close', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
    activeConnections = Math.max(0, activeConnections - 1);
    res.end();
  });
}

export const config = { api: { bodyParser: false, responseLimit: false } };
