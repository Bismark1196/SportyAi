// pages/dashboard/history.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getSession } from '../../lib/auth';

const C = {
  bg0:'#070810', bg1:'#0c0d1a', bg2:'#111226', bg3:'#181932',
  border:'rgba(255,255,255,0.07)', borderHi:'rgba(255,255,255,0.14)',
  green:'#00e676', greenD:'#00c853',
  greenFaint:'rgba(0,230,118,0.08)', greenBorder:'rgba(0,230,118,0.22)',
  gold:'#ffd740', goldFaint:'rgba(255,215,64,0.10)', goldBorder:'rgba(255,215,64,0.30)',
  blue:'#448aff', blueFaint:'rgba(68,138,255,0.10)', blueBorder:'rgba(68,138,255,0.25)',
  red:'#ff5252', redFaint:'rgba(255,82,82,0.09)', redBorder:'rgba(255,82,82,0.25)',
  text0:'#eceef8', text1:'#8e90a8', text2:'#4a4c68',
};

const LABELS: Record<string, string> = {
  home_win:'Home Win', away_win:'Away Win', draw:'Draw',
  over_2_5:'Over 2.5', under_2_5:'Under 2.5', btts:'Both Teams Score',
};

const confMeta = (c: number) => c >= 88
  ? { label:'ELITE', col:C.gold,  bg:C.goldFaint,  bc:C.goldBorder  }
  : c >= 75
  ? { label:'HIGH',  col:C.green, bg:C.greenFaint, bc:C.greenBorder }
  : c >= 60
  ? { label:'MED',   col:C.blue,  bg:C.blueFaint,  bc:C.blueBorder  }
  : { label:'LOW',   col:C.red,   bg:C.redFaint,   bc:C.redBorder   };

interface HistoryProps { predictions: any[] }

export default function HistoryPage({ predictions }: HistoryProps) {
  const won     = predictions.filter(p => p.result === 'won').length;
  const lost    = predictions.filter(p => p.result === 'lost').length;
  const pending = predictions.filter(p => !p.result).length;
  const settled = won + lost;
  const winRate = settled > 0 ? Math.round((won / settled) * 100) : null;

  return (
    <div style={{ background:C.bg0, color:C.text0, minHeight:'100vh', fontFamily:"'Barlow', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a { text-decoration:none; color:inherit; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .28s ease both; }
        .row-hover:hover { background:rgba(255,255,255,0.025) !important; }
        .link-hover { transition:color .15s; }
        .link-hover:hover { color:#eceef8 !important; }
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
            <div style={{ width:4, height:18, borderRadius:2, background:C.blue }}/>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:16, letterSpacing:'0.06em' }}>
              PREDICTION HISTORY
            </span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:10, color:C.text2 }}>{predictions.length} records</span>
          <Link href="/dashboard/stats" className="link-hover" style={{
            fontSize:11, color:C.blue, fontWeight:700, letterSpacing:'0.06em',
            padding:'5px 12px', borderRadius:7,
            border:`1px solid ${C.blueBorder}`, background:C.blueFaint,
          }}>STATS →</Link>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px' }}>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
          {[
            { label:'Win Rate', val:winRate !== null ? `${winRate}%` : '—', col:C.green, bg:C.greenFaint, bc:C.greenBorder },
            { label:'Correct',  val:won,    col:C.green, bg:C.greenFaint, bc:C.greenBorder },
            { label:'Wrong',    val:lost,   col:C.red,   bg:C.redFaint,   bc:C.redBorder   },
            { label:'Pending',  val:pending, col:C.gold, bg:C.goldFaint,  bc:C.goldBorder  },
          ].map((s, i) => (
            <div key={i} className="fade-up" style={{
              background:s.bg, border:`1px solid ${s.bc}`,
              borderRadius:12, padding:'16px 18px', textAlign:'center',
              animationDelay:`${i*0.06}s`, animationFillMode:'both',
            }}>
              <div style={{ fontSize:9, color:s.col, letterSpacing:'0.12em', fontWeight:800, marginBottom:6 }}>
                {s.label.toUpperCase()}
              </div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, color:s.col, lineHeight:1 }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        {predictions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:48, opacity:0.08, marginBottom:16 }}>📋</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:C.text1, marginBottom:8 }}>
              NO HISTORY YET
            </div>
            <p style={{ fontSize:13, color:C.text2, lineHeight:1.7 }}>
              Predictions will appear here once results are settled.
            </p>
          </div>
        ) : (
          <div className="fade-up" style={{
            background:C.bg1, border:`1px solid ${C.border}`,
            borderRadius:14, overflow:'hidden',
            animationDelay:'0.2s', animationFillMode:'both',
          }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${C.border}`, background:C.bg0 }}>
                    {['Match','League','Prediction','Confidence','Odds','Result','Date'].map(h => (
                      <th key={h} style={{
                        padding:'10px 16px', textAlign:'left',
                        fontSize:9, color:C.text2, fontWeight:800,
                        letterSpacing:'0.12em', whiteSpace:'nowrap',
                      }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {predictions.map(p => {
                    const cm = confMeta(p.confidence);
                    const resultCol  = p.result === 'won' ? C.green  : p.result === 'lost' ? C.red   : C.gold;
                    const resultBg   = p.result === 'won' ? C.greenFaint : p.result === 'lost' ? C.redFaint : C.goldFaint;
                    const resultBc   = p.result === 'won' ? C.greenBorder : p.result === 'lost' ? C.redBorder : C.goldBorder;
                    const resultText = p.result === 'won' ? '✓ WON' : p.result === 'lost' ? '✗ LOST' : '⏳ PENDING';
                    return (
                      <tr key={p.id} className="row-hover" style={{ borderBottom:`1px solid ${C.border}`, background:'transparent', transition:'background .12s' }}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ fontSize:13, fontWeight:600, color:C.text0, lineHeight:1.3 }}>{p.homeTeam}</div>
                          <div style={{ fontSize:11, color:C.text2, marginTop:2 }}>vs {p.awayTeam}</div>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:11, color:C.text1, whiteSpace:'nowrap' }}>{p.league}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontSize:11, color:C.blue, fontWeight:700 }}>
                            {LABELS[p.prediction] || p.prediction}
                          </span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            <div style={{ width:52, height:3, background:C.bg3, borderRadius:99, overflow:'hidden' }}>
                              <div style={{ width:`${p.confidence}%`, height:'100%', background:cm.col, borderRadius:99 }}/>
                            </div>
                            <span style={{ fontSize:10, fontFamily:'monospace', color:C.text2 }}>{p.confidence}%</span>
                            <span style={{
                              fontSize:9, fontWeight:800, letterSpacing:'0.07em',
                              color:cm.col, background:cm.bg, border:`1px solid ${cm.bc}`,
                              borderRadius:4, padding:'1px 6px',
                            }}>{cm.label}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{
                            fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:14,
                            color:C.gold, background:C.goldFaint, border:`1px solid ${C.goldBorder}`,
                            borderRadius:5, padding:'2px 8px',
                          }}>{p.odds || '—'}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{
                            fontSize:9, fontWeight:800, letterSpacing:'0.07em',
                            color:resultCol, background:resultBg, border:`1px solid ${resultBc}`,
                            borderRadius:999, padding:'3px 10px',
                          }}>{resultText}</span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:11, color:C.text2, fontFamily:'monospace', whiteSpace:'nowrap' }}>
                          {new Date(p.matchDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
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
