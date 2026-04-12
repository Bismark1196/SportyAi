// pages/auth/login.tsx
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

const SIDE_STATS = [
  { icon:'🎯', label:'Win Rate',       value:'74%'  },
  { icon:'⚽', label:"Today's Tips",  value:'32'   },
  { icon:'📈', label:'Avg Confidence', value:'79%'  },
];

const SIDE_FEATURES = [
  'Gemini AI-powered predictions daily',
  'Premier League, La Liga, Bundesliga & more',
  'Confidence scores on every tip',
  'New fixtures updated every morning',
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/auth/login', {
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

  return (
    <div style={{ background: C.bg0, color: C.text0, minHeight: '100vh', display: 'flex', fontFamily: "'Barlow', system-ui, sans-serif" }}>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a { text-decoration:none; color:inherit; }
        button { font-family:inherit; cursor:pointer; border:none; background:none; color:inherit; }
        input  { font-family:inherit; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
        .fade-1 { animation:fadeUp .35s .05s ease both; }
        .fade-2 { animation:fadeUp .35s .12s ease both; }
        .fade-3 { animation:fadeUp .35s .19s ease both; }
        .fade-4 { animation:fadeUp .35s .26s ease both; }
        .btn-scale:active { transform:scale(0.97); transition:transform .1s; }
        .row-hover:hover  { border-color:rgba(255,255,255,0.13) !important; }
        .link-hover { transition:color .15s; }
        .link-hover:hover { color:#eceef8 !important; }
      `}</style>

      {/* ═══ LEFT PANEL ═════════════════════════════════════════ */}
      <div style={{
        display: 'none',
        width: '44%', flexShrink: 0,
        background: C.bg1,
        borderRight: `1px solid ${C.border}`,
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 48px',
        position: 'relative', overflow: 'hidden',
      }} className="left-panel">
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 80% 60% at 20% 80%, rgba(0,230,118,0.05) 0%, transparent 70%),
                       radial-gradient(ellipse 50% 40% at 80% 10%, rgba(68,138,255,0.04) 0%, transparent 60%)`,
        }}/>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `linear-gradient(135deg,${C.green},#00897b)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>⚡</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: '0.02em' }}>
            BET<span style={{ color: C.green }}>AI</span>
          </div>
        </Link>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
            fontSize: 52, lineHeight: 0.95, textTransform: 'uppercase',
            letterSpacing: '0.01em', marginBottom: 20,
          }}>
            WELCOME<br />BACK,<br /><span style={{ color: C.green }}>CHAMPION.</span>
          </h1>
          <p style={{ fontSize: 14, color: C.text1, lineHeight: 1.75, maxWidth: 340, marginBottom: 32 }}>
            Your AI-powered predictions are ready. Log in to access today&apos;s tips with confidence scores and expert analysis.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SIDE_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: C.greenFaint, border: `1px solid ${C.greenBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: C.green, fontWeight: 800,
                }}>✓</span>
                <span style={{ fontSize: 13, color: C.text1 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1,
          background: C.border, border: `1px solid ${C.border}`,
          borderRadius: 12, overflow: 'hidden', position: 'relative', zIndex: 1,
        }}>
          {SIDE_STATS.map((s, i) => (
            <div key={i} style={{ background: C.bg0, padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 22, color: C.green, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: C.text2, fontWeight: 700, letterSpacing: '0.1em' }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ RIGHT PANEL — FORM ═════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>

        {/* Mobile logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, alignSelf: 'flex-start' }} className="mobile-logo">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${C.green},#00897b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: '0.02em' }}>BET<span style={{ color: C.green }}>AI</span></div>
        </Link>

        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Heading */}
          <div className="fade-1" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: C.green }}/>
              <span style={{ fontSize: 9, color: C.green, fontWeight: 800, letterSpacing: '0.16em' }}>SIGN IN</span>
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 34, textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 6 }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: 13, color: C.text1 }}>
              No account?{' '}
              <Link href="/auth/signup" className="link-hover" style={{ color: C.green, fontWeight: 600 }}>Get access →</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div className="fade-2">
              <label style={{ display: 'block', fontSize: 9, color: C.text2, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 7 }}>EMAIL ADDRESS</label>
              <input
                type="email" placeholder="you@example.com" required
                autoComplete="email"
                value={form.email}
                onChange={e => { setError(''); setForm({ ...form, email: e.target.value }); }}
                style={inputStyle()}
                onFocus={e => (e.currentTarget.style.borderColor = C.greenBorder)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>

            {/* Password */}
            <div className="fade-3">
              <label style={{ display: 'block', fontSize: 9, color: C.text2, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 7 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} placeholder="Your password" required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }}
                  style={{ ...inputStyle(), paddingRight: 56 }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.greenBorder)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: C.text2,
                  transition: 'color .15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text1)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.text2)}>
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: C.redFaint, border: `1px solid ${C.redBorder}`,
                borderRadius: 9, padding: '11px 14px',
                display: 'flex', alignItems: 'flex-start', gap: 8,
                fontSize: 12, color: C.red, fontWeight: 600,
              }}>
                <span style={{ flexShrink: 0 }}>⚠</span><span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <div className="fade-4">
              <button type="submit" disabled={loading || !form.email || !form.password} className="btn-scale" style={{
                width: '100%', padding: '13px', borderRadius: 10, marginTop: 2,
                background: loading || !form.email || !form.password
                  ? C.bg3
                  : `linear-gradient(90deg,${C.green},${C.greenD})`,
                color: loading || !form.email || !form.password ? C.text2 : C.bg0,
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
                fontSize: 15, letterSpacing: '0.07em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background .2s',
              }}>
                {loading
                  ? <><span style={{ width: 16, height: 16, border: `2px solid ${C.text2}`, borderTop: `2px solid ${C.text0}`, borderRadius: '50%', display: 'inline-block', animation: 'spin .75s linear infinite' }}/> SIGNING IN...</>
                  : 'SIGN IN →'}
              </button>
            </div>
          </form>

          {/* Admin link */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: C.text2 }}>
            Admin?{' '}
            <Link href="/auth/admin-login" className="link-hover" style={{ color: C.text2, textDecoration: 'underline' }}>Admin login →</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .left-panel  { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (session) return { redirect: { destination: session.role === 'ADMIN' ? '/admin' : '/dashboard', permanent: false } };
  return { props: {} };
};
