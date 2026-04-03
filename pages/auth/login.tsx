// pages/auth/login.tsx
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
              BET<span className="text-brand-500">AI</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">Welcome back, champion</p>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            SIGN IN
          </h2>
          <p className="text-slate-400 text-sm mb-6">Access your AI predictions</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" placeholder="Your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              ) : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
