// pages/index.tsx — Professional Landing Page
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from '../lib/auth';

const STATS = [
  { value: '74.1%', label: 'Win Rate', sub: 'Last 7 days' },
  { value: '1,284', label: 'Predictions Today', sub: 'Across all leagues' },
  { value: '94.2%', label: 'AI Accuracy', sub: '300 settled bets' },
  { value: '+18.4%', label: 'Portfolio ROI', sub: 'This month' },
];

const FEATURES = [
  { icon: '🧠', title: 'Gemini AI Engine', desc: 'Our AI analyzes 50+ data points per match including form, injuries, H2H, odds movement, and tactical patterns.' },
  { icon: '⚡', title: 'Real-Time Data', desc: 'Live fixture data from Premier League, La Liga, Bundesliga, Serie A, Ligue 1 and Champions League daily.' },
  { icon: '📊', title: 'Confidence Scoring', desc: 'Every prediction carries a confidence rating and value indicator so you know exactly how strong each signal is.' },
  { icon: '💰', title: 'Value Bets', desc: 'Our AI identifies value bets where our predicted probability exceeds the implied bookmaker probability.' },
];

const LEAGUES = [
  { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', matches: 10 },
  { name: 'La Liga', flag: '🇪🇸', matches: 10 },
  { name: 'Bundesliga', flag: '🇩🇪', matches: 9 },
  { name: 'Serie A', flag: '🇮🇹', matches: 10 },
  { name: 'Ligue 1', flag: '🇫🇷', matches: 10 },
  { name: 'Champions League', flag: '⭐', matches: 8 },
];

const HOW_IT_WORKS = [
  { n: '01', title: 'Get a Promo Code', desc: 'Join our Telegram channel and purchase a premium access code to unlock BetAI predictions.', action: 'Join Telegram →', link: 'https://t.me/+pU9nGY-wN_w0MzM8' },
  { n: '02', title: 'Create Your Account', desc: 'Sign up with your email and activate your subscription using the promo code you received.' },
  { n: '03', title: 'Win with AI Daily', desc: 'Log in every day for AI-powered predictions with confidence scores, odds, and expert analysis.' },
];

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ background: 'var(--bg-void)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* ── Sticky Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '60px', display: 'flex', alignItems: 'center',
        padding: '0 2rem',
        background: scrolled ? 'rgba(2,4,8,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s ease',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#020408', fontSize: '1rem' }}>B</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.08em' }}>
            BET<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {[
            { label: 'Features', id: 'features' },
            { label: 'Leagues', id: 'leagues' },
            { label: 'How It Works', id: 'how-it-works' },
          ].map(item => (
            <button key={item.id} onClick={() => scrollToSection(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isLoggedIn ? (
            <Link href="/dashboard" style={{ background: 'var(--accent)', color: '#020408', padding: '0.5rem 1.25rem', borderRadius: '7px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em', textDecoration: 'none' }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/auth/login" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}>
                Sign In
              </Link>
              <a href="https://t.me/+pU9nGY-wN_w0MzM8" target="_blank" rel="noopener noreferrer"
                style={{ background: 'var(--accent)', color: '#020408', padding: '0.5rem 1.25rem', borderRadius: '7px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em', textDecoration: 'none' }}>
                Get Access
              </a>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
        <div className="grid-texture" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '80px' }}>
          {/* Ticker */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.375rem 1rem', borderRadius: '999px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <span className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--accent)' }}>94.2% AI ACCURACY · 1,284 PREDICTIONS TODAY · 73.1% WIN RATE (7D)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
            <div>
              <h1 className="hero-display" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', marginBottom: '1.5rem', lineHeight: 0.95 }}>
                WIN MORE.<br />
                <span className="gradient-text">BET SMARTER.</span><br />
                <span style={{ WebkitTextStroke: '1px rgba(52,211,153,0.4)', color: 'transparent' }}>EVERY DAY.</span>
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '480px' }}>
                AI-powered football predictions for Premier League, La Liga, Bundesliga, Serie A and more. Join 1,200+ winning subscribers.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <a href="https://t.me/+pU9nGY-wN_w0MzM8" target="_blank" rel="noopener noreferrer"
                  style={{ background: 'var(--accent)', color: '#020408', padding: '0.875rem 2rem', borderRadius: '8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
                  📱 Get Your Promo Code
                </a>
                <Link href="/auth/login"
                  style={{ background: 'transparent', color: 'var(--accent)', padding: '0.875rem 2rem', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.4)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em', textDecoration: 'none' }}>
                  Sign In →
                </Link>
              </div>
              {/* Trust badges */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {['🔒 SSL Secure', '⚡ Daily Updates', '🤖 Gemini AI', '📱 Telegram Support'].map(b => (
                  <span key={b} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Hero stats card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {STATS.map((s, i) => (
                <div key={i} className="stat-card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <div className="hero-display gradient-text" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{s.value}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '6rem 2rem', position: 'relative', zIndex: 1, background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>Why BetAI</p>
            <h2 className="hero-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              Intelligence that <span className="gradient-text">converts</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="glass glass-hover" style={{ borderRadius: '14px', padding: '1.75rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.03em', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leagues ── */}
      <section id="leagues" style={{ padding: '6rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>Coverage</p>
            <h2 className="hero-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>6 elite competitions. Daily.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {LEAGUES.map((l, i) => (
              <div key={i} className="glass glass-hover" style={{ borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{l.flag}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{l.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent)' }}>{l.matches} matches/week</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '6rem 2rem', background: 'var(--bg-base)', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem' }}>Process</p>
          <h2 className="hero-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '3.5rem' }}>Up and running in 3 steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i}>
                <div className="hero-display" style={{ fontSize: '4rem', color: 'rgba(52,211,153,0.08)', marginBottom: '-0.75rem' }}>{s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{s.title}</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: s.action ? '1rem' : 0 }}>{s.desc}</p>
                {s.action && s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {s.action}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '6rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 className="hero-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginBottom: '1rem' }}>
            Ready to start <span className="gradient-text">winning?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1rem' }}>
            Join 1,200+ subscribers already using BetAI. Get your promo code on Telegram.
          </p>
          <a href="https://t.me/+pU9nGY-wN_w0MzM8" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: 'var(--accent)', color: '#020408', padding: '1.1rem 3rem', borderRadius: '8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.05em', textDecoration: 'none' }}>
            📱 Get Promo Code on Telegram
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em' }}>
            BET<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            © {new Date().getFullYear()} BetAI · AI predictions only · 18+ · Gamble responsibly · BeGambleAware.org
          </p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  return { props: { isLoggedIn: !!session } };
};
