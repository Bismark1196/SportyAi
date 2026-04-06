// pages/auth/signup.tsx — Premium Signup Page
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
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handlePromo = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const code = promoCode.trim().toUpperCase();
    try {
      const res = await fetch('/api/auth/verify-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid promo code');
      setPromoData(data); setPromoCode(code); setStep('register');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, promoCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setStep('success');
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const planLabel = promoData?.plan ? promoData.plan.charAt(0) + promoData.plan.slice(1).toLowerCase() : 'Monthly';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)', fontFamily: 'var(--font-body)' }}>
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative" style={{ borderRight: '1px solid var(--border)', zIndex: 1 }}>
        <div className="grid-texture absolute inset-0 opacity-60" />
        <Link href="/" className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#020408', fontSize: '1rem' }}>B</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.08em' }}>
            BET<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </Link>

        <div className="relative">
          <p className="hero-display mb-6" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
            Join 1,200+<br />winning<br /><span className="gradient-text">bettors.</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Gemini AI-powered predictions daily', 'Premier League, La Liga, Bundesliga & more', 'Confidence scores on every tip', 'Cancel anytime'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>✓</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative glass rounded-xl p-5">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
            "BetAI's AI predictions have completely changed how I approach football betting. The confidence scores are spot on."
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>— David K., Premium Member</div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative" style={{ zIndex: 1 }}>
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#020408' }}>B</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em' }}>
              BET<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          </Link>

          {/* Step indicator */}
          {step !== 'success' && (
            <div className="flex items-center gap-3 mb-8">
              {[{ id: 'promo', label: 'Promo Code' }, { id: 'register', label: 'Account' }].map((s, i) => {
                const done = s.id === 'promo' && step === 'register';
                const active = step === s.id;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div style={{
                      width: '1.75rem', height: '1.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, border: '1px solid',
                      background: done ? 'rgba(52,211,153,0.15)' : active ? 'var(--accent)' : 'transparent',
                      borderColor: done || active ? 'var(--accent)' : 'var(--border)',
                      color: done ? 'var(--accent)' : active ? '#020408' : 'var(--text-muted)',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>{s.label}</span>
                    {i === 0 && <div style={{ width: '2rem', height: '1px', background: 'var(--border)', margin: '0 0.25rem' }} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Step 1: Promo ── */}
          {step === 'promo' && (
            <form onSubmit={handlePromo} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 className="hero-display mb-1" style={{ fontSize: '2rem' }}>Enter Code</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Have an account?{' '}
                  <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
                </p>
              </div>

              <div>
                <label className="label">Promo Code</label>
                <input type="text" className="input" placeholder="BETAI-XXXX-XXXX"
                  style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.15em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                  value={promoCode}
                  onChange={e => { setError(''); setPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')); }}
                  required maxLength={30} spellCheck={false} />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                  No code? <a href="mailto:admin@betai.app" style={{ color: 'var(--accent)' }}>Contact us to purchase</a>
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '0.875rem', fontSize: '0.82rem', color: 'var(--red)', display: 'flex', gap: '0.5rem' }}>
                  <span>⚠</span><span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading || promoCode.length < 4}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                {loading ? <><span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(2,4,8,0.3)', borderTop: '2px solid #020408', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Verifying...</> : 'Verify Code →'}
              </button>
            </form>
          )}

          {/* ── Step 2: Register ── */}
          {step === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Code badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#020408', fontWeight: 700, flexShrink: 0 }}>✓</div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 500 }}>{promoCode}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{planLabel} plan · verified</div>
                </div>
              </div>

              <div>
                <h2 className="hero-display" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Account</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Fill in your details below</p>
              </div>

              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe', autoComplete: 'name' },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input type={f.type} className="input" placeholder={f.placeholder} autoComplete={f.autoComplete}
                    value={(form as any)[f.key]} onChange={e => { setError(''); setForm({ ...form, [f.key]: e.target.value }); }} required />
                </div>
              ))}

              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} className="input" placeholder="Min. 8 characters"
                    style={{ paddingRight: '4rem' }} autoComplete="new-password"
                    value={form.password} onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }} required minLength={8} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input type={showPw ? 'text' : 'password'} className="input" placeholder="Repeat password" autoComplete="new-password"
                  value={form.confirm} onChange={e => { setError(''); setForm({ ...form, confirm: e.target.value }); }} required />
                {form.confirm && form.password !== form.confirm && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--red)', marginTop: '0.4rem' }}>Passwords do not match</p>
                )}
              </div>

              {error && (
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '0.875rem', fontSize: '0.82rem', color: 'var(--red)', display: 'flex', gap: '0.5rem' }}>
                  <span>⚠</span><span>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-ghost" onClick={() => { setStep('promo'); setError(''); }} style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem' }}>← Back</button>
                <button type="submit" className="btn-primary" disabled={loading || !form.email || !form.password || !form.name || form.password !== form.confirm}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  {loading ? <><span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(2,4,8,0.3)', borderTop: '2px solid #020408', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Creating...</> : 'Create Account →'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>🎉</div>
              <h2 className="hero-display mb-2" style={{ fontSize: '2.5rem' }}>You're in!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Welcome to BetAI. Redirecting to your dashboard...</p>
              <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(52,211,153,0.2)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (session) return { redirect: { destination: session.role === 'ADMIN' ? '/admin' : '/dashboard', permanent: false } };
  return { props: {} };
};
