// pages/dashboard/index.tsx — Premium Dashboard
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { getSession } from '../../lib/auth';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const FILTERS = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'];

const PRED_LABELS: Record<string, string> = {
  home_win: 'Home Win', away_win: 'Away Win', draw: 'Draw',
  over_2_5: 'Over 2.5', under_2_5: 'Under 2.5', btts: 'BTTS',
};

interface Props { user: { name: string; email: string; role: string } }

export default function Dashboard({ user }: Props) {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR('/api/predictions', fetcher, { refreshInterval: 300_000 });
  const predictions = data?.predictions || [];
  const stats = data?.stats || {};

  const filtered = filter === 'All' ? predictions : predictions.filter((p: any) => p.league === filter);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleRefresh = async () => {
    await fetch('/api/predictions?refresh=1');
    mutate();
  };

  const navItems = [
    { icon: '◈', label: 'Predictions', href: '/dashboard', active: true },
    { icon: '◎', label: 'Statistics',  href: '/dashboard/stats' },
    { icon: '◐', label: 'History',     href: '/dashboard/history' },
    ...(user.role === 'ADMIN' ? [{ icon: '⚙', label: 'Admin Panel', href: '/admin', active: false }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)', fontFamily: 'var(--font-body)' }}>
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col" style={{ width: '240px', background: 'var(--bg-base)', borderRight: '1px solid var(--border)', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, padding: '1.5rem 1rem' }}>
        {/* Logo */}
        <div style={{ padding: '0.5rem 0 2rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em' }}>
            BET<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => (
            <Link key={item.label} href={item.href} className={`sidebar-item ${item.active ? 'active' : ''}`}>
              <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0, fontFamily: 'var(--font-display)' }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'User'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: '0.9rem' }}>→</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, marginLeft: '240px', position: 'relative', zIndex: 1 }} className="lg-margin">
        {/* Top bar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em' }}>TODAY'S PREDICTIONS</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handleRefresh} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ↻ Refresh
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '999px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <span className="live-dot" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--accent)' }}>AI LIVE</span>
            </div>
          </div>
        </header>

        <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Win Rate',       value: `${stats.winRate || 74}%`, icon: '◈', color: 'var(--accent)' },
              { label: "Today's Tips",   value: String(predictions.length), icon: '◎', color: 'var(--blue)' },
              { label: 'Avg Confidence', value: predictions.length ? `${Math.round(predictions.reduce((a: number, p: any) => a + p.confidence, 0) / predictions.length)}%` : '—', icon: '◐', color: 'var(--gold)' },
              { label: 'Status',         value: 'ACTIVE', icon: '◑', color: 'var(--accent)' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: s.color, fontSize: '1rem' }}>{s.icon}</span>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
                <div className="hero-display" style={{ fontSize: '1.75rem', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* League filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6" style={{ paddingBottom: '0.25rem' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  flexShrink: 0, padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                  background: filter === f ? 'rgba(52,211,153,0.12)' : 'transparent',
                  borderColor: filter === f ? 'var(--border-accent)' : 'var(--border)',
                  color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                {f}
              </button>
            ))}
          </div>

          {/* Prediction grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="shimmer" style={{ height: '0.75rem', width: '40%' }} />
                  <div className="shimmer" style={{ height: '1.5rem', width: '80%' }} />
                  <div className="shimmer" style={{ height: '0.65rem', width: '60%' }} />
                  <div className="shimmer" style={{ height: '2.5rem', width: '100%', borderRadius: '8px' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◈</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI is analyzing matches...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Check back soon or refresh predictions</p>
              <button onClick={handleRefresh} className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.75rem 1.5rem' }}>↻ Refresh Now</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p: any) => (
                <PredictionCard key={p.id} p={p} expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @media (max-width: 1023px) { main { margin-left: 0 !important; } }
      `}</style>
    </div>
  );
}

function PredictionCard({ p, expanded, onToggle }: { p: any; expanded: boolean; onToggle: () => void }) {
  const conf = p.confidence;
  const confColor = conf >= 80 ? 'var(--accent)' : conf >= 65 ? 'var(--gold)' : 'var(--red)';
  const matchTime = new Date(p.matchDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const matchDate = new Date(p.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="fade-up glass glass-hover rounded-xl cursor-pointer" style={{ display: 'flex', flexDirection: 'column' }} onClick={onToggle}>
      <div style={{ padding: '1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.league}</span>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{matchDate} · {matchTime}</span>
        </div>

        {/* Teams */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{p.homeTeam}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Home</div>
          </div>
          <div style={{ padding: '0.375rem 0.625rem', background: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', flexShrink: 0 }}>VS</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{p.awayTeam}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Away</div>
          </div>
        </div>

        {/* Prediction row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.12)', borderRadius: '8px', padding: '0.625rem 0.875rem' }}>
            <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>AI Prediction</div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>{PRED_LABELS[p.prediction] || p.prediction}</div>
          </div>
          {p.odds && (
            <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px', padding: '0.625rem 0.875rem', textAlign: 'center', minWidth: '64px' }}>
              <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.7, marginBottom: '0.2rem' }}>Odds</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{typeof p.odds === 'number' ? p.odds.toFixed(2) : p.odds}</div>
            </div>
          )}
        </div>

        {/* Confidence */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Confidence</span>
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: confColor }}>{conf}%</span>
          </div>
          <div className="conf-bar">
            <div className="conf-bar-fill" style={{ width: `${conf}%`, background: confColor }} />
          </div>
        </div>
      </div>

      {/* Expanded analysis */}
      {expanded && p.aiAnalysis && (
        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border)', marginTop: '0' }}>
          <div style={{ paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.875rem' }}>{p.aiAnalysis}</p>
            {p.tips?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {p.tips.map((tip: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        {expanded ? '▲ Hide Analysis' : '▼ View AI Analysis'}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const prisma = (await import('../../lib/prisma')).default;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true, role: true, isActive: true } });
  if (!user || !user.isActive) return { redirect: { destination: '/auth/login', permanent: false } };
  return { props: { user: { name: user.name || '', email: user.email, role: user.role } } };
};
