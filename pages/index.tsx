// pages/index.tsx — BetAI Landing Page (mobile-first responsive)
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getSession } from '../lib/auth';

const C = {
  bg0: '#070810', bg1: '#0c0d1a', bg2: '#111226', bg3: '#181932',
  border: 'rgba(255,255,255,0.07)', borderHi: 'rgba(255,255,255,0.14)',
  green: '#00e676', greenD: '#00c853',
  greenFaint: 'rgba(0,230,118,0.08)', greenBorder: 'rgba(0,230,118,0.22)',
  gold: '#ffd740', goldFaint: 'rgba(255,215,64,0.10)', goldBorder: 'rgba(255,215,64,0.30)',
  blue: '#448aff', blueFaint: 'rgba(68,138,255,0.10)',
  orange: '#ff6d00', orangeFaint: 'rgba(255,109,0,0.08)', orangeBorder: 'rgba(255,109,0,0.25)',
  red: '#ff5252', redFaint: 'rgba(255,82,82,0.09)',
  text0: '#eceef8', text1: '#8e90a8', text2: '#4a4c68',
};

const STATS = [
  { icon: '🎯', label: 'AI Win Rate',    value: '74%',    sub: 'Last 30 days' },
  { icon: '⚽', label: "Today's Tips",   value: '32',     sub: 'Across 6 leagues' },
  { icon: '📈', label: 'Avg Confidence', value: '79%',    sub: 'Per prediction' },
  { icon: '👥', label: 'Active Users',   value: '1,200+', sub: 'Subscribers' },
];

const FEATURES = [
  { icon: '◈', title: 'Gemini AI Engine',   desc: 'Powered by Google Gemini AI — analyses team form, H2H records, injuries, odds movement, and tactical patterns in seconds.' },
  { icon: '◎', title: 'Real-Time Fixtures', desc: 'Live data from Premier League, La Liga, Bundesliga, Serie A, Ligue 1 and Champions League, refreshed continuously.' },
  { icon: '◐', title: 'Confidence Scoring', desc: 'Every prediction carries an ELITE / HIGH / MED rating so you always know the signal strength before placing.' },
  { icon: '◑', title: 'Promo-Gated Access', desc: 'Exclusive promo code system ensures only serious bettors access our premium AI tips. No free rides.' },
];

const SAMPLE = [
  { league: 'Champions League', flag: '⭐',  home: 'Arsenal',       away: 'Sporting CP',   display: 'Tue 7 Apr · 22:00', round: 'QF Leg 1' },
  { league: 'La Liga',          flag: '🇪🇸', home: 'FC Barcelona',   away: 'Espanyol',      display: 'Sat 11 Apr · 19:30', round: 'Matchday 33' },
  { league: 'Bundesliga',       flag: '🇩🇪', home: 'FC St. Pauli',   away: 'Bayern Munich', display: 'Sat 11 Apr · 19:30', round: 'Matchday 30' },
  { league: 'Premier League',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', home: 'Arsenal',        away: 'Bournemouth',   display: 'Sat 11 Apr · 14:30', round: 'GW35' },
  { league: 'Champions League', flag: '⭐',  home: 'PSG',            away: 'Liverpool',     display: 'Wed 8 Apr · 22:00', round: 'QF Leg 1' },
];

const LEAGUES = [
  { name: 'Premier League',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga',          flag: '🇪🇸' },
  { name: 'Bundesliga',       flag: '🇩🇪' },
  { name: 'Serie A',          flag: '🇮🇹' },
  { name: 'Ligue 1',          flag: '🇫🇷' },
  { name: 'Champions League', flag: '⭐' },
];

const STEPS = [
  { n: '01', title: 'Get a Promo Code',   desc: 'Purchase a premium access code. Contact us via email or WhatsApp to get yours.' },
  { n: '02', title: 'Create Account',     desc: 'Sign up with your email and activate your subscription using the promo code.' },
  { n: '03', title: 'Receive Daily Tips', desc: 'Log in every day to see AI-generated predictions with confidence ratings and analysis.' },
];

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ background: C.bg0, color: C.text0, fontFamily: "'Barlow', system-ui, sans-serif", fontWeight: 400 }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }
        a    { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .fade-1 { animation: fadeUp .4s .00s ease both; }
        .fade-2 { animation: fadeUp .4s .08s ease both; }
        .fade-3 { animation: fadeUp .4s .16s ease both; }
        .fade-4 { animation: fadeUp .4s .24s ease both; }
        .fade-5 { animation: fadeUp .4s .32s ease both; }

        .card-hover:hover { border-color: rgba(255,255,255,0.14) !important; }
        .btn:active { transform: scale(0.97); transition: transform .1s; }

        /* ── NAV subtitle ── */
        .nav-sub { display: none; }
        @media (min-width: 480px) { .nav-sub { display: block; } }

        /* ── HERO ── */
        /* Mobile: single column */
        .hero-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 36px 20px 48px;
          display: flex; flex-direction: column; gap: 32px;
        }
        /* Desktop: two columns */
        @media (min-width: 1024px) {
          .hero-inner {
            display: grid !important;
            grid-template-columns: 1fr 340px;
            gap: 3rem; align-items: center;
            padding: 60px 24px;
          }
        }

        /* Fixture cards: hidden on mobile, shown on desktop */
        .hero-fixtures-desktop { display: none; }
        @media (min-width: 1024px) { .hero-fixtures-desktop { display: flex; flex-direction: column; gap: 8px; } }

        /* Mobile fixture strip: shown on mobile, hidden on desktop */
        .hero-fixtures-mobile { display: flex; flex-direction: column; gap: 8px; }
        @media (min-width: 1024px) { .hero-fixtures-mobile { display: none !important; } }

        /* ── STATS ── */
        /* 2-col on mobile, 4-col on desktop */
        .stats-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
        }
        .stat-cell {
          padding: 20px 16px; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.07);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .stat-cell:nth-child(2n)            { border-right: none; }
        .stat-cell:nth-child(3),
        .stat-cell:nth-child(4)             { border-bottom: none; }
        @media (min-width: 768px) {
          .stats-inner { grid-template-columns: repeat(4, 1fr); }
          .stat-cell   { border-bottom: none; padding: 24px 20px; }
          .stat-cell:nth-child(2n) { border-right: 1px solid rgba(255,255,255,0.07); }
          .stat-cell:last-child    { border-right: none; }
        }

        /* ── FEATURES ── */
        /* 1-col mobile → 2-col tablet → 4-col desktop */
        .features-grid {
          display: grid; grid-template-columns: 1fr;
          gap: 1px; background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.07);
        }
        @media (min-width: 640px)  { .features-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(4, 1fr); } }

        /* ── LEAGUES ── */
        /* 2-col mobile → 3-col tablet → 6-col desktop */
        .leagues-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 1px; background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.07);
        }
        @media (min-width: 480px)  { .leagues-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .leagues-grid { grid-template-columns: repeat(6, 1fr); } }

        /* ── STEPS ── */
        /* 1-col mobile → 3-col desktop */
        .steps-grid {
          display: grid; grid-template-columns: 1fr;
          gap: 1px; background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.07);
        }
        @media (min-width: 768px) { .steps-grid { grid-template-columns: repeat(3, 1fr); } }

        /* ── Section padding ── */
        .sec { padding: 3.5rem 20px; }
        @media (min-width: 640px)  { .sec { padding: 5rem 24px; } }
        @media (min-width: 1024px) { .sec { padding: 6rem 24px; } }

        /* ── Footer ── */
        .footer-inner {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; text-align: center;
        }
        @media (min-width: 640px) {
          .footer-inner {
            flex-direction: row; justify-content: space-between; text-align: left;
          }
          .footer-legal { order: 0; }
        }
      `}</style>

      {/* ═══ NAV ═══════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        background: scrolled ? 'rgba(7,8,16,0.97)' : 'rgba(7,8,16,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
        transition: 'all .3s ease',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg,${C.green},#00897b)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: '0.02em', lineHeight: 1 }}>
              BET<span style={{ color: C.green }}>AI</span>
            </div>
            <div className="nav-sub" style={{ fontSize: 8, color: C.text2, letterSpacing: '0.12em' }}>PREDICTION ENGINE</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isLoggedIn ? (
            <Link href="/dashboard" style={{
              padding: '7px 16px', borderRadius: 8,
              background: `linear-gradient(90deg,${C.green},${C.greenD})`,
              color: C.bg0, fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 900, fontSize: 12, letterSpacing: '0.06em', whiteSpace: 'nowrap',
            }}>DASHBOARD →</Link>
          ) : (
            <>
              <Link href="/auth/login" style={{
                padding: '6px 14px', borderRadius: 7,
                border: `1px solid ${C.border}`,
                color: C.text1, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', whiteSpace: 'nowrap',
              }}>SIGN IN</Link>
              <Link href="/auth/signup" style={{
                padding: '7px 16px', borderRadius: 8,
                background: `linear-gradient(90deg,${C.green},${C.greenD})`,
                color: C.bg0, fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 900, fontSize: 12, letterSpacing: '0.06em', whiteSpace: 'nowrap',
              }}>GET ACCESS</Link>
            </>
          )}
        </div>
      </nav>

      {/* ═══ TICKER ═════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99,
        height: 26, background: C.bg1, borderBottom: `1px solid ${C.border}`,
        overflow: 'hidden', display: 'flex', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', animation: 'ticker 32s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri}>
              {SAMPLE.concat(SAMPLE).map((s, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', padding: '0 14px', color: C.text2 }}>
                  {s.flag}{' '}
                  <span style={{ color: C.text1 }}>{s.home}</span>
                  <span style={{ color: C.text2, margin: '0 4px' }}>vs</span>
                  <span style={{ color: C.text1 }}>{s.away}</span>
                  <span style={{ color: C.text2, margin: '0 6px' }}>·</span>
                  <span style={{ color: C.text2 }}>{s.display}</span>
                  <span style={{ color: 'rgba(255,255,255,0.05)', margin: '0 12px' }}>|</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ HERO ════════════════════════════════════════════════ */}
      <section style={{
        paddingTop: 'calc(56px + 26px)',
        minHeight: '100svh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,230,118,0.05) 0%, transparent 70%)` }}/>

        <div className="hero-inner">
          {/* Left — copy */}
          <div>
            <div className="fade-1" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
              borderRadius: 999, padding: '5px 14px 5px 8px', marginBottom: 20,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green,
                boxShadow: `0 0 0 3px rgba(0,230,118,0.2)`, animation: 'pulse 1.8s ease infinite', display: 'block', flexShrink: 0 }}/>
              <span style={{ fontSize: 10, color: C.green, fontWeight: 800, letterSpacing: '0.12em' }}>AI PREDICTIONS LIVE</span>
            </div>

            <h1 className="fade-2" style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
              fontSize: 'clamp(2.6rem,10vw,5.5rem)',
              lineHeight: 0.95, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.01em',
            }}>
              WIN MORE.<br />
              <span style={{ color: C.green }}>BET SMARTER.</span><br />
              <span style={{ color: C.text2 }}>EVERY DAY.</span>
            </h1>

            <p className="fade-3" style={{ fontSize: 14, color: C.text1, maxWidth: 480, lineHeight: 1.75, marginBottom: 24 }}>
              Our Gemini AI engine analyses thousands of data points across Europe&apos;s top leagues to deliver high-confidence football predictions daily.
            </p>

            <div className="fade-4" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              <Link href="/auth/signup" className="btn" style={{
                padding: '12px 24px', borderRadius: 10,
                background: `linear-gradient(90deg,${C.green},${C.greenD})`,
                color: C.bg0, fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 900, fontSize: 14, letterSpacing: '0.07em', whiteSpace: 'nowrap',
              }}>START WINNING →</Link>
              <Link href="/auth/login" style={{
                padding: '12px 20px', borderRadius: 10,
                border: `1px solid ${C.border}`,
                color: C.text1, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
              }}>SIGN IN</Link>
            </div>

            <div className="fade-5" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {LEAGUES.map(l => (
                <span key={l.name} style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                  padding: '4px 10px', borderRadius: 999,
                  background: C.bg2, border: `1px solid ${C.border}`, color: C.text2,
                }}>{l.flag} {l.name.toUpperCase()}</span>
              ))}
            </div>
          </div>

          {/* Right — desktop fixture cards */}
          <div className="hero-fixtures-desktop">
            <div style={{ fontSize: 9, color: C.text2, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 4 }}>UPCOMING FIXTURES</div>
            {SAMPLE.map((s, i) => (
              <div key={i} className="card-hover" style={{
                background: C.bg1, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '12px 14px',
                animation: `fadeUp .4s ${0.3 + i * 0.07}s ease both`, animationFillMode: 'both',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12 }}>{s.flag}</span>
                    <span style={{ fontSize: 9, color: C.text1, fontWeight: 600, letterSpacing: '0.06em' }}>{s.league.toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize: 9, color: C.text2 }}>{s.round}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: C.text0 }}>{s.home}</div>
                  </div>
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', textAlign: 'center', minWidth: 34 }}>
                    <div style={{ fontSize: 9, color: C.text2, fontWeight: 700 }}>VS</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: C.text1 }}>{s.away}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 9, color: C.text2 }}>🕐</span>
                  <span style={{ fontSize: 10, color: C.text2, fontFamily: 'monospace' }}>{s.display}</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: 9, color: C.green, fontWeight: 800, letterSpacing: '0.07em',
                    background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                    borderRadius: 4, padding: '1px 6px',
                  }}>SIGN IN TO VIEW</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile fixture strip — compact rows */}
          <div className="hero-fixtures-mobile">
            <div style={{ fontSize: 9, color: C.text2, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 8 }}>UPCOMING FIXTURES</div>
            {SAMPLE.slice(0, 3).map((s, i) => (
              <div key={i} style={{
                background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{s.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.home} <span style={{ color: C.text2, fontWeight: 400 }}>vs</span> {s.away}
                  </div>
                  <div style={{ fontSize: 9, color: C.text2, marginTop: 2 }}>{s.league} · {s.display}</div>
                </div>
                <div style={{
                  fontSize: 9, color: C.green, fontWeight: 800, letterSpacing: '0.06em',
                  background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                  borderRadius: 4, padding: '2px 7px', flexShrink: 0,
                }}>LOGIN</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ══════════════════════════════════════════ */}
      <section style={{ background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        <div className="stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stat-cell">
              <div style={{ fontSize: 18, marginBottom: 8 }}>{s.icon}</div>
              <div style={{
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
                fontSize: 28, color: C.green, letterSpacing: '-0.01em', lineHeight: 1, marginBottom: 4,
              }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.text0, letterSpacing: '0.06em', marginBottom: 2 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 9, color: C.text2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════════ */}
      <section className="sec" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: C.green }}/>
              <span style={{ fontSize: 9, color: C.green, fontWeight: 800, letterSpacing: '0.16em' }}>WHY BETAI</span>
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
              fontSize: 'clamp(1.8rem,6vw,3rem)', textTransform: 'uppercase', letterSpacing: '0.01em',
            }}>
              Intelligence that <span style={{ color: C.green }}>converts.</span>
            </h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-hover" style={{ background: C.bg1, padding: '22px 20px' }}>
                <div style={{ fontSize: 24, color: C.green, marginBottom: 12, lineHeight: 1 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: '0.04em', marginBottom: 8, color: C.text0 }}>
                  {f.title.toUpperCase()}
                </div>
                <p style={{ fontSize: 12, color: C.text1, lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LEAGUES ════════════════════════════════════════════ */}
      <section className="sec" style={{ background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: C.blue }}/>
            <span style={{ fontSize: 9, color: C.blue, fontWeight: 800, letterSpacing: '0.16em' }}>COVERAGE</span>
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
            fontSize: 'clamp(1.8rem,6vw,3rem)', textTransform: 'uppercase', marginBottom: 24,
          }}>
            6 elite competitions. <span style={{ color: C.green }}>Daily.</span>
          </h2>
          <div className="leagues-grid">
            {LEAGUES.map((l, i) => (
              <div key={i} className="card-hover" style={{
                background: C.bg0, padding: '18px 12px', textAlign: 'center', transition: 'background .2s',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{l.flag}</div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: C.text1 }}>{l.name.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section className="sec" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: C.gold }}/>
            <span style={{ fontSize: 9, color: C.gold, fontWeight: 800, letterSpacing: '0.16em' }}>PROCESS</span>
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
            fontSize: 'clamp(1.8rem,6vw,3rem)', textTransform: 'uppercase', marginBottom: 28,
          }}>
            Up and running in <span style={{ color: C.green }}>3 steps.</span>
          </h2>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: C.bg1, padding: '22px 20px', position: 'relative' }}>
                <div style={{
                  fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
                  fontSize: 48, color: 'rgba(0,230,118,0.06)', lineHeight: 1, marginBottom: 10,
                }}>{s.n}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 800,
                    color: C.green, background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                    borderRadius: 5, padding: '2px 8px', letterSpacing: '0.08em',
                  }}>{s.n}</span>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '0.03em' }}>
                    {s.title.toUpperCase()}
                  </div>
                </div>
                <p style={{ fontSize: 12, color: C.text1, lineHeight: 1.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════ */}
      <section style={{
        padding: '4rem 20px', background: C.bg1,
        borderBottom: `1px solid ${C.border}`,
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 70% 80% at 50% 100%, rgba(0,230,118,0.06) 0%, transparent 70%)` }}/>
        <div style={{ position: 'relative', maxWidth: 580, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: C.orange }}/>
            <span style={{ fontSize: 9, color: C.orange, fontWeight: 800, letterSpacing: '0.16em' }}>🔥 GET STARTED</span>
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
            fontSize: 'clamp(2.2rem,9vw,5rem)', textTransform: 'uppercase',
            letterSpacing: '0.01em', lineHeight: 0.95, marginBottom: 14,
          }}>
            READY TO START<br /><span style={{ color: C.green }}>WINNING?</span>
          </h2>
          <p style={{ fontSize: 13, color: C.text1, lineHeight: 1.7, marginBottom: 24 }}>
            Join over 1,200 subscribers already using BetAI to make smarter decisions.
          </p>
          <Link href="/auth/signup" className="btn" style={{
            display: 'inline-block', padding: '14px 32px', borderRadius: 10,
            background: `linear-gradient(90deg,${C.green},${C.greenD})`,
            color: C.bg0, fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 900, fontSize: 15, letterSpacing: '0.07em',
          }}>GET YOUR PROMO CODE →</Link>
          <p style={{ fontSize: 10, color: C.text2, marginTop: 12 }}>
            18+ · Please gamble responsibly · For entertainment purposes only
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '18px 20px', background: C.bg0 }}>
        <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: `linear-gradient(135deg,${C.green},#00897b)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>⚡</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 17, letterSpacing: '0.02em' }}>
              BET<span style={{ color: C.green }}>AI</span>
            </div>
          </div>

          {/* Legal */}
          <p className="footer-legal" style={{ fontSize: 10, color: C.text2 }} suppressHydrationWarning>
            © {new Date().getFullYear()} BetAI · For entertainment purposes only · Please gamble responsibly
          </p>

          {/* Links */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/auth/login"  style={{ fontSize: 11, color: C.text2, fontWeight: 600, letterSpacing: '0.06em' }}>SIGN IN</Link>
            <Link href="/auth/signup" style={{ fontSize: 11, color: C.green,  fontWeight: 700, letterSpacing: '0.06em' }}>GET ACCESS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  // Already logged in → send straight to dashboard
  if (session) {
    return {
      redirect: { destination: '/dashboard', permanent: false },
    };
  }
  return { props: { isLoggedIn: false } };
};