import { Link } from 'react-router-dom'
import { userProfile, pointsTiers } from '../data/mockData'

const PointsWidget = () => {
  const currentTier = pointsTiers.find(t => userProfile.points >= t.min && userProfile.points < t.max) || pointsTiers[0]
  const nextTier = pointsTiers[pointsTiers.indexOf(currentTier) + 1]
  const progress = nextTier ? ((userProfile.points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100
  const remaining = nextTier ? nextTier.min - userProfile.points : 0

  return (
    <Link to="/profile" style={{ textDecoration: 'none' }}>
      <div className="glass" style={{
        borderRadius: '16px', padding: '20px', cursor: 'pointer',
        border: '1px solid rgba(245,158,11,0.2)',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(15,15,26,0.9), rgba(245,158,11,0.05))',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>ShowMate Points</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '0.05em' }} className="gradient-text-gold">
              {userProfile.points.toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', marginBottom: '2px' }}>{currentTier.icon}</div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: currentTier.color, letterSpacing: '0.1em' }}>{currentTier.name}</p>
          </div>
        </div>

        {/* Progress */}
        {nextTier && (
          <>
            <div className="progress-track" style={{ marginBottom: '8px' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
              <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>{remaining.toLocaleString()} pts</span> more to reach {nextTier.icon} {nextTier.name}
            </p>
          </>
        )}

        {/* Wallet */}
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>💰 Wallet Balance</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>₹{userProfile.walletBalance}</span>
        </div>
      </div>
    </Link>
  )
}

export default PointsWidget