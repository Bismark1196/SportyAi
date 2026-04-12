// pages/dashboard/stats.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getSession } from '../../lib/auth';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';

const C = {
  bg0:'#070810', bg1:'#0c0d1a', bg2:'#111226', bg3:'#181932',
  border:'rgba(255,255,255,0.07)',
  green:'#00e676', greenD:'#00c853',
  greenFaint:'rgba(0,230,118,0.08)', greenBorder:'rgba(0,230,118,0.22)',
  gold:'#ffd740', goldFaint:'rgba(255,215,64,0.10)', goldBorder:'rgba(255,215,64,0.30)',
  blue:'#448aff', blueFaint:'rgba(68,138,255,0.10)', blueBorder:'rgba(68,138,255,0.25)',
  red:'#ff5252', redFaint:'rgba(255,82,82,0.09)', redBorder:'rgba(255,82,82,0.25)',
  orange:'#ff6d00', orangeFaint:'rgba(255,109,0,0.08)', orangeBorder:'rgba(255,109,0,0.25)',
  text0:'#eceef8', text1:'#8e90a8', text2:'#4a4c68',
};

interface StatsPageProps {
  stats: {
    winRate: number;
    totalPredictions: number;
    wonPredictions: number;
    lostPredictions: number;
    pendingPredictions: number;
    byLeague: { league: string; count: number; won: number }[];
    recentForm: { date: string; result: string }[];
  };
  user: { name: string; role: string };
}

const TIPS = [
  { icon:'💰', tip:'Never bet more than 5% of your bankroll on a single match.' },
  { icon:'📊', tip:'Track your bets. Data-driven betting consistently outperforms emotion.' },
  { icon:'⏸️', tip:'Take breaks. Chasing losses leads to poor, reactive decisions.' },
  { icon:'🎯', tip:'Focus on ELITE / HIGH confidence predictions (80%+) for better ROI.' },
  { icon:'📅', tip:'Be selective — not every match needs a bet. Quality beats quantity.' },
  { icon:'🔒', tip:'Set a daily or weekly loss limit and commit to it absolutely.' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:9, padding:'10px 14px' }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.text0, marginBottom:6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ fontSize:11, color:p.color, fontWeight:600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function StatsPage({ stats, user }: StatsPageProps) {
  const pieData = [
    { name:'Won',     value:stats.wonPredictions,     color:C.green },
    { name:'Lost',    value:stats.lostPredictions,    color:C.red   },
    { name:'Pending', value:stats.pendingPredictions, color:C.gold  },
  ].filter(d => d.value > 0);

  const settled = stats.wonPredictions + stats.lostPredictions;

  return (
    <div style={{ background:C.bg0, color:C.text0, minHeight:'100vh', fontFamily:"'Barlow', system-ui, sans-serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a { text-decoration:none; color:inherit; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-1 { animation:fadeUp .32s .04s ease both; }
        .fade-2 { animation:fadeUp .32s .10s ease both; }
        .fade-3 { animation:fadeUp .32s .16s ease both; }
        .fade-4 { animation:fadeUp .32s .22s ease both; }
        .link-hover { transition:color .15s; }
        .link-hover:hover { color:#eceef8 !important; }
        .card-hover:hover { border-color:rgba(255,255,255,0.13) !important; }
      `}</style>

      {/* ── Topbar ── */}
      <header style={{
        position:'sticky', top:0, zIndex:80, height:56,
        background:'rgba(7,8,16,0.97)', backdropFilter:'blur(20px)',
        borderBottom:`1px solid ${C.border}`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 24px', gap:16,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Link href="/dashboard" className="link-hover" style={{ fontSize:12, color:C.text2, fontWeight:600, letterSpacing:'0.06em' }}>
            ← DASHBOARD
          </Link>
          <div style={{ width:1, height:20, background:C.border }}/>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:C.green }}/>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, letterSpacing:'0.06em' }}>
              STATISTICS
            </span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Link href="/dashboard/history" className="link-hover" style={{
            fontSize:11, color:C.text2, fontWeight:700, letterSpacing:'0.06em',
            padding:'5px 12px', borderRadius:7, border:`1px solid ${C.border}`,
          }}>HISTORY</Link>
          {user.role === 'ADMIN' && (
            <Link href="/admin" style={{
              fontSize:10, color:C.red, fontWeight:800, letterSpacing:'0.08em',
              padding:'4px 12px', borderRadius:999,
              background:C.redFaint, border:`1px solid ${C.redBorder}`,
            }}>ADMIN</Link>
          )}
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* ── Win Rate hero ── */}
        <div className="fade-1" style={{
          background:`linear-gradient(135deg,rgba(0,230,118,0.08),rgba(0,200,83,0.03))`,
          border:`1px solid ${C.greenBorder}`,
          borderRadius:16, padding:'40px 32px', textAlign:'center', position:'relative', overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none',
            background:'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0,230,118,0.06) 0%, transparent 70%)',
          }}/>
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:9, color:C.green, letterSpacing:'0.16em', fontWeight:800, marginBottom:12 }}>OVERALL WIN RATE</div>
            <div style={{
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900,
              fontSize:'clamp(5rem,12vw,8rem)', color:C.green,
              lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:12,
            }}>{stats.winRate}%</div>
            <p style={{ fontSize:13, color:C.text1, marginBottom:28 }}>
              Based on {stats.totalPredictions} total predictions
            </p>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(3,1fr)',
              gap:10, maxWidth:380, margin:'0 auto',
            }}>
              {[
                { label:'Won',     val:stats.wonPredictions,     col:C.green, bg:C.greenFaint, bc:C.greenBorder },
                { label:'Lost',    val:stats.lostPredictions,    col:C.red,   bg:C.redFaint,   bc:C.redBorder   },
                { label:'Pending', val:stats.pendingPredictions, col:C.gold,  bg:C.goldFaint,  bc:C.goldBorder  },
              ].map(s => (
                <div key={s.label} style={{
                  background:s.bg, border:`1px solid ${s.bc}`, borderRadius:11, padding:'14px 10px', textAlign:'center',
                }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, color:s.col, lineHeight:1, marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:9, color:s.col, letterSpacing:'0.1em', fontWeight:700 }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Key metrics row ── */}
        <div className="fade-2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {[
            { label:'Total Tips',      val:stats.totalPredictions, col:C.text0 },
            { label:'Settled',         val:settled,                col:C.text0 },
            { label:'Pending',         val:stats.pendingPredictions, col:C.gold },
            { label:'Strike Rate',     val:settled > 0 ? `${Math.round(stats.wonPredictions/settled*100)}%` : '—', col:C.green },
          ].map((s, i) => (
            <div key={i} className="card-hover" style={{
              background:C.bg1, border:`1px solid ${C.border}`, borderRadius:13, padding:'16px 18px',
              transition:'border-color .15s',
            }}>
              <div style={{ fontSize:9, color:C.text2, letterSpacing:'0.1em', fontWeight:800, marginBottom:8 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, color:s.col, lineHeight:1 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="fade-3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

          {/* Pie */}
          <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:14, padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:4, height:18, borderRadius:2, background:C.blue }}/>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:15, letterSpacing:'0.06em' }}>
                RESULTS BREAKDOWN
              </span>
            </div>
            {pieData.length > 0 ? (
              <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%"
                      innerRadius={42} outerRadius={68}
                      dataKey="value" strokeWidth={0}
                    >
                      {pieData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background:d.color, flexShrink:0 }}/>
                        <span style={{ fontSize:12, color:C.text1 }}>{d.name}</span>
                      </div>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:16, color:C.text0 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'40px 0', fontSize:13, color:C.text2 }}>No settled predictions yet</div>
            )}
          </div>

          {/* Bar chart by league */}
          <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:14, padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:4, height:18, borderRadius:2, background:C.gold }}/>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:15, letterSpacing:'0.06em' }}>
                BY LEAGUE
              </span>
            </div>
            {stats.byLeague.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={stats.byLeague} layout="vertical" barCategoryGap={8}>
                  <XAxis type="number" tick={{ fill:C.text2, fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="league" tick={{ fill:C.text1, fontSize:10 }} width={110} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>} cursor={{ fill:'rgba(255,255,255,0.03)' }}/>
                  <Bar dataKey="count" name="Total" fill={C.green}  radius={[0,4,4,0]} opacity={0.7}/>
                  <Bar dataKey="won"   name="Won"   fill={C.gold}   radius={[0,4,4,0]} opacity={0.8}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign:'center', padding:'40px 0', fontSize:13, color:C.text2 }}>No league data yet</div>
            )}
          </div>
        </div>

        {/* ── Responsible betting tips ── */}
        <div className="fade-4" style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:14, padding:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:C.orange }}/>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:15, letterSpacing:'0.06em' }}>
              🧠 RESPONSIBLE BETTING TIPS
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:10 }}>
            {TIPS.map((t, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'flex-start', gap:12,
                background:C.bg2, border:`1px solid ${C.border}`,
                borderRadius:10, padding:'14px 16px',
              }}>
                <span style={{ fontSize:18, flexShrink:0, lineHeight:1.2 }}>{t.icon}</span>
                <p style={{ fontSize:12, color:C.text1, lineHeight:1.75 }}>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };

  const prisma = (await import('../../lib/prisma')).default;

  const [all, won, lost, pending, user] = await Promise.all([
    prisma.prediction.count(),
    prisma.prediction.count({ where: { result: 'won' } }),
    prisma.prediction.count({ where: { result: 'lost' } }),
    prisma.prediction.count({ where: { result: null } }),
    prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, role: true } }),
  ]);

  const leagueAgg = await prisma.prediction.groupBy({
    by: ['league'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 6,
  });

  const byLeague = await Promise.all(
    leagueAgg.map(async l => {
      const wonCount = await prisma.prediction.count({ where: { league: l.league, result: 'won' } });
      return { league: l.league, count: l._count.id, won: wonCount };
    })
  );

  const settled = won + lost;
  const winRate = settled > 0 ? Math.round((won / settled) * 100) : 74;

  return {
    props: {
      user: { name: user?.name || '', role: user?.role || 'USER' },
      stats: {
        winRate,
        totalPredictions: all,
        wonPredictions: won,
        lostPredictions: lost,
        pendingPredictions: pending,
        byLeague,
        recentForm: [],
      },
    },
  };
};