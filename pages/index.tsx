// pages/index.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getSession } from '../lib/auth';

interface LandingPageProps {
  isLoggedIn: boolean;
}

const stats = [
  { label: 'Win Rate', value: '74%', sub: 'Last 30 days' },
  { label: 'Predictions', value: '2,847', sub: 'Total made' },
  { label: 'Active Users', value: '1,200+', sub: 'Subscribers' },
  { label: 'Avg Odds', value: '2.15', sub: 'Per prediction' },
];

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Analysis',
    desc: 'Claude AI analyzes 50+ data points per match including form, head-to-head, injuries, weather, and market odds.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Data',
    desc: 'Live fixture data from top leagues worldwide. Predictions updated as team news and odds change.',
  },
  {
    icon: '📊',
    title: 'Confidence Scoring',
    desc: 'Every prediction comes with a confidence percentage so you know exactly how strong each tip is.',
  },
  {
    icon: '🔒',
    title: 'Premium Access',
    desc: 'Exclusive promo codes ensure only serious bettors get access to our AI predictions.',
  },
];

export default function LandingPage({ isLoggedIn }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md"
        style={{ background: 'rgba(5,10,14,0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-dark-900 text-sm"
              style={{ fontFamily: 'var(--font-display)' }}>
              B
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
              BET<span className="text-brand-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary text-sm px-5 py-2">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
                  Get Access
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            AI predictions updated daily
          </div>

          <h1 className="text-6xl sm:text-8xl font-bold mb-6 leading-none"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
            PREDICT.{' '}
            <span className="gradient-text">WIN.</span>{' '}
            REPEAT.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Our Claude AI engine analyzes thousands of data points to deliver high-confidence 
            football predictions. Join subscribers winning consistently.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-4">
              Claim Your Access Code →
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base px-8 py-4">
              Already have a code?
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20">
            {stats.map((s, i) => (
              <div key={i} className="card p-5 text-center"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-3xl font-bold gradient-text mb-1"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                  {s.value}
                </div>
                <div className="text-white text-sm font-semibold">{s.label}</div>
                <div className="text-slate-500 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              WHY <span className="text-brand-500">BETAI</span>?
            </h2>
            <p className="text-slate-400">Powered by cutting-edge AI, not gut feelings</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4" style={{ background: 'rgba(34,197,94,0.03)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-14" style={{ fontFamily: 'var(--font-display)' }}>
            HOW IT <span className="text-brand-500">WORKS</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Get a Promo Code', desc: 'Purchase a premium promo code to unlock full access to AI predictions.' },
              { step: '02', title: 'Create Account', desc: 'Sign up with your email and enter your promo code to activate your subscription.' },
              { step: '03', title: 'Win with AI', desc: 'Access daily predictions with confidence scores and expert AI analysis.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-7xl font-bold text-brand-500/10 mb-2 leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            READY TO START <span className="gradient-text">WINNING</span>?
          </h2>
          <p className="text-slate-400 mb-8">
            Limited access. Join now with a promo code.
          </p>
          <Link href="/auth/signup" className="btn-primary text-lg px-10 py-4 inline-block">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }} className="text-white">
            BET<span className="text-brand-500">AI</span>
          </span>
        </div>
        <p>© {new Date().getFullYear()} BetAI. For entertainment purposes. Please gamble responsibly.</p>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  return { props: { isLoggedIn: !!session } };
};
