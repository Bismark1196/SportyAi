// pages/auth/admin-login.tsx
// Dedicated admin login — bookmarkable, separate from user login
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from '../../lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');

      if (data.role !== 'ADMIN') {
        throw new Error('This login is for admins only. Use /auth/login instead.');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
            BET<span className="text-brand-500">AI</span>
          </span>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/30 rounded-full text-red-400 text-xs font-bold ml-2">
            ADMIN
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            ADMIN LOGIN
          </h2>
          <p className="text-slate-400 text-sm mb-6">Restricted access — admins only</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Admin Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@yourdomain.com"
                value={form.email}
                onChange={e => { setError(''); setForm({ ...form, email: e.target.value }); }}
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
                  placeholder="Admin password"
                  value={form.password}
                  onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }}
                  autoComplete="current-password"
                  required
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2">
                <span className="flex-none">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="w-full py-3 px-6 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#dc2626', color: 'white' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : '🔐 Admin Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Not an admin?{' '}
          <a href="/auth/login" className="text-slate-400 hover:text-white">Regular login</a>
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (session?.role === 'ADMIN') {
    return { redirect: { destination: '/admin', permanent: false } };
  }
  return { props: {} };
};
