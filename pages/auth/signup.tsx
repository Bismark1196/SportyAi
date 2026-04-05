// pages/auth/signup.tsx
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from '../../lib/auth';

type Step = 'promo' | 'register' | 'success';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('promo');
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Verify promo code
  const handlePromoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter a promo code.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid promo code. Please check and try again.');
      }

      setPromoData(data);
      setPromoCode(code); // Store normalized version
      setStep('register');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create account
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          promoCode: promoCode.trim().toUpperCase(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setStep('success');
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
              BET<span className="text-brand-500">AI</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">AI-Powered Football Predictions</p>
        </div>

        {/* Step indicators */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { id: 'promo', num: 1, label: 'Promo Code' },
              { id: 'register', num: 2, label: 'Create Account' },
            ].map((s, i) => {
              const isDone = (s.id === 'promo' && step === 'register');
              const isActive = step === s.id;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                    ${isDone ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' :
                      isActive ? 'bg-brand-500 border-brand-500 text-dark-900' :
                      'bg-dark-700 border-dark-600 text-slate-500'}`}>
                    {isDone ? '✓' : s.num}
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                  {i === 0 && <div className="w-8 h-px bg-dark-600 mx-1" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="card p-8">

          {/* ── Step 1: Promo Code ── */}
          {step === 'promo' && (
            <form onSubmit={handlePromoSubmit} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  ENTER PROMO CODE
                </h2>
                <p className="text-slate-400 text-sm mb-5">
                  Enter your paid promo code to unlock BetAI access.
                </p>
              </div>

              <div>
                <label className="label">Your Promo Code</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => {
                    setError('');
                    setPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
                  }}
                  className="input-field text-center text-lg tracking-widest font-mono uppercase"
                  placeholder="BETAI-XXXX-XXXX"
                  required
                  maxLength={30}
                  spellCheck={false}
                  autoCapitalize="characters"
                />
                <p className="text-slate-600 text-xs mt-1.5 text-center">
                  Enter the code exactly as received
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2">
                  <span className="flex-none">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || promoCode.length < 4}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify Code →'}
              </button>

              <p className="text-center text-slate-500 text-xs pt-1">
                No code?{' '}
                <a href="mailto:admin@betai.app" className="text-brand-400 hover:text-brand-300">
                  Contact support to purchase
                </a>
              </p>
            </form>
          )}

          {/* ── Step 2: Register ── */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Verified code badge */}
              <div className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/25 rounded-lg p-3 mb-2">
                <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-dark-900 text-xs font-bold flex-none">
                  ✓
                </div>
                <div>
                  <div className="text-brand-400 text-xs font-bold font-mono">{promoCode}</div>
                  <div className="text-slate-400 text-xs">
                    {promoData?.plan ? `${promoData.plan.charAt(0) + promoData.plan.slice(1).toLowerCase()} plan` : 'Monthly plan'} — verified
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  CREATE ACCOUNT
                </h2>
                <p className="text-slate-400 text-sm mb-3">Fill in your details below.</p>
              </div>

              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    tabIndex={-1}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  required
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2">
                  <span className="flex-none">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep('promo'); setError(''); }}
                  className="btn-secondary px-4 py-3 text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.email || !form.password || !form.name || form.password !== form.confirmPassword}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : 'Create Account →'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-brand-500/20 border-2 border-brand-500/40 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
                🎉
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                YOU'RE IN!
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Account created. Redirecting to your dashboard...
              </p>
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        {step !== 'success' && (
          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

// Redirect already-logged-in users
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (session) {
    return {
      redirect: {
        destination: session.role === 'ADMIN' ? '/admin' : '/dashboard',
        permanent: false,
      },
    };
  }
  return { props: {} };
};
