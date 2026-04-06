// pages/dashboard/history.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getSession } from '../../lib/auth';

interface HistoryProps {
  predictions: any[];
}

const LABELS: Record<string, string> = {
  home_win: 'Home Win', away_win: 'Away Win', draw: 'Draw',
  over_2_5: 'Over 2.5', under_2_5: 'Under 2.5', btts: 'Both Teams Score',
};

export default function HistoryPage({ predictions }: HistoryProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-40 border-b border-white/5 px-6 py-4 flex items-center gap-4"
        style={{ background: 'rgba(5,10,14,0.9)', backdropFilter: 'blur(10px)' }}>
        <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">← Predictions</Link>
        <span className="text-slate-700">|</span>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
          PREDICTION HISTORY
        </h1>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {predictions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-white font-bold mb-2">No history yet</h3>
            <p className="text-slate-400 text-sm">Predictions will appear here once results are settled.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full stats-table">
                <thead>
                  <tr>
                    <th className="text-left">Match</th>
                    <th className="text-left">League</th>
                    <th className="text-left">Prediction</th>
                    <th className="text-left">Confidence</th>
                    <th className="text-left">Odds</th>
                    <th className="text-left">Result</th>
                    <th className="text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="text-white text-sm font-medium">{p.homeTeam}</div>
                        <div className="text-slate-500 text-xs">vs {p.awayTeam}</div>
                      </td>
                      <td className="text-slate-400 text-xs">{p.league}</td>
                      <td>
                        <span className="text-brand-400 text-xs font-medium">
                          {LABELS[p.prediction] || p.prediction}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{
                                width: `${p.confidence}%`,
                                background: p.confidence >= 80 ? '#22c55e' : p.confidence >= 65 ? '#fbbf24' : '#ef4444'
                              }} />
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{p.confidence}%</span>
                        </div>
                      </td>
                      <td className="text-gold-400 font-mono text-sm">{p.odds || '—'}</td>
                      <td>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium
                          ${p.result === 'won' ? 'badge-win' :
                            p.result === 'lost' ? 'badge-loss' : 'badge-pending'}`}>
                          {p.result === 'won' ? '✓ Won' : p.result === 'lost' ? '✗ Lost' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">
                        {new Date(p.matchDate).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };

  const prisma = (await import('../../lib/prisma')).default;
  const predictions = await prisma.prediction.findMany({
    orderBy: { matchDate: 'desc' },
    take: 100,
  });

  return { props: { predictions: JSON.parse(JSON.stringify(predictions)) } };
};
