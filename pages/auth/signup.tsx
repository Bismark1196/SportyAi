// pages/auth/signup.tsx
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type Step = 'promo' | 'register' | 'success';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('promo');
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePromoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid promo code');
      setPromoData(data);
      setStep('register');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, promoCode: promoCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setStep('success');
      setTimeout(() => router.push('/dashboard'), 2000);
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

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { id: 'promo', label: 'Promo Code' },
            { id: 'register', label: 'Create Account' },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step === s.id ? 'bg-brand-500 text-dark-900' : 
                  (step === 'register' && s.id === 'promo') || step === 'success' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40' :
                  'bg-dark-700 text-slate-500'}`}>
                {((step === 'register' && s.id === 'promo') || step === 'success') ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${step === s.id ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
              {i === 0 && <div className="w-8 h-px bg-dark-600 mx-1" />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {/* Step 1: Promo Code */}
          {step === 'promo' && (
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                ENTER PROMO CODE
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Enter your paid promo code to unlock access to BetAI predictions.
              </p>

              <form onSubmit={handlePromoSubmit} className="space-y-5">
                <div>
                  <label className="label">Promo Code</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    className="input-field text-center text-xl tracking-widest font-mono"
                    placeholder="BETAI-XXXX"
                    required
                    maxLength={20}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || !promoCode}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  ) : 'Verify Code →'}
                </button>
              </form>

              <p className="text-center text-slate-500 text-xs mt-6">
                Don't have a code?{' '}
                <a href="mailto:admin@betai.app" className="text-brand-400 hover:text-brand-300">
                  Contact us to purchase
                </a>
              </p>
            </div>
          )}

          {/* Step 2: Register */}
          {step === 'register' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1.5 bg-brand-500/15 border border-brand-500/30 rounded-lg">
                  <span className="text-brand-400 text-xs font-mono font-bold">{promoCode}</span>
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">Code Verified ✓</div>
                  <div className="text-slate-400 text-xs">
                    {promoData?.plan || 'Monthly'} Plan
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                CREATE ACCOUNT
              </h2>
              <p className="text-slate-400 text-sm mb-6">Fill in your details to get started.</p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input-field" placeholder="John Doe"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input-field" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input-field" placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" className="input-field" placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  ) : 'Create Account & Start Winning →'}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand-500/20 border border-brand-500/40 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🎉
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                WELCOME TO BETAI!
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Your account is ready. Redirecting to dashboard...
              </p>
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
