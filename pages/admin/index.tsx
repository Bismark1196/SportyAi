// pages/admin/index.tsx — BetAI Admin Panel (matched to dashboard UI)
import { GetServerSideProps } from 'next';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { getSession } from '../../lib/auth';

/* ─── Design tokens — identical to the dashboard ─── */
const C = {
  bg0: '#070810',
  bg1: '#0c0d1a',
  bg2: '#111226',
  bg3: '#181932',
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.14)',
  green: '#00e676',
  greenD: '#00c853',
  greenFaint: 'rgba(0,230,118,0.08)',
  greenBorder: 'rgba(0,230,118,0.22)',
  gold: '#ffd740',
  goldFaint: 'rgba(255,215,64,0.10)',
  goldBorder: 'rgba(255,215,64,0.30)',
  blue: '#448aff',
  blueFaint: 'rgba(68,138,255,0.10)',
  blueBorder: 'rgba(68,138,255,0.25)',
  red: '#ff5252',
  redFaint: 'rgba(255,82,82,0.09)',
  redBorder: 'rgba(255,82,82,0.25)',
  orange: '#ff6d00',
  orangeFaint: 'rgba(255,109,0,0.08)',
  orangeBorder: 'rgba(255,109,0,0.25)',
  text0: '#eceef8',
  text1: '#8e90a8',
  text2: '#4a4c68',
};

interface AdminProps {
  promoCodes: any[];
  users: any[];
  stats: { totalUsers: number; activeUsers: number; totalCodes: number; usedCodes: number };
}

export default function AdminPanel({ promoCodes: initialCodes, users, stats }: AdminProps) {
  const [promoCodes, setPromoCodes] = useState(initialCodes);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState('MONTHLY');
  const [count, setCount] = useState(1);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [tab, setTab] = useState<'codes' | 'users'>('codes');
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, count }),
      });
      const data = await res.json();
      setNewCodes(data.codes);
      setPromoCodes(prev => [...data.promoObjects, ...prev]);
      showToast(`✓ ${data.codes.length} code${data.codes.length > 1 ? 's' : ''} generated`);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    showToast(`Copied: ${code}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(newCodes.join('\n'));
    showToast(`Copied all ${newCodes.length} codes`);
  };

  const usedPct = stats.totalCodes > 0 ? Math.round((stats.usedCodes / stats.totalCodes) * 100) : 0;
  const activePct = stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;

  return (
    <div style={{ background: C.bg0, color: C.text0, minHeight: '100vh', fontFamily: "'Barlow', system-ui, sans-serif", fontWeight: 400 }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
        input, select, textarea { font-family: inherit; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .fade-up { animation: fadeUp .28s ease both; }
        .btn-scale:active { transform: scale(0.97); transition: transform .1s; }
        .row-hover:hover { background: rgba(255,255,255,0.025) !important; }
        .card-hover:hover { border-color: rgba(255,255,255,0.13) !important; }
        .spin { animation: spin .7s linear infinite; display: inline-block; }
      `}</style>

      {/* ═══ TOAST ══════════════════════════════════════════════ */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 999,
          background: C.bg2, border: `1px solid ${C.greenBorder}`,
          color: C.green, borderRadius: 10, padding: '9px 16px',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
          animation: 'toastIn .2s ease', pointerEvents: 'none',
        }}>{toast}</div>
      )}

      {/* ═══ TOPBAR ═════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 80,
        height: 56, background: 'rgba(7,8,16,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg,${C.green},#00897b)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>⚡</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: '0.02em', lineHeight: 1 }}>
              BET<span style={{ color: C.green }}>AI</span>
            </div>
          </div>

          <div style={{ width: 1, height: 22, background: C.border }}/>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/dashboard" style={{ fontSize: 12, color: C.text2, fontWeight: 600, letterSpacing: '0.06em', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text1)}
              onMouseLeave={e => (e.currentTarget.style.color = C.text2)}>
              DASHBOARD
            </Link>
            <span style={{ color: C.text2, fontSize: 12 }}>›</span>
            <span style={{ fontSize: 12, color: C.text0, fontWeight: 700, letterSpacing: '0.06em' }}>ADMIN</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 10, color: C.text2, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, display: 'inline-block', animation: 'pulse 2s ease infinite' }}/>
            RESTRICTED ACCESS
          </div>
          <div style={{
            padding: '4px 12px', borderRadius: 999,
            background: C.redFaint, border: `1px solid ${C.redBorder}`,
            color: C.red, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
          }}>ADMIN</div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>

        {/* ═══ PAGE TITLE ═════════════════════════════════════ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.red }}/>
            <span style={{ fontSize: 9, color: C.red, fontWeight: 800, letterSpacing: '0.16em' }}>CONTROL PANEL</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Admin Dashboard
          </h1>
        </div>

        {/* ═══ STATS ROW ══════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { icon: '👥', label: 'Total Users',   value: stats.totalUsers,   pct: null,      col: C.blue,   bg: C.blueFaint,   bc: C.blueBorder },
            { icon: '✅', label: 'Active Users',  value: stats.activeUsers,  pct: activePct, col: C.green,  bg: C.greenFaint,  bc: C.greenBorder },
            { icon: '🎟️', label: 'Total Codes',  value: stats.totalCodes,   pct: null,      col: C.gold,   bg: C.goldFaint,   bc: C.goldBorder },
            { icon: '🔑', label: 'Codes Used',    value: stats.usedCodes,    pct: usedPct,   col: C.orange, bg: C.orangeFaint, bc: C.orangeBorder },
          ].map((s, i) => (
            <div key={i} className="card-hover fade-up" style={{
              background: C.bg1, border: `1px solid ${C.border}`,
              borderRadius: 13, padding: '18px 20px',
              animationDelay: `${i * 0.06}s`, animationFillMode: 'both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span style={{ fontSize: 9, color: C.text2, fontWeight: 800, letterSpacing: '0.1em' }}>{s.label.toUpperCase()}</span>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 30, color: s.col, letterSpacing: '-0.01em', lineHeight: 1, marginBottom: 8 }}>
                {s.value}
              </div>
              {s.pct !== null && (
                <>
                  <div style={{ height: 3, background: C.bg3, borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', background: s.col, borderRadius: 99, transition: 'width .6s ease' }}/>
                  </div>
                  <div style={{ fontSize: 10, color: C.text2 }}>{s.pct}% of total</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* ═══ MAIN GRID ══════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>

          {/* ── LEFT: Generate Panel ───────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Generate form */}
            <div className="fade-up" style={{
              background: C.bg1, border: `1px solid ${C.border}`,
              borderRadius: 14, overflow: 'hidden',
              animationDelay: '0.2s', animationFillMode: 'both',
            }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 18, borderRadius: 2, background: C.green }}/>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '0.08em' }}>GENERATE PROMO CODES</span>
              </div>

              <form onSubmit={handleGenerate} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Plan */}
                <div>
                  <label style={{ display: 'block', fontSize: 9, color: C.text2, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 7 }}>PLAN TYPE</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {['DAILY','WEEKLY','MONTHLY','YEARLY'].map(p => (
                      <button key={p} type="button" onClick={() => setPlan(p)} className="btn-scale" style={{
                        padding: '8px 6px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                        background: plan === p ? C.greenFaint : C.bg2,
                        border: `1px solid ${plan === p ? C.greenBorder : C.border}`,
                        color: plan === p ? C.green : C.text2,
                        transition: 'all .15s',
                      }}>{p}</button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label style={{ display: 'block', fontSize: 9, color: C.text2, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 7 }}>QUANTITY</label>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {[1, 5, 10, 25].map(n => (
                      <button key={n} type="button" onClick={() => setCount(n)} className="btn-scale" style={{
                        flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: count === n ? C.greenFaint : C.bg2,
                        border: `1px solid ${count === n ? C.greenBorder : C.border}`,
                        color: count === n ? C.green : C.text2,
                        transition: 'all .15s',
                      }}>{n}</button>
                    ))}
                  </div>
                  <input
                    type="number" min={1} max={50} value={count}
                    onChange={e => setCount(Number(e.target.value))}
                    style={{
                      width: '100%', background: C.bg2, border: `1px solid ${C.border}`,
                      borderRadius: 9, padding: '9px 12px', color: C.text0,
                      fontSize: 14, outline: 'none',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = C.greenBorder)}
                    onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                  />
                </div>

                <button type="submit" disabled={generating} className="btn-scale" style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: generating ? C.bg3 : `linear-gradient(90deg,${C.green},${C.greenD})`,
                  color: generating ? C.text2 : C.bg0,
                  fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
                  fontSize: 15, letterSpacing: '0.07em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background .2s',
                }}>
                  {generating
                    ? <><span className="spin">◌</span> GENERATING...</>
                    : `GENERATE ${count} CODE${count > 1 ? 'S' : ''}`}
                </button>
              </form>
            </div>

            {/* New codes output */}
            {newCodes.length > 0 && (
              <div className="fade-up" style={{ background: C.bg1, border: `1px solid ${C.greenBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'block' }}/>
                    <span style={{ fontSize: 10, color: C.green, fontWeight: 800, letterSpacing: '0.1em' }}>
                      {newCodes.length} NEW CODE{newCodes.length > 1 ? 'S' : ''} GENERATED
                    </span>
                  </div>
                  {newCodes.length > 1 && (
                    <button onClick={copyAll} className="btn-scale" style={{
                      fontSize: 10, color: C.text1, fontWeight: 700, letterSpacing: '0.06em',
                      padding: '4px 10px', borderRadius: 6,
                      background: C.bg2, border: `1px solid ${C.border}`,
                    }}>COPY ALL</button>
                  )}
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {newCodes.map(code => (
                    <div key={code} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: C.bg2, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: '8px 12px',
                    }}>
                      <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, color: C.green, letterSpacing: '0.08em' }}>{code}</span>
                      <button onClick={() => copyCode(code)} className="btn-scale" style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                        color: copied === code ? C.green : C.text2,
                        transition: 'color .15s',
                      }}>
                        {copied === code ? '✓ COPIED' : 'COPY'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Table Panel ─────────────────────────── */}
          <div className="fade-up" style={{
            background: C.bg1, border: `1px solid ${C.border}`,
            borderRadius: 14, overflow: 'hidden',
            animationDelay: '0.28s', animationFillMode: 'both',
          }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.bg0 }}>
              {(['codes', 'users'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className="btn-scale" style={{
                  padding: '14px 22px', fontSize: 11, fontWeight: 800, letterSpacing: '0.09em',
                  color: tab === t ? C.green : C.text2,
                  borderBottom: tab === t ? `2px solid ${C.green}` : '2px solid transparent',
                  background: 'transparent',
                  transition: 'all .15s',
                }}>
                  {t === 'codes' ? '🎟️  PROMO CODES' : '👥  USERS'}
                  <span style={{
                    marginLeft: 8, fontSize: 10,
                    background: tab === t ? C.greenFaint : C.bg2,
                    border: `1px solid ${tab === t ? C.greenBorder : C.border}`,
                    color: tab === t ? C.green : C.text2,
                    borderRadius: 999, padding: '1px 7px',
                  }}>
                    {t === 'codes' ? promoCodes.length : users.length}
                  </span>
                </button>
              ))}

              {/* search hint */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                <span style={{ fontSize: 10, color: C.text2 }}>
                  {tab === 'codes'
                    ? `${promoCodes.filter(c => !c.isUsed).length} available · ${promoCodes.filter(c => c.isUsed).length} used`
                    : `${users.filter(u => u.isActive).length} active · ${users.filter(u => !u.isActive).length} inactive`}
                </span>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              {tab === 'codes' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Code', 'Plan', 'Status', 'Used By', 'Created'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: 9, color: C.text2, fontWeight: 800,
                          letterSpacing: '0.12em', whiteSpace: 'nowrap',
                        }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((code, i) => (
                      <tr key={code.id} className="row-hover" style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: 'transparent', transition: 'background .12s',
                      }}>
                        <td style={{ padding: '11px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.green, letterSpacing: '0.07em' }}>{code.code}</span>
                            <button onClick={() => copyCode(code.code)} style={{
                              fontSize: 9, color: copied === code.code ? C.green : C.text2,
                              fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px',
                              background: C.bg2, border: `1px solid ${C.border}`,
                              borderRadius: 4, transition: 'color .15s',
                            }}>
                              {copied === code.code ? '✓' : 'COPY'}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.09em',
                            padding: '3px 8px', borderRadius: 5,
                            background: C.goldFaint, border: `1px solid ${C.goldBorder}`,
                            color: C.gold,
                          }}>{code.plan}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                            padding: '3px 9px', borderRadius: 999,
                            background: code.isUsed ? C.redFaint : C.greenFaint,
                            border: `1px solid ${code.isUsed ? C.redBorder : C.greenBorder}`,
                            color: code.isUsed ? C.red : C.green,
                          }}>{code.isUsed ? 'USED' : 'AVAILABLE'}</span>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: 11, color: C.text1 }}>
                          {code.usedBy || <span style={{ color: C.text2 }}>—</span>}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: 11, color: C.text2, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {new Date(code.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                    {promoCodes.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: C.text2, fontSize: 13 }}>No promo codes yet. Generate some above.</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['User', 'Email', 'Role', 'Status', 'Joined'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: 9, color: C.text2, fontWeight: 800,
                          letterSpacing: '0.12em', whiteSpace: 'nowrap',
                        }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr key={user.id} className="row-hover" style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: 'transparent', transition: 'background .12s',
                      }}>
                        <td style={{ padding: '11px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            {/* Avatar initials */}
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                              background: `linear-gradient(135deg,${C.blue}22,${C.blue}11)`,
                              border: `1px solid ${C.blueBorder}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 800, color: C.blue, letterSpacing: '0.04em',
                            }}>
                              {(user.name || user.email || '?').slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.text0 }}>{user.name || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: 11, color: C.text1, fontFamily: 'monospace' }}>{user.email}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                            padding: '3px 8px', borderRadius: 5,
                            background: user.role === 'ADMIN' ? C.redFaint : C.blueFaint,
                            border: `1px solid ${user.role === 'ADMIN' ? C.redBorder : C.blueBorder}`,
                            color: user.role === 'ADMIN' ? C.red : C.blue,
                          }}>{user.role}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                            padding: '3px 9px', borderRadius: 999,
                            background: user.isActive ? C.greenFaint : C.redFaint,
                            border: `1px solid ${user.isActive ? C.greenBorder : C.redBorder}`,
                            color: user.isActive ? C.green : C.red,
                          }}>{user.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: 11, color: C.text2, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: C.text2, fontSize: 13 }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  if (session.role !== 'ADMIN') return { redirect: { destination: '/dashboard', permanent: false } };

  const prisma = (await import('../../lib/prisma')).default;
  const [promoCodes, users] = await Promise.all([
    prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' }, take: 100,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    }),
  ]);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalCodes: promoCodes.length,
    usedCodes: promoCodes.filter(c => c.isUsed).length,
  };

  return {
    props: {
      promoCodes: JSON.parse(JSON.stringify(promoCodes)),
      users: JSON.parse(JSON.stringify(users)),
      stats,
    },
  };
};