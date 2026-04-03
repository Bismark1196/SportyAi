// pages/admin/index.tsx
import { GetServerSideProps } from 'next';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { getSession } from '../../lib/auth';

interface AdminProps {
  promoCodes: any[];
  users: any[];
  stats: { totalUsers: number; activeUsers: number; totalCodes: number; usedCodes: number };
}

export default function AdminPanel({ promoCodes: initialCodes, users, stats }: AdminProps) {
  const [promoCodes, setPromoCodes] = useState(initialCodes);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState('MONTHLY');
  const [count, setCount] = useState(1);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [tab, setTab] = useState<'codes' | 'users'>('codes');
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, count }),
      });
      const data = await res.json();
      setNewCodes(data.codes);
      setPromoCodes(prev => [...data.promoObjects, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between"
        style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            BET<span className="text-brand-500">AI</span> <span className="text-slate-400 text-base">Admin</span>
          </span>
        </div>
        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-bold">
          ADMIN PANEL
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Active Users', value: stats.activeUsers, icon: '✅' },
            { label: 'Total Codes', value: stats.totalCodes, icon: '🎟️' },
            { label: 'Used Codes', value: stats.usedCodes, icon: '🔑' },
          ].map((s, i) => (
            <div key={i} className="card p-4">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-brand-400" style={{ fontFamily: 'var(--font-display)' }}>
                {s.value}
              </div>
              <div className="text-slate-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Generate Codes */}
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              GENERATE PROMO CODES
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="label">Plan Type</label>
                <select value={plan} onChange={e => setPlan(e.target.value)} className="input-field">
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div>
                <label className="label">Quantity (1-50)</label>
                <input type="number" min={1} max={50} value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="input-field" />
              </div>
              <button type="submit" disabled={generating} className="btn-primary w-full">
                {generating ? 'Generating...' : `Generate ${count} Code${count > 1 ? 's' : ''}`}
              </button>
            </form>

            {newCodes.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-brand-400 text-xs font-bold uppercase mb-2">New Codes Generated:</p>
                {newCodes.map(code => (
                  <div key={code} className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2">
                    <span className="flex-1 font-mono text-brand-400 text-sm">{code}</span>
                    <button onClick={() => copyCode(code)}
                      className="text-xs text-slate-400 hover:text-white transition-colors">
                      {copied === code ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tables */}
          <div className="lg:col-span-2 card">
            <div className="flex border-b border-white/5">
              {(['codes', 'users'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-6 py-4 text-sm font-semibold capitalize transition-colors
                    ${tab === t ? 'text-brand-400 border-b-2 border-brand-500' : 'text-slate-400 hover:text-white'}`}>
                  {t === 'codes' ? 'Promo Codes' : 'Users'}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              {tab === 'codes' ? (
                <table className="w-full stats-table">
                  <thead>
                    <tr>
                      <th className="text-left">Code</th>
                      <th className="text-left">Plan</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Used By</th>
                      <th className="text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map(code => (
                      <tr key={code.id}>
                        <td className="font-mono text-brand-400 text-sm">{code.code}</td>
                        <td><span className="text-xs text-slate-400 capitalize">{code.plan.toLowerCase()}</span></td>
                        <td>
                          <span className={`text-xs px-2 py-1 rounded-full ${code.isUsed ? 'badge-loss' : 'badge-win'}`}>
                            {code.isUsed ? 'Used' : 'Available'}
                          </span>
                        </td>
                        <td className="text-slate-400 text-xs">{code.usedBy || '—'}</td>
                        <td className="text-slate-500 text-xs">
                          {new Date(code.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full stats-table">
                  <thead>
                    <tr>
                      <th className="text-left">Name</th>
                      <th className="text-left">Email</th>
                      <th className="text-left">Role</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="text-white text-sm">{user.name || '—'}</td>
                        <td className="text-slate-400 text-xs">{user.email}</td>
                        <td>
                          <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'badge-win' : 'badge-pending'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`text-xs px-2 py-1 rounded-full ${user.isActive ? 'badge-win' : 'badge-loss'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-slate-500 text-xs">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  if (session.role !== 'ADMIN') return { redirect: { destination: '/dashboard', permanent: false } };

  const prisma = (await import('../../lib/prisma')).default;
  const [promoCodes, users] = await Promise.all([
    prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } }),
  ]);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalCodes: promoCodes.length,
    usedCodes: promoCodes.filter(c => c.isUsed).length,
  };

  return {
    props: {
      promoCodes: JSON.parse(JSON.stringify(promoCodes)),
      users: JSON.parse(JSON.stringify(users)),
      stats,
    },
  };
};
