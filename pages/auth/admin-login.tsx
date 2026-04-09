// pages/auth/admin-login.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from '../../lib/auth';
import Link from 'next/link';

const C = {
  bg0:'#070810', bg1:'#0c0d1a', bg2:'#111226',
  border:'rgba(255,255,255,0.07)',
  green:'#00e676', greenD:'#00c853',
  greenFaint:'rgba(0,230,118,0.08)', greenBorder:'rgba(0,230,118,0.22)',
  red:'#ff5252', redFaint:'rgba(255,82,82,0.09)', redBorder:'rgba(255,82,82,0.25)',
  text0:'#eceef8', text1:'#8e90a8', text2:'#4a4c68',
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      if (!res.ok) throw new Error(data.message || 'Login failed.');
      if (data.role !== 'ADMIN') throw new Error('This login is for admins only. Use /auth/login instead.');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width:'100%', background:C.bg2, border:`1px solid ${C.border}`,
    borderRadius:10, padding:'11px 14px', color:C.text0,
    fontSize:14, outline:'none', transition:'border-color .15s',
    fontFamily:"'Barlow', sans-serif",
  };

  return (
    <div style={{ background:C.bg0, color:C.text0, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Barlow', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a { text-decoration:none; color:inherit; }
        button { font-family:inherit; cursor:pointer; border:none; background:none; color:inherit; }
        input { font-family:inherit; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .fade-1 { animation:fadeUp .32s .05s ease both; }
        .fade-2 { animation:fadeUp .32s .12s ease both; }
        .fade-3 { animation:fadeUp .32s .18s ease both; }
        .btn-scale:active { transform:scale(0.97); transition:transform .1s; }
        .link-hover { transition:color .15s; }
        .link-hover:hover { color:#eceef8 !important; }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,82,82,0.04) 0%, transparent 70%)',
      }}/>

      <div style={{ width:'100%', maxWidth:380, position:'relative', zIndex:1 }}>

        {/* Logo + ADMIN badge */}
        <div className="fade-1" style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{
              width:36, height:36, borderRadius:9,
              background:`linear-gradient(135deg,${C.green},#00897b)`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>⚡</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:24, letterSpacing:'0.02em' }}>
              BET<span style={{ color:C.green }}>AI</span>
            </div>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
            <div style={{
              padding:'3px 14px', borderRadius:999,
              background:C.redFaint, border:`1px solid ${C.redBorder}`,
              color:C.red, fontSize:10, fontWeight:800, letterSpacing:'0.12em',
            }}>ADMIN ACCESS</div>
          </div>
        </div>

        {/* Card */}
        <div className="fade-2" style={{
          background:C.bg1, border:`1px solid ${C.redBorder}`,
          borderRadius:16, overflow:'hidden',
        }}>
          {/* Card header */}
          <div style={{
            padding:'18px 24px', borderBottom:`1px solid ${C.border}`,
            background:`linear-gradient(135deg,rgba(255,82,82,0.06),rgba(255,82,82,0.02))`,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <div style={{ width:4, height:20, borderRadius:2, background:C.red }}/>
              <span style={{ fontSize:9, color:C.red, fontWeight:800, letterSpacing:'0.16em' }}>RESTRICTED</span>
            </div>
            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, textTransform:'uppercase', letterSpacing:'0.02em', marginBottom:4 }}>
              Admin Sign In
            </h1>
            <p style={{ fontSize:12, color:C.text2 }}>Authorised personnel only</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>

            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:9, color:C.text2, fontWeight:800, letterSpacing:'0.12em', marginBottom:7 }}>
                ADMIN EMAIL
              </label>
              <input
                type="email" placeholder="admin@yourdomain.com" required autoComplete="email"
                value={form.email}
                onChange={e => { setError(''); setForm({ ...form, email: e.target.value }); }}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = C.redBorder)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:9, color:C.text2, fontWeight:800, letterSpacing:'0.12em', marginBottom:7 }}>
                PASSWORD
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} placeholder="Admin password" required autoComplete="current-password"
                  value={form.password}
                  onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }}
                  style={{ ...inputStyle, paddingRight:56 }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.redBorder)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  fontSize:9, fontWeight:800, letterSpacing:'0.1em', color:C.text2,
                }}>
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background:C.redFaint, border:`1px solid ${C.redBorder}`,
                borderRadius:9, padding:'11px 14px',
                display:'flex', alignItems:'flex-start', gap:8,
                fontSize:12, color:C.red, fontWeight:600,
              }}>
                <span style={{ flexShrink:0 }}>⚠</span><span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || !form.email || !form.password} className="btn-scale" style={{
              width:'100%', padding:'13px', borderRadius:10, marginTop:2,
              background: loading || !form.email || !form.password
                ? 'rgba(255,82,82,0.15)'
                : 'linear-gradient(90deg,#ff5252,#d32f2f)',
              color: loading || !form.email || !form.password ? C.red : '#fff',
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900,
              fontSize:15, letterSpacing:'0.07em',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              border: loading || !form.email || !form.password ? `1px solid ${C.redBorder}` : 'none',
              transition:'opacity .2s',
            }}>
              {loading
                ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,82,82,0.4)', borderTop:'2px solid #ff5252', borderRadius:'50%', display:'inline-block', animation:'spin .75s linear infinite' }}/> SIGNING IN...</>
                : '🔐 ADMIN SIGN IN →'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="fade-3" style={{ textAlign:'center', marginTop:20, fontSize:11, color:C.text2 }}>
          Not an admin?{' '}
          <Link href="/auth/login" className="link-hover" style={{ color:C.text2, textDecoration:'underline' }}>
            Regular login →
          </Link>
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req);
  if (session?.role === 'ADMIN') return { redirect: { destination: '/admin', permanent: false } };
  return { props: {} };
};
