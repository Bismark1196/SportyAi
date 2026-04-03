// pages/dashboard/index.tsx
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { getSession } from '../../lib/auth';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const FILTERS = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'];

interface DashboardProps {
  user: { name: string; email: string; role: string };
}

export default function Dashboard({ user }: DashboardProps) {
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'predictions' | 'history'>('predictions');

  const { data: predictionsData, isLoading } = useSWR('/api/predictions', fetcher, {
    refreshInterval: 300_000, // Refresh every 5 min
  });

  const predictions = predictionsData?.predictions || [];
  const filtered = filter === 'All' ? predictions : predictions.filter((p: any) => p.league === filter);
  const winRate = predictionsData?.stats?.winRate || 74;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/5 hidden lg:flex flex-col"
        style={{ background: 'var(--bg-secondary)' }}>
        <div className="p-6 border-b border-white/5">
          <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
            BET<span className="text-brand-500">AI</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: '📊', label: 'Predictions', href: '/dashboard', active: true },
            { icon: '📈', label: 'Statistics', href: '/dashboard/stats' },
            { icon: '🏆', label: 'History', href: '/dashboard/history' },
            ...(user.role === 'ADMIN' ? [{ icon: '⚙️', label: 'Admin Panel', href: '/admin' }] : []),
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all
                ${item.active ? 'bg-brand-500/15 border border-brand-500/30 text-brand-400' : 
                  'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-brand-500/20 border border-brand-500/30 rounded-full flex items-center justify-center text-brand-400 font-bold text-sm">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user.name || 'User'}</div>
              <div className="text-slate-500 text-xs truncate">{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-left text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
            → Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-white/5 px-6 py-4 flex items-center justify-between"
          style={{ background: 'rgba(5,10,14,0.9)', backdropFilter: 'blur(10px)' }}>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
              TODAY'S PREDICTIONS
            </h1>
            <p className="text-slate-500 text-xs">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
              <span className="text-brand-400 text-xs font-medium">AI Live</span>
            </div>
            <button onClick={handleLogout} className="lg:hidden text-slate-400 text-sm">Sign Out</button>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Win Rate', value: `${winRate}%`, icon: '🎯', color: 'text-brand-400' },
              { label: "Today's Tips", value: String(predictions.length), icon: '📋', color: 'text-blue-400' },
              { label: 'Avg Confidence', value: predictions.length ? `${Math.round(predictions.reduce((a: number, p: any) => a + p.confidence, 0) / predictions.length)}%` : '—', icon: '🧠', color: 'text-gold-400' },
              { label: 'Status', value: 'Active', icon: '✅', color: 'text-brand-400' },
            ].map((s, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</span>
                </div>
                <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: 'var(--font-display)' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-none text-xs px-4 py-2 rounded-full border transition-all whitespace-nowrap
                  ${filter === f ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 
                    'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Predictions Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-5 space-y-3">
                  <div className="shimmer h-4 w-24 rounded" />
                  <div className="shimmer h-6 w-full rounded" />
                  <div className="shimmer h-3 w-3/4 rounded" />
                  <div className="shimmer h-10 w-full rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-white font-bold mb-2">AI is analyzing matches...</h3>
              <p className="text-slate-400 text-sm">Check back soon for today's predictions</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p: any, i: number) => (
                <PredictionCard key={p.id} prediction={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PredictionCard({ prediction: p, index }: { prediction: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const confidenceColor = p.confidence >= 80 ? '#22c55e' :
    p.confidence >= 65 ? '#fbbf24' : '#ef4444';

  const predictionLabels: Record<string, string> = {
    home_win: 'Home Win',
    away_win: 'Away Win',
    draw: 'Draw',
    over_2_5: 'Over 2.5 Goals',
    under_2_5: 'Under 2.5 Goals',
    btts: 'Both Teams Score',
  };

  return (
    <div className="prediction-card card p-5 cursor-pointer"
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => setExpanded(!expanded)}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-mono">{p.league}</span>
        <span className="text-xs text-slate-600">
          {new Date(p.matchDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 text-right">
          <div className="font-bold text-white text-sm leading-tight">{p.homeTeam}</div>
          <div className="text-xs text-slate-500">Home</div>
        </div>
        <div className="flex-none px-3 py-1.5 bg-dark-700 rounded-lg text-xs text-slate-400 font-mono">VS</div>
        <div className="flex-1">
          <div className="font-bold text-white text-sm leading-tight">{p.awayTeam}</div>
          <div className="text-xs text-slate-500">Away</div>
        </div>
      </div>

      {/* Prediction badge */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 bg-dark-700 rounded-lg px-3 py-2">
          <div className="text-xs text-slate-400 mb-0.5">AI Prediction</div>
          <div className="font-bold text-brand-400 text-sm">
            {predictionLabels[p.prediction] || p.prediction}
          </div>
        </div>
        {p.odds && (
          <div className="text-center bg-gold-500/10 border border-gold-500/20 rounded-lg px-3 py-2">
            <div className="text-xs text-gold-500/60 mb-0.5">Odds</div>
            <div className="font-bold text-gold-400 text-sm font-mono">{p.odds}</div>
          </div>
        )}
      </div>

      {/* Confidence */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Confidence</span>
          <span className="font-bold font-mono" style={{ color: confidenceColor }}>{p.confidence}%</span>
        </div>
        <div className="confidence-bar">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${p.confidence}%`, background: `linear-gradient(90deg, ${confidenceColor}80, ${confidenceColor})` }} />
        </div>
      </div>

      {/* Expanded analysis */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-xs text-slate-400 leading-relaxed mb-3">{p.aiAnalysis}</div>
          {p.tips && (
            <div className="space-y-1.5">
              {p.tips.map((tip: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-brand-500 mt-0.5 flex-none">→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-3 text-xs text-slate-600">
        {expanded ? '▲ Less' : '▼ AI Analysis'}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const session = await getSession();
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };

  const prisma = (await import('../../lib/prisma')).default;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) return { redirect: { destination: '/auth/login', permanent: false } };

  return { props: { user: { name: user.name || '', email: user.email, role: user.role } } };
};
