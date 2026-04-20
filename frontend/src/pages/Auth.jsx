import ForgotPasswordModal from '../components/ForgotPasswordModal'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { pointsTiers } from '../data/mockData'

const Auth = () => {
  const [mode, setMode]               = useState('login')
  const [form, setForm]               = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const update = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError('') }

  const validate = () => {
    if (!form.email.includes('@')) return 'Enter a valid email address.'
    if (form.password.length < 6)  return 'Password must be at least 6 characters.'
    if (mode === 'register') {
      if (!form.name.trim())              return 'Full name is required.'
      if (form.password !== form.confirm) return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password)
        setSuccess(`Welcome back, ${data.user.name}! 🎬`)
        setTimeout(() => navigate('/'), 1000)
      } else {
        const data = await register(form.name, form.email, form.password)
        setSuccess(`Welcome to ShowMate! You got 100 welcome points 🎉`)
        setTimeout(() => navigate('/'), 1200)
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '85vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* Left panel */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(109,40,217,0.85) 0%, rgba(8,8,16,0.95) 70%)' }} />
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '60px 48px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--purple), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900 }}>S</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '0.05em', color: 'white' }}>SHOW<span style={{ color: 'var(--gold)' }}>MATE</span></span>
          </Link>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '52px', letterSpacing: '0.04em', lineHeight: 0.92, marginBottom: '16px' }}>
            BOOK.<br/>EARN.<br/><span className="gradient-text-gold">REWARD.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', marginBottom: '40px', maxWidth: '300px' }}>
            India's smartest ticketing platform. Every booking earns points. Every milestone gets rewarded with real cashback.
          </p>

          {/* Tier pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Loyalty Tiers</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {pointsTiers.map(tier => (
                <div key={tier.name} style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${tier.color}33`, borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: 600, color: tier.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {tier.icon} {tier.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', background: 'var(--surface)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '12px', padding: '4px', marginBottom: '32px', border: '1px solid var(--border)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                background: mode === m ? 'var(--purple)' : 'transparent',
                color: mode === m ? 'white' : 'var(--muted)',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '0.05em', marginBottom: '6px' }}>
            {mode === 'login' ? 'WELCOME BACK' : 'JOIN SHOWMATE'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
            {mode === 'register' ? 'Get 100 welcome points on signup 🎁' : 'Sign in to access your points & bookings'}
          </p>

          {/* Error / Success banners */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#4ade80' }}>
              ✅ {success}
            </div>
          )}

          {/* Fields */}
          {mode === 'register' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input className="input-field" placeholder="Adamya Mehta" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Email</label>
            <input className="input-field" type="email" placeholder="you@email.com" value={form.email} onChange={e => update('email', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          <div style={{ marginBottom: '14px', position: 'relative' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} style={{ paddingRight: '44px' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px' }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.confirm} onChange={e => update('confirm', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '18px' }}>
              <button
              onClick={() => setShowForgot(true)}
              style={{
              background: 'none',
              border: 'none',
              fontSize: '12px',
              color: 'var(--purple-light)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              textDecoration: 'underline',
              }}>
              Forgot password?
            </button>
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, marginBottom: '12px', opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Please wait...' : mode === 'login' ? '→ Sign In' : '🎬 Create Account + Get 100 pts'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>or</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          {mode === 'register' && (
            <div style={{ background: 'rgba(245,158,11,0.06)', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--gold-light)' }}>
                🎁 New members get <strong>100 Welcome Points</strong> — that's ₹10 in cashback instantly!
              </p>
            </div>
          )}

          <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
              style={{ background: 'none', border: 'none', color: 'var(--purple-light)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {mode === 'login' ? 'Register free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  )
}

export default Auth