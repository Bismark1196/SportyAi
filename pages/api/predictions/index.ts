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
    // 5-day window: today 00:00 → today+5 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const windowEnd = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Serve from DB if we have enough and not forcing refresh
    if (!forceRefresh) {
      const stored = await prisma.prediction.findMany({
        where: { isPublished: true, matchDate: { gte: today, lt: windowEnd } },
        orderBy: [{ matchDate: 'asc' }, { confidence: 'desc' }],
      });
      if (stored.length >= 4) {
        return res.status(200).json({ predictions: stored, stats: await getStats(), source: 'database' });
      }
    }

    // Wipe the window so upserts start fresh on refresh
    if (forceRefresh) {
      await prisma.prediction.deleteMany({ where: { matchDate: { gte: today, lt: windowEnd } } });
    }

    const { fixtures, source: dataSource } = await getUpcomingFixtures();
    if (fixtures.length === 0) {
      return res.status(200).json({ predictions: [], stats: await getStats(), source: 'none' });
    }

    // Generate predictions for up to 20 matches
    const results = await Promise.allSettled(
      fixtures.slice(0, 20).map(async (match) => {
        const ai = await generateAIPrediction(match);
        const homeOdds = match.odds?.home ?? null;
        const drawOdds = match.odds?.draw ?? null;
        const awayOdds = match.odds?.away ?? null;
        // AI-pick odds for single display
        const odds = ai.prediction === 'home_win' ? homeOdds
          : ai.prediction === 'away_win' ? awayOdds
          : ai.prediction === 'draw'     ? drawOdds
          : homeOdds;
        return {
          matchId: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam,
          league: match.league, sport: 'football',
          matchDate: new Date(match.matchDate),
          prediction: ai.prediction, confidence: ai.confidence,
          odds, homeOdds, drawOdds, awayOdds,
          aiAnalysis: ai.analysis,
          tips: ai.tips || [],   // ephemeral — not in schema
          isPublished: true,
        };
      })
    );

    const valid = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    // Upsert each prediction — matchId @unique prevents any duplicates
    const tipMap: Record<string, string[]> = {};
    for (const pred of valid) {
      tipMap[pred.matchId] = pred.tips;
      const { tips, ...data } = pred;
      await prisma.prediction.upsert({
        where:  { matchId: data.matchId },
        update: data,
        create: data,
      });
    }

    const saved = await prisma.prediction.findMany({
      where: { isPublished: true, matchDate: { gte: today, lt: windowEnd } },
      orderBy: [{ matchDate: 'asc' }, { confidence: 'desc' }],
    });

    const withTips = saved.map(p => ({ ...p, tips: tipMap[p.matchId] || [] }));
    return res.status(200).json({ predictions: withTips, stats: await getStats(), source: dataSource });
  } catch (err: any) {
    console.error('Predictions error:', err?.message);
    return res.status(500).json({ message: 'Failed to load predictions' });
  }
}

async function getStats() {
  const total   = await prisma.prediction.count();
  const won     = await prisma.prediction.count({ where: { result: 'won' } });
  const settled = await prisma.prediction.count({ where: { result: { in: ['won', 'lost'] } } });
  return { totalPredictions: total, winRate: settled > 0 ? Math.round((won / settled) * 100) : 74, settledPredictions: settled };
}
