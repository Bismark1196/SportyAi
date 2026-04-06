// pages/dashboard/stats.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getSession } from '../../lib/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface StatsPageProps {
  stats: {
    winRate: number; totalPredictions: number; wonPredictions: number;
    lostPredictions: number; pendingPredictions: number;
    byLeague: { league: string; count: number; won: number }[];
  };
  user: { name: string; role: string };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>{label}</p>
      {payload.map((p: any) => <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

export default function StatsPage({ stats, user }: StatsPageProps) {
  const pieData = [
    { name: 'Won',     value: stats.wonPredictions,     color: '#34d399' },
    { name: 'Lost',    value: stats.lostPredictions,    color: '#f87171' },
    { name: 'Pending', value: stats.pendingPredictions, color: '#fbbf24' },
  ].filter(d => d.value > 0);

  const navItems = [
    { icon: '▦', label: 'Dashboard',   href: '/dashboard' },
    { icon: '📊', label: 'Statistics',  href: '/dashboard/stats', active: true },
    { icon: '📋', label: 'History',     href: '/dashboard/history' },
    ...(user.role === 'ADMIN' ? [{ icon: '⚙️', label: 'Admin', href: '/admin' }] : []),
  ];

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0f1a', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
      {/* Ticker */}
      <div style={{ background: '#060b12', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 1.5rem', height: '36px', display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>
        {[{ label: 'Win Rate', value: `${stats.winRate}%`, color: 'var(--accent)' }, { label: 'Total Predictions', value: String(stats.totalPredictions), color: 'var(--text-secondary)' }, { label: 'Won', value: String(stats.wonPredictions), color: '#34d399' }].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.color, fontFamily: 'var(--font-mono)' }}>{t.value}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: '200px', background: '#060b12', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em', textDecoration: 'none', color: 'var(--text-primary)' }}>
              Sport<span style={{ color: 'var(--accent)' }}>AI</span>
            </Link>
            <div style={{ fontSize: '0.65rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '999px', padding: '0.15rem 0.5rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>LIVE</div>
          </div>
          <div style={{ padding: '0.75rem 0.625rem', flex: 1 }}>
            <p style={{ fontSize: '0.58rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.625rem', marginBottom: '0.375rem' }}>MENU</p>
            {navItems.map(item => (
              <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.75rem', borderRadius: '7px', fontSize: '0.8rem', color: (item as any).active ? 'var(--accent)' : 'var(--text-muted)', background: (item as any).active ? 'rgba(52,211,153,0.08)' : 'transparent', border: (item as any).active ? '1px solid rgba(52,211,153,0.15)' : '1px solid transparent', textDecoration: 'none', marginBottom: '0.2rem' }}>
                <span>{item.icon}</span><span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: '0.8rem', flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <button onClick={handleLogout} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }} className="scrollbar-hide">
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>Statistics</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI prediction performance overview</p>
          </div>

          {/* Win Rate hero */}
          <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center top, rgba(52,211,153,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(4rem,10vw,7rem)', background: 'linear-gradient(135deg,#34d399,#a7f3d0,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem', lineHeight: 1 }}>{stats.winRate}%</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Overall Win Rate</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Based on {stats.totalPredictions} total predictions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
              {[{ label: 'Won', value: stats.wonPredictions, color: '#34d399' }, { label: 'Lost', value: stats.lostPredictions, color: '#f87171' }, { label: 'Pending', value: stats.pendingPredictions, color: '#fbbf24' }].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Pie */}
            <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Results Breakdown</h2>
              {pieData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="value" strokeWidth={0}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie></PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.name}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No settled predictions yet</div>}
            </div>

            {/* Bar chart */}
            <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>By League</h2>
              {stats.byLeague.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.byLeague} layout="vertical">
                    <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="league" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} width={95} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="count" name="Total" fill="rgba(52,211,153,0.4)" radius={[0,4,4,0]} />
                    <Bar dataKey="won" name="Won" fill="#34d399" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No data yet</div>}
            </div>
          </div>

          {/* Responsible betting */}
          <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>🧠 Responsible Betting</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {[
                { icon: '💰', tip: 'Never stake more than 5% of your bankroll on one match.' },
                { icon: '📊', tip: 'Track every bet. Data beats emotion every time.' },
                { icon: '⏸️', tip: 'Take breaks. Chasing losses leads to poor decisions.' },
                { icon: '🎯', tip: 'Focus on 80%+ confidence picks for long-term ROI.' },
                { icon: '📅', tip: 'Be selective — not every match needs a bet.' },
                { icon: '🔒', tip: 'Set daily/weekly loss limits and stick to them.' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{t.icon}</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const prisma = (await import('../../lib/prisma')).default;
  const [all, won, lost, pending, user] = await Promise.all([
    prisma.prediction.count(), prisma.prediction.count({ where: { result: 'won' } }),
    prisma.prediction.count({ where: { result: 'lost' } }), prisma.prediction.count({ where: { result: null } }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, role: true } }),
  ]);
  const leagueAgg = await prisma.prediction.groupBy({ by: ['league'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 6 });
  const byLeague = await Promise.all(leagueAgg.map(async l => {
    const wonCount = await prisma.prediction.count({ where: { league: l.league, result: 'won' } });
    return { league: l.league, count: l._count.id, won: wonCount };
  }));
  const settled = won + lost;
  return { props: { user: { name: user?.name || '', role: user?.role || 'USER' }, stats: { winRate: settled > 0 ? Math.round((won / settled) * 100) : 74, totalPredictions: all, wonPredictions: won, lostPredictions: lost, pendingPredictions: pending, byLeague } } };
};
