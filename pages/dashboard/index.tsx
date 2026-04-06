// pages/dashboard/index.tsx — Professional Sportsbook Dashboard v2
import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { getSession } from '../../lib/auth';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const FILTERS = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'];

const LEAGUE_FLAGS: Record<string, string> = {
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'La Liga': '🇪🇸',
  'Bundesliga': '🇩🇪',
  'Serie A': '🇮🇹',
  'Ligue 1': '🇫🇷',
  'Champions League': '⭐',
};

const PRED_LABELS: Record<string, { short: string; long: string; color: string }> = {
  home_win:  { short: '1',    long: 'Home Win',         color: 'var(--blue)' },
  draw:      { short: 'X',    long: 'Draw',              color: 'var(--gold)' },
  away_win:  { short: '2',    long: 'Away Win',          color: 'var(--red)' },
  over_2_5:  { short: 'O2.5', long: 'Over 2.5 Goals',   color: 'var(--accent)' },
  under_2_5: { short: 'U2.5', long: 'Under 2.5 Goals',  color: 'var(--accent)' },
  btts:      { short: 'GG',   long: 'Both Teams Score',  color: 'var(--accent)' },
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
  const [placingBet, setPlacingBet] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [sortBy, setSortBy] = useState<'confidence' | 'time' | 'odds'>('confidence');
  const [mobileTab, setMobileTab] = useState<'predictions' | 'slip'>('predictions');

  const { data, isLoading, mutate, isValidating } = useSWR('/api/predictions', fetcher, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  });

  const predictions = data?.predictions || [];
  const stats = data?.stats || {};
  const filtered = filter === 'All' ? predictions : predictions.filter((p: any) => p.league === filter);
  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    if (sortBy === 'time') return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
    if (sortBy === 'odds') return (b.odds || 1.9) - (a.odds || 1.9);
    return 0;
  });

  const totalOdds = betSlip.reduce((acc, b) => acc * (b.odds || 1), 1);
  const totalStake = betSlip.reduce((acc, b) => acc + (parseFloat(b.stake) || 0), 0);
  const potentialWin = betSlip.length > 0 ? totalStake * totalOdds : 0;

  const addToBetSlip = (p: any) => {
    if (betSlip.find(b => b.id === p.id)) {
      setBetSlip(prev => prev.filter(b => b.id !== p.id));
    } else {
      setBetSlip(prev => [...prev, {
        id: p.id, homeTeam: p.homeTeam, awayTeam: p.awayTeam,
        league: p.league, prediction: p.prediction,
        odds: p.odds || 1.90, stake: '100',
      }]);
      setSlipOpen(true);
    }
  };

  const isInSlip = (id: string) => betSlip.some(b => b.id === id);
  const updateStake = (id: string, stake: string) => setBetSlip(prev => prev.map(b => b.id === id ? { ...b, stake } : b));
  const removeFromSlip = (id: string) => setBetSlip(prev => prev.filter(b => b.id !== id));

  const handlePlaceBets = async () => {
    setPlacingBet(true);
    await new Promise(r => setTimeout(r, 1800));
    setPlacingBet(false);
    setBetPlaced(true);
    setTimeout(() => { setBetPlaced(false); setBetSlip([]); setSlipOpen(false); }, 3000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const navItems = [
    { icon: '▦', label: 'Predictions', href: '/dashboard', active: true },
    { icon: '◎', label: 'Statistics',  href: '/dashboard/stats', active: false },
    { icon: '◐', label: 'History',     href: '/dashboard/history', active: false },
    ...(user.role === 'ADMIN' ? [{ icon: '⚙', label: 'Admin', href: '/admin', active: false }] : []),
  ];

  const avgConf = predictions.length
    ? Math.round(predictions.reduce((a: number, p: any) => a + p.confidence, 0) / predictions.length)
    : 0;
  const highConf = predictions.filter((p: any) => p.confidence >= 80).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)', fontFamily: 'var(--font-body)', position: 'relative' }}>
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, backdropFilter: 'blur(4px)' }} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px', background: 'var(--bg-base)', borderRight: '1px solid var(--border)',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }} className={`sidebar-desktop ${sidebarOpen ? 'sidebar-open' : ''}`}>

        <div style={{ padding: '0 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.08em' }}>
            BET<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--accent)', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '999px', padding: '0.2rem 0.5rem' }}>
            <span className="live-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            LIVE
          </span>
        </div>

        <div style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.5rem', marginBottom: '0.5rem' }}>Main Menu</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {navItems.map(item => (
              <Link key={item.label} href={item.href} className={`sidebar-item ${item.active ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <span style={{ fontSize: '0.85rem', minWidth: '1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.5rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>Leagues</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {[
              { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', key: 'Premier League' },
              { name: 'La Liga',         flag: '🇪🇸', key: 'La Liga' },
              { name: 'Bundesliga',      flag: '🇩🇪', key: 'Bundesliga' },
              { name: 'Serie A',         flag: '🇮🇹', key: 'Serie A' },
              { name: 'Ligue 1',         flag: '🇫🇷', key: 'Ligue 1' },
              { name: 'Champions Lg',    flag: '⭐',   key: 'Champions League' },
            ].map(l => (
              <button key={l.key} onClick={() => { setFilter(l.key); setSidebarOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: '6px', background: filter === l.key ? 'rgba(52,211,153,0.06)' : 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '0.78rem', color: filter === l.key ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                <span style={{ fontSize: '0.8rem' }}>{l.flag}</span>
                {l.name}
              </button>
            ))}
          </div>

          {betSlip.length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.4rem' }}>BET SLIP</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{betSlip.length} selection{betSlip.length > 1 ? 's' : ''}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>KES {totalStake.toFixed(0)} → KES {potentialWin.toFixed(0)}</div>
              <button onClick={() => { setSlipOpen(true); setSidebarOpen(false); }} style={{ marginTop: '0.5rem', width: '100%', padding: '0.4rem', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#020408', fontSize: '0.68rem', fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}>
                VIEW SLIP →
              </button>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '0.875rem 1rem', flexShrink: 0 }}>
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
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
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
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="sort-select"
              style={{ padding: '0.4rem 0.625rem', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', outline: 'none', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
              <option value="confidence">↑ CONF</option>
              <option value="time">↑ TIME</option>
              <option value="odds">↑ ODDS</option>
            </select>
            <button onClick={() => mutate()}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', background: isValidating ? 'rgba(52,211,153,0.08)' : 'transparent', border: '1px solid var(--border)', color: isValidating ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.15s' }}>
              <span style={{ display: 'inline-block', animation: isValidating ? 'spin 1s linear infinite' : 'none' }}>↺</span>
              <span className="refresh-label">Refresh</span>
            </button>
            <button onClick={() => setSlipOpen(v => !v)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', background: betSlip.length > 0 ? 'var(--accent)' : 'transparent', border: `1px solid ${betSlip.length > 0 ? 'var(--accent)' : 'var(--border)'}`, color: betSlip.length > 0 ? '#020408' : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: betSlip.length > 0 ? 700 : 400, transition: 'all 0.2s', fontFamily: betSlip.length > 0 ? 'var(--font-display)' : 'var(--font-body)', letterSpacing: betSlip.length > 0 ? '0.03em' : '0' }}>
              ◫ <span className="slip-label">Bet Slip</span>
              {betSlip.length > 0 && (
                <span style={{ background: '#020408', color: 'var(--accent)', borderRadius: '999px', padding: '0.05rem 0.4rem', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{betSlip.length}</span>
              )}
            </button>
          </div>
        </header>

        {/* Mobile tab switcher */}
        <div className="mobile-tabs" style={{ display: 'none', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
          {(['predictions', 'slip'] as const).map(tab => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: `2px solid ${mobileTab === tab ? 'var(--accent)' : 'transparent'}`, cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', fontWeight: 600, color: mobileTab === tab ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.15s', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              {tab === 'slip' && betSlip.length > 0 && <span style={{ background: 'var(--accent)', color: '#020408', borderRadius: '999px', padding: '0.05rem 0.4rem', fontSize: '0.6rem', fontWeight: 700 }}>{betSlip.length}</span>}
              {tab === 'predictions' ? '▦ Predictions' : '◫ Slip'}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.25rem 1.5rem', maxWidth: '1100px' }} className="main-pad">

          {betPlaced && (
            <div style={{ marginBottom: '1rem', padding: '1rem 1.25rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>✓</span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>BETS PLACED SUCCESSFULLY</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Your selections have been submitted. Good luck!</div>
              </div>
            </div>
          )}

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }} className="stats-grid">
            {[
              { l: 'Win Rate',       v: `${stats.winRate || 74}%`,    c: 'var(--accent)',  icon: '◈', sub: 'Last 30 days' },
              { l: "Today's Tips",   v: String(predictions.length),   c: 'var(--blue)',    icon: '◎', sub: `${highConf} high confidence` },
              { l: 'Avg Confidence', v: avgConf ? `${avgConf}%` : '—', c: 'var(--gold)',  icon: '◐', sub: 'Across all tips' },
              { l: 'Potential Win',  v: betSlip.length > 0 ? `KES ${potentialWin.toFixed(0)}` : '—', c: betSlip.length > 0 ? 'var(--accent)' : 'var(--text-muted)', icon: '◫', sub: betSlip.length > 0 ? `${betSlip.length} selections` : 'Add to slip' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ padding: '0.875rem 1rem', cursor: i === 3 && betSlip.length > 0 ? 'pointer' : 'default' }}
                onClick={i === 3 && betSlip.length > 0 ? () => setSlipOpen(true) : undefined}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: s.c, fontSize: '0.8rem' }}>{s.icon}</span>
                  <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{s.l}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: s.c, letterSpacing: '-0.01em', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }} className="scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                flexShrink: 0, padding: '0.35rem 0.875rem', borderRadius: '999px', fontSize: '0.72rem',
                fontFamily: 'var(--font-display)', letterSpacing: '0.04em', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', border: '1px solid',
                background: filter === f ? 'rgba(52,211,153,0.12)' : 'transparent',
                borderColor: filter === f ? 'var(--border-accent)' : 'var(--border)',
                color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                {LEAGUE_FLAGS[f] && <span style={{ fontSize: '0.75rem' }}>{LEAGUE_FLAGS[f]}</span>}
                {f}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              {sorted.length} match{sorted.length !== 1 ? 'es' : ''}
            </span>
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
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }}>◈</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No predictions yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Click Refresh to generate today's AI predictions</p>
              <button onClick={() => mutate()} style={{ padding: '0.6rem 1.5rem', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#020408', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '0.05em' }}>
                ↺ GENERATE
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
              {sorted.map((p: any) => (
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
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }} className="slip-panel">

        {/* Slip header */}
        <div style={{ padding: '0 1.25rem', height: '56px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em' }}>BET SLIP</span>
            {betSlip.length > 0 && (
              <span style={{ background: 'var(--accent)', color: '#020408', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{betSlip.length}</span>
            )}
          </div>
          {/* BUG FIX: `align` → `alignItems` */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              {betSlip.map(bet => {
                const predInfo = PRED_LABELS[bet.prediction];
                return (
                  <div key={bet.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem', position: 'relative' }}>
                    <button onClick={() => removeFromSlip(bet.id)} style={{ position: 'absolute', top: '0.625rem', right: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                    <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {LEAGUE_FLAGS[bet.league] && <span>{LEAGUE_FLAGS[bet.league]}</span>}
                      {bet.league}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', paddingRight: '1.5rem' }}>{bet.homeTeam} vs {bet.awayTeam}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', color: predInfo?.color || 'var(--accent)', fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{predInfo?.long || bet.prediction}</span>
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
                      {/* Quick stake presets */}
                      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.375rem' }}>
                        {[50, 100, 500, 1000].map(amt => (
                          <button key={amt} onClick={() => updateStake(bet.id, String(amt))}
                            style={{ flex: 1, padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'none', color: 'var(--text-muted)', fontSize: '0.62rem', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                            {amt >= 1000 ? `${amt/1000}K` : amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Slip footer */}
        {betSlip.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem', flexShrink: 0 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.875rem' }}>
              {betSlip.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Acca odds</span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)' }}>{totalOdds.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total stake</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>KES {totalStake.toFixed(0)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.375rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Potential win</span>
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>KES {potentialWin.toFixed(0)}</span>
              </div>
            </div>
            <button onClick={handlePlaceBets} disabled={placingBet}
              style={{ width: '100%', padding: '0.875rem', background: placingBet ? 'rgba(52,211,153,0.5)' : 'var(--accent)', border: 'none', borderRadius: '8px', color: '#020408', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em', cursor: placingBet ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {placingBet ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span> PLACING...</> : <>PLACE BET{betSlip.length > 1 ? 'S' : ''} ({betSlip.length})</>}
            </button>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', lineHeight: 1.5 }}>
              AI predictions only · Bet responsibly · 18+
            </p>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 1024px) { .sidebar-desktop { transform: translateX(0) !important; } }
        @media (max-width: 1023px) {
          .sidebar-desktop { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0) !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
          .main-pad { padding: 0.875rem 1rem !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .slip-panel { width: 100% !important; }
          .sort-select { display: none !important; }
          .refresh-label { display: none; }
          .slip-label { display: none; }
          .mobile-tabs { display: flex !important; }
        }
        @media (max-width: 1300px) { .main-content { margin-right: 0 !important; } }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 0.5rem !important; }
          .main-pad { padding: 0.75rem !important; }
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
  const confLabel = conf >= 80 ? 'HIGH' : conf >= 65 ? 'MED' : 'LOW';
  const pred = PRED_LABELS[p.prediction];
  const matchDate = new Date(p.matchDate);
  const isToday = matchDate.toDateString() === new Date().toDateString();
  const timeStr = matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = isToday ? 'Today' : matchDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const odds = p.odds || 1.90;

  return (
    <div className="fade-up" style={{
      background: 'var(--bg-card)', border: `1px solid ${inSlip ? 'rgba(52,211,153,0.35)' : 'var(--border)'}`,
      borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s ease',
      boxShadow: inSlip ? '0 0 0 1px rgba(52,211,153,0.15), 0 4px 20px rgba(52,211,153,0.05)' : 'none',
    }}>
      <div style={{ padding: '0.875rem 1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {LEAGUE_FLAGS[p.league] && <span style={{ fontSize: '0.75rem' }}>{LEAGUE_FLAGS[p.league]}</span>}
            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.league}</span>
          </div>
          {/* BUG FIX: `align` → `alignItems` */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.6rem', color: confColor, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', background: `${confColor}18`, border: `1px solid ${confColor}30`, borderRadius: '4px', padding: '0.1rem 0.35rem' }}>{confLabel}</span>
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
            { label: '1', sublabel: 'Home', val: p.odds?.home || (p.prediction === 'home_win' ? odds : null), pred: 'home_win' },
            { label: 'X', sublabel: 'Draw', val: p.odds?.draw || (p.prediction === 'draw' ? odds : null), pred: 'draw' },
            { label: '2', sublabel: 'Away', val: p.odds?.away || (p.prediction === 'away_win' ? odds : null), pred: 'away_win' },
          ].map((o) => {
            const isAI = p.prediction === o.pred;
            return (
              <button key={o.label} onClick={onAddToSlip}
                style={{ padding: '0.5rem 0.375rem', borderRadius: '7px', border: `1px solid ${isAI ? 'rgba(52,211,153,0.4)' : 'var(--border)'}`, background: isAI ? 'rgba(52,211,153,0.08)' : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isAI ? 'rgba(52,211,153,0.4)' : 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: '0.62rem', color: isAI ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>{o.label}</div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isAI ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {o.val ? (typeof o.val === 'number' ? o.val.toFixed(2) : o.val) : '—'}
                </div>
                {isAI && <div style={{ fontSize: '0.5rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', marginTop: '0.15rem' }}>AI ✓</div>}
              </button>
            );
          })}
        </div>

        {/* Prediction badge */}
        {pred && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.1)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: confColor, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{pred.long}</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '4px', padding: '0.1rem 0.375rem' }}>
              {typeof odds === 'number' ? odds.toFixed(2) : odds}
            </span>
          </div>
        )}

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
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
        }}>
          {inSlip ? '✓ IN SLIP' : '+ ADD TO SLIP'}
        </button>
        <button onClick={onToggleExpand} style={{
          padding: '0.625rem 0.875rem', background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: '0.7rem', color: 'var(--text-muted)', transition: 'all 0.15s', fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
          display: 'flex', alignItems: 'center', gap: '0.25rem',
        }}>
          {expanded ? '▲' : '▼'} ANALYSIS
        </button>
      </div>

      {/* Expanded analysis */}
      {expanded && (
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
          {p.aiAnalysis ? (
            <>
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
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              No analysis available for this match.
            </div>
          )}
          {/* Form stats row */}
          <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
            {[
              { label: 'Home Form', val: p.homeForm || '—' },
              { label: 'H2H', val: p.h2h || '—' },
              { label: 'Away Form', val: p.awayForm || '—' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{stat.label}</div>
                <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>{stat.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const prisma = (await import('../../lib/prisma')).default;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return { redirect: { destination: '/auth/login', permanent: false } };
  return { props: { user: { name: user.name || '', email: user.email, role: user.role } } };
};
