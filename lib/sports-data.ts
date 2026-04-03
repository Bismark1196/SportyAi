// lib/sports-data.ts

export type PredictionType =
  | 'home_win'
  | 'away_win'
  | 'draw'
  | 'over_2_5'
  | 'under_2_5';

export interface FixtureMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchDate: string;
  odds?: {
    home?: number;
    away?: number;
    draw?: number;
  };
}

// ✅ FIX: Accept correct type (NOT old Match)
export async function generateAIPrediction(match: FixtureMatch) {
  // 🔥 Simple AI logic (replace later with real AI)
  const random = Math.random();

  let prediction: PredictionType = 'draw';
  if (random > 0.66) prediction = 'home_win';
  else if (random > 0.33) prediction = 'away_win';

  return {
    prediction,
    confidence: Math.floor(Math.random() * 30) + 70, // 70–100%
    analysis: `${match.homeTeam} vs ${match.awayTeam} looks competitive. AI favors ${prediction}.`,
  };
}

// ✅ Mock fixtures (replace with real API later)
export async function getUpcomingFixtures() {
  const fixtures: FixtureMatch[] = [
    {
      id: '1',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      league: 'EPL',
      matchDate: new Date().toISOString(),
      odds: { home: 1.8, away: 2.5, draw: 3.2 },
    },
    {
      id: '2',
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      league: 'La Liga',
      matchDate: new Date().toISOString(),
      odds: { home: 2.1, away: 2.2, draw: 3.0 },
    },
  ];

  return { fixtures, source: 'mock' };
}