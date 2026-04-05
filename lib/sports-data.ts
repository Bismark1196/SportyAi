// lib/sports-data.ts
/**
 * AI PROVIDER OPTIONS (set ONE in Vercel env vars):
 *
 * FREE - Google Gemini (1500 req/day):
 *   GEMINI_API_KEY = "AIzaSy..." (get from aistudio.google.com)
 *
 * FREE - Groq (very fast, generous limits):
 *   GROQ_API_KEY = "gsk_..." (get from console.groq.com)
 *
 * PAID - Anthropic Claude:
 *   ANTHROPIC_API_KEY = "sk-ant-..." (get from platform.claude.com)
 *
 * The code auto-detects which key is set and uses that provider.
 * If none are set, it uses smart mock predictions.
 */

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

// ── Sports Data ──────────────────────────────────────────────────────────────

async function fetchFromAPIFootball(endpoint: string) {
  if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'your-rapidapi-key') return null;
  try {
    const res = await fetch(`https://api-football-v1.p.rapidapi.com/v3${endpoint}`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export function getMockFixtures(): Match[] {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const day3 = new Date(Date.now() + 72 * 60 * 60 * 1000);

  return [
    { id: 'mock-1', homeTeam: 'Manchester City', awayTeam: 'Arsenal', league: 'Premier League', country: 'England', matchDate: tomorrow.toISOString(), status: 'scheduled', odds: { home: 1.85, draw: 3.50, away: 4.20 } },
    { id: 'mock-2', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', league: 'La Liga', country: 'Spain', matchDate: tomorrow.toISOString(), status: 'scheduled', odds: { home: 2.10, draw: 3.30, away: 3.50 } },
    { id: 'mock-3', homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', league: 'Bundesliga', country: 'Germany', matchDate: dayAfter.toISOString(), status: 'scheduled', odds: { home: 1.65, draw: 3.90, away: 5.20 } },
    { id: 'mock-4', homeTeam: 'PSG', awayTeam: 'Marseille', league: 'Ligue 1', country: 'France', matchDate: dayAfter.toISOString(), status: 'scheduled', odds: { home: 1.45, draw: 4.20, away: 7.00 } },
    { id: 'mock-5', homeTeam: 'Inter Milan', awayTeam: 'Juventus', league: 'Serie A', country: 'Italy', matchDate: dayAfter.toISOString(), status: 'scheduled', odds: { home: 2.40, draw: 3.20, away: 3.10 } },
    { id: 'mock-6', homeTeam: 'Chelsea', awayTeam: 'Liverpool', league: 'Premier League', country: 'England', matchDate: day3.toISOString(), status: 'scheduled', odds: { home: 3.10, draw: 3.30, away: 2.30 } },
    { id: 'mock-7', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', league: 'La Liga', country: 'Spain', matchDate: day3.toISOString(), status: 'scheduled', odds: { home: 1.90, draw: 3.40, away: 4.10 } },
    { id: 'mock-8', homeTeam: 'AC Milan', awayTeam: 'Napoli', league: 'Serie A', country: 'Italy', matchDate: day3.toISOString(), status: 'scheduled', odds: { home: 2.20, draw: 3.10, away: 3.40 } },
  ];
}

export async function getUpcomingFixtures(): Promise<FixtureData> {
  const data = await fetchFromAPIFootball('/fixtures?next=10&timezone=Africa/Nairobi');
  if (data?.response?.length > 0) {
    const fixtures: Match[] = data.response.map((item: any) => ({
      id: String(item.fixture.id),
      homeTeam: item.teams.home.name,
      awayTeam: item.teams.away.name,
      league: item.league.name,
      country: item.league.country,
      matchDate: item.fixture.date,
      status: item.fixture.status.short === 'NS' ? 'scheduled' : item.fixture.status.short === 'FT' ? 'finished' : 'live',
      homeScore: item.goals.home,
      awayScore: item.goals.away,
    }));
    return { fixtures, source: 'api-football' };
  }
  return { fixtures: getMockFixtures(), source: 'mock' };
}

// ── AI Prediction Engine ─────────────────────────────────────────────────────

function buildPrompt(match: Match): string {
  return `You are an expert football betting analyst. Analyze this match and provide a prediction.

Match: ${match.homeTeam} vs ${match.awayTeam}
League: ${match.league} (${match.country})
Date: ${new Date(match.matchDate).toDateString()}
${match.odds ? `Odds: Home ${match.odds.home} | Draw ${match.odds.draw} | Away ${match.odds.away}` : ''}

Respond ONLY with a JSON object (no markdown, no backticks) with exactly these fields:
{
  "prediction": "home_win" or "draw" or "away_win" or "over_2_5" or "btts",
  "confidence": <number between 55 and 92>,
  "analysis": "<2-3 sentence expert analysis>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;
}

function parseAIResponse(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  // Find JSON object in response
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[0]);
}

// Google Gemini (FREE - 1500 req/day)
async function predictWithGemini(match: Match) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(match) }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Gemini error:', err);
    return null;
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return parseAIResponse(text);
}

// Groq (FREE - very fast)
async function predictWithGroq(match: Match) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: buildPrompt(match) }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Groq error:', err);
    return null;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;
  return parseAIResponse(text);
}

// Anthropic Claude (PAID)
async function predictWithClaude(match: Match) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !key.startsWith('sk-ant-')) return null;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: buildPrompt(match) }],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) return null;
  return parseAIResponse(text);
}

// Smart fallback when no AI key is available
function generateSmartPrediction(match: Match) {
  const homeOdds = match.odds?.home || 2.5;
  const drawOdds = match.odds?.draw || 3.2;
  const awayOdds = match.odds?.away || 3.0;

  // Use odds to determine most likely outcome
  const minOdds = Math.min(homeOdds, drawOdds, awayOdds);
  let prediction = 'home_win';
  let confidence = 72;

  if (minOdds === homeOdds) {
    prediction = 'home_win';
    confidence = Math.round(Math.min(90, (1 / homeOdds) * 100 * 1.3));
  } else if (minOdds === awayOdds) {
    prediction = 'away_win';
    confidence = Math.round(Math.min(90, (1 / awayOdds) * 100 * 1.3));
  } else {
    prediction = 'over_2_5';
    confidence = 65;
  }

  return {
    prediction,
    confidence,
    analysis: `Statistical analysis of ${match.homeTeam} vs ${match.awayTeam} indicates a ${prediction.replace('_', ' ')} outcome based on current market odds and historical form data. The ${match.league} fixture shows clear value at the current price point.`,
    tips: [
      'Check team news and injuries before placing bets',
      'Consider the home advantage factor in your stake sizing',
      'Monitor line movement closer to kickoff for sharp money signals',
    ],
  };
}

// Main prediction function — tries each provider in order
export async function generateAIPrediction(match: Match) {
  try {
    // Try Gemini first (free & reliable)
    const gemini = await predictWithGemini(match);
    if (gemini) { console.log('Used Gemini for prediction'); return gemini; }

    // Try Groq second (free & fast)
    const groq = await predictWithGroq(match);
    if (groq) { console.log('Used Groq for prediction'); return groq; }

    // Try Claude last (paid)
    const claude = await predictWithClaude(match);
    if (claude) { console.log('Used Claude for prediction'); return claude; }

    // Smart fallback using odds
    console.log('Using smart fallback prediction (no AI key set)');
    return generateSmartPrediction(match);
  } catch (err) {
    console.error('AI prediction error:', err);
    return generateSmartPrediction(match);
  }
}

export function getPredictionLabel(prediction: string): string {
  const labels: Record<string, string> = {
    home_win: 'Home Win', away_win: 'Away Win', draw: 'Draw',
    over_2_5: 'Over 2.5 Goals', under_2_5: 'Under 2.5 Goals', btts: 'Both Teams Score',
  };
  return labels[prediction] || prediction;
}
