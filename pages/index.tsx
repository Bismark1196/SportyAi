// pages/index.tsx — BetAI Landing Page (matched to dashboard UI)
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getSession } from '../lib/auth';

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
  orange: '#ff6d00',
  orangeFaint: 'rgba(255,109,0,0.08)',
  orangeBorder: 'rgba(255,109,0,0.25)',
  red: '#ff5252',
  redFaint: 'rgba(255,82,82,0.09)',
  text0: '#eceef8',
  text1: '#8e90a8',
  text2: '#4a4c68',
};

const STATS = [
  { icon: '🎯', label: 'AI Win Rate',     value: '74%',   sub: 'Last 30 days' },
  { icon: '⚽', label: "Today's Tips",    value: '32',    sub: 'Across 6 leagues' },
  { icon: '📈', label: 'Avg Confidence', value: '79%',   sub: 'Per prediction' },
  { icon: '👥', label: 'Active Users',   value: '1,200+',sub: 'Subscribers' },
];

const FEATURES = [
  { icon: '◈', title: 'Gemini AI Engine',    desc: 'Powered by Google Gemini AI — analyses team form, H2H records, injuries, odds movement, and tactical patterns in seconds.' },
  { icon: '◎', title: 'Real-Time Fixtures',  desc: 'Live data from Premier League, La Liga, Bundesliga, Serie A, Ligue 1 and Champions League, refreshed continuously.' },
  { icon: '◐', title: 'Confidence Scoring',  desc: 'Every prediction carries an ELITE / HIGH / MED rating so you always know the signal strength before placing.' },
  { icon: '◑', title: 'Promo-Gated Access',  desc: 'Exclusive promo code system ensures only serious bettors access our premium AI tips. No free rides.' },
];

const SAMPLE = [
  { league: 'Champions League', flag: '⭐', home: 'Arsenal',        away: 'Sporting CP',   display: 'Tue 7 Apr · 22:00', round: 'QF Leg 1' },
  { league: 'La Liga',          flag: '🇪🇸', home: 'FC Barcelona',   away: 'Espanyol',      display: 'Sat 11 Apr · 19:30', round: 'Matchday 33' },
  { league: 'Bundesliga',       flag: '🇩🇪', home: 'FC St. Pauli',   away: 'Bayern Munich', display: 'Sat 11 Apr · 19:30', round: 'Matchday 30' },
  { league: 'Premier League',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', home: 'Arsenal',        away: 'Bournemouth',   display: 'Sat 11 Apr · 14:30', round: 'GW35' },
  { league: 'Champions League', flag: '⭐', home: 'PSG',             away: 'Liverpool',     display: 'Wed 8 Apr · 22:00', round: 'QF Leg 1' },
];

const LEAGUES = [
  { name: 'Premier League',    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga',           flag: '🇪🇸' },
  { name: 'Bundesliga',        flag: '🇩🇪' },
  { name: 'Serie A',           flag: '🇮🇹' },
  { name: 'Ligue 1',           flag: '🇫🇷' },
  { name: 'Champions League',  flag: '⭐' },
];

const STEPS = [
  { n: '01', title: 'Get a Promo Code',    desc: 'Purchase a premium access code. Contact us via email or WhatsApp to get yours.' },
  { n: '02', title: 'Create Account',      desc: 'Sign up with your email and activate your subscription using the promo code.' },
  { n: '03', title: 'Receive Daily Tips',  desc: 'Log in every day to see AI-generated predictions with confidence ratings and analysis.' },
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
        body { overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes glowOrange { 0%,100%{box-shadow:0 0 0 0 rgba(255,109,0,0.3)} 50%{box-shadow:0 0 20px 4px rgba(255,109,0,0.12)} }
        @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .fade-1 { animation: fadeUp .4s ease both; }
        .fade-2 { animation: fadeUp .4s .08s ease both; }
        .fade-3 { animation: fadeUp .4s .16s ease both; }
        .fade-4 { animation: fadeUp .4s .24s ease both; }
        .fade-5 { animation: fadeUp .4s .32s ease both; }

        .card-hover:hover { border-color: rgba(255,255,255,0.14) !important; }
        .btn-hover:hover  { opacity: .88; }
        .btn:active       { transform: scale(0.97); transition: transform .1s; }

        .conf-elite { background: rgba(255,215,64,0.12); border: 1px solid rgba(255,215,64,0.30); color: #ffd740; }
        .conf-high  { background: rgba(0,230,118,0.08);  border: 1px solid rgba(0,230,118,0.22); color: #00e676; }
        .conf-med   { background: rgba(68,138,255,0.10); border: 1px solid rgba(68,138,255,0.30); color: #448aff; }
      `}</style>

      {/* ═══ NAV ═══════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        background: scrolled ? 'rgba(7,8,16,0.97)' : 'rgba(7,8,16,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
        transition: 'all .3s ease',
        display: 'flex', alignItems: 'center', padding: '0 24px',
        justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `linear-gradient(135deg,${C.green},#00897b)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: '0.02em', lineHeight: 1 }}>
              BET<span style={{ color: C.green }}>AI</span>
            </div>
            <div style={{ fontSize: 9, color: C.text2, letterSpacing: '0.12em' }}>PREDICTION ENGINE</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isLoggedIn ? (
            <Link href="/dashboard" style={{
              padding: '8px 20px', borderRadius: 9,
              background: `linear-gradient(90deg,${C.green},${C.greenD})`,
              color: C.bg0, fontFamily: "'Barlow Condensed',sans-serif",
              fontWeight: 900, fontSize: 13, letterSpacing: '0.06em',
            }}>DASHBOARD →</Link>
          ) : (
            <>
              <Link href="/auth/login" style={{
                padding: '7px 16px', borderRadius: 8,
                border: `1px solid ${C.border}`,
                color: C.text1, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              }}>SIGN IN</Link>
              <Link href="/auth/signup" style={{
                padding: '8px 20px', borderRadius: 9,
                background: `linear-gradient(90deg,${C.green},${C.greenD})`,
                color: C.bg0, fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 900, fontSize: 13, letterSpacing: '0.06em',
              }}>GET ACCESS</Link>
            </>
          )}
        </div>
      </nav>

      {/* ═══ TICKER ═════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99,
        height: 28, background: C.bg1,
        borderBottom: `1px solid ${C.border}`,
        overflow: 'hidden', display: 'flex', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', animation: 'ticker 28s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri}>
              {SAMPLE.concat(SAMPLE).map((s, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', padding: '0 20px', color: C.text2 }}>
                  {s.flag} <span style={{ color: C.text1 }}>{s.home}</span>
                  <span style={{ color: C.text2, margin: '0 5px' }}>vs</span>
                  <span style={{ color: C.text1 }}>{s.away}</span>
                  <span style={{ color: C.text2, margin: '0 8px' }}>·</span>
                  <span style={{ color: C.text2 }}>{s.display}</span>
                  <span style={{ color: C.border, margin: '0 18px' }}>|</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ HERO ════════════════════════════════════════════════ */}
      <section style={{
        paddingTop: 'calc(56px + 28px)',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        borderBottom: `1px solid ${C.border}`,
      }}>
        {/* ambient glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,230,118,0.05) 0%, transparent 70%),
                       radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,109,0,0.04) 0%, transparent 60%)`,
        }}/>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'center' }}>

            {/* Left */}
            <div>
              {/* live badge */}
              <div className="fade-1" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                borderRadius: 999, padding: '5px 14px 5px 8px', marginBottom: 28,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: C.green,
                  boxShadow: `0 0 0 3px rgba(0,230,118,0.2)`,
                  animation: 'pulse 1.8s ease infinite', display: 'block',
                }}/>
                <span style={{ fontSize: 10, color: C.green, fontWeight: 800, letterSpacing: '0.12em' }}>AI PREDICTIONS LIVE</span>
              </div>

              <h1 className="fade-2" style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 900, letterSpacing: '0.01em',
                fontSize: 'clamp(3.2rem,6vw,5.5rem)',
                lineHeight: 0.95, marginBottom: 24,
                textTransform: 'uppercase',
              }}>
                WIN MORE.<br />
                <span style={{ color: C.green }}>BET SMARTER.</span><br />
                <span style={{ color: C.text2 }}>EVERY DAY.</span>
              </h1>

              <p className="fade-3" style={{ fontSize: 15, color: C.text1, maxWidth: 480, lineHeight: 1.75, marginBottom: 32 }}>
                Our Gemini AI engine analyses thousands of data points across Europe&apos;s top leagues to deliver high-confidence football predictions daily.
              </p>

              <div className="fade-4" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
                <Link href="/auth/signup" className="btn" style={{
                  padding: '12px 28px', borderRadius: 10,
                  background: `linear-gradient(90deg,${C.green},${C.greenD})`,
                  color: C.bg0, fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 900, fontSize: 15, letterSpacing: '0.07em',
                }}>START WINNING TODAY →</Link>
                <Link href="/auth/login" style={{
                  padding: '12px 22px', borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  color: C.text1, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em',
                  display: 'flex', alignItems: 'center',
                }}>SIGN IN</Link>
              </div>

              {/* League pills */}
              <div className="fade-5" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {LEAGUES.map(l => (
                  <span key={l.name} style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                    padding: '4px 12px', borderRadius: 999,
                    background: C.bg2, border: `1px solid ${C.border}`, color: C.text2,
                  }}>{l.flag} {l.name.toUpperCase()}</span>
                ))}
              </div>
            </div>

            {/* Right — upcoming fixture cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 9, color: C.text2, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 4 }}>UPCOMING FIXTURES</div>
              {SAMPLE.map((s, i) => (
                <div key={i} className="card-hover" style={{
                  background: C.bg1,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '12px 14px',
                  animation: `fadeUp .4s ${0.3 + i * 0.07}s ease both`,
                  animationFillMode: 'both',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{s.flag}</span>
                      <span style={{ fontSize: 9, color: C.text1, fontWeight: 600, letterSpacing: '0.06em' }}>{s.league.toUpperCase()}</span>
                    </div>
                    <span style={{ fontSize: 9, color: C.text2, letterSpacing: '0.04em' }}>{s.round}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: C.text0, lineHeight: 1.2 }}>{s.home}</div>
                    </div>
                    <div style={{
                      background: C.bg2, border: `1px solid ${C.border}`,
                      borderRadius: 6, padding: '5px 8px', textAlign: 'center', minWidth: 36,
                    }}>
                      <div style={{ fontSize: 9, color: C.text2, fontWeight: 700 }}>VS</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: C.text1, lineHeight: 1.2 }}>{s.away}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 9, color: C.text2 }}>🕐</span>
                    <span style={{ fontSize: 10, color: C.text2, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{s.display}</span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 9, color: C.green, fontWeight: 800, letterSpacing: '0.08em',
                      background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                      borderRadius: 4, padding: '1px 6px',
                    }}>SIGN IN TO VIEW TIPS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ══════════════════════════════════════════ */}
      <section style={{ background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: '28px 24px', textAlign: 'center',
              borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>{s.icon}</div>
              <div style={{
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
                fontSize: 32, color: C.green, letterSpacing: '-0.01em', lineHeight: 1,
                marginBottom: 4,
              }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text0, letterSpacing: '0.06em', marginBottom: 3 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: C.text2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════════ */}
      <section id="features" style={{ padding: '6rem 24px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: C.green }}/>
              <span style={{ fontSize: 9, color: C.green, fontWeight: 800, letterSpacing: '0.16em' }}>WHY BETAI</span>
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
              Intelligence that <span style={{ color: C.green }}>converts.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: C.border, border: `1px solid ${C.border}` }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card-hover" style={{ background: C.bg1, padding: '28px 24px' }}>
                <div style={{ fontSize: 28, color: C.green, marginBottom: 18, lineHeight: 1 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: '0.04em', marginBottom: 10, color: C.text0 }}>{f.title.toUpperCase()}</div>
                <p style={{ fontSize: 12, color: C.text1, lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LEAGUES ════════════════════════════════════════════ */}
      <section id="leagues" style={{ padding: '5rem 24px', background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.blue }}/>
            <span style={{ fontSize: 9, color: C.blue, fontWeight: 800, letterSpacing: '0.16em' }}>COVERAGE</span>
          </div>
          <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', textTransform: 'uppercase', marginBottom: 32 }}>
            6 elite competitions. <span style={{ color: C.green }}>Daily.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 1, background: C.border, border: `1px solid ${C.border}` }}>
            {LEAGUES.map((l, i) => (
              <div key={i} className="card-hover" style={{
                background: C.bg0, padding: '24px 16px', textAlign: 'center',
                transition: 'background .2s',
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{l.flag}</div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.09em', color: C.text1 }}>{l.name.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '6rem 24px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.gold }}/>
            <span style={{ fontSize: 9, color: C.gold, fontWeight: 800, letterSpacing: '0.16em' }}>PROCESS</span>
          </div>
          <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', textTransform: 'uppercase', marginBottom: 40 }}>
            Up and running in <span style={{ color: C.green }}>3 steps.</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: C.border, border: `1px solid ${C.border}` }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: C.bg1, padding: '28px 24px', position: 'relative' }}>
                <div style={{
                  fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 56,
                  color: `rgba(0,230,118,0.06)`, lineHeight: 1, marginBottom: 12,
                }}>{s.n}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 800,
                    color: C.green, background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                    borderRadius: 5, padding: '2px 8px', letterSpacing: '0.08em',
                  }}>{s.n}</span>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '0.03em' }}>{s.title.toUpperCase()}</div>
                </div>
                <p style={{ fontSize: 12, color: C.text1, lineHeight: 1.8 }}>{s.desc}</p>
                {i < 2 && (
                  <div style={{
                    position: 'absolute', right: -1, top: '25%', bottom: '25%',
                    width: 1, background: `linear-gradient(to bottom, transparent, ${C.green}, transparent)`,
                    opacity: 0.2,
                  }}/>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════ */}
      <section style={{
        padding: '6rem 24px', background: C.bg1,
        borderBottom: `1px solid ${C.border}`,
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 80% at 50% 100%, rgba(0,230,118,0.05) 0%, transparent 70%)`,
        }}/>
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: C.orange }}/>
            <span style={{ fontSize: 9, color: C.orange, fontWeight: 800, letterSpacing: '0.16em' }}>🔥 GET STARTED</span>
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
            fontSize: 'clamp(2.5rem,6vw,5rem)', textTransform: 'uppercase',
            letterSpacing: '0.01em', lineHeight: 0.95, marginBottom: 20,
          }}>
            READY TO START<br /><span style={{ color: C.green }}>WINNING?</span>
          </h2>
          <p style={{ fontSize: 14, color: C.text1, marginBottom: 36, lineHeight: 1.7 }}>
            Join over 1,200 subscribers already using BetAI to make smarter decisions.
          </p>
          <Link href="/auth/signup" className="btn" style={{
            display: 'inline-block',
            padding: '14px 40px', borderRadius: 10,
            background: `linear-gradient(90deg,${C.green},${C.greenD})`,
            color: C.bg0, fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 900, fontSize: 17, letterSpacing: '0.07em',
          }}>GET YOUR PROMO CODE →</Link>
          <p style={{ fontSize: 10, color: C.text2, marginTop: 16 }}>18+ · Please gamble responsibly · For entertainment purposes only</p>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════════════════════════════ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        background: C.bg0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `linear-gradient(135deg,${C.green},#00897b)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>⚡</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: '0.02em' }}>
            BET<span style={{ color: C.green }}>AI</span>
          </div>
        </div>
        <p style={{ fontSize: 10, color: C.text2, textAlign: 'center' }}>
          © {new Date().getFullYear()} BetAI · For entertainment purposes only · Please gamble responsibly
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/auth/login"  style={{ fontSize: 11, color: C.text2, fontWeight: 600, letterSpacing: '0.06em' }}>SIGN IN</Link>
          <Link href="/auth/signup" style={{ fontSize: 11, color: C.green,  fontWeight: 700, letterSpacing: '0.06em' }}>GET ACCESS</Link>
        </div>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  return { props: { isLoggedIn: !!session } };
};
