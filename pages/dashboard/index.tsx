// pages/dashboard/index.tsx — Professional SportAI-style Dashboard
import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { getSession } from '../../lib/auth';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const PRED_LABELS: Record<string, string> = {
  home_win: 'Home Win', draw: 'Draw', away_win: 'Away Win',
  over_2_5: 'Over 2.5', under_2_5: 'Under 2.5', btts: 'BTTS',
};

interface BetItem {
  id: string; homeTeam: string; awayTeam: string; league: string;
  prediction: string; odds: number; stake: number; type: '1' | 'X' | '2' | 'special';
}

const DEMO_BALANCE = 50000;

interface Props { user: { name: string; email: string; role: string } }

function formatKES(n: number) {
  return 'KES ' + n.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getOutcomeKey(pred: string): '1' | 'X' | '2' | 'special' {
  if (pred === 'home_win') return '1';
  if (pred === 'draw') return 'X';
  if (pred === 'away_win') return '2';
  return 'special';
}

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{time}</span>;
}

export default function Dashboard({ user }: Props) {
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState<'all' | 'live' | 'upcoming'>('all');
  const [betSlip, setBetSlip] = useState<BetItem[]>([]);
  const [slipOpen, setSlipOpen] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [balance] = useState(DEMO_BALANCE);
  const [betPlaced, setBetPlaced] = useState(false);
  const [defaultStake, setDefaultStake] = useState(100);

  const { data, isLoading, mutate } = useSWR('/api/predictions', fetcher, { refreshInterval: 300_000 });
  const predictions: any[] = data?.predictions || [];
  const stats = data?.stats || {};

  const filtered = predictions.filter(p => {
    if (filter !== 'All' && p.league !== filter) return false;
    return true;
  });

  const featured = predictions[0];

  const totalOdds = betSlip.reduce((acc, b) => acc * b.odds, 1);
  const totalStake = betSlip.reduce((acc, b) => acc + b.stake, 0);
  const potentialWin = totalStake * totalOdds;

  const addBet = (p: any, type: '1' | 'X' | '2' | 'special', odds: number) => {
    const existing = betSlip.find(b => b.id === p.id && b.type === type);
    if (existing) {
      setBetSlip(prev => prev.filter(b => !(b.id === p.id && b.type === type)));
    } else {
      setBetSlip(prev => [
        ...prev.filter(b => b.id !== p.id),
        { id: p.id, homeTeam: p.homeTeam, awayTeam: p.awayTeam, league: p.league, prediction: p.prediction, odds, stake: defaultStake, type },
      ]);
      setSlipOpen(true);
      setBetPlaced(false);
    }
  };

  const isSelected = (id: string, type: string) => betSlip.some(b => b.id === id && b.type === type);

  const updateStake = (id: string, type: string, val: number) => {
    setBetSlip(prev => prev.map(b => (b.id === id && b.type === type) ? { ...b, stake: val } : b));
  };

  const removeFromSlip = (id: string, type: string) => setBetSlip(prev => prev.filter(b => !(b.id === id && b.type === type)));

  const handlePlaceBet = () => {
    if (totalStake > balance) return;
    setBetPlaced(true);
    setTimeout(() => {
      setBetSlip([]);
      setBetPlaced(false);
    }, 3000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const avgConf = predictions.length
    ? Math.round(predictions.reduce((a, p) => a + p.confidence, 0) / predictions.length)
    : 0;

  const LEAGUES = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'];

  const navItems = [
    { icon: '▦', label: 'Dashboard',    href: '/dashboard', active: true },
    { icon: '⚽', label: 'Predictions', href: '/dashboard', active: false },
    { icon: '🤖', label: 'AI Insights', href: '/dashboard/stats', active: false },
    { icon: '📺', label: 'Live Centre', href: '/dashboard', active: false },
    { icon: '📊', label: 'Statistics',  href: '/dashboard/stats', active: false },
    { icon: '🏆', label: 'Leaderboard', href: '/dashboard', active: false },
    { icon: '📋', label: 'History',     href: '/dashboard/history', active: false },
    { icon: '🧮', label: 'Bet Calculator', href: '/dashboard', active: false },
    ...(user.role === 'ADMIN' ? [{ icon: '⚙️', label: 'Admin', href: '/admin', active: false }] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0f1a', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>

      {/* ── Top ticker bar ── */}
      <div style={{ background: '#060b12', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 1.5rem', height: '36px', display: 'flex', alignItems: 'center', gap: '2rem', overflowX: 'auto', flexShrink: 0 }} className="scrollbar-hide">
        {[
          { label: 'Matches', value: String(predictions.length), color: 'var(--text-secondary)' },
          { label: 'Live', value: '2', color: '#ef4444' },
          { label: 'Value Bets', value: String(predictions.filter((p: any) => p.confidence >= 80).length), color: '#fbbf24' },
          { label: 'AI Accuracy', value: `${stats.winRate || 94}%`, color: 'var(--accent)' },
          { label: 'Predictions Today', value: `+${predictions.length}`, color: 'var(--accent)' },
          { label: 'Win Rate (7d)', value: `${stats.winRate || 73}%`, color: 'var(--accent)' },
          { label: 'Updated', value: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), color: 'var(--text-muted)' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.color, fontFamily: 'var(--font-mono)' }}>{t.value}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: '200px', background: '#060b12', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }} className="scrollbar-hide sidebar-desktop">

          {/* Logo */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em' }}>
              Sport<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '999px', padding: '0.15rem 0.5rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              LIVE
            </div>
          </div>

          {/* Nav */}
          <div style={{ padding: '0.75rem 0.625rem', flex: 1 }}>
            <p style={{ fontSize: '0.58rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.625rem', marginBottom: '0.375rem' }}>MAIN</p>
            {navItems.slice(0, 4).map(item => (
              <Link key={item.label} href={item.href}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.75rem', borderRadius: '7px', fontSize: '0.8rem', color: item.active ? 'var(--accent)' : 'var(--text-muted)', background: item.active ? 'rgba(52,211,153,0.08)' : 'transparent', border: item.active ? '1px solid rgba(52,211,153,0.15)' : '1px solid transparent', textDecoration: 'none', marginBottom: '0.2rem', transition: 'all 0.15s' }}>
                <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Live Centre' && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: '999px', padding: '0.05rem 0.4rem', fontSize: '0.6rem', fontWeight: 700 }}>2</span>
                )}
                {item.label === 'Predictions' && (
                  <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#020408', borderRadius: '999px', padding: '0.05rem 0.4rem', fontSize: '0.6rem', fontWeight: 700 }}>{predictions.length}</span>
                )}
              </Link>
            ))}

            <p style={{ fontSize: '0.58rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.625rem', marginBottom: '0.375rem', marginTop: '1rem' }}>ANALYSIS</p>
            {navItems.slice(4).map(item => (
              <Link key={item.label} href={item.href}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.75rem', borderRadius: '7px', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'transparent', border: '1px solid transparent', textDecoration: 'none', marginBottom: '0.2rem', transition: 'all 0.15s' }}>
                <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <p style={{ fontSize: '0.58rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.625rem', marginBottom: '0.375rem', marginTop: '1rem' }}>ACCOUNT</p>
            {[
              { icon: '⚙️', label: 'Settings' },
              { icon: '💳', label: 'Subscription' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.75rem', borderRadius: '7px', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* AI Accuracy card */}
          <div style={{ margin: '0.75rem', padding: '1rem', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>AI ACCURACY (300)</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.25rem' }}>{stats.winRate || 94}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginBottom: '0.625rem' }}>↑ +1.4% vs last month</div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.winRate || 94}%`, background: 'linear-gradient(90deg, var(--accent), #fbbf24)', borderRadius: '2px' }} />
            </div>
          </div>

          {/* User + signout */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: '0.8rem', flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase() || 'K'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'Kelvin'}</div>
              <button onClick={handleLogout} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Sign out</button>
            </div>
          </div>
        </aside>

        {/* ── Center content ── */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="scrollbar-hide">

          {/* Top header bar */}
          <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#060b12', flexShrink: 0 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.03em', marginBottom: '0.125rem' }}>Dashboard</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Welcome back, {user.name || 'Kelvin'}. Here's today's overview.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem' }}>🌐</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Football</span>
              </div>
              <button onClick={() => { fetch('/api/predictions?refresh=1'); mutate(); }}
                style={{ background: 'var(--accent)', color: '#020408', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.05em', cursor: 'pointer' }}>
                View All Predictions →
              </button>
            </div>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', flex: 1 }}>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { label: "TODAY'S PREDICTIONS", value: String(predictions.length || 47), trend: '↑ 12 vs yesterday', trendColor: 'var(--accent)', icon: '📋' },
                { label: 'LIVE MATCHES', value: '2', trend: '● Active now', trendColor: '#ef4444', icon: '📺' },
                { label: 'VALUE BETS FOUND', value: String(predictions.filter(p => p.confidence >= 80).length || 5), trend: `↑ ${predictions.filter(p => p.confidence >= 85).length || 3} high confidence`, trendColor: 'var(--accent)', icon: '💰' },
                { label: 'PORTFOLIO ROI', value: '+18.4%', trend: '↑ 2.1% this week', trendColor: 'var(--accent)', icon: '📈' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.375rem', letterSpacing: '-0.01em' }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: s.trendColor }}>{s.trend}</div>
                </div>
              ))}
            </div>

            {/* Featured match + Value bets row */}
            {featured && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', marginBottom: '1.25rem' }}>
                {/* Featured match */}
                <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem' }}>⭐</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>Featured Match</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      LIVE 73'
                    </span>
                  </div>
                  <div style={{ padding: '1.5rem 1.25rem' }}>
                    {/* Teams & score */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>{featured.homeTeam}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)' }}>2</div>
                        <div style={{ display: 'flex', gap: '3px', marginTop: '0.5rem' }}>
                          {['W','W','D','W','W'].map((r, i) => (
                            <span key={i} style={{ width: '18px', height: '18px', borderRadius: '3px', background: r==='W'?'rgba(52,211,153,0.2)':r==='D'?'rgba(251,191,36,0.2)':'rgba(239,68,68,0.2)', color: r==='W'?'var(--accent)':r==='D'?'#fbbf24':'#ef4444', fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)' }}>{r}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{featured.league}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-muted)' }}>VS</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Etihad Stadium</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>{featured.awayTeam}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', textAlign: 'right' }}>1</div>
                        <div style={{ display: 'flex', gap: '3px', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                          {['W','L','W','W','D'].map((r, i) => (
                            <span key={i} style={{ width: '18px', height: '18px', borderRadius: '3px', background: r==='W'?'rgba(52,211,153,0.2)':r==='D'?'rgba(251,191,36,0.2)':'rgba(239,68,68,0.2)', color: r==='W'?'var(--accent)':r==='D'?'#fbbf24':'#ef4444', fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)' }}>{r}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Probability bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginBottom: '1rem' }}>
                      {[
                        { label: 'HOME WIN', pct: 58, odds: featured.odds?.home || 1.72, color: '#3b82f6' },
                        { label: 'DRAW', pct: 22, odds: featured.odds?.draw || 3.50, color: '#8b5cf6' },
                        { label: 'AWAY WIN', pct: 20, odds: featured.odds?.away || 4.80, color: '#ef4444', isAway: true },
                      ].map((o, i) => (
                        <button key={i} onClick={() => addBet(featured, i===0?'1':i===1?'X':'2', o.odds)}
                          style={{ background: isSelected(featured.id, i===0?'1':i===1?'X':'2') ? `${o.color}25` : `${o.color}15`, border: `1px solid ${isSelected(featured.id, i===0?'1':i===1?'X':'2') ? o.color : `${o.color}40`}`, borderRadius: '8px', padding: '0.75rem 0.5rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: o.color, marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>{o.pct}%</div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.375rem' }}>
                            <div style={{ height: '100%', width: `${o.pct}%`, background: o.color, borderRadius: '2px' }} />
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{o.label}</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>{o.odds}</div>
                        </button>
                      ))}
                    </div>

                    {/* AI Insight */}
                    <div style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🤖</span>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', marginRight: '0.375rem' }}>AI Insight:</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{featured.aiAnalysis || `${featured.homeTeam} dominates with strong home form. AI projects a Home Win at ${featured.odds?.home || 1.72} as the highest value pick.`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Value Bets */}
                <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem' }}>💰</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>Top Value Bets</span>
                    </div>
                    <button style={{ fontSize: '0.72rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>See All</button>
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    {predictions.filter(p => p.confidence >= 75).slice(0, 4).map((p: any, i: number) => {
                      const edge = (p.confidence / 100 - 1 / (p.odds || 2)).toFixed(1);
                      const edgePos = parseFloat(edge) >= 0;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.15s' }}
                          onClick={() => addBet(p, getOutcomeKey(p.prediction), p.odds || 1.90)}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.homeTeam} vs {p.awayTeam}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {p.league.length > 20 ? p.league.slice(0,20)+'…' : p.league} · {PRED_LABELS[p.prediction] || p.prediction}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: edgePos ? 'var(--accent)' : '#ef4444', fontFamily: 'var(--font-mono)' }}>{edgePos ? '+' : ''}{edge}%</span>
                            <div style={{ background: '#fbbf24', color: '#020408', borderRadius: '6px', padding: '0.3rem 0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', minWidth: '44px', textAlign: 'center' }}>
                              {(p.odds || 1.90).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {predictions.filter(p => p.confidence >= 75).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No high-value bets yet. Click Refresh.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Live & Upcoming table */}
            <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem' }}>🏟️</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em' }}>Live & Upcoming Matches</span>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {(['all', 'live', 'upcoming'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid', fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer', background: tab === t ? '#fbbf24' : 'transparent', borderColor: tab === t ? '#fbbf24' : 'rgba(255,255,255,0.1)', color: tab === t ? '#020408' : 'var(--text-muted)' }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* League filter pills */}
              <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '0.5rem', overflowX: 'auto' }} className="scrollbar-hide">
                {['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'].map(l => (
                  <button key={l} onClick={() => setFilter(filter === l ? 'All' : l)}
                    style={{ flexShrink: 0, padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', background: filter === l ? 'rgba(52,211,153,0.12)' : 'transparent', borderColor: filter === l ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)', color: filter === l ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 60px 60px 60px 100px', gap: '0.5rem', padding: '0.625rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['MATCH', 'AI PROBABILITIES', '1', 'X', '2', 'VALUE'].map(h => (
                  <div key={h} style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--text-muted)', textAlign: h === 'MATCH' || h === 'AI PROBABILITIES' ? 'left' : 'center' }}>{h}</div>
                ))}
              </div>

              {/* Match rows */}
              {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Loading predictions...</div>
              ) : filtered.slice(0, 8).map((p: any, i: number) => {
                const homeProb = Math.round(p.confidence * (p.prediction === 'home_win' ? 1 : 0.6));
                const drawProb = Math.round(p.confidence * 0.3);
                const awayProb = 100 - homeProb - drawProb;
                const matchTime = new Date(p.matchDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                const matchDate = new Date(p.matchDate);
                const isToday = matchDate.toDateString() === new Date().toDateString();
                const isTomorrow = matchDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : matchDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
                const edge = ((p.confidence / 100 - 1 / (p.odds || 2)) * 100).toFixed(1);
                const edgePos = parseFloat(edge) >= 0;

                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 60px 60px 60px 100px', gap: '0.5rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                    {/* Match info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.homeTeam}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>vs</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.awayTeam}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{p.league.length > 18 ? p.league.slice(0,18)+'…' : p.league}</span>
                        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: i < 2 ? '#ef4444' : 'var(--text-muted)', background: i < 2 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', padding: '0.1rem 0.375rem', borderRadius: '3px', border: i < 2 ? '1px solid rgba(239,68,68,0.3)' : 'none' }}>
                          {i < 2 ? `● LIVE ${60 + i * 8}'` : `${dayLabel} ${matchTime}`}
                        </span>
                      </div>
                    </div>

                    {/* AI probability mini-bar */}
                    <div>
                      <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '1px', marginBottom: '0.2rem' }}>
                        <div style={{ flex: homeProb, background: '#3b82f6', minWidth: '4px' }} />
                        <div style={{ flex: drawProb, background: '#8b5cf6', minWidth: '4px' }} />
                        <div style={{ flex: Math.max(awayProb, 1), background: '#ef4444', minWidth: '4px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        <span style={{ color: '#3b82f6' }}>{homeProb}%</span>
                        <span style={{ color: '#8b5cf6' }}>{drawProb}%</span>
                        <span style={{ color: '#ef4444' }}>{awayProb}%</span>
                      </div>
                    </div>

                    {/* Odds buttons */}
                    {(['1', 'X', '2'] as const).map((type, oi) => {
                      const oddsVal = oi === 0 ? (p.odds?.home || p.odds || 1.90) : oi === 1 ? (p.odds?.draw || 3.20) : (p.odds?.away || p.odds || 3.50);
                      const sel = isSelected(p.id, type);
                      const isAIPick = getOutcomeKey(p.prediction) === type;
                      return (
                        <button key={type} onClick={() => addBet(p, type, typeof oddsVal === 'number' ? oddsVal : 1.90)}
                          style={{ padding: '0.4rem 0.25rem', borderRadius: '6px', border: `1px solid ${sel ? '#fbbf24' : isAIPick ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.08)'}`, background: sel ? 'rgba(251,191,36,0.15)' : isAIPick ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: sel ? '#fbbf24' : isAIPick ? 'var(--accent)' : 'var(--text-primary)', textAlign: 'center', transition: 'all 0.15s' }}>
                          {typeof oddsVal === 'number' ? oddsVal.toFixed(2) : oddsVal}
                        </button>
                      );
                    })}

                    {/* Value */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: edgePos ? 'var(--accent)' : '#ef4444', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>{edgePos ? '+' : ''}{edge}%</div>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{p.confidence}% conf</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* ── Bet Slip ── */}
        <aside style={{ width: slipOpen ? '280px' : '0', background: '#060b12', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', transition: 'width 0.3s ease' }}>
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Slip header */}
            <div style={{ padding: '0 1rem', height: '56px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em' }}>BET SLIP</span>
                {betSlip.length > 0 && <span style={{ background: 'var(--accent)', color: '#020408', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{betSlip.length}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {betSlip.length > 0 && <button onClick={() => setBetSlip([])} style={{ fontSize: '0.65rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>CLEAR</button>}
                <button onClick={() => setSlipOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>×</button>
              </div>
            </div>

            {/* Balance */}
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(52,211,153,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>DEMO BALANCE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)' }}>{formatKES(balance - totalStake)}</span>
            </div>

            {/* Slip type tabs */}
            <div style={{ display: 'flex', padding: '0.625rem', gap: '0.375rem', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
              {['Single', 'Accumulator'].map(t => (
                <div key={t} style={{ flex: 1, padding: '0.375rem', textAlign: 'center', borderRadius: '6px', fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer', background: t === 'Accumulator' && betSlip.length > 1 ? 'var(--accent)' : t === 'Single' && betSlip.length <= 1 ? 'rgba(255,255,255,0.08)' : 'transparent', color: (t === 'Accumulator' && betSlip.length > 1) ? '#020408' : 'var(--text-muted)' }}>
                  {t}
                </div>
              ))}
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }} className="scrollbar-hide">
              {betPlaced ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>BET PLACED!</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your bet has been confirmed. Good luck!</div>
                </div>
              ) : betSlip.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '0.75rem' }}>◫</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Click any odds button on a match to add it to your slip</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {betSlip.map(bet => (
                    <div key={`${bet.id}-${bet.type}`} style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.875rem', position: 'relative' }}>
                      <button onClick={() => removeFromSlip(bet.id, bet.type)} style={{ position: 'absolute', top: '0.625rem', right: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem' }}>×</button>
                      <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{bet.league}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', paddingRight: '1.25rem' }}>{bet.homeTeam} vs {bet.awayTeam}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600 }}>{PRED_LABELS[bet.prediction] || bet.prediction} ({bet.type})</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '5px', padding: '0.15rem 0.5rem' }}>{bet.odds.toFixed(2)}</span>
                      </div>

                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>STAKE (KES)</div>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <input type="number" min={10} value={bet.stake}
                            onChange={e => updateStake(bet.id, bet.type, Math.max(10, parseFloat(e.target.value) || 10))}
                            style={{ flex: 1, background: '#080d14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.5rem 0.625rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                          <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '6px', padding: '0.5rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0 }}>
                            {(bet.stake * bet.odds).toFixed(0)}
                          </div>
                        </div>
                      </div>

                      {/* Quick stake buttons */}
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {[50, 100, 500, 1000].map(amt => (
                          <button key={amt} onClick={() => updateStake(bet.id, bet.type, amt)}
                            style={{ flex: 1, padding: '0.25rem 0', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', background: bet.stake === amt ? 'rgba(52,211,153,0.12)' : 'transparent', fontSize: '0.62rem', color: bet.stake === amt ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                            {amt >= 1000 ? `${amt/1000}K` : amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slip footer */}
            {betSlip.length > 0 && !betPlaced && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.875rem', flexShrink: 0 }}>
                {betSlip.length > 1 && (
                  <div style={{ background: '#0c1420', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.75rem' }}>
                    {[
                      { label: 'Selections', value: String(betSlip.length) },
                      { label: 'Accumulator odds', value: totalOdds.toFixed(2), gold: true },
                      { label: 'Total stake', value: formatKES(totalStake) },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.label}</span>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: r.gold ? '#fbbf24' : 'var(--text-primary)' }}>{r.value}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Potential win</span>
                      <span style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>{formatKES(potentialWin)}</span>
                    </div>
                  </div>
                )}

                {totalStake > balance ? (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.625rem', textAlign: 'center', fontSize: '0.72rem', color: '#ef4444', marginBottom: '0.75rem' }}>
                    Insufficient balance
                  </div>
                ) : null}

                <button onClick={handlePlaceBet} disabled={totalStake > balance}
                  style={{ width: '100%', padding: '0.875rem', background: totalStake > balance ? 'rgba(255,255,255,0.05)' : 'var(--accent)', border: 'none', borderRadius: '8px', color: totalStake > balance ? 'var(--text-muted)' : '#020408', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.06em', cursor: totalStake > balance ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  PLACE BET{betSlip.length > 1 ? 'S' : ''} · {formatKES(totalStake)}
                </button>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  Demo mode · AI tips only · 18+ · Bet responsibly
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Toggle bet slip button when hidden */}
      {!slipOpen && (
        <button onClick={() => setSlipOpen(true)}
          style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 60, background: betSlip.length > 0 ? 'var(--accent)' : '#0c1420', border: `1px solid ${betSlip.length > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`, color: betSlip.length > 0 ? '#020408' : 'var(--text-primary)', padding: '0.75rem 1.25rem', borderRadius: '999px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          ◫ BET SLIP {betSlip.length > 0 && <span style={{ background: '#020408', color: 'var(--accent)', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>{betSlip.length}</span>}
        </button>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media (max-width: 1024px) { .sidebar-desktop { display: none !important; } }
      `}</style>
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
