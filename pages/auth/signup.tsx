// pages/auth/signup.tsx
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
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

type Step = 'promo' | 'register' | 'success';

const SIDE_BENEFITS = [
  'Gemini AI-powered predictions daily',
  'Premier League, La Liga, Bundesliga & more',
  'ELITE / HIGH / MED confidence ratings',
  'New fixtures updated every morning',
  'Full match analysis and H2H stats',
  'Cancel anytime',
];

const inputStyle = (focused = false): React.CSSProperties => ({
  width: '100%',
  background: C.bg2,
  border: `1px solid ${focused ? C.greenBorder : C.border}`,
  borderRadius: 10,
  padding: '11px 14px',
  color: C.text0,
  fontSize: 14,
  outline: 'none',
  transition: 'border-color .15s',
  fontFamily: "'Barlow', sans-serif",
});

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>('promo');
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState<any>(null);
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPw, setShowPw]       = useState(false);

  const handlePromo = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const code = promoCode.trim().toUpperCase();
    try {
      const res  = await fetch('/api/auth/verify-promo', {
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
      const res  = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, promoCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setStep('success');
      setTimeout(() => router.push('/dashboard'), 2600);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const planLabel = promoData?.plan
    ? promoData.plan.charAt(0) + promoData.plan.slice(1).toLowerCase()
    : 'Monthly';

  const pwMatch = form.confirm.length > 0 && form.password === form.confirm;
  const pwMismatch = form.confirm.length > 0 && form.password !== form.confirm;

  return (
    <div style={{ background: C.bg0, color: C.text0, minHeight: '100vh', display: 'flex', fontFamily: "'Barlow', system-ui, sans-serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a { text-decoration:none; color:inherit; }
        button { font-family:inherit; cursor:pointer; border:none; background:none; color:inherit; }
        input  { font-family:inherit; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
        @keyframes checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
        .fade-1 { animation:fadeUp .32s .05s ease both; }
        .fade-2 { animation:fadeUp .32s .10s ease both; }
        .fade-3 { animation:fadeUp .32s .15s ease both; }
        .fade-4 { animation:fadeUp .32s .20s ease both; }
        .fade-5 { animation:fadeUp .32s .25s ease both; }
        .btn-scale:active { transform:scale(0.97); transition:transform .1s; }
        .link-hover { transition:color .15s; }
        .link-hover:hover { color:#eceef8 !important; }
        @media (min-width:1024px) {
          .left-panel  { display:flex !important; }
          .mobile-logo { display:none !important; }
        }
      `}</style>

      {/* ═══ LEFT PANEL ═════════════════════════════════════════ */}
      <div className="left-panel" style={{
        display: 'none',
        width: '44%', flexShrink: 0,
        background: C.bg1, borderRight: `1px solid ${C.border}`,
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 48px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:`radial-gradient(ellipse 80% 60% at 20% 80%, rgba(0,230,118,0.05) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 10%, rgba(255,215,64,0.04) 0%, transparent 60%)` }}/>

        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${C.green},#00897b)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, letterSpacing:'0.02em' }}>BET<span style={{ color:C.green }}>AI</span></div>
        </Link>

        {/* Headline + benefits */}
        <div style={{ position:'relative', zIndex:1 }}>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:50, lineHeight:0.95, textTransform:'uppercase', letterSpacing:'0.01em', marginBottom:20 }}>
            JOIN 1,200+<br />WINNING<br /><span style={{ color:C.green }}>BETTORS.</span>
          </h1>
          <p style={{ fontSize:14, color:C.text1, lineHeight:1.75, marginBottom:28 }}>
            Get premium access to AI-generated football predictions with full analysis and confidence scoring.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {SIDE_BENEFITS.map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, background:C.greenFaint, border:`1px solid ${C.greenBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:C.green, fontWeight:800 }}>✓</span>
                <span style={{ fontSize:13, color:C.text1 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:20, color:C.gold, marginBottom:10, lineHeight:1 }}>❝</div>
          <p style={{ fontSize:13, color:C.text1, lineHeight:1.75, marginBottom:12, fontStyle:'italic' }}>
            &quot;BetAI&apos;s predictions have completely changed how I approach football betting. The confidence scores are spot on.&quot;
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:C.greenFaint, border:`1px solid ${C.greenBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:C.green }}>DK</div>
            <span style={{ fontSize:11, color:C.green, fontWeight:700, letterSpacing:'0.04em' }}>David K. — Premium Member</span>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ════════════════════════════════════════ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', position:'relative' }}>

        {/* Mobile logo */}
        <Link href="/" className="mobile-logo" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36, alignSelf:'flex-start' }}>
          <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${C.green},#00897b)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⚡</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, letterSpacing:'0.02em' }}>BET<span style={{ color:C.green }}>AI</span></div>
        </Link>

        <div style={{ width:'100%', maxWidth:400 }}>

          {/* ── Step indicator ───────────────────────────────── */}
          {step !== 'success' && (
            <div className="fade-1" style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28 }}>
              {[{ id:'promo', label:'Promo Code' }, { id:'register', label:'Account Details' }].map((s, i) => {
                const done   = s.id === 'promo' && step === 'register';
                const active = step === s.id;
                return (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{
                        width:26, height:26, borderRadius:'50%', flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:10, fontWeight:800,
                        background: done ? C.greenFaint : active ? C.green : C.bg2,
                        border: `1px solid ${done ? C.greenBorder : active ? C.green : C.border}`,
                        color: done ? C.green : active ? C.bg0 : C.text2,
                        transition:'all .25s',
                      }}>{done ? '✓' : i + 1}</div>
                      <span style={{ fontSize:11, fontWeight:active ? 700 : 500, color:active ? C.text0 : C.text2, letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
                        {s.label.toUpperCase()}
                      </span>
                    </div>
                    {i === 0 && (
                      <div style={{ width:40, height:1, background: done ? C.greenBorder : C.border, margin:'0 12px', transition:'background .3s' }}/>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ STEP 1: PROMO ════════════════════════════════ */}
          {step === 'promo' && (
            <form onSubmit={handlePromo} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="fade-2">
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:4, height:20, borderRadius:2, background:C.gold }}/>
                  <span style={{ fontSize:9, color:C.gold, fontWeight:800, letterSpacing:'0.16em' }}>STEP 1 OF 2</span>
                </div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:32, textTransform:'uppercase', letterSpacing:'0.01em', marginBottom:6 }}>Enter Your Code</h2>
                <p style={{ fontSize:13, color:C.text1 }}>
                  Have an account?{' '}
                  <Link href="/auth/login" className="link-hover" style={{ color:C.green, fontWeight:600 }}>Sign in →</Link>
                </p>
              </div>

              <div className="fade-3">
                <label style={{ display:'block', fontSize:9, color:C.text2, fontWeight:800, letterSpacing:'0.12em', marginBottom:7 }}>PROMO CODE</label>
                <input
                  type="text" placeholder="BETAI-XXXX-XXXX" required maxLength={30} spellCheck={false}
                  value={promoCode}
                  onChange={e => { setError(''); setPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')); }}
                  style={{ ...inputStyle(), textAlign:'center', fontSize:16, letterSpacing:'0.18em', fontFamily:'monospace', textTransform:'uppercase' }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.greenBorder)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
                <p style={{ fontSize:11, color:C.text2, textAlign:'center', marginTop:8 }}>
                  No code?{' '}
                  <a href="mailto:admin@betai.app" className="link-hover" style={{ color:C.text2, textDecoration:'underline' }}>Contact us to purchase</a>
                </p>
              </div>

              {error && (
                <div style={{ background:C.redFaint, border:`1px solid ${C.redBorder}`, borderRadius:9, padding:'11px 14px', display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color:C.red, fontWeight:600 }}>
                  <span style={{ flexShrink:0 }}>⚠</span><span>{error}</span>
                </div>
              )}

              <div className="fade-4">
                <button type="submit" disabled={loading || promoCode.length < 4} className="btn-scale" style={{
                  width:'100%', padding:'13px', borderRadius:10,
                  background: loading || promoCode.length < 4 ? C.bg3 : `linear-gradient(90deg,${C.green},${C.greenD})`,
                  color: loading || promoCode.length < 4 ? C.text2 : C.bg0,
                  fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, letterSpacing:'0.07em',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .2s',
                }}>
                  {loading
                    ? <><span style={{ width:16, height:16, border:`2px solid ${C.text2}`, borderTop:`2px solid ${C.text0}`, borderRadius:'50%', display:'inline-block', animation:'spin .75s linear infinite' }}/> VERIFYING...</>
                    : 'VERIFY CODE →'}
                </button>
              </div>
            </form>
          )}

          {/* ══ STEP 2: REGISTER ═════════════════════════════ */}
          {step === 'register' && (
            <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Verified code badge */}
              <div className="fade-1" style={{ display:'flex', alignItems:'center', gap:12, background:C.greenFaint, border:`1px solid ${C.greenBorder}`, borderRadius:10, padding:'11px 14px' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:C.green, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:C.bg0, fontWeight:900, animation:'checkPop .35s ease' }}>✓</div>
                <div>
                  <div style={{ fontFamily:'monospace', fontSize:12, color:C.green, fontWeight:700, letterSpacing:'0.1em' }}>{promoCode}</div>
                  <div style={{ fontSize:10, color:C.text2, marginTop:2 }}>{planLabel} plan · verified</div>
                </div>
              </div>

              <div className="fade-2">
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:4, height:20, borderRadius:2, background:C.blue }}/>
                  <span style={{ fontSize:9, color:C.blue, fontWeight:800, letterSpacing:'0.16em' }}>STEP 2 OF 2</span>
                </div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:32, textTransform:'uppercase', letterSpacing:'0.01em', marginBottom:4 }}>Create Account</h2>
                <p style={{ fontSize:13, color:C.text1 }}>Fill in your details below</p>
              </div>

              {/* Full name */}
              <div className="fade-3">
                <label style={{ display:'block', fontSize:9, color:C.text2, fontWeight:800, letterSpacing:'0.12em', marginBottom:7 }}>FULL NAME</label>
                <input type="text" placeholder="John Doe" required autoComplete="name"
                  value={form.name}
                  onChange={e => { setError(''); setForm({ ...form, name: e.target.value }); }}
                  style={inputStyle()}
                  onFocus={e => (e.currentTarget.style.borderColor = C.greenBorder)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>

              {/* Email */}
              <div className="fade-3">
                <label style={{ display:'block', fontSize:9, color:C.text2, fontWeight:800, letterSpacing:'0.12em', marginBottom:7 }}>EMAIL ADDRESS</label>
                <input type="email" placeholder="you@example.com" required autoComplete="email"
                  value={form.email}
                  onChange={e => { setError(''); setForm({ ...form, email: e.target.value }); }}
                  style={inputStyle()}
                  onFocus={e => (e.currentTarget.style.borderColor = C.greenBorder)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>

              {/* Password */}
              <div className="fade-4">
                <label style={{ display:'block', fontSize:9, color:C.text2, fontWeight:800, letterSpacing:'0.12em', marginBottom:7 }}>PASSWORD</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
                    value={form.password}
                    onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }}
                    style={{ ...inputStyle(), paddingRight:56 }}
                    onFocus={e => (e.currentTarget.style.borderColor = C.greenBorder)}
                    onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:9, fontWeight:800, letterSpacing:'0.1em', color:C.text2, transition:'color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.text1)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.text2)}>
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="fade-4">
                <label style={{ display:'block', fontSize:9, color:C.text2, fontWeight:800, letterSpacing:'0.12em', marginBottom:7 }}>CONFIRM PASSWORD</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw ? 'text' : 'password'} placeholder="Repeat password" required autoComplete="new-password"
                    value={form.confirm}
                    onChange={e => { setError(''); setForm({ ...form, confirm: e.target.value }); }}
                    style={{ ...inputStyle(), paddingRight:36, borderColor: pwMismatch ? C.redBorder : pwMatch ? C.greenBorder : C.border }}
                    onFocus={e => { if (!pwMatch && !pwMismatch) e.currentTarget.style.borderColor = C.greenBorder; }}
                    onBlur={e => { if (!pwMatch && !pwMismatch) e.currentTarget.style.borderColor = C.border; }}
                  />
                  {pwMatch && (
                    <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:C.green, fontSize:14, fontWeight:800 }}>✓</span>
                  )}
                </div>
                {pwMismatch && (
                  <p style={{ fontSize:11, color:C.red, marginTop:5, fontWeight:600 }}>Passwords do not match</p>
                )}
              </div>

              {error && (
                <div style={{ background:C.redFaint, border:`1px solid ${C.redBorder}`, borderRadius:9, padding:'11px 14px', display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color:C.red, fontWeight:600 }}>
                  <span style={{ flexShrink:0 }}>⚠</span><span>{error}</span>
                </div>
              )}

              <div className="fade-5" style={{ display:'flex', gap:10 }}>
                <button type="button" onClick={() => { setStep('promo'); setError(''); }} className="btn-scale" style={{
                  padding:'12px 18px', borderRadius:10,
                  background:'transparent', border:`1px solid ${C.border}`,
                  color:C.text1, fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:800, fontSize:13, letterSpacing:'0.06em',
                  transition:'border-color .15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.borderHi)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                  ← BACK
                </button>
                <button type="submit" disabled={loading || !form.email || !form.password || !form.name || pwMismatch} className="btn-scale" style={{
                  flex:1, padding:'12px', borderRadius:10,
                  background: loading || !form.email || !form.password || !form.name || pwMismatch
                    ? C.bg3
                    : `linear-gradient(90deg,${C.green},${C.greenD})`,
                  color: loading || !form.email || !form.password || !form.name || pwMismatch ? C.text2 : C.bg0,
                  fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:15, letterSpacing:'0.07em',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .2s',
                }}>
                  {loading
                    ? <><span style={{ width:16, height:16, border:`2px solid ${C.text2}`, borderTop:`2px solid ${C.text0}`, borderRadius:'50%', display:'inline-block', animation:'spin .75s linear infinite' }}/> CREATING...</>
                    : 'CREATE ACCOUNT →'}
                </button>
              </div>
            </form>
          )}

          {/* ══ STEP 3: SUCCESS ══════════════════════════════ */}
          {step === 'success' && (
            <div style={{ textAlign:'center', padding:'2rem 0', animation:'scaleIn .4s ease' }}>
              <div style={{
                width:80, height:80, borderRadius:'50%', margin:'0 auto 24px',
                background:C.greenFaint, border:`2px solid ${C.greenBorder}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:36, animation:'checkPop .5s .1s ease both',
              }}>🎉</div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:40, textTransform:'uppercase', letterSpacing:'0.01em', marginBottom:10 }}>
                YOU&apos;RE IN!
              </h2>
              <p style={{ fontSize:14, color:C.text1, marginBottom:32, lineHeight:1.7 }}>
                Welcome to BetAI.<br/>Redirecting to your dashboard...
              </p>
              <div style={{ width:28, height:28, border:`2px solid ${C.greenBorder}`, borderTop:`2px solid ${C.green}`, borderRadius:'50%', animation:'spin .75s linear infinite', margin:'0 auto' }}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (session) return { redirect: { destination: session.role === 'ADMIN' ? '/admin' : '/dashboard', permanent: false } };
  return { props: {} };
};
