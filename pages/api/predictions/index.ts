import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { getUpcomingFixtures, generateAIPrediction } from '../../../lib/sports-data';
import prisma from '../../../lib/prisma';

// ✅ Shared types
type PredictionType = 'home_win' | 'away_win' | 'draw' | 'over_2_5' | 'under_2_5';

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

interface AIPrediction {
  prediction: PredictionType;
  confidence: number;
  analysis: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 🔐 Auth
  const token = req.cookies['betai_token'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await verifyToken(token);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // 📅 Date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1️⃣ Check DB first
    const stored = await prisma.prediction.findMany({
      where: {
        isPublished: true,
        createdAt: { gte: today, lt: tomorrow },
      },
      orderBy: [{ confidence: 'desc' }, { createdAt: 'desc' }],
    });

    if (stored.length > 0) {
      return res.status(200).json({
        predictions: stored,
        stats: await getStats(),
        source: 'database',
      });
    }

    // 2️⃣ Fetch fixtures
    const { fixtures, source } = await getUpcomingFixtures();

    if (!fixtures || fixtures.length === 0) {
      return res.status(200).json({
        predictions: [],
        stats: await getStats(),
        source: 'none',
      });
    }

    const matchesToAnalyze = fixtures.slice(0, 8);

    // 3️⃣ Generate AI predictions
    const predictionsData = await Promise.all(
      matchesToAnalyze.map(async (match: FixtureMatch) => {
        const ai = await generateAIPrediction(match);

        let odds: number | null = null;

        if (match.odds) {
          if (ai.prediction === 'home_win') {
            odds = match.odds.home ?? null;
          } else if (ai.prediction === 'away_win') {
            odds = match.odds.away ?? null;
          } else {
            odds = match.odds.draw ?? null;
          }
        }

        return {
          matchId: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          league: match.league,
          sport: 'football',
          matchDate: new Date(match.matchDate),
          prediction: ai.prediction,
          confidence: ai.confidence,
          odds,
          aiAnalysis: ai.analysis,
          result: null,
          isPublished: true,
        };
      })
    );

    // 4️⃣ Save
    await prisma.prediction.createMany({
      data: predictionsData,
      skipDuplicates: true,
    });

    // 5️⃣ Fetch saved
    const saved = await prisma.prediction.findMany({
      where: {
        isPublished: true,
        createdAt: { gte: today, lt: tomorrow },
      },
      orderBy: { confidence: 'desc' },
    });

    // 6️⃣ Add tips
    const withTips = saved.map((p, i) => ({
      ...p,
      tips: matchesToAnalyze[i]
        ? [
            'Verify team news before betting',
            'Check injuries and suspensions',
            'Analyze last 5 matches form',
          ]
        : [],
    }));

    return res.status(200).json({
      predictions: withTips,
      stats: await getStats(),
      source,
    });
  } catch (error) {
    console.error('Predictions API error:', error);
    return res.status(500).json({ message: 'Failed to load predictions' });
  }
}

// 📊 Stats
async function getStats() {
  const total = await prisma.prediction.count();

  const won = await prisma.prediction.count({
    where: { result: 'won' },
  });

  const settled = await prisma.prediction.count({
    where: { result: { in: ['won', 'lost'] } },
  });

  return {
    totalPredictions: total,
    winRate: settled > 0 ? Math.round((won / settled) * 100) : 74,
    settledPredictions: settled,
  };
}