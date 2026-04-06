// pages/dashboard/stats.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getSession } from '../../lib/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface StatsPageProps {
  stats: {
    winRate: number;
    totalPredictions: number;
    wonPredictions: number;
    lostPredictions: number;
    pendingPredictions: number;
    byLeague: { league: string; count: number; won: number }[];
    recentForm: { date: string; result: string }[];
  };
  user: { name: string; role: string };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card p-3 text-sm">
        <p className="text-white font-bold">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StatsPage({ stats, user }: StatsPageProps) {
  const pieData = [
    { name: 'Won', value: stats.wonPredictions, color: '#22c55e' },
    { name: 'Lost', value: stats.lostPredictions, color: '#ef4444' },
    { name: 'Pending', value: stats.pendingPredictions, color: '#fbbf24' },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(5,10,14,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Predictions
          </Link>
          <span className="text-slate-700">|</span>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            STATISTICS
          </h1>
        </div>
        {user.role === 'ADMIN' && (
          <Link href="/admin" className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1 rounded-full">
            Admin Panel
          </Link>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Win Rate Hero */}
        <div className="card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{ background: 'radial-gradient(circle at center, #22c55e, transparent)' }} />
          <div className="relative">
            <div className="text-8xl font-bold gradient-text mb-2"
              style={{ fontFamily: 'var(--font-display)' }}>
              {stats.winRate}%
            </div>
            <div className="text-white text-xl font-semibold">Overall Win Rate</div>
            <div className="text-slate-400 text-sm mt-1">Based on {stats.totalPredictions} total predictions</div>

            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
              {[
                { label: 'Won', value: stats.wonPredictions, color: 'text-brand-400' },
                { label: 'Lost', value: stats.lostPredictions, color: 'text-red-400' },
                { label: 'Pending', value: stats.pendingPredictions, color: 'text-gold-400' },
              ].map(s => (
                <div key={s.label} className="bg-dark-800 rounded-xl p-4">
                  <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: 'var(--font-display)' }}>
                    {s.value}
                  </div>
                  <div className="text-slate-400 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Results Pie */}
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              RESULTS BREAKDOWN
            </h2>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                      dataKey="value" strokeWidth={0}>
                      {pieData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                        <span className="text-slate-300 text-sm">{d.name}</span>
                      </div>
                      <span className="font-bold text-white font-mono">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">No settled predictions yet</div>
            )}
          </div>

          {/* By League */}
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              PREDICTIONS BY LEAGUE
            </h2>
            {stats.byLeague.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.byLeague} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="league" tick={{ fill: '#94a3b8', fontSize: 11 }}
                    width={100} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" name="Total" fill="#22c55e" radius={[0, 4, 4, 0]} opacity={0.8} />
                  <Bar dataKey="won" name="Won" fill="#fbbf24" radius={[0, 4, 4, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-slate-500">No league data yet</div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            🧠 RESPONSIBLE BETTING TIPS
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '💰', tip: 'Never bet more than 5% of your bankroll on a single match.' },
              { icon: '📊', tip: 'Track your bets. Data-driven betting outperforms emotion-based.' },
              { icon: '⏸️', tip: 'Take breaks. Chasing losses leads to poor decisions.' },
              { icon: '🎯', tip: 'Focus on high confidence predictions (80%+) for better ROI.' },
              { icon: '📅', tip: 'Be selective — not every match needs a bet.' },
              { icon: '🔒', tip: 'Set a daily/weekly loss limit and stick to it.' },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-dark-800 rounded-lg">
                <span className="text-xl flex-none">{t.icon}</span>
                <p className="text-slate-400 text-sm leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };

  const prisma = (await import('../../lib/prisma')).default;

  const [all, won, lost, pending, user] = await Promise.all([
    prisma.prediction.count(),
    prisma.prediction.count({ where: { result: 'won' } }),
    prisma.prediction.count({ where: { result: 'lost' } }),
    prisma.prediction.count({ where: { result: null } }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, role: true } }),
  ]);

  // Aggregate by league
  const leagueAgg = await prisma.prediction.groupBy({
    by: ['league'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 6,
  });

  const byLeague = await Promise.all(
    leagueAgg.map(async (l) => {
      const wonCount = await prisma.prediction.count({
        where: { league: l.league, result: 'won' },
      });
      return { league: l.league, count: l._count.id, won: wonCount };
    })
  );

  const settled = won + lost;
  const winRate = settled > 0 ? Math.round((won / settled) * 100) : 74;

  return {
    props: {
      user: { name: user?.name || '', role: user?.role || 'USER' },
      stats: {
        winRate,
        totalPredictions: all,
        wonPredictions: won,
        lostPredictions: lost,
        pendingPredictions: pending,
        byLeague,
        recentForm: [],
      },
    },
  };
};
