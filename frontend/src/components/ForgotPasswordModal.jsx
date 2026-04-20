// ─── Add this component at the TOP of Auth.jsx (before the Auth function) ────

const ForgotPasswordModal = ({ onClose }) => {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error,   setError]   = useState('')

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const handleSubmit = async () => {
    if (!email.includes('@')) { setError('Enter a valid email.'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${BASE_URL}/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage(data.message)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-strong" style={{ borderRadius: '20px', padding: '40px', maxWidth: '400px', width: '100%', border: '1px solid rgba(109,40,217,0.4)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '0.05em' }}>FORGOT PASSWORD</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        {message ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>📧</p>
            <p style={{ color: '#4ade80', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>{message}</p>
            <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '20px' }}>Check your inbox and spam folder. Link expires in 1 hour.</p>
            <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
              Enter your registered email. We'll send you a password reset link.
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#f87171' }}>
                ⚠️ {error}
              </div>
            )}

            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ marginBottom: '20px' }}
            />

            <button className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}