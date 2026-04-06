// pages/dashboard/index.tsx — BetAI Professional Dashboard v2
import { GetServerSideProps } from 'next';
import { useState, useRef } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { getSession } from '../../lib/auth';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const FILTERS = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'];

const LEAGUE_META: Record<string, { flag: string; short: string }> = {
  'Premier League':   { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', short: 'EPL' },
  'La Liga':          { flag: '🇪🇸',         short: 'LAL' },
  'Bundesliga':       { flag: '🇩🇪',         short: 'BUN' },
  'Serie A':          { flag: '🇮🇹',         short: 'SRA' },
  'Ligue 1':          { flag: '🇫🇷',         short: 'L1'  },
  'Champions League': { flag: '⭐',           short: 'UCL' },
};

const PRED_LABELS: Record<string, { short: string; long: string; color: string }> = {
  home_win:  { short: '1',    long: 'Home Win',        color: '#60a5fa' },
  draw:      { short: 'X',    long: 'Draw',             color: '#fbbf24' },
  away_win:  { short: '2',    long: 'Away Win',         color: '#f87171' },
  over_2_5:  { short: 'O2.5', long: 'Over 2.5 Goals',  color: '#34d399' },
  under_2_5: { short: 'U2.5', long: 'Under 2.5 Goals', color: '#34d399' },
  btts:      { short: 'GG',   long: 'Both Teams Score', color: '#34d399' },
};

type SortKey = 'confidence' | 'time' | 'odds';

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

const STAKE_PRESETS = [50, 100, 500, 1000];

export default function Dashboard({ user }: Props) {
  const [filter, setFilter]           = useState('All');
  const [sortBy, setSortBy]           = useState<SortKey>('confidence');
  const [betSlip, setBetSlip]         = useState<BetSlipItem[]>([]);
  const [slipOpen, setSlipOpen]       = useState(false);
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [placing, setPlacing]         = useState(false);
  const [placed, setPlaced]           = useState(false);
  const [mobileView, setMobileView]   = useState<'tips' | 'slip'>('tips');

  const { data, isLoading, isValidating, mutate } = useSWR('/api/predictions', fetcher, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  });

  const predictions: any[] = data?.predictions || [];
  const stats               = data?.stats       || {};

  const byLeague  = filter === 'All' ? predictions : predictions.filter((p: any) => p.league === filter);
  const displayed = [...byLeague].sort((a: any, b: any) => {
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    if (sortBy === 'time')       return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
    if (sortBy === 'odds')       return (b.odds || 0) - (a.odds || 0);
    return 0;
  });

  const totalOdds    = betSlip.reduce((a, b) => a * (b.odds || 1), 1);
  const totalStake   = betSlip.reduce((a, b) => a + (parseFloat(b.stake) || 0), 0);
  const potentialWin = betSlip.length > 0 ? totalStake * totalOdds : 0;
  const avgConf      = predictions.length
    ? Math.round(predictions.reduce((a: number, p: any) => a + p.confidence, 0) / predictions.length) : 0;
  const highConf     = predictions.filter((p: any) => p.confidence >= 80).length;

  const isInSlip = (id: string) => betSlip.some(b => b.id === id);

  const toggleSlip = (p: any) => {
    if (isInSlip(p.id)) {
      setBetSlip(prev => prev.filter(b => b.id !== p.id));
    } else {
      setBetSlip(prev => [...prev, {
        id: p.id, homeTeam: p.homeTeam, awayTeam: p.awayTeam,
        league: p.league, prediction: p.prediction,
        odds: p.odds || 1.90, stake: '100',
      }]);
      setSlipOpen(true);
      setMobileView('slip');
    }
  };

  const updateStake    = (id: string, stake: string) =>
    setBetSlip(prev => prev.map(b => b.id === id ? { ...b, stake } : b));
  const removeFromSlip = (id: string) =>
    setBetSlip(prev => prev.filter(b => b.id !== id));

  const placeBets = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1800));
    setPlacing(false);
    setPlaced(true);
    setTimeout(() => { setPlaced(false); setBetSlip([]); setSlipOpen(false); }, 3200);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const navItems = [
    { icon: '▦', label: 'Predictions', href: '/dashboard',        active: true  },
    { icon: '◎', label: 'Statistics',  href: '/dashboard/stats',  active: false },
    { icon: '◐', label: 'History',     href: '/dashboard/history',active: false },
    ...(user.role === 'ADMIN' ? [{ icon: '⚙', label: 'Admin', href: '/admin', active: false }] : []),
  ];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-void)', fontFamily:'var(--font-body)', position:'relative' }}>
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)', zIndex:45 }} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width:'220px', background:'var(--bg-base)', borderRight:'1px solid var(--border)',
        position:'fixed', top:0, left:0, bottom:0, zIndex:50,
        display:'flex', flexDirection:'column',
        transition:'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }} className={`sidebar-root ${sidebarOpen ? 'sidebar-open' : ''}`}>

        <div style={{ padding:'0 1.25rem', height:'56px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.05rem', letterSpacing:'0.08em' }}>
            BET<span style={{ color:'var(--accent)' }}>AI</span>
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.58rem', fontFamily:'var(--font-display)', letterSpacing:'0.1em', color:'var(--accent)', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.22)', borderRadius:'999px', padding:'0.18rem 0.5rem' }}>
            <span className="live-dot" style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />
            LIVE
          </span>
        </div>

        <div style={{ padding:'1rem 0.75rem', flex:1, overflowY:'auto' }}>
          <p style={{ fontSize:'0.58rem', fontFamily:'var(--font-display)', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', padding:'0 0.5rem', marginBottom:'0.5rem' }}>Menu</p>
          <nav style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
            {navItems.map(item => (
              <Link key={item.label} href={item.href} className={`sidebar-item ${item.active ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span style={{ fontSize:'0.85rem', minWidth:'1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <p style={{ fontSize:'0.58rem', fontFamily:'var(--font-display)', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', padding:'0 0.5rem', marginBottom:'0.5rem', marginTop:'1.5rem' }}>Leagues</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.12rem' }}>
            {Object.entries(LEAGUE_META).map(([name, meta]) => (
              <button key={name} onClick={() => { setFilter(name); setSidebarOpen(false); }}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem', padding:'0.42rem 0.75rem', borderRadius:'7px', background: filter===name ? 'rgba(52,211,153,0.07)' : 'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left', fontSize:'0.78rem', color: filter===name ? 'var(--accent)' : 'var(--text-muted)', transition:'all 0.15s' }}>
                <span style={{ display:'flex', alignItems:'center', gap:'0.45rem' }}>
                  <span style={{ fontSize:'0.8rem' }}>{meta.flag}</span>
                  {name}
                </span>
                <span style={{ fontSize:'0.58rem', fontFamily:'var(--font-display)', letterSpacing:'0.06em', opacity:0.5 }}>{meta.short}</span>
              </button>
            ))}
          </div>

          {betSlip.length > 0 && (
            <div style={{ marginTop:'1.5rem', padding:'0.75rem', background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.18)', borderRadius:'10px' }}>
              <div style={{ fontSize:'0.58rem', fontFamily:'var(--font-display)', letterSpacing:'0.1em', color:'var(--accent)', marginBottom:'0.4rem' }}>BET SLIP</div>
              <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>
                {betSlip.length} selection{betSlip.length>1?'s':''}
              </div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'0.2rem' }}>
                KES {totalStake.toFixed(0)} → <span style={{ color:'var(--accent)' }}>KES {potentialWin.toFixed(0)}</span>
              </div>
              <button onClick={() => { setSlipOpen(true); setSidebarOpen(false); }}
                style={{ marginTop:'0.6rem', width:'100%', padding:'0.4rem', background:'var(--accent)', border:'none', borderRadius:'6px', color:'#020408', fontSize:'0.68rem', fontFamily:'var(--font-display)', fontWeight:700, cursor:'pointer', letterSpacing:'0.04em' }}>
                VIEW SLIP →
              </button>
            </div>
          )}
        </div>

        <div style={{ borderTop:'1px solid var(--border)', padding:'0.875rem 1rem', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.625rem' }}>
            <div style={{ width:'1.875rem', height:'1.875rem', borderRadius:'50%', background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontWeight:700, fontSize:'0.75rem', flexShrink:0, fontFamily:'var(--font-display)' }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name||'User'}</div>
              <div style={{ fontSize:'0.63rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 0.625rem', borderRadius:'6px', background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', color:'var(--text-muted)', transition:'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color='var(--red)')}
            onMouseLeave={e => (e.currentTarget.style.color='var(--text-muted)')}>
            ↗ Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, marginLeft:'220px', marginRight:slipOpen?'300px':'0', transition:'margin-right 0.3s ease', position:'relative', zIndex:1, minHeight:'100vh' }}
        className="main-content">

        <header style={{ position:'sticky', top:0, zIndex:30, height:'56px', background:'rgba(2,4,8,0.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', padding:'0 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
            <button onClick={() => setSidebarOpen(v => !v)} className="hamburger"
              style={{ display:'none', background:'none', border:'1px solid var(--border)', borderRadius:'6px', color:'var(--text-secondary)', cursor:'pointer', fontSize:'0.9rem', padding:'0.35rem 0.5rem', lineHeight:1 }}>
              ☰
            </button>
            <div>
              <h1 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem', letterSpacing:'0.06em', lineHeight:1 }}>TODAY'S PREDICTIONS</h1>
              <p style={{ fontSize:'0.63rem', color:'var(--text-muted)', marginTop:'0.12rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} className="sort-sel"
              style={{ padding:'0.38rem 0.6rem', borderRadius:'6px', background:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-muted)', fontSize:'0.7rem', cursor:'pointer', outline:'none', fontFamily:'var(--font-display)', letterSpacing:'0.04em' }}>
              <option value="confidence">↑ CONFIDENCE</option>
              <option value="time">↑ KICK-OFF</option>
              <option value="odds">↑ ODDS</option>
            </select>
            <button onClick={() => mutate()}
              style={{ padding:'0.38rem 0.75rem', borderRadius:'6px', background:isValidating?'rgba(52,211,153,0.08)':'transparent', border:'1px solid var(--border)', color:isValidating?'var(--accent)':'var(--text-muted)', fontSize:'0.72rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.3rem', transition:'all 0.15s' }}>
              <span style={{ display:'inline-block', animation:isValidating?'spin 0.9s linear infinite':'none' }}>↺</span>
              <span className="btn-label">Refresh</span>
            </button>
            <button onClick={() => setSlipOpen(v => !v)}
              style={{ padding:'0.38rem 0.875rem', borderRadius:'6px', background:betSlip.length?'var(--accent)':'transparent', border:`1px solid ${betSlip.length?'var(--accent)':'var(--border)'}`, color:betSlip.length?'#020408':'var(--text-muted)', fontSize:'0.72rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', fontWeight:betSlip.length?700:400, transition:'all 0.2s', fontFamily:betSlip.length?'var(--font-display)':'var(--font-body)', letterSpacing:betSlip.length?'0.03em':'0' }}>
              ◫ <span className="btn-label">Slip</span>
              {betSlip.length>0 && <span style={{ background:'#020408', color:'var(--accent)', borderRadius:'999px', padding:'0.05rem 0.42rem', fontSize:'0.63rem', fontWeight:700, fontFamily:'var(--font-display)' }}>{betSlip.length}</span>}
            </button>
          </div>
        </header>

        {/* Mobile tab bar */}
        <div className="mobile-tabs" style={{ display:'none', borderBottom:'1px solid var(--border)', background:'var(--bg-base)' }}>
          {(['tips','slip'] as const).map(tab => (
            <button key={tab} onClick={() => setMobileView(tab)}
              style={{ flex:1, padding:'0.7rem', background:'none', border:'none', borderBottom:`2px solid ${mobileView===tab?'var(--accent)':'transparent'}`, cursor:'pointer', fontSize:'0.7rem', fontFamily:'var(--font-display)', letterSpacing:'0.07em', fontWeight:600, color:mobileView===tab?'var(--accent)':'var(--text-muted)', transition:'all 0.15s', textTransform:'uppercase', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem' }}>
              {tab==='slip'&&betSlip.length>0&&<span style={{ background:'var(--accent)', color:'#020408', borderRadius:'999px', padding:'0.05rem 0.38rem', fontSize:'0.6rem', fontWeight:700 }}>{betSlip.length}</span>}
              {tab==='tips'?'▦ Predictions':'◫ Bet Slip'}
            </button>
          ))}
        </div>

        <div style={{ padding:'1.25rem 1.5rem', maxWidth:'1100px' }} className="main-pad">

          {placed && (
            <div style={{ marginBottom:'1rem', padding:'0.875rem 1.25rem', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.28)', borderRadius:'10px', display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span style={{ fontSize:'1.1rem', color:'var(--accent)' }}>✓</span>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--accent)', fontFamily:'var(--font-display)', letterSpacing:'0.04em' }}>BETS PLACED SUCCESSFULLY</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'0.15rem' }}>Your selections have been submitted. Good luck!</div>
              </div>
            </div>
          )}

          {/* Stats strip */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', marginBottom:'1.25rem' }} className="stats-grid">
            {[
              { l:'Win Rate',       v:`${stats.winRate||74}%`,                          c:'var(--accent)', icon:'◈', sub:'Last 30 days' },
              { l:"Today's Tips",   v:String(predictions.length),                        c:'var(--blue)',   icon:'◎', sub:`${highConf} high conf` },
              { l:'Avg Confidence', v:avgConf?`${avgConf}%`:'—',                         c:'var(--gold)',   icon:'◐', sub:'All tips today' },
              { l:'Potential Win',  v:betSlip.length?`KES ${potentialWin.toFixed(0)}`:'—', c:betSlip.length?'var(--accent)':'var(--text-muted)', icon:'◫', sub:betSlip.length?`${betSlip.length} selection${betSlip.length>1?'s':''}`:'Add picks to slip' },
            ].map((s,i) => (
              <div key={i} className="stat-card" style={{ padding:'0.875rem 1rem', cursor:i===3&&betSlip.length?'pointer':'default' }}
                onClick={i===3&&betSlip.length?()=>setSlipOpen(true):undefined}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.375rem', marginBottom:'0.5rem' }}>
                  <span style={{ color:s.c, fontSize:'0.8rem' }}>{s.icon}</span>
                  <span style={{ fontSize:'0.58rem', fontFamily:'var(--font-display)', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>{s.l}</span>
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.45rem', color:s.c, letterSpacing:'-0.01em', lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:'0.3rem' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{ display:'flex', gap:'0.45rem', overflowX:'auto', paddingBottom:'0.5rem', marginBottom:'1.25rem', alignItems:'center' }} className="scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ flexShrink:0, padding:'0.33rem 0.8rem', borderRadius:'999px', fontSize:'0.7rem', fontFamily:'var(--font-display)', letterSpacing:'0.04em', fontWeight:600, cursor:'pointer', transition:'all 0.15s', border:'1px solid', background:filter===f?'rgba(52,211,153,0.12)':'transparent', borderColor:filter===f?'var(--border-accent)':'var(--border)', color:filter===f?'var(--accent)':'var(--text-muted)', display:'flex', alignItems:'center', gap:'0.28rem' }}>
                {LEAGUE_META[f]?.flag&&<span style={{ fontSize:'0.72rem' }}>{LEAGUE_META[f].flag}</span>}
                {f}
              </button>
            ))}
            <span style={{ marginLeft:'auto', flexShrink:0, fontSize:'0.63rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
              {displayed.length} match{displayed.length!==1?'es':''}
            </span>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'0.875rem' }}>
              {[...Array(6)].map((_,i) => (
                <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                  <div className="shimmer" style={{ height:'0.7rem', width:'35%' }} />
                  <div className="shimmer" style={{ height:'1.25rem', width:'70%' }} />
                  <div className="shimmer" style={{ height:'3rem', width:'100%', borderRadius:'8px' }} />
                  <div className="shimmer" style={{ height:'0.5rem', width:'100%' }} />
                </div>
              ))}
            </div>
          ) : displayed.length===0 ? (
            <div style={{ textAlign:'center', padding:'5rem 0' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem', opacity:0.35 }}>◈</div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', marginBottom:'0.5rem' }}>No predictions yet</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:'1.5rem' }}>Click Refresh to generate today's AI predictions</p>
              <button onClick={() => mutate()} style={{ padding:'0.6rem 1.5rem', background:'var(--accent)', border:'none', borderRadius:'8px', color:'#020408', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', letterSpacing:'0.05em' }}>
                ↺ GENERATE PREDICTIONS
              </button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'0.875rem' }}>
              {displayed.map((p: any) => (
                <MatchCard key={p.id} p={p}
                  inSlip={isInSlip(p.id)}
                  expanded={expanded===p.id}
                  onToggleExpand={() => setExpanded(expanded===p.id?null:p.id)}
                  onAddToSlip={() => toggleSlip(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Bet Slip Panel ── */}
      <aside style={{ width:'300px', background:'var(--bg-base)', borderLeft:'1px solid var(--border)', position:'fixed', top:0, right:0, bottom:0, zIndex:50, display:'flex', flexDirection:'column', transform:slipOpen?'translateX(0)':'translateX(100%)', transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)' }} className="slip-panel">

        {/* ↓↓ BUG FIX: `align: 'center'` → `alignItems: 'center'` ↓↓ */}
        <div style={{ padding:'0 1.25rem', height:'56px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem', letterSpacing:'0.05em' }}>BET SLIP</span>
            {betSlip.length>0&&<span style={{ background:'var(--accent)', color:'#020408', borderRadius:'999px', padding:'0.1rem 0.5rem', fontSize:'0.63rem', fontWeight:700, fontFamily:'var(--font-display)' }}>{betSlip.length}</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            {betSlip.length>0&&(
              <button onClick={() => setBetSlip([])} style={{ fontSize:'0.68rem', color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:'0.05em' }}>CLEAR ALL</button>
            )}
            <button onClick={() => setSlipOpen(false)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.1rem', lineHeight:1, padding:'0.25rem', borderRadius:'4px', transition:'color 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.color='var(--text-primary)')}
              onMouseLeave={e=>(e.currentTarget.style.color='var(--text-muted)')}>
              ×
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'0.875rem' }}>
          {betSlip.length===0 ? (
            <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem', opacity:0.18 }}>◫</div>
              <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', lineHeight:1.65 }}>
                Click <strong style={{ color:'var(--text-secondary)' }}>Add to Slip</strong> on any prediction to build your bet
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
              {betSlip.map(bet => {
                const pred   = PRED_LABELS[bet.prediction];
                const payout = (parseFloat(bet.stake)||0) * bet.odds;
                return (
                  <div key={bet.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'10px', padding:'0.875rem', position:'relative' }}>
                    <button onClick={() => removeFromSlip(bet.id)}
                      style={{ position:'absolute', top:'0.625rem', right:'0.625rem', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:1, padding:'0.1rem 0.25rem', borderRadius:'4px', transition:'all 0.15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.color='var(--red)';e.currentTarget.style.background='rgba(248,113,113,0.1)';}}
                      onMouseLeave={e=>{e.currentTarget.style.color='var(--text-muted)';e.currentTarget.style.background='none';}}>
                      ×
                    </button>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.6rem', fontFamily:'var(--font-display)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.35rem' }}>
                      {LEAGUE_META[bet.league]?.flag&&<span>{LEAGUE_META[bet.league].flag}</span>}
                      {bet.league}
                    </div>
                    <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-primary)', marginBottom:'0.35rem', paddingRight:'1.5rem' }}>
                      {bet.homeTeam} <span style={{ color:'var(--text-muted)', fontWeight:400 }}>vs</span> {bet.awayTeam}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                      <span style={{ fontSize:'0.72rem', color:pred?.color||'var(--accent)', fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'0.03em' }}>
                        {pred?.short} · {pred?.long||bet.prediction}
                      </span>
                      <span style={{ fontSize:'0.8rem', fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--gold)', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:'4px', padding:'0.08rem 0.4rem' }}>
                        {bet.odds.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize:'0.58rem', fontFamily:'var(--font-display)', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', display:'block', marginBottom:'0.32rem' }}>Stake (KES)</label>
                      <div style={{ display:'flex', gap:'0.375rem' }}>
                        <input type="number" min="1" value={bet.stake}
                          onChange={e => updateStake(bet.id, e.target.value)}
                          onFocus={e=>(e.currentTarget.style.borderColor='var(--border-accent)')}
                          onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}
                          style={{ flex:1, background:'var(--bg-void)', border:'1px solid var(--border)', borderRadius:'6px', padding:'0.48rem 0.6rem', color:'var(--text-primary)', fontSize:'0.85rem', fontFamily:'var(--font-mono)', outline:'none', transition:'border-color 0.15s' }} />
                        <div style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.15)', borderRadius:'6px', padding:'0.48rem 0.55rem', fontSize:'0.7rem', color:'var(--accent)', display:'flex', alignItems:'center', flexShrink:0, fontFamily:'var(--font-mono)', whiteSpace:'nowrap' }}>
                          = {payout.toFixed(0)}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.25rem', marginTop:'0.35rem' }}>
                        {STAKE_PRESETS.map(amt => (
                          <button key={amt} onClick={() => updateStake(bet.id, String(amt))}
                            style={{ flex:1, padding:'0.22rem', border:'1px solid var(--border)', borderRadius:'4px', background:bet.stake===String(amt)?'rgba(52,211,153,0.1)':'none', color:bet.stake===String(amt)?'var(--accent)':'var(--text-muted)', fontSize:'0.6rem', cursor:'pointer', fontFamily:'var(--font-display)', letterSpacing:'0.03em', transition:'all 0.15s' }}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-accent)';e.currentTarget.style.color='var(--accent)';}}
                            onMouseLeave={e=>{if(bet.stake!==String(amt)){e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-muted)';}}} >
                            {amt>=1000?`${amt/1000}K`:amt}
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

        {betSlip.length>0&&(
          <div style={{ borderTop:'1px solid var(--border)', padding:'1rem 1.25rem', flexShrink:0 }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'8px', padding:'0.75rem', marginBottom:'0.875rem' }}>
              {betSlip.length>1&&(
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem' }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Accumulator odds</span>
                    <span style={{ fontSize:'0.8rem', fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--gold)' }}>{totalOdds.toFixed(2)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem' }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Total stake</span>
                    <span style={{ fontSize:'0.8rem', fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--text-primary)' }}>KES {totalStake.toFixed(0)}</span>
                  </div>
                </>
              )}
              <div style={{ borderTop:betSlip.length>1?'1px solid var(--border)':'none', paddingTop:betSlip.length>1?'0.35rem':'0', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--text-secondary)' }}>Potential win</span>
                <span style={{ fontSize:'0.9rem', fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--accent)' }}>KES {potentialWin.toFixed(0)}</span>
              </div>
            </div>
            <button onClick={placeBets} disabled={placing}
              style={{ width:'100%', padding:'0.875rem', background:placing?'rgba(52,211,153,0.5)':'var(--accent)', border:'none', borderRadius:'8px', color:'#020408', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.875rem', letterSpacing:'0.05em', cursor:placing?'not-allowed':'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}
              onMouseEnter={e=>{if(!placing)e.currentTarget.style.opacity='0.9';}}
              onMouseLeave={e=>{e.currentTarget.style.opacity='1';}}>
              {placing
                ? <><span style={{ display:'inline-block', animation:'spin 0.9s linear infinite' }}>◌</span> PLACING...</>
                : <>PLACE BET{betSlip.length>1?'S':''} ({betSlip.length})</>}
            </button>
            <p style={{ fontSize:'0.6rem', color:'var(--text-muted)', textAlign:'center', marginTop:'0.5rem', lineHeight:1.55 }}>
              AI predictions only · Bet responsibly · 18+
            </p>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        @media(min-width:1024px){ .sidebar-root{transform:translateX(0)!important;} }
        @media(max-width:1023px){
          .sidebar-root{transform:translateX(-100%);}
          .sidebar-open{transform:translateX(0)!important;}
          .main-content{margin-left:0!important;}
          .hamburger{display:flex!important;}
          .main-pad{padding:0.875rem 1rem!important;}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .slip-panel{width:100%!important;}
          .sort-sel{display:none!important;}
          .btn-label{display:none;}
          .mobile-tabs{display:flex!important;}
        }
        @media(max-width:1300px){ .main-content{margin-right:0!important;} }
        @media(max-width:480px){
          .stats-grid{grid-template-columns:1fr 1fr!important;gap:0.5rem!important;}
          .main-pad{padding:0.625rem!important;}
        }
      `}</style>
    </div>
  );
}

// ─── Match Card ──────────────────────────────────────────────────────────────
function MatchCard({ p, inSlip, expanded, onToggleExpand, onAddToSlip }: {
  p: any; inSlip: boolean; expanded: boolean; onToggleExpand: () => void; onAddToSlip: () => void;
}) {
  const conf      = p.confidence as number;
  const confColor = conf>=80?'var(--accent)':conf>=65?'var(--gold)':'var(--red)';
  const confLabel = conf>=80?'HIGH':conf>=65?'MED':'LOW';
  const pred      = PRED_LABELS[p.prediction];
  const matchDate = new Date(p.matchDate);
  const isToday   = matchDate.toDateString()===new Date().toDateString();
  const timeStr   = matchDate.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  const dateStr   = isToday?'Today':matchDate.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  const baseOdds  = typeof p.odds==='number'?p.odds:1.90;
  const leagueMeta= LEAGUE_META[p.league];

  return (
    <div className="fade-up" style={{ background:'var(--bg-card)', border:`1px solid ${inSlip?'rgba(52,211,153,0.38)':'var(--border)'}`, borderRadius:'12px', overflow:'hidden', transition:'all 0.2s ease', boxShadow:inSlip?'0 0 0 1px rgba(52,211,153,0.15),0 4px 24px rgba(52,211,153,0.06)':'none' }}>
      <div style={{ padding:'0.875rem 1rem 0' }}>

        {/* League + conf badge + time — FIX: `align` → `alignItems` */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.825rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.38rem' }}>
            {leagueMeta?.flag&&<span style={{ fontSize:'0.75rem' }}>{leagueMeta.flag}</span>}
            <span style={{ fontSize:'0.6rem', fontFamily:'var(--font-display)', letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-muted)' }}>{p.league}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
            <span style={{ fontSize:'0.58rem', color:confColor, fontFamily:'var(--font-display)', letterSpacing:'0.06em', background:`${confColor}1a`, border:`1px solid ${confColor}33`, borderRadius:'4px', padding:'0.1rem 0.35rem' }}>{confLabel}</span>
            <span style={{ fontSize:'0.63rem', fontFamily:'var(--font-mono)', color:'var(--text-muted)', background:'var(--bg-elevated)', padding:'0.15rem 0.4rem', borderRadius:'4px' }}>{dateStr} · {timeStr}</span>
          </div>
        </div>

        {/* Teams */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'0.5rem', alignItems:'center', marginBottom:'1rem' }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-primary)', lineHeight:1.2 }}>{p.homeTeam}</div>
            <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:'0.12rem' }}>HOME</div>
          </div>
          <div style={{ textAlign:'center', padding:'0.375rem 0.625rem', background:'var(--bg-elevated)', borderRadius:'6px', fontSize:'0.68rem', fontFamily:'var(--font-display)', color:'var(--text-muted)', letterSpacing:'0.06em' }}>VS</div>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:1.2 }}>{p.awayTeam}</div>
            <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:'0.12rem' }}>AWAY</div>
          </div>
        </div>

        {/* 1X2 odds */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.375rem', marginBottom:'0.875rem' }}>
          {[
            { label:'1', predKey:'home_win', val:p.odds?.home||(p.prediction==='home_win'?baseOdds:null) },
            { label:'X', predKey:'draw',     val:p.odds?.draw ||(p.prediction==='draw'    ?baseOdds:null) },
            { label:'2', predKey:'away_win', val:p.odds?.away ||(p.prediction==='away_win'?baseOdds:null) },
          ].map(o => {
            const isAI = p.prediction===o.predKey;
            return (
              <button key={o.label} onClick={onAddToSlip}
                style={{ padding:'0.5rem 0.375rem', borderRadius:'7px', border:`1px solid ${isAI?'rgba(52,211,153,0.42)':'var(--border)'}`, background:isAI?'rgba(52,211,153,0.08)':'var(--bg-elevated)', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-accent)';e.currentTarget.style.transform='translateY(-1px)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=isAI?'rgba(52,211,153,0.42)':'var(--border)';e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{ fontSize:'0.6rem', color:isAI?'var(--accent)':'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'0.06em', marginBottom:'0.12rem' }}>{o.label}</div>
                <div style={{ fontSize:'0.82rem', fontFamily:'var(--font-mono)', fontWeight:700, color:isAI?'var(--accent)':'var(--text-primary)' }}>
                  {o.val?(typeof o.val==='number'?o.val.toFixed(2):o.val):'—'}
                </div>
                {isAI&&<div style={{ fontSize:'0.5rem', color:'var(--accent)', fontFamily:'var(--font-display)', letterSpacing:'0.05em', marginTop:'0.1rem' }}>AI ✓</div>}
              </button>
            );
          })}
        </div>

        {/* AI pick badge row */}
        {pred&&(
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem', padding:'0.48rem 0.75rem', background:'rgba(52,211,153,0.04)', border:'1px solid rgba(52,211,153,0.1)', borderRadius:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.45rem' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:confColor, display:'inline-block', flexShrink:0 }} />
              <span style={{ fontSize:'0.7rem', color:'var(--accent)', fontWeight:600, fontFamily:'var(--font-display)', letterSpacing:'0.04em' }}>{pred.long}</span>
            </div>
            <span style={{ fontSize:'0.75rem', fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--gold)', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.18)', borderRadius:'4px', padding:'0.08rem 0.38rem' }}>
              {baseOdds.toFixed(2)}
            </span>
          </div>
        )}

        {/* Confidence */}
        <div style={{ marginBottom:'0.875rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.32rem' }}>
            <span style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'0.07em' }}>AI CONFIDENCE</span>
            <span style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', fontWeight:700, color:confColor }}>{conf}%</span>
          </div>
          <div className="conf-bar"><div className="conf-bar-fill" style={{ width:`${conf}%`, background:confColor }} /></div>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display:'flex', borderTop:'1px solid var(--border)' }}>
        <button onClick={onAddToSlip} style={{ flex:1, padding:'0.6rem 1rem', background:inSlip?'rgba(52,211,153,0.08)':'transparent', border:'none', borderRight:'1px solid var(--border)', cursor:'pointer', fontSize:'0.7rem', fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'0.06em', color:inSlip?'var(--accent)':'var(--text-muted)', transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem' }}>
          {inSlip?'✓ IN SLIP':'+ ADD TO SLIP'}
        </button>
        <button onClick={onToggleExpand} style={{ padding:'0.6rem 0.875rem', background:'transparent', border:'none', cursor:'pointer', fontSize:'0.68rem', color:'var(--text-muted)', transition:'all 0.15s', fontFamily:'var(--font-display)', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'0.25rem' }}
          onMouseEnter={e=>(e.currentTarget.style.color='var(--text-secondary)')}
          onMouseLeave={e=>(e.currentTarget.style.color='var(--text-muted)')}>
          {expanded?'▲':'▼'} ANALYSIS
        </button>
      </div>

      {/* Analysis panel */}
      {expanded&&(
        <div style={{ padding:'0.875rem 1rem', borderTop:'1px solid var(--border)', background:'rgba(0,0,0,0.18)' }}>
          {p.aiAnalysis
            ? <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.78, marginBottom:p.tips?.length?'0.75rem':0 }}>{p.aiAnalysis}</p>
            : <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontStyle:'italic', marginBottom:p.tips?.length?'0.75rem':0 }}>No analysis available.</p>}
          {p.tips?.length>0&&(
            <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
              {p.tips.map((tip:string,i:number)=>(
                <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.7rem', color:'var(--text-muted)' }}>
                  <span style={{ color:'var(--accent)', flexShrink:0, marginTop:'0.06rem' }}>›</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
          {/* Form stats */}
          <div style={{ marginTop:'0.875rem', paddingTop:'0.75rem', borderTop:'1px solid var(--border)', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem', textAlign:'center' }}>
            {[{label:'Home Form',val:p.homeForm||'—'},{label:'H2H',val:p.h2h||'—'},{label:'Away Form',val:p.awayForm||'—'}].map(s=>(
              <div key={s.label}>
                <div style={{ fontSize:'0.58rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'0.08em', marginBottom:'0.18rem' }}>{s.label}</div>
                <div style={{ fontSize:'0.78rem', fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--text-secondary)' }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const prisma = (await import('../../lib/prisma')).default;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return { redirect: { destination: '/auth/login', permanent: false } };
  return { props: { user: { name: user.name||'', email: user.email, role: user.role } } };
};
