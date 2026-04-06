// pages/dashboard/index.tsx — Professional Sportsbook Dashboard with Bet Slip
import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { getSession } from '../../lib/auth';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const FILTERS = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'];

const PRED_LABELS: Record<string, { short: string; long: string }> = {
  home_win:  { short: '1',    long: 'Home Win' },
  draw:      { short: 'X',    long: 'Draw' },
  away_win:  { short: '2',    long: 'Away Win' },
  over_2_5:  { short: 'O2.5', long: 'Over 2.5 Goals' },
  under_2_5: { short: 'U2.5', long: 'Under 2.5 Goals' },
  btts:      { short: 'GG',   long: 'Both Teams Score' },
};

interface BetSlipItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  prediction: string;
  odds: number;
  stake: string;
}

interface Props { user: { name: string; email: string; role: string } }

export default function Dashboard({ user }: Props) {
  const [filter, setFilter] = useState('All');
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [slipOpen, setSlipOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data, isLoading, mutate } = useSWR('/api/predictions', fetcher, { refreshInterval: 300_000 });
  const predictions = data?.predictions || [];
  const stats = data?.stats || {};
  const filtered = filter === 'All' ? predictions : predictions.filter((p: any) => p.league === filter);

  const totalOdds = betSlip.reduce((acc, b) => acc * (b.odds || 1), 1);
  const totalStake = betSlip.reduce((acc, b) => acc + (parseFloat(b.stake) || 0), 0);
  const potentialWin = betSlip.length > 0 ? (totalStake * totalOdds) : 0;

  const addToBetSlip = (p: any) => {
    if (betSlip.find(b => b.id === p.id)) {
      setBetSlip(prev => prev.filter(b => b.id !== p.id));
    } else {
      setBetSlip(prev => [...prev, {
        id: p.id, homeTeam: p.homeTeam, awayTeam: p.awayTeam,
        league: p.league, prediction: p.prediction,
        odds: p.odds || 1.90, stake: '10',
      }]);
      setSlipOpen(true);
    }
  };

  const isInSlip = (id: string) => betSlip.some(b => b.id === id);

  const updateStake = (id: string, stake: string) => {
    setBetSlip(prev => prev.map(b => b.id === id ? { ...b, stake } : b));
  };

  const removeFromSlip = (id: string) => setBetSlip(prev => prev.filter(b => b.id !== id));

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const navItems = [
    { icon: '▦', label: 'Predictions', href: '/dashboard', active: true },
    { icon: '◎', label: 'Statistics',  href: '/dashboard/stats', active: false },
    { icon: '◐', label: 'History',     href: '/dashboard/history', active: false },
    ...(user.role === 'ADMIN' ? [{ icon: '⚙', label: 'Admin',  href: '/admin', active: false }] : []),
  ];

  const avgConf = predictions.length
    ? Math.round(predictions.reduce((a: number, p: any) => a + p.confidence, 0) / predictions.length)
    : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)', fontFamily: 'var(--font-body)', position: 'relative' }}>
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px', background: 'var(--bg-base)', borderRight: '1px solid var(--border)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column', padding: '0',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
      }} className="sidebar-desktop">
        {/* Logo bar */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.08em' }}>
            BET<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--accent)', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '999px', padding: '0.2rem 0.5rem' }}>
            <span className="live-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            LIVE
          </span>
        </div>

        {/* Nav */}
        <div style={{ padding: '1rem 0.75rem', flex: 1 }}>
          <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.5rem', marginBottom: '0.5rem' }}>Main Menu</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {navItems.map(item => (
              <Link key={item.label} href={item.href} className={`sidebar-item ${item.active ? 'active' : ''}`}>
                <span style={{ fontSize: '0.85rem', minWidth: '1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.5rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>Leagues</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {[
              { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
              { name: 'La Liga',         flag: '🇪🇸' },
              { name: 'Bundesliga',      flag: '🇩🇪' },
              { name: 'Serie A',         flag: '🇮🇹' },
              { name: 'Ligue 1',         flag: '🇫🇷' },
              { name: 'Champions Lg',    flag: '⭐' },
            ].map(l => (
              <button key={l.name} onClick={() => setFilter(l.name === 'Champions Lg' ? 'Champions League' : l.name)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                <span style={{ fontSize: '0.8rem' }}>{l.flag}</span>
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '0.875rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
            <div style={{ width: '1.875rem', height: '1.875rem', borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, fontFamily: 'var(--font-display)' }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'User'}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.625rem', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            ↗ Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, marginLeft: '220px', marginRight: slipOpen ? '300px' : '0', transition: 'margin-right 0.3s ease', position: 'relative', zIndex: 1, minHeight: '100vh' }} className="main-content">

        {/* Top bar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, height: '56px', background: 'rgba(2,4,8,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(v => !v)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem' }}>☰</button>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.06em', lineHeight: 1 }}>TODAY'S PREDICTIONS</h1>
              <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button onClick={() => { fetch('/api/predictions?refresh=1'); mutate(); }}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              ↺ Refresh
            </button>

            {/* Bet Slip Toggle */}
            <button onClick={() => setSlipOpen(v => !v)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', background: betSlip.length > 0 ? 'var(--accent)' : 'transparent', border: `1px solid ${betSlip.length > 0 ? 'var(--accent)' : 'var(--border)'}`, color: betSlip.length > 0 ? '#020408' : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: betSlip.length > 0 ? 700 : 400, transition: 'all 0.2s', fontFamily: betSlip.length > 0 ? 'var(--font-display)' : 'var(--font-body)', letterSpacing: betSlip.length > 0 ? '0.03em' : 0 }}>
              ◫ Bet Slip
              {betSlip.length > 0 && (
                <span style={{ background: '#020408', color: 'var(--accent)', borderRadius: '999px', padding: '0.05rem 0.4rem', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{betSlip.length}</span>
              )}
            </button>
          </div>
        </header>

        <div style={{ padding: '1.25rem 1.5rem', maxWidth: '1100px' }}>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { l: 'Win Rate',       v: `${stats.winRate || 74}%`,    c: 'var(--accent)',  icon: '◈' },
              { l: "Today's Tips",   v: String(predictions.length),   c: 'var(--blue)',    icon: '◎' },
              { l: 'Avg Confidence', v: avgConf ? `${avgConf}%` : '—', c: 'var(--gold)',   icon: '◐' },
              { l: 'Bet Slip',       v: betSlip.length > 0 ? `${betSlip.length} sel.` : 'Empty', c: betSlip.length > 0 ? 'var(--accent)' : 'var(--text-muted)', icon: '◫' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ padding: '0.875rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: s.c, fontSize: '0.8rem' }}>{s.icon}</span>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{s.l}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: s.c, letterSpacing: '-0.01em' }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }} className="scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                flexShrink: 0, padding: '0.35rem 0.875rem', borderRadius: '999px', fontSize: '0.72rem',
                fontFamily: 'var(--font-display)', letterSpacing: '0.04em', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', border: '1px solid',
                background: filter === f ? 'rgba(52,211,153,0.12)' : 'transparent',
                borderColor: filter === f ? 'var(--border-accent)' : 'var(--border)',
                color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
              }}>{f}</button>
            ))}
          </div>

          {/* Match grid */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div className="shimmer" style={{ height: '0.7rem', width: '35%' }} />
                  <div className="shimmer" style={{ height: '1.25rem', width: '70%' }} />
                  <div className="shimmer" style={{ height: '3rem', width: '100%', borderRadius: '8px' }} />
                  <div className="shimmer" style={{ height: '0.5rem', width: '100%' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }}>◈</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No predictions yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Click Refresh to generate today's AI predictions</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
              {filtered.map((p: any) => (
                <MatchCard key={p.id} p={p}
                  inSlip={isInSlip(p.id)}
                  expanded={expanded === p.id}
                  onToggleExpand={() => setExpanded(expanded === p.id ? null : p.id)}
                  onAddToSlip={() => addToBetSlip(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Bet Slip Panel ── */}
      <aside style={{
        width: '300px', background: 'var(--bg-base)', borderLeft: '1px solid var(--border)',
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        transform: slipOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Slip header */}
        <div style={{ padding: '0 1.25rem', height: '56px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em' }}>BET SLIP</span>
            {betSlip.length > 0 && (
              <span style={{ background: 'var(--accent)', color: '#020408', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{betSlip.length}</span>
            )}
          </div>
          <div style={{ display: 'flex', align: 'center', gap: '0.5rem' }}>
            {betSlip.length > 0 && (
              <button onClick={() => setBetSlip([])} style={{ fontSize: '0.7rem', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>CLEAR</button>
            )}
            <button onClick={() => setSlipOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
          </div>
        </div>

        {/* Slip items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem' }}>
          {betSlip.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.2 }}>◫</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                Click <strong style={{ color: 'var(--text-secondary)' }}>Add to Slip</strong> on any prediction to build your bet
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {betSlip.map(bet => (
                <div key={bet.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem', position: 'relative' }}>
                  <button onClick={() => removeFromSlip(bet.id)} style={{ position: 'absolute', top: '0.625rem', right: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1 }}>×</button>

                  <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{bet.league}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', paddingRight: '1.5rem' }}>{bet.homeTeam} vs {bet.awayTeam}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>{PRED_LABELS[bet.prediction]?.long || bet.prediction}</span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>{bet.odds.toFixed(2)}</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Stake (KES)</label>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <input type="number" min="1" value={bet.stake}
                        onChange={e => updateStake(bet.id, e.target.value)}
                        style={{ flex: 1, background: 'var(--bg-void)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem 0.625rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                      <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '6px', padding: '0.5rem 0.5rem', fontSize: '0.72rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                        = {((parseFloat(bet.stake) || 0) * bet.odds).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slip footer */}
        {betSlip.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem', flexShrink: 0 }}>
            {betSlip.length > 1 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Acca odds</span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)' }}>{totalOdds.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total stake</span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>KES {totalStake.toFixed(0)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.375rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Potential win</span>
                  <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>KES {potentialWin.toFixed(0)}</span>
                </div>
              </div>
            )}

            <button style={{ width: '100%', padding: '0.875rem', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#020408', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              PLACE BET{betSlip.length > 1 ? 'S' : ''} ({betSlip.length})
            </button>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              These are AI predictions, not financial advice. Bet responsibly.
            </p>
          </div>
        )}
      </aside>

      <style>{`
        @media (max-width: 1023px) {
          .sidebar-desktop { transform: translateX(-100%); }
          .main-content { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 1300px) {
          .main-content { margin-right: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function MatchCard({ p, inSlip, expanded, onToggleExpand, onAddToSlip }: {
  p: any; inSlip: boolean; expanded: boolean; onToggleExpand: () => void; onAddToSlip: () => void;
}) {
  const conf = p.confidence;
  const confColor = conf >= 80 ? 'var(--accent)' : conf >= 65 ? 'var(--gold)' : 'var(--red)';
  const pred = PRED_LABELS[p.prediction];
  const matchDate = new Date(p.matchDate);
  const isToday = matchDate.toDateString() === new Date().toDateString();
  const timeStr = matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = isToday ? 'Today' : matchDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="fade-up" style={{
      background: 'var(--bg-card)', border: `1px solid ${inSlip ? 'rgba(52,211,153,0.35)' : 'var(--border)'}`,
      borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s ease',
      boxShadow: inSlip ? '0 0 0 1px rgba(52,211,153,0.15)' : 'none',
    }}>
      {/* Match header */}
      <div style={{ padding: '0.875rem 1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.league}</span>
          </div>
          <div style={{ display: 'flex', align: 'center', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{dateStr} · {timeStr}</span>
          </div>
        </div>

        {/* Teams row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{p.homeTeam}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>HOME</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.375rem 0.625rem', background: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '0.7rem', fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>VS</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{p.awayTeam}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>AWAY</div>
          </div>
        </div>

        {/* Odds buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.375rem', marginBottom: '0.875rem' }}>
          {[
            { label: '1', sublabel: 'Home', val: p.odds?.home || (p.prediction === 'home_win' ? p.odds : null) },
            { label: 'X', sublabel: 'Draw', val: p.odds?.draw },
            { label: '2', sublabel: 'Away', val: p.odds?.away || (p.prediction === 'away_win' ? p.odds : null) },
          ].map((o, i) => {
            const isAI = (i === 0 && p.prediction === 'home_win') || (i === 1 && p.prediction === 'draw') || (i === 2 && p.prediction === 'away_win');
            return (
              <button key={o.label} onClick={onAddToSlip}
                style={{
                  padding: '0.5rem 0.375rem', borderRadius: '7px', border: `1px solid ${isAI ? 'rgba(52,211,153,0.4)' : 'var(--border)'}`,
                  background: isAI ? 'rgba(52,211,153,0.08)' : 'var(--bg-elevated)',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isAI ? 'rgba(52,211,153,0.4)' : 'var(--border)')}>
                <div style={{ fontSize: '0.62rem', color: isAI ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>{o.label}</div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isAI ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {o.val ? (typeof o.val === 'number' ? o.val.toFixed(2) : o.val) : '—'}
                </div>
                {isAI && <div style={{ fontSize: '0.55rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', marginTop: '0.15rem' }}>AI PICK</div>}
              </button>
            );
          })}
        </div>

        {/* Confidence */}
        <div style={{ marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>AI CONFIDENCE</span>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: confColor }}>{conf}%</span>
          </div>
          <div className="conf-bar">
            <div className="conf-bar-fill" style={{ width: `${conf}%`, background: confColor }} />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
        <button onClick={onAddToSlip} style={{
          flex: 1, padding: '0.625rem 1rem', background: inSlip ? 'rgba(52,211,153,0.08)' : 'transparent',
          border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.72rem',
          fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.06em',
          color: inSlip ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.15s',
        }}>
          {inSlip ? '✓ IN SLIP' : '+ ADD TO SLIP'}
        </button>
        <button onClick={onToggleExpand} style={{
          padding: '0.625rem 0.875rem', background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: '0.7rem', color: 'var(--text-muted)', transition: 'all 0.15s', fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
        }}>
          {expanded ? '▲ HIDE' : '▼ ANALYSIS'}
        </button>
      </div>

      {/* Expanded analysis */}
      {expanded && p.aiAnalysis && (
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '0.75rem' }}>{p.aiAnalysis}</p>
          {p.tips?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {p.tips.map((tip: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.05rem' }}>›</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
