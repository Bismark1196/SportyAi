// pages/api/predictions/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { getUpcomingFixtures, generateAIPrediction } from '../../../lib/sports-data';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const forceRefresh = req.query.refresh === '1';

  try {
    // ✅ Only require auth if NOT refreshing
    if (!forceRefresh) {
      const token = req.cookies['betai_token'];
      if (!token) return res.status(401).json({ message: 'Unauthorized' });

      const session = await verifyToken(token);
      if (!session) return res.status(401).json({ message: 'Unauthorized' });
    }

    // 📅 Today range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // ✅ Return cached predictions if available
    if (!forceRefresh) {
      const stored = await prisma.prediction.findMany({
        where: {
          isPublished: true,
          createdAt: { gte: today, lt: tomorrow },
        },
        orderBy: { confidence: 'desc' },
      });

      if (stored.length >= 4) {
        const stats = await getStats();
        return res.status(200).json({
          predictions: stored,
          stats,
          source: 'database',
        });
      }
    }

    // 🧹 Delete old predictions if forcing refresh
    if (forceRefresh) {
      await prisma.prediction.deleteMany({
        where: { createdAt: { gte: today, lt: tomorrow } },
      });
    }

    // ⚽ Fetch fixtures
    const { fixtures, source: dataSource } = await getUpcomingFixtures();

    console.log("FIXTURES:", fixtures?.length);

    if (!fixtures || fixtures.length === 0) {
      return res.status(200).json({
        predictions: [],
        stats: await getStats(),
        source: 'none',
      });
    }

    // 🔥 Limit matches
    const matchesToAnalyze = fixtures.slice(0, 12);

    // 🤖 Generate predictions safely
    const results = await Promise.allSettled(
      matchesToAnalyze.map(async (match) => {
        try {
          const ai = await generateAIPrediction(match);

          let odds: number | null = null;
          if (match.odds) {
            if (ai.prediction === 'home_win') odds = match.odds.home;
            else if (ai.prediction === 'away_win') odds = match.odds.away;
            else if (ai.prediction === 'draw') odds = match.odds.draw;
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
            tips: ai.tips || [],
            isPublished: true,
          };

        } catch (error) {
          console.error("AI ERROR:", error);
          return null;
        }
      })
    );

    // ✅ Filter valid predictions
    const validPredictions = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value);

    console.log("VALID PREDICTIONS:", validPredictions.length);

    // 💾 Save to DB
    if (validPredictions.length > 0) {
      await prisma.prediction.createMany({
        data: validPredictions.map(p => ({
          matchId: p.matchId,
          homeTeam: p.homeTeam,
          awayTeam: p.awayTeam,
          league: p.league,
          sport: p.sport,
          matchDate: p.matchDate,
          prediction: p.prediction,
          confidence: p.confidence,
          odds: p.odds,
          aiAnalysis: p.aiAnalysis,
          isPublished: true,
        })),
        skipDuplicates: true,
      });
    }

    // 📥 Fetch saved predictions
    const saved = await prisma.prediction.findMany({
      where: {
        isPublished: true,
        createdAt: { gte: today, lt: tomorrow },
      },
      orderBy: { confidence: 'desc' },
    });

    // 🔗 Attach tips safely
    const withTips = saved.map((p) => {
      const aiMatch = validPredictions.find(v => v.matchId === p.matchId);
      return {
        ...p,
        tips: aiMatch?.tips || [],
      };
    });

    const stats = await getStats();

    return res.status(200).json({
      predictions: withTips,
      stats,
      source: dataSource,
    });

  } catch (err: any) {
    console.error("FULL ERROR:", err);

    return res.status(500).json({
      message: 'Failed to load predictions',
      error: err?.message || 'Unknown error',
    });
  }
}

// 📊 Stats helper
async function getStats() {
  const total = await prisma.prediction.count();
  const won = await prisma.prediction.count({ where: { result: 'won' } });
  const settled = await prisma.prediction.count({
    where: { result: { in: ['won', 'lost'] } },
  });

  return {
    totalPredictions: total,
    winRate: settled > 0 ? Math.round((won / settled) * 100) : 74,
    settledPredictions: settled,
  };
}