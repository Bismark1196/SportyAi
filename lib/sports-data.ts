// lib/sports-data.ts
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  matchDate: string;
  status: 'scheduled' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  odds?: { home: number; draw: number; away: number };
}

export interface FixtureData {
  fixtures: Match[];
  source: string;
}

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getDateStr(daysAhead: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

// ── Source 1: football-data.org ───────────────────────────────────────────────
const FOOTBALL_DATA_COMPETITIONS = {
  PL:  { id: 'PL',  name: 'Premier League',    country: 'England' },
  PD:  { id: 'PD',  name: 'La Liga',            country: 'Spain'   },
  BL1: { id: 'BL1', name: 'Bundesliga',          country: 'Germany' },
  SA:  { id: 'SA',  name: 'Serie A',             country: 'Italy'   },
  FL1: { id: 'FL1', name: 'Ligue 1',             country: 'France'  },
  CL:  { id: 'CL',  name: 'Champions League',    country: 'Europe'  },
};

async function fetchFootballData(): Promise<Match[]> {
  try {
    const dateFrom = getTodayStr();
    const dateTo   = getDateStr(4);
    const all: Match[] = [];
    for (const comp of Object.values(FOOTBALL_DATA_COMPETITIONS)) {
      try {
        const url = `https://api.football-data.org/v4/competitions/${comp.id}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED,TIMED,IN_PLAY`;
        const res = await fetch(url, { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '' } });
        if (!res.ok) continue;
        const data = await res.json();
        if (!data.matches?.length) continue;
        for (const m of data.matches) {
          all.push({
            id: `fd-${m.id}`,
            homeTeam: m.homeTeam?.shortName || m.homeTeam?.name || 'Home',
            awayTeam: m.awayTeam?.shortName || m.awayTeam?.name || 'Away',
            league: comp.name, country: comp.country,
            matchDate: m.utcDate,
            status: m.status === 'IN_PLAY' ? 'live' : m.status === 'FINISHED' ? 'finished' : 'scheduled',
            homeScore: m.score?.fullTime?.home ?? undefined,
            awayScore: m.score?.fullTime?.away ?? undefined,
          });
        }
      } catch { continue; }
    }
    return all;
  } catch { return []; }
}

// ── Source 2: API-Football via RapidAPI ───────────────────────────────────────
async function fetchAPIFootball(): Promise<Match[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key || key === 'your-rapidapi-key') return [];
  try {
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?from=${getTodayStr()}&to=${getDateStr(4)}&status=NS-1H-2H`;
    const res = await fetch(url, { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.response?.length) return [];
    const TOP = [39, 140, 78, 135, 61, 2, 3];
    return data.response.filter((i: any) => TOP.includes(i.league?.id)).map((item: any) => ({
      id: `af-${item.fixture.id}`,
      homeTeam: item.teams.home.name, awayTeam: item.teams.away.name,
      league: item.league.name, country: item.league.country,
      matchDate: item.fixture.date,
      status: item.fixture.status.short === 'NS' ? 'scheduled' : item.fixture.status.short === 'FT' ? 'finished' : 'live',
      homeScore: item.goals.home ?? undefined, awayScore: item.goals.away ?? undefined,
    }));
  } catch { return []; }
}

// ── Source 3: Smart mock — spread across today through day 4 ──────────────────
export function getMockFixtures(): Match[] {
  const fixtures = [
    // TODAY
    { home: 'Arsenal',          away: 'Chelsea',           league: 'Premier League',   country: 'England', day: 0, odds: { home: 2.10, draw: 3.40, away: 3.50 } },
    { home: 'Real Madrid',      away: 'Atletico Madrid',   league: 'La Liga',           country: 'Spain',   day: 0, odds: { home: 1.90, draw: 3.50, away: 4.20 } },
    { home: 'Bayern Munich',    away: 'RB Leipzig',        league: 'Bundesliga',        country: 'Germany', day: 0, odds: { home: 1.70, draw: 3.80, away: 5.00 } },
    { home: 'Inter Milan',      away: 'AC Milan',          league: 'Serie A',           country: 'Italy',   day: 0, odds: { home: 2.20, draw: 3.30, away: 3.30 } },
    { home: 'PSG',              away: 'Monaco',            league: 'Ligue 1',           country: 'France',  day: 0, odds: { home: 1.50, draw: 4.20, away: 6.50 } },
    // TOMORROW
    { home: 'Liverpool',        away: 'Manchester City',   league: 'Premier League',   country: 'England', day: 1, odds: { home: 2.80, draw: 3.30, away: 2.50 } },
    { home: 'Barcelona',        away: 'Sevilla',           league: 'La Liga',           country: 'Spain',   day: 1, odds: { home: 1.55, draw: 4.00, away: 6.00 } },
    { home: 'Bayer Leverkusen', away: 'Dortmund',          league: 'Bundesliga',        country: 'Germany', day: 1, odds: { home: 2.10, draw: 3.30, away: 3.60 } },
    { home: 'Juventus',         away: 'Napoli',            league: 'Serie A',           country: 'Italy',   day: 1, odds: { home: 2.40, draw: 3.20, away: 3.00 } },
    { home: 'Marseille',        away: 'Lyon',              league: 'Ligue 1',           country: 'France',  day: 1, odds: { home: 2.10, draw: 3.30, away: 3.60 } },
    // DAY 2
    { home: 'Tottenham',        away: 'Manchester Utd',    league: 'Premier League',   country: 'England', day: 2, odds: { home: 2.20, draw: 3.40, away: 3.20 } },
    { home: 'Newcastle',        away: 'Aston Villa',       league: 'Premier League',   country: 'England', day: 2, odds: { home: 2.00, draw: 3.50, away: 3.80 } },
    { home: 'Valencia',         away: 'Real Betis',        league: 'La Liga',           country: 'Spain',   day: 2, odds: { home: 2.30, draw: 3.20, away: 3.10 } },
    { home: 'Roma',             away: 'Lazio',             league: 'Serie A',           country: 'Italy',   day: 2, odds: { home: 2.30, draw: 3.20, away: 3.20 } },
    // DAY 3
    { home: 'Real Madrid',      away: 'Bayern Munich',     league: 'Champions League',  country: 'Europe',  day: 3, odds: { home: 2.00, draw: 3.50, away: 3.80 } },
    { home: 'Brighton',         away: 'West Ham',          league: 'Premier League',   country: 'England', day: 3, odds: { home: 2.20, draw: 3.30, away: 3.40 } },
    { home: 'Wolfsburg',        away: 'Frankfurt',         league: 'Bundesliga',        country: 'Germany', day: 3, odds: { home: 2.40, draw: 3.30, away: 2.90 } },
    // DAY 4
    { home: 'Arsenal',          away: 'PSG',               league: 'Champions League',  country: 'Europe',  day: 4, odds: { home: 2.40, draw: 3.30, away: 3.00 } },
    { home: 'Atletico Madrid',  away: 'Villarreal',        league: 'La Liga',           country: 'Spain',   day: 4, odds: { home: 1.80, draw: 3.60, away: 4.50 } },
    { home: 'Atalanta',         away: 'Fiorentina',        league: 'Serie A',           country: 'Italy',   day: 4, odds: { home: 2.00, draw: 3.40, away: 3.80 } },
  ];
  return fixtures.map((f, i) => {
    const d = new Date();
    d.setDate(d.getDate() + f.day);
    d.setHours(14 + (i % 7), [0, 15, 30, 45][i % 4], 0, 0);
    return { id: `mock-${i + 1}`, homeTeam: f.home, awayTeam: f.away, league: f.league, country: f.country, matchDate: d.toISOString(), status: 'scheduled' as const, odds: f.odds };
  });
}

// ── Main fetcher ──────────────────────────────────────────────────────────────
export async function getUpcomingFixtures(): Promise<FixtureData> {
  const apiFootball = await fetchAPIFootball();
  if (apiFootball.length >= 4) return { fixtures: apiFootball.slice(0, 20), source: 'api-football' };
  const footballData = await fetchFootballData();
  if (footballData.length >= 2) return { fixtures: footballData.slice(0, 20), source: 'football-data.org' };
  return { fixtures: getMockFixtures(), source: 'mock' };
}

// ── AI Prediction Engine ──────────────────────────────────────────────────────
function buildPrompt(match: Match): string {
  const dateStr = new Date(match.matchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return `You are an expert football betting analyst with deep knowledge of European football.

Analyze this upcoming match and provide a data-driven prediction:

Match: ${match.homeTeam} vs ${match.awayTeam}
Competition: ${match.league} (${match.country})
Date: ${dateStr}
${match.odds ? `Market Odds: Home ${match.odds.home} | Draw ${match.odds.draw} | Away ${match.odds.away}` : ''}

Consider: recent form, head-to-head record, home advantage, squad strength, league position, and any injury news you know about.

Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "prediction": "home_win" or "draw" or "away_win" or "over_2_5" or "btts",
  "confidence": <integer between 55 and 93>,
  "analysis": "<2-3 sentences of expert analysis>",
  "tips": ["<tactical tip>", "<betting tip>", "<value tip>"]
}`;
}

function parseAIResponse(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No JSON');
  return JSON.parse(m[0]);
}

async function predictWithGemini(match: Match) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.startsWith('AIza')) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: buildPrompt(match) }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 600 } }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? parseAIResponse(text) : null;
  } catch { return null; }
}

async function predictWithGroq(match: Match) {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'gsk_your-key-here') return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: buildPrompt(match) }], max_tokens: 600, temperature: 0.7 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    return text ? parseAIResponse(text) : null;
  } catch { return null; }
}

function generateSmartPrediction(match: Match) {
  const home = match.odds?.home || 2.5;
  const draw = match.odds?.draw || 3.2;
  const away = match.odds?.away || 3.0;
  const min = Math.min(home, draw, away);
  let prediction = 'home_win', confidence = 68;
  if (min === home && home < 2.0) { prediction = 'home_win'; confidence = Math.min(88, Math.round((1 / home) * 120)); }
  else if (min === away && away < 2.2) { prediction = 'away_win'; confidence = Math.min(82, Math.round((1 / away) * 115)); }
  else if (home >= 2.5 && away >= 2.5) { prediction = 'over_2_5'; confidence = 64; }
  else { prediction = 'home_win'; confidence = Math.min(78, Math.round((1 / home) * 110)); }
  const fav = home < away ? match.homeTeam : match.awayTeam;
  return {
    prediction, confidence,
    analysis: `${match.homeTeam} vs ${match.awayTeam} in the ${match.league} — statistical model projects ${prediction.replace(/_/g, ' ')} based on market odds and form. ${fav} hold the edge in this fixture.`,
    tips: ['Check team news 2h before kickoff', `${fav} are market favourites — monitor line movement`, 'Consider value in correct score markets'],
  };
}

export async function generateAIPrediction(match: Match) {
  try {
    return (await predictWithGemini(match)) || (await predictWithGroq(match)) || generateSmartPrediction(match);
  } catch { return generateSmartPrediction(match); }
}

export function getPredictionLabel(prediction: string): string {
  const labels: Record<string, string> = {
    home_win: 'Home Win', away_win: 'Away Win', draw: 'Draw',
    over_2_5: 'Over 2.5 Goals', under_2_5: 'Under 2.5 Goals', btts: 'Both Teams Score',
  };
  return labels[prediction] || prediction;
}
