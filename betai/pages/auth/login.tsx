// pages/auth/login.tsx — Premium Login Page
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      router.push(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-void)', fontFamily: 'var(--font-body)' }}>
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* Left panel — branding */}
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
          <p className="hero-display mb-6" style={{ fontSize: '3.5rem', lineHeight: 1, color: 'var(--text-primary)' }}>
            Welcome<br />back,<br /><span className="gradient-text">champion.</span>
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '360px' }}>
            Your AI-powered predictions are ready. Log in to access today's tips with confidence scores and expert analysis.
          </p>
        </div>

        {/* Sample stats */}
        <div className="grid grid-cols-3 gap-4 relative">
          {[{ v: '74%', l: 'Win Rate' }, { v: '8', l: "Today's Tips" }, { v: '67%', l: 'Avg Confidence' }].map(s => (
            <div key={s.l} className="stat-card text-center">
              <div className="hero-display gradient-text" style={{ fontSize: '1.5rem' }}>{s.v}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative" style={{ zIndex: 1 }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#020408', fontSize: '0.9rem' }}>B</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em' }}>
              BET<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          </Link>

          <h2 className="hero-display mb-2" style={{ fontSize: '2rem' }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Don't have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign up</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => { setError(''); setForm({ ...form, email: e.target.value }); }}
                autoComplete="email" required />
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="input" placeholder="Your password"
                  style={{ paddingRight: '4rem' }}
                  value={form.password} onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }}
                  autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '0.875rem', fontSize: '0.82rem', color: 'var(--red)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span>⚠</span><span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading || !form.email || !form.password}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              {loading ? (
                <><span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(2,4,8,0.3)', borderTop: '2px solid #020408', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Admin?{' '}
            <Link href="/auth/admin-login" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Admin login →</Link>
          </p>
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
