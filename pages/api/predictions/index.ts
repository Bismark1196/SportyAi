import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { getUpcomingFixtures, generateAIPrediction } from '../../../lib/sports-data';
import prisma from '../../../lib/prisma';

// ✅ Strong types
type PredictionType = 'home_win' | 'away_win' | 'draw' | 'over_2_5' | 'under_2_5';

interface FixtureMatch {
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

  // 🔐 Auth check
  const token = req.cookies['betai_token'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = await verifyToken(token);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // 📅 Today range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1️⃣ Get stored predictions
    const stored = await prisma.prediction.findMany({
      where: {
        isPublished: true,
        createdAt: { gte: today, lt: tomorrow },
      },
      orderBy: [{ confidence: 'desc' }, { createdAt: 'desc' }],
    });

    if (stored.length > 0) {
      const stats = await getStats();
      return res.status(200).json({
        predictions: stored,
        stats,
        source: 'database',
      });
    }

    // 2️⃣ Fetch fixtures
    const { fixtures, source } = await getUpcomingFixtures() as {
      fixtures: FixtureMatch[];
      source: string;
    };

    if (!fixtures || fixtures.length === 0) {
      return res.status(200).json({
        predictions: [],
        stats: await getStats(),
        source: 'none',
      });
    }

    // ⚡ Limit for performance
    const matchesToAnalyze = fixtures.slice(0, 8);

    // 3️⃣ Generate AI predictions
    const predictionsData = await Promise.all(
      matchesToAnalyze.map(async (match) => {
        const ai = (await generateAIPrediction(match)) as AIPrediction;

        // ✅ Safe odds selection
        let selectedOdds: number | null = null;

        if (match.odds) {
          if (ai.prediction === 'home_win') {
            selectedOdds = match.odds.home ?? null;
          } else if (ai.prediction === 'away_win') {
            selectedOdds = match.odds.away ?? null;
          } else {
            selectedOdds = match.odds.draw ?? null;
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
          odds: selectedOdds,
          aiAnalysis: ai.analysis,
          result: null,
          isPublished: true,
        };
      })
    );

    // 4️⃣ Save to DB
    await prisma.prediction.createMany({
      data: predictionsData,
      skipDuplicates: true,
    });

    // 5️⃣ Fetch saved predictions
    const saved = await prisma.prediction.findMany({
      where: {
        isPublished: true,
        createdAt: { gte: today, lt: tomorrow },
      },
      orderBy: { confidence: 'desc' },
    });

    // 6️⃣ Attach tips (not stored in DB)
    const withTips = saved.map((p, i) => ({
      ...p,
      tips: matchesToAnalyze[i]
        ? [
            'Verify team news before betting',
            'Check recent form and injuries',
            'Consider home vs away performance',
          ]
        : [],
    }));

    const stats = await getStats();

    return res.status(200).json({
      predictions: withTips,
      stats,
      source,
    });
  } catch (error) {
    console.error('Predictions API error:', error);
    return res.status(500).json({
      message: 'Failed to load predictions',
    });
  }
}

// 📊 Stats helper
async function getStats() {
  const total = await prisma.prediction.count();

  const won = await prisma.prediction.count({
    where: { result: 'won' },
  });

  const settled = await prisma.prediction.count({
    where: {
      result: { in: ['won', 'lost'] },
    },
  });

  return {
    totalPredictions: total,
    winRate: settled > 0 ? Math.round((won / settled) * 100) : 74,
    settledPredictions: settled,
  };
}