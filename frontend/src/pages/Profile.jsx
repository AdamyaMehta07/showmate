import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { pointsAPI, bookingsAPI } from '../services/api'
import { pointsTiers } from '../data/mockData'

const Profile = () => {
  const { user, refreshUser } = useAuth()
  const [searchParams]  = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')

  const [pointsSummary, setPointsSummary] = useState(null)
  const [pointsHistory, setPointsHistory] = useState([])
  const [bookings,      setBookings]      = useState([])
  const [redeemAmt,     setRedeemAmt]     = useState(500)
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemMsg,     setRedeemMsg]     = useState('')
  const [loadingData,   setLoadingData]   = useState(true)

  // Local fallback values when backend not connected
  const pts          = pointsSummary?.points        ?? user?.points        ?? 0
  const wallet       = pointsSummary?.walletBalance ?? user?.walletBalance ?? 0
  const tier         = pointsSummary?.tier          ?? user?.tier          ?? 'Bronze'
  const totalBooks   = user?.totalBookings ?? 0

  const currentTier  = pointsTiers.find(t => pts >= t.min && pts < t.max) || pointsTiers[0]
  const nextTier     = pointsTiers[pointsTiers.indexOf(currentTier) + 1]
  const progress     = nextTier ? Math.min(((pts - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100) : 100
  const remaining    = nextTier ? nextTier.min - pts : 0
  const cashback     = Math.floor(redeemAmt / 500) * 50

  useEffect(() => {
    const load = async () => {
      setLoadingData(true)
      try {
        const [sumRes, histRes, bookRes] = await Promise.allSettled([
          pointsAPI.getSummary(),
          pointsAPI.getHistory(),
          bookingsAPI.getMyBookings(),
        ])
        if (sumRes.status === 'fulfilled')  setPointsSummary(sumRes.value)
        if (histRes.status === 'fulfilled') setPointsHistory(histRes.value.history || [])
        if (bookRes.status === 'fulfilled') setBookings(bookRes.value.bookings || [])
      } catch (e) { /* use local fallback */ }
      setLoadingData(false)
    }
    load()
  }, [])

  const handleRedeem = async () => {
    if (redeemAmt > pts) { setRedeemMsg('❌ Not enough points!'); return }
    if (redeemAmt % 500 !== 0) { setRedeemMsg('❌ Must be a multiple of 500.'); return }
    setRedeemLoading(true); setRedeemMsg('')
    try {
      const res = await pointsAPI.redeem(redeemAmt)
      setRedeemMsg(`✅ ${res.message}`)
      setPointsSummary(prev => prev ? { ...prev, points: res.newPoints, walletBalance: res.newWallet } : null)
      await refreshUser()
    } catch (e) { setRedeemMsg('❌ ' + e.message) }
    setRedeemLoading(false)
  }

  const TABS = ['overview', 'bookings', 'history', 'redeem']

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '36px' }}>
        <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, flexShrink: 0, border: '3px solid rgba(139,92,246,0.4)', boxShadow: '0 0 30px rgba(109,40,217,0.3)' }}>
          {user?.avatar || user?.name?.slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '5px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.05em' }}>{user?.name}</h1>
            <div style={{ background: `linear-gradient(135deg, ${currentTier.color}22, ${currentTier.color}11)`, border: `1px solid ${currentTier.color}55`, borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 700, color: currentTier.color }}>
              {currentTier.icon} {tier} Member
            </div>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{user?.email} · Member since {user?.memberSince || user?.createdAt?.slice(0,7)}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
        {[
          { label: 'Total Points',   value: pts.toLocaleString(),  suffix: 'pts',        icon: '⭐', color: 'var(--gold)',         gradient: 'rgba(245,158,11,0.08)'  },
          { label: 'Wallet Balance', value: `₹${wallet}`,          suffix: 'redeemable', icon: '💰', color: '#4ade80',             gradient: 'rgba(34,197,94,0.06)'   },
          { label: 'Bookings',       value: totalBooks,             suffix: 'all time',   icon: '🎟', color: 'var(--purple-light)', gradient: 'rgba(139,92,246,0.08)'  },
          { label: 'Current Tier',   value: tier,                   suffix: remaining > 0 ? `${remaining} pts to next` : 'Max tier!', icon: currentTier.icon, color: currentTier.color, gradient: `${currentTier.color}0a` },
        ].map(stat => (
          <div key={stat.label} className="glass" style={{ borderRadius: '14px', padding: '18px', border: `1px solid ${stat.color}22`, background: stat.gradient, transition: 'all 0.3s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = `${stat.color}44` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.borderColor = `${stat.color}22` }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{stat.icon}</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '0.04em', color: stat.color, marginBottom: '2px' }}>{stat.value}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{stat.label}</p>
            <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{stat.suffix}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {nextTier && (
        <div className="glass" style={{ borderRadius: '14px', padding: '20px', border: '1px solid var(--border)', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Progress to {nextTier.icon} {nextTier.name}</p>
              <p style={{ fontSize: '13px' }}><span style={{ color: 'var(--gold)', fontWeight: 700 }}>{pts.toLocaleString()}</span> / {nextTier.min.toLocaleString()} pts</p>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{remaining.toLocaleString()} pts to go</p>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: currentTier.color, fontWeight: 600 }}>{currentTier.icon} {currentTier.name}</span>
            <span style={{ fontSize: '11px', color: nextTier.color, fontWeight: 600 }}>{nextTier.icon} {nextTier.name}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '28px', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '11px 22px', border: 'none', background: 'none', cursor: 'pointer',
            color: activeTab === tab ? 'white' : 'var(--muted)',
            borderBottom: `2px solid ${activeTab === tab ? 'var(--purple-light)' : 'transparent'}`,
            fontFamily: 'var(--font-body)', fontWeight: activeTab === tab ? 600 : 400,
            fontSize: '14px', textTransform: 'capitalize', transition: 'all 0.2s', marginBottom: '-1px', whiteSpace: 'nowrap',
          }}>{tab === 'history' ? 'Points History' : tab}</button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="fade-up">
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '14px' }}>Recent Bookings</p>
            {bookings.length === 0 ? (
              <div className="glass" style={{ borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</p>
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>No bookings yet</p>
                <Link to="/movies"><button className="btn-primary" style={{ marginTop: '12px', fontSize: '12px', padding: '8px 18px' }}>Browse Movies</button></Link>
              </div>
            ) : bookings.slice(0, 3).map(b => (
              <div key={b._id} className="glass" style={{ borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700 }}>{b.movieTitle}</p>
                  <span style={{ fontSize: '10px', background: b.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)', color: b.status === 'confirmed' ? '#4ade80' : '#f87171', border: `1px solid ${b.status === 'confirmed' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '4px', padding: '2px 8px', fontWeight: 700 }}>
                    {b.status}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>📍 {b.theatre} · 🕐 {b.showTime}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--gold)' }}>⭐ +{b.pointsEarned} pts</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>₹{b.finalAmount}</span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '14px' }}>All Tiers & Benefits</p>
            {pointsTiers.map(t => {
              const isActive = t.name === tier
              return (
                <div key={t.name} style={{ borderRadius: '10px', padding: '13px 16px', marginBottom: '7px', border: `1px solid ${isActive ? t.color + '55' : 'var(--border)'}`, background: isActive ? `${t.color}0a` : 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px' }}>{t.icon}</span>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: t.color }}>{t.name}</p>
                      <p style={{ fontSize: '10px', color: 'var(--muted)' }}>{t.min.toLocaleString()}+ pts</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>{t.cashback > 0 ? `₹${t.cashback}` : '–'}</p>
                    <p style={{ fontSize: '10px', color: 'var(--muted)' }}>cashback</p>
                  </div>
                  {isActive && <span style={{ fontSize: '9px', background: t.color, color: '#000', borderRadius: '8px', padding: '2px 7px', fontWeight: 800, marginLeft: '8px' }}>YOU</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── BOOKINGS ─────────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="fade-up">
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '18px' }}>
            All Bookings ({bookings.length})
          </p>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>🎟</p>
              <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>No bookings yet</p>
              <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>Book your first movie to see it here!</p>
              <Link to="/movies"><button className="btn-primary">Browse Movies →</button></Link>
            </div>
          ) : bookings.map(b => (
            <div key={b._id} className="glass" style={{ borderRadius: '12px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border)', marginBottom: '12px', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-light)'; e.currentTarget.style.transform = 'translateX(4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';       e.currentTarget.style.transform = 'translateX(0)' }}>
              {b.moviePoster && <img src={b.moviePoster} alt="" style={{ width: '70px', objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.background = '#16162a'} />}
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '5px' }}>{b.movieTitle}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>📍 {b.theatre} · 🕐 {b.showTime} · {b.showDate}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Ref: <strong style={{ color: 'white' }}>{b.bookingRef}</strong></p>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {b.seats?.map(s => <span key={s.id} style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.3)', borderRadius: '4px', padding: '2px 7px', fontSize: '10px', color: 'var(--purple-light)', fontWeight: 600 }}>{s.id}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold)', marginBottom: '3px' }}>₹{b.finalAmount}</p>
                  <p style={{ fontSize: '11px', color: '#4ade80', marginBottom: '5px' }}>⭐ +{b.pointsEarned} pts</p>
                  <span style={{ fontSize: '10px', background: b.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)', color: b.status === 'confirmed' ? '#4ade80' : '#f87171', border: `1px solid ${b.status === 'confirmed' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '4px', padding: '2px 8px', fontWeight: 700 }}>
                    {b.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── POINTS HISTORY ───────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="fade-up">
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '18px' }}>Points Transaction History</p>
          {pointsHistory.length === 0
            ? (user?.pointsHistory || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: item.type === 'earned' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: `1px solid ${item.type === 'earned' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`, flexShrink: 0 }}>
                    {item.type === 'earned' ? '⭐' : '💸'}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{item.movie || item.description}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.date || new Date(item.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: item.points > 0 ? '#4ade80' : '#f87171', letterSpacing: '0.04em' }}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))
            : pointsHistory.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: item.type === 'earned' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: `1px solid ${item.type === 'earned' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`, flexShrink: 0 }}>
                    {item.type === 'earned' ? '⭐' : '💸'}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{item.description}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: item.points > 0 ? '#4ade80' : '#f87171' }}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))
          }
        </div>
      )}

      {/* ── REDEEM ───────────────────────────────────────────────────────── */}
      {activeTab === 'redeem' && (
        <div className="fade-up" style={{ maxWidth: '520px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '18px' }}>Redeem Points for Cashback</p>

          <div className="glass" style={{ borderRadius: '16px', padding: '24px', border: '1px solid rgba(245,158,11,0.3)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>Available Points</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--gold)' }}>{pts.toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>Wallet Balance</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#4ade80' }}>₹{wallet}</p>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>Select amount to redeem:</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
              {[500, 1000, 1500, Math.floor(pts / 500) * 500].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map(amount => (
                <button key={amount} onClick={() => setRedeemAmt(amount)} style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid',
                  borderColor: redeemAmt === amount ? 'var(--gold)' : 'var(--border)',
                  background: redeemAmt === amount ? 'rgba(245,158,11,0.15)' : 'var(--surface2)',
                  color: redeemAmt === amount ? 'var(--gold)' : 'var(--muted)',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                  {amount.toLocaleString()} pts
                </button>
              ))}
            </div>

            <div style={{ background: 'rgba(245,158,11,0.06)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(245,158,11,0.15)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Points to redeem</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{redeemAmt.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Cashback you'll get</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#4ade80' }}>₹{cashback}</span>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '14px' }}>
              📌 500 pts = ₹50 · Credited to ShowMate Wallet instantly · Min 500 pts required
            </p>

            {redeemMsg && (
              <div style={{ background: redeemMsg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${redeemMsg.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px', color: redeemMsg.startsWith('✅') ? '#4ade80' : '#f87171' }}>
                {redeemMsg}
              </div>
            )}

            <button className="btn-gold" style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: 700, opacity: redeemLoading ? 0.7 : 1 }}
              onClick={handleRedeem} disabled={redeemLoading || redeemAmt > pts}>
              {redeemLoading ? '⏳ Processing...' : `💰 Redeem ${redeemAmt.toLocaleString()} pts → ₹${cashback}`}
            </button>
          </div>

          {/* Conversion table */}
          <div className="glass" style={{ borderRadius: '12px', padding: '18px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Conversion Table</p>
            {[500, 1000, 1500, 2000, 3000, 5000].map(p => (
              <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>⭐ {p.toLocaleString()} points</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>₹{p / 10} cashback</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile