// pages/index.tsx — Premium Landing Page
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getSession } from '../lib/auth';

const STATS = [
  { value: '74%',    label: 'Win Rate',      sub: 'Last 30 days' },
  { value: '2,800+', label: 'Predictions',   sub: 'Total made' },
  { value: '1,200+', label: 'Active Users',  sub: 'Subscribers' },
  { value: '2.15',   label: 'Avg Odds',      sub: 'Per prediction' },
];

const FEATURES = [
  { icon: '◈', title: 'Gemini AI Engine',     desc: 'Powered by Google Gemini AI — analyzes team form, H2H records, injuries, odds movement, and tactical patterns in seconds.' },
  { icon: '◎', title: 'Real-Time Fixtures',   desc: 'Live data from top European leagues. Premier League, La Liga, Bundesliga, Serie A, Ligue 1 and Champions League covered daily.' },
  { icon: '◐', title: 'Confidence Scoring',   desc: 'Every prediction carries a confidence rating so you know exactly how strong the signal is before placing your stake.' },
  { icon: '◑', title: 'Promo-Gated Access',   desc: 'Exclusive promo code system ensures only serious bettors access our premium AI tips. No free rides.' },
];

const LEAGUES = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'];

const SAMPLE_PREDICTIONS = [
  { home: 'Arsenal', away: 'Chelsea', league: 'Premier League', pred: 'Home Win', conf: 84, odds: 2.10 },
  { home: 'Real Madrid', away: 'Barcelona', league: 'La Liga', pred: 'Home Win', conf: 78, odds: 1.90 },
  { home: 'Bayern Munich', away: 'Dortmund', league: 'Bundesliga', pred: 'Home Win', conf: 91, odds: 1.65 },
];

function AnimatedNumber({ target }: { target: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setDisplay(target);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="transition-all duration-700">{display}</div>;
}

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ background: 'var(--bg-void)', fontFamily: 'var(--font-body)' }}>
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}
        style={{ background: scrolled ? 'rgba(2,4,8,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid var(--border)' : 'none' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#020408', fontSize: '0.9rem' }}>
              B
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em' }}>
              BET<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Leagues', 'How It Works'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="nav-link">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost" style={{ padding: '0.6rem 1.25rem', fontSize: '0.82rem' }}>
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.82rem' }}>
                  Get Access
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-20" style={{ zIndex: 1 }}>
        <div className="grid-texture absolute inset-0 opacity-100" />
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="max-w-4xl">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full glass"
              style={{ border: '1px solid var(--border-accent)' }}>
              <span className="live-dot w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                AI Predictions Live
              </span>
            </div>

            <h1 className="hero-display mb-6" style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', color: 'var(--text-primary)' }}>
              WIN MORE.<br />
              <span className="gradient-text">BET SMARTER.</span><br />
              <span className="text-stroke">EVERY DAY.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '540px', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Our Gemini AI engine analyzes thousands of data points across Europe's top leagues to deliver high-confidence football predictions daily.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <Link href="/auth/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}>
                Start Winning Today →
              </Link>
              <Link href="/auth/login" className="btn-outline" style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
                Sign In
              </Link>
            </div>

            {/* League pills */}
            <div className="flex flex-wrap gap-2">
              {LEAGUES.map(l => (
                <span key={l} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Sample prediction cards floating on right */}
          <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 w-80 space-y-3">
            {SAMPLE_PREDICTIONS.map((p, i) => (
              <div key={i} className="glass glass-hover rounded-xl p-4 fade-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                <div className="flex justify-between items-start mb-3">
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.league}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{p.odds}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{p.home}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>VS</span>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>{p.away}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{p.pred}</span>
                  <div className="flex items-center gap-2">
                    <div className="conf-bar w-20">
                      <div className="conf-bar-fill" style={{ width: `${p.conf}%`, background: p.conf >= 80 ? 'var(--accent)' : p.conf >= 65 ? 'var(--gold)' : 'var(--red)' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{p.conf}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="stat-card text-center">
                <div className="hero-display gradient-text mb-1" style={{ fontSize: '2.5rem' }}>
                  <AnimatedNumber target={s.value} />
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '6rem 0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>
              Why BetAI
            </p>
            <h2 className="hero-display" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Intelligence that{' '}
              <span className="gradient-text">converts</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass glass-hover rounded-2xl p-6">
                <div className="mb-4 text-3xl" style={{ color: 'var(--accent)' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.03em', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leagues ── */}
      <section id="leagues" style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1, padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>Coverage</p>
          <h2 className="hero-display mb-12" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>6 elite competitions. Daily.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3b82f6' },
              { name: 'La Liga', flag: '🇪🇸', color: '#ef4444' },
              { name: 'Bundesliga', flag: '🇩🇪', color: '#f59e0b' },
              { name: 'Serie A', flag: '🇮🇹', color: '#10b981' },
              { name: 'Ligue 1', flag: '🇫🇷', color: '#8b5cf6' },
              { name: 'Champions League', flag: '⭐', color: '#fbbf24' },
            ].map((l, i) => (
              <div key={i} className="glass glass-hover rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{l.flag}</div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>{l.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '6rem 0' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>Process</p>
          <h2 className="hero-display mb-16" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>Up and running in 3 steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Get a Promo Code', desc: 'Purchase a premium access code. Contact us via email or WhatsApp to get yours.' },
              { n: '02', title: 'Create Account', desc: 'Sign up with your email and activate your subscription using the promo code.' },
              { n: '03', title: 'Receive Daily Tips', desc: 'Log in every day to see AI-generated predictions with confidence ratings and analysis.' },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="hero-display mb-3" style={{ fontSize: '4rem', color: 'rgba(52,211,153,0.08)' }}>{s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-primary)', marginTop: '-1rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1, padding: '6rem 0' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="hero-display mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Ready to start<br /><span className="gradient-text">winning?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1rem' }}>
            Join over 1,200 subscribers already using BetAI to make smarter decisions.
          </p>
          <Link href="/auth/signup" className="btn-primary" style={{ fontSize: '1.05rem', padding: '1.1rem 3rem', display: 'inline-block' }}>
            Get Your Promo Code →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', position: 'relative', zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '1rem' }}>
            BET<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            © {new Date().getFullYear()} BetAI · For entertainment purposes only · Please gamble responsibly
          </p>
          <div className="flex gap-4">
            <Link href="/auth/login" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Login</Link>
            <Link href="/auth/signup" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  return { props: { isLoggedIn: !!session } };
};
