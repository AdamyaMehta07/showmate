import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { movies, pointsTiers } from '../data/mockData'
import MovieCard from '../components/MovieCard'
import { useAuth } from '../context/AuthContext'

const HeroSlide = ({ movie, active }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: 'opacity 1s ease', pointerEvents: active ? 'auto' : 'none' }}>
    <img src={movie.backdrop} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }} onError={e => e.target.style.display = 'none'} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,8,16,0.98) 0%, rgba(8,8,16,0.55) 55%, transparent 100%)' }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '280px', background: 'linear-gradient(0deg, var(--bg) 0%, transparent 100%)' }} />
    <div style={{ position: 'relative', zIndex: 2, height: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }} className="fade-up-1">
          {movie.genre?.slice(0,2).map(g => <span key={g} className="tag tag-genre">{g}</span>)}
          <span className="tag tag-lang">{movie.language}</span>
          <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>⭐ {movie.rating}/10 · {movie.votes}</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 6vw, 68px)', letterSpacing: '0.04em', lineHeight: 0.93, marginBottom: '14px' }} className="fade-up-2">{movie.title}</h1>
        <p style={{ fontFamily: 'var(--font-italic)', fontSize: '15px', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', marginBottom: '12px' }} className="fade-up-2">{movie.duration} · {movie.director}</p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginBottom: '22px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="fade-up-3">{movie.description}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', padding: '7px 14px', marginBottom: '22px' }} className="fade-up-3">
          <span>⭐</span>
          <span style={{ fontSize: '13px', color: 'var(--gold-light)' }}>Book & earn <strong>+{movie.pointsReward} ShowMate Points</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} className="fade-up-4">
          <Link to={`/booking/${movie.id}`}><button className="btn-primary" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Book Tickets</button></Link>
          <Link to={`/movie/${movie.id}`}><button className="btn-outline" style={{ fontSize: '14px' }}>More Info</button></Link>
        </div>
      </div>
    </div>
  </div>
)

const Home = () => {
  const { user } = useAuth()
  const [heroIndex, setHeroIndex] = useState(0)
  const heroMovies = movies.filter(m => m.trending).slice(0, 5)
  const scrollRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setHeroIndex(i => (i + 1) % heroMovies.length), 5000)
    return () => clearInterval(id)
  }, [heroMovies.length])

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })

  const currentTier  = pointsTiers.find(t => (user?.points || 0) >= t.min && (user?.points || 0) < t.max) || pointsTiers[0]
  const nextTier     = pointsTiers[pointsTiers.indexOf(currentTier) + 1]
  const progress     = nextTier ? Math.min((((user?.points || 0) - currentTier.min) / (nextTier.min - currentTier.min)) * 100, 100) : 100

  return (
    <div>
      {/* Hero */}
      <div style={{ position: 'relative', height: 'clamp(500px, 78vh, 700px)', overflow: 'hidden' }}>
        {heroMovies.map((movie, i) => <HeroSlide key={movie.id} movie={movie} active={i === heroIndex} />)}
        <div style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
          {heroMovies.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)} style={{ width: i === heroIndex ? '28px' : '8px', height: '8px', borderRadius: '100px', border: 'none', cursor: 'pointer', background: i === heroIndex ? 'var(--purple-light)' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
          {heroMovies.map((movie, i) => (
            <div key={movie.id} onClick={() => setHeroIndex(i)} style={{ width: '56px', height: '76px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', opacity: i === heroIndex ? 1 : 0.35, border: `2px solid ${i === heroIndex ? 'var(--purple-light)' : 'transparent'}`, transition: 'all 0.3s' }}>
              <img src={movie.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.background = '#16162a'} />
            </div>
          ))}
        </div>
      </div>

      {/* Points banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.2), rgba(245,158,11,0.1))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '18px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { icon: '🎬', label: 'Book a Movie', value: '+100 pts' },
              { icon: '🎭', label: 'Book a Show',  value: '+80 pts'  },
              { icon: '⚡', label: 'Weekend Bonus', value: '2x Points' },
              { icon: '💰', label: '500 pts =',    value: '₹50 Cash' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--muted)' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          {user
            ? <div className="points-badge" style={{ fontSize: '13px', padding: '8px 16px' }}>⭐ Your balance: {(user.points || 0).toLocaleString()} pts</div>
            : <Link to="/auth"><button className="btn-gold" style={{ fontSize: '13px', padding: '9px 20px' }}>Start Earning →</button></Link>
          }
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px', alignItems: 'start' }}>

          <div>
            {/* Now Showing */}
            <section style={{ marginBottom: '56px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <div>
                  <p className="section-label" style={{ marginBottom: '4px' }}>🎬 On Screen Now</p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.05em' }}>NOW SHOWING</h2>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => scroll(-1)} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                  <button onClick={() => scroll(1)}  style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                  <Link to="/movies"><button className="btn-outline" style={{ fontSize: '12px', padding: '7px 14px' }}>See All</button></Link>
                </div>
              </div>
              <div ref={scrollRef} style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
              </div>
            </section>

            {/* Loyalty Tiers */}
            <section style={{ marginBottom: '56px' }}>
              <div style={{ marginBottom: '22px' }}>
                <p className="section-label" style={{ marginBottom: '4px' }}>🏆 Rewards Program</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.05em' }}>LOYALTY TIERS</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {pointsTiers.map(tier => {
                  const isActive = tier.name === (user?.tier || 'Bronze')
                  return (
                    <div key={tier.name} className="glass" style={{ borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: isActive ? `1px solid ${tier.color}66` : '1px solid var(--border)', background: isActive ? `${tier.color}08` : 'rgba(255,255,255,0.02)', position: 'relative', transition: 'all 0.3s' }}>
                      {isActive && <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: tier.color, color: '#000', fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>YOU</div>}
                      <div style={{ fontSize: '26px', marginBottom: '6px' }}>{tier.icon}</div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', letterSpacing: '0.08em', color: tier.color, marginBottom: '3px' }}>{tier.name}</p>
                      <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '6px' }}>{tier.min === 0 ? '0' : tier.min.toLocaleString()}+ pts</p>
                      <p style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>{tier.cashback > 0 ? `₹${tier.cashback}` : 'Start'}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Coming Soon */}
            <section>
              <div style={{ marginBottom: '22px' }}>
                <p className="section-label" style={{ marginBottom: '4px' }}>🔜 Pre-book Available</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.05em' }}>COMING SOON</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {movies.filter(m => ['UPCOMING', 'MOST AWAITED', 'EPIC'].includes(m.badge)).map(movie => (
                  <div key={movie.id} className="glass" style={{ borderRadius: '12px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border)', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-light)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';       e.currentTarget.style.transform = 'translateY(0)'   }}>
                    <img src={movie.poster} alt={movie.title} style={{ width: '86px', objectFit: 'cover' }} onError={e => { e.target.style.background = '#16162a'; e.target.style.minHeight = '110px' }} />
                    <div style={{ padding: '14px', flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>{movie.title}</p>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '7px', flexWrap: 'wrap' }}>
                        {movie.genre?.slice(0,2).map(g => <span key={g} className="tag tag-genre" style={{ fontSize: '9px' }}>{g}</span>)}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '9px' }}>📅 {movie.releaseDate}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gold)' }}>⭐ +{movie.pointsReward} pts</span>
                        <Link to={`/movie/${movie.id}`}><button className="btn-outline" style={{ fontSize: '10px', padding: '4px 10px' }}>Info</button></Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Points widget */}
            {user ? (
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div className="glass" style={{ borderRadius: '16px', padding: '20px', border: '1px solid rgba(245,158,11,0.25)', background: 'linear-gradient(135deg, rgba(15,15,26,0.9), rgba(245,158,11,0.04))', transition: 'all 0.3s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.45)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Your Points</p>
                      <p className="gradient-text-gold" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '0.05em' }}>{(user.points || 0).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', marginBottom: '2px' }}>{currentTier.icon}</div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: currentTier.color }}>{user.tier}</p>
                    </div>
                  </div>
                  {nextTier && (
                    <>
                      <div className="progress-track" style={{ marginBottom: '7px' }}>
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>{(nextTier.min - (user.points || 0)).toLocaleString()} pts</span> to {nextTier.icon} {nextTier.name}
                      </p>
                    </>
                  )}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>💰 Wallet</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80' }}>₹{user.walletBalance || 0}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="glass" style={{ borderRadius: '16px', padding: '24px', border: '1px solid rgba(109,40,217,0.3)', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', marginBottom: '10px' }}>🎁</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.05em', marginBottom: '6px' }}>START EARNING</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Join free & get 100 welcome points instantly!</p>
                <Link to="/auth"><button className="btn-gold" style={{ width: '100%', fontSize: '13px' }}>Join ShowMate Free →</button></Link>
              </div>
            )}

            {/* Quick stats */}
            {user && (
              <div className="glass" style={{ borderRadius: '14px', padding: '18px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '12px' }}>Your Activity</p>
                {[
                  { label: 'Total Bookings', value: user.totalBookings || 0, icon: '🎟' },
                  { label: 'Member Since',   value: user.memberSince || '2026', icon: '📅' },
                  { label: 'Tier Status',    value: `${currentTier.icon} ${user.tier}`, icon: '🏆' },
                ].map(stat => (
                  <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{stat.icon} {stat.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Featured quick book */}
            <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
              <img src={movies[0].poster} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.background = '#16162a'; e.target.style.height = '140px' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(8,8,16,0.98) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 0, padding: '14px' }}>
                <p style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 600, marginBottom: '3px' }}>⚡ TRENDING #1</p>
                <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>{movies[0].title}</p>
                <Link to={`/booking/${movies[0].id}`}>
                  <button className="btn-gold" style={{ fontSize: '12px', padding: '8px 16px', width: '100%' }}>Book Now → ⭐ +{movies[0].pointsReward}</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home