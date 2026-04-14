import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const searchRef = useRef(null)
  const dropRef   = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false) }, [location])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/movies?tab=all&q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { label: 'Movies', to: '/movies?tab=movies' },
    { label: 'Shows',  to: '/movies?tab=shows'  },
    { label: 'Events', to: '/movies?tab=events' },
    { label: 'Offers', to: '/movies?tab=offers' },
  ]

  const isNavActive = (to) => {
    const tabParam     = new URLSearchParams(to.split('?')[1]).get('tab')
    const currentTab   = new URLSearchParams(location.search).get('tab')
    return location.pathname === '/movies' && currentTab === tabParam
  }

  const handleLogout = () => { logout(); navigate('/'); setDropdownOpen(false) }

  return (
    <>
      {/* Ticker */}
      <div style={{ background: 'var(--purple)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', padding: '6px 0', overflow: 'hidden' }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(4)].map((_, i) => (
              <span key={i} style={{ display: 'inline-flex', gap: '60px', paddingRight: '60px', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.9)' }}>
                <span>🏆 Earn 150 points on Ramayan — Oct 2026</span>
                <span>⚡ GOLD MEMBERS get 2x points this weekend</span>
                <span>💰 Redeem 500 points = ₹50 cashback</span>
                <span>🎬 Stranger Things Season 5 — Book Now</span>
                <span>🌟 Diamond members get free upgrades</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000, transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(8,8,16,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '64px', gap: '24px' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--purple), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900 }}>S</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '0.05em', color: 'white' }}>
                SHOW<span style={{ color: 'var(--gold)' }}>MATE</span>
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
            {navLinks.map(link => {
              const active = isNavActive(link.to)
              return (
                <Link key={link.label} to={link.to} style={{
                  padding: '6px 14px', borderRadius: '6px', textDecoration: 'none',
                  fontSize: '14px', fontWeight: active ? 600 : 500,
                  color: active ? 'white' : 'var(--muted)',
                  background: active ? 'rgba(109,40,217,0.15)' : 'transparent',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' } }}>
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>


            <a 
              href="https://ai-movie-recommender-82qif7stgo3war8nj78tsc.streamlit.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button
                style={{
                  background: 'linear-gradient(135deg, var(--purple), var(--gold))',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                AI Recommender
              </button>
            </a>

            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <input ref={searchRef} className="input-field"
                    style={{ width: '220px', padding: '7px 32px 7px 12px', fontSize: '13px' }}
                    placeholder="Search movies, cast..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && (setSearchOpen(false), setSearchQuery(''))} />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                  )}
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }}>Go</button>
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 12px', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-light)'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Search
              </button>
            )}

            {user ? (
              <>
                {/* Points badge */}
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div className="points-badge" style={{ cursor: 'pointer' }}>
                    ⭐ {(user.points || 0).toLocaleString()} pts
                  </div>
                </Link>

                {/* Avatar + dropdown */}
                <div style={{ position: 'relative' }} ref={dropRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--purple-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: '2px solid rgba(139,92,246,0.4)', color: 'white' }}>
                    {user.avatar || user.name?.slice(0, 2).toUpperCase()}
                  </button>

                  {dropdownOpen && (
                    <div className="glass-strong" style={{ position: 'absolute', right: 0, top: '46px', width: '220px', borderRadius: '12px', border: '1px solid var(--border)', padding: '8px', zIndex: 2000 }}>
                      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{user.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{user.email}</p>
                        <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--gold)' }}>⭐ {(user.points || 0).toLocaleString()} pts</span>
                          <span style={{ fontSize: '10px', background: 'rgba(245,158,11,0.15)', color: 'var(--gold)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '1px 7px', fontWeight: 700 }}>
                            {user.tier || 'Bronze'}
                          </span>
                        </div>
                      </div>
                      {[
                        { label: '👤 My Profile', to: '/profile' },
                        { label: '🎟 My Bookings', to: '/profile?tab=bookings' },
                        { label: '⭐ Points & Rewards', to: '/profile?tab=redeem' },
                      ].map(item => (
                        <Link key={item.label} to={item.to}
                          style={{ display: 'block', padding: '9px 12px', borderRadius: '8px', color: 'var(--text)', textDecoration: 'none', fontSize: '13px', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {item.label}
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '6px' }}>
                        <button onClick={handleLogout}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: 'none', background: 'none', color: '#f87171', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/auth" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '7px 18px', fontSize: '13px' }}>Sign In</button>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: '20px', height: '2px', background: 'white', borderRadius: '2px' }} />)}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="glass-strong" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            {navLinks.map(link => (
              <Link key={link.label} to={link.to}
                style={{ display: 'block', padding: '12px 0', color: 'var(--text)', textDecoration: 'none', fontSize: '15px', borderBottom: '1px solid var(--border)' }}>
                {link.label}
              </Link>
            ))}
            {user
              ? <button onClick={handleLogout} style={{ display: 'block', padding: '12px 0', color: '#f87171', background: 'none', border: 'none', fontSize: '15px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>🚪 Logout</button>
              : <Link to="/auth" style={{ display: 'block', padding: '12px 0', color: 'var(--purple-light)', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Sign In / Register</Link>
            }
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar