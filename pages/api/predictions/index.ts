// pages/api/predictions/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { getUpcomingFixtures, generateAIPrediction } from '../../../lib/sports-data';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const token = req.cookies['betai_token'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const session = await verifyToken(token);
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const forceRefresh = req.query.refresh === '1';

  try {
    // Check for today's predictions in DB
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (!forceRefresh) {
      const stored = await prisma.prediction.findMany({
        where: { isPublished: true, createdAt: { gte: today, lt: tomorrow } },
        orderBy: { confidence: 'desc' },
      });

      if (stored.length >= 4) {
        const stats = await getStats();
        return res.status(200).json({ predictions: stored, stats, source: 'database' });
      }
    }

    // Delete stale predictions if refreshing
    if (forceRefresh) {
      await prisma.prediction.deleteMany({
        where: { createdAt: { gte: today, lt: tomorrow } },
      });
    }

    // Fetch fresh fixtures
    const { fixtures, source: dataSource } = await getUpcomingFixtures();

    if (fixtures.length === 0) {
      return res.status(200).json({ predictions: [], stats: await getStats(), source: 'none' });
    }

    // Generate AI predictions (limit to 12)
    const matchesToAnalyze = fixtures.slice(0, 12);
    const predictions = await Promise.allSettled(
      matchesToAnalyze.map(async (match) => {
        const ai = await generateAIPrediction(match);
        
        // Pick the right odds based on prediction
        let odds: number | null = null;
        if (match.odds) {
          if (ai.prediction === 'home_win') odds = match.odds.home;
          else if (ai.prediction === 'away_win') odds = match.odds.away;
          else if (ai.prediction === 'draw') odds = match.odds.draw;
          else odds = match.odds.home; // default
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
          odds: odds,
          aiAnalysis: ai.analysis,
          isPublished: true,
        };
      })
    );

    // Filter successful predictions
    const validPredictions = predictions
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    if (validPredictions.length > 0) {
      await prisma.prediction.createMany({ data: validPredictions, skipDuplicates: true });
    }

    // Fetch back from DB with IDs
    const saved = await prisma.prediction.findMany({
      where: { isPublished: true, createdAt: { gte: today, lt: tomorrow } },
      orderBy: { confidence: 'desc' },
    });

    // Attach tips
    const withTips = saved.map((p, i) => {
      const aiResult = validPredictions[i];
      return { ...p, tips: aiResult?.tips || [] };
    });

    const stats = await getStats();
    return res.status(200).json({ predictions: withTips, stats, source: dataSource });
  } catch (err: any) {
    console.error('Predictions error:', err?.message);
    return res.status(500).json({ message: 'Failed to load predictions' });
  }
}

async function getStats() {
  const total = await prisma.prediction.count();
  const won = await prisma.prediction.count({ where: { result: 'won' } });
  const settled = await prisma.prediction.count({ where: { result: { in: ['won', 'lost'] } } });
  return {
    totalPredictions: total,
    winRate: settled > 0 ? Math.round((won / settled) * 100) : 74,
    settledPredictions: settled,
  };
}
