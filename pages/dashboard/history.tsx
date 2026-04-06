// pages/dashboard/history.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { getSession } from '../../lib/auth';

interface HistoryProps { predictions: any[]; user: { name: string; role: string }; }

const LABELS: Record<string, string> = {
  home_win: 'Home Win', away_win: 'Away Win', draw: 'Draw',
  over_2_5: 'Over 2.5', under_2_5: 'Under 2.5', btts: 'Both Teams Score',
};

export default function HistoryPage({ predictions, user }: HistoryProps) {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');

  const filtered = filter === 'all' ? predictions
    : filter === 'pending' ? predictions.filter(p => !p.result)
    : predictions.filter(p => p.result === filter);

  const counts = {
    won: predictions.filter(p => p.result === 'won').length,
    lost: predictions.filter(p => p.result === 'lost').length,
    pending: predictions.filter(p => !p.result).length,
  };

  const navItems = [
    { icon: '▦', label: 'Dashboard',  href: '/dashboard' },
    { icon: '📊', label: 'Statistics', href: '/dashboard/stats' },
    { icon: '📋', label: 'History',    href: '/dashboard/history', active: true },
    ...(user.role === 'ADMIN' ? [{ icon: '⚙️', label: 'Admin', href: '/admin' }] : []),
  ];

  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0f1a', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>
      {/* Ticker */}
      <div style={{ background: '#060b12', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 1.5rem', height: '36px', display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>
        {[{ label: 'Total', value: String(predictions.length), color: 'var(--text-secondary)' }, { label: 'Won', value: String(counts.won), color: '#34d399' }, { label: 'Lost', value: String(counts.lost), color: '#f87171' }, { label: 'Pending', value: String(counts.pending), color: '#fbbf24' }].map((t, i) => (
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
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>Prediction History</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{predictions.length} total predictions tracked</p>
          </div>

          {predictions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No history yet</div>
              <div style={{ fontSize: '0.82rem' }}>Predictions will appear here once results are settled.</div>
            </div>
          ) : (
            <>
              {/* Filter strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {([['all', predictions.length, 'var(--blue)'], ['won', counts.won, '#34d399'], ['lost', counts.lost, '#f87171'], ['pending', counts.pending, '#fbbf24']] as const).map(([f, v, c]) => (
                  <button key={f} onClick={() => setFilter(f as any)}
                    style={{ background: filter === f ? '#0c1420' : 'transparent', border: `1px solid ${filter === f ? c : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px', padding: '1rem', cursor: 'pointer', textAlign: 'left', outline: 'none', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: c, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{v}</div>
                    <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</div>
                  </button>
                ))}
              </div>

              {/* Table */}
              <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Match', 'League', 'Prediction', 'Confidence', 'Odds', 'Result', 'Date'].map(h => (
                        <th key={h} style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} style={{ transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.homeTeam}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>vs {p.awayTeam}</div>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{p.league}</td>
                        <td style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>{LABELS[p.prediction] || p.prediction}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '56px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${p.confidence}%`, background: p.confidence >= 80 ? '#34d399' : p.confidence >= 65 ? '#fbbf24' : '#f87171', borderRadius: '2px' }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{p.confidence}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#fbbf24', fontWeight: 600 }}>{p.odds ? Number(p.odds).toFixed(2) : '—'}</td>
                        <td style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem', borderRadius: '999px', display: 'inline-block', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', fontWeight: 600, ...(p.result === 'won' ? { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' } : p.result === 'lost' ? { background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' } : { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }) }}>
                            {p.result === 'won' ? '✓ Won' : p.result === 'lost' ? '✗ Lost' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(p.matchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No predictions in this category</div>}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const prisma = (await import('../../lib/prisma')).default;
  const [predictions, user] = await Promise.all([
    prisma.prediction.findMany({ orderBy: { matchDate: 'desc' }, take: 100 }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, role: true } }),
  ]);
  return { props: { predictions: JSON.parse(JSON.stringify(predictions)), user: { name: user?.name || '', role: user?.role || 'USER' } } };
};
