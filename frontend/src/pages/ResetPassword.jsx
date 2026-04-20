import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ResetPassword = () => {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const token                   = searchParams.get('token')
  const userId                  = searchParams.get('id')

  const [newPassword, setNew]   = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [message, setMessage]   = useState('')
  const [error, setError]       = useState('')
  const [showPass, setShowPass] = useState(false)
  const [done, setDone]         = useState(false)

  const handleReset = async () => {
    setError('')
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res  = await fetch(`${BASE_URL}/forgot-password/reset`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, userId, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage(data.message)
      setDone(true)
      setTimeout(() => navigate('/auth'), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // No token in URL
  if (!token || !userId) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass" style={{ borderRadius: '20px', padding: '48px', maxWidth: '440px', width: '100%', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>❌</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '12px' }}>INVALID LINK</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>This reset link is invalid or has expired.</p>
          <Link to="/auth"><button className="btn-primary" style={{ width: '100%' }}>Back to Login</button></Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass" style={{ borderRadius: '20px', padding: '48px', maxWidth: '440px', width: '100%', border: '1px solid rgba(109,40,217,0.3)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--purple), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, margin: '0 auto 12px' }}>S</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '0.05em' }}>
            SHOW<span style={{ color: 'var(--gold)' }}>MATE</span>
          </h1>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>✅</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '12px' }}>PASSWORD RESET!</h2>
            <p style={{ color: '#4ade80', marginBottom: '8px' }}>{message}</p>
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Redirecting to login...</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.05em', marginBottom: '8px' }}>RESET PASSWORD</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '28px' }}>Enter your new password below</p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => setNew(e.target.value)}
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="Repeat new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
              />
            </div>

            <button className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
              onClick={handleReset} disabled={loading}>
              {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--muted)' }}>
              Remember it? <Link to="/auth" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 600 }}>Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPassword