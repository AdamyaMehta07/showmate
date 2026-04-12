import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { movies, shows, allContent } from '../data/mockData'
import MovieCard from '../components/MovieCard'

const TABS = ['All', 'Movies', 'Shows', 'Events', 'Offers']
const LANG_TABS = ['All Languages', 'Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam']
const GENRES = ['Action', 'Drama', 'Sci-Fi', 'Thriller', 'Comedy', 'Romance', 'Horror', 'Adventure', 'Superhero', 'Mythology', 'Crime', 'Historical']
const SORT_OPTIONS = ['Trending', 'Rating: High', 'Rating: Low', 'Points: High', 'Points: Low', 'Newest', 'Oldest']

const events = [
  { id: 'e1', title: 'Sunburn Festival 2026', genre: ['Music', 'Live'], language: 'English', rating: 8.5, votes: '32K', duration: '3 days', releaseDate: '2026-12-15', poster: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', backdrop: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&q=80', description: "Asia's biggest electronic music festival returns!", cast: [], director: 'Percept Live', pointsReward: 60, price: { regular: 2500, premium: 5000 }, badge: 'LIVE EVENT', trending: true },
  { id: 'e2', title: 'Comedy Nights Live', genre: ['Comedy', 'Live'], language: 'Hindi', rating: 8.9, votes: '18K', duration: '2h', releaseDate: '2026-05-20', poster: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=400&q=80', backdrop: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1400&q=80', description: 'The funniest night of your life — live stand-up comedy!', cast: ['Kapil Sharma'], director: 'Comedy Network', pointsReward: 50, price: { regular: 800, premium: 1500 }, badge: 'LIVE EVENT', trending: false },
]

const offers = [
  { id: 'o1', title: 'BOGO Tuesday Special', genre: ['Offer'], language: 'All', rating: 9.9, votes: '50K', duration: 'Every Tuesday', releaseDate: '2026-01-01', poster: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80', backdrop: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80', description: 'Buy 1 Get 1 Free on all regular seats every Tuesday!', cast: [], director: 'ShowMate', pointsReward: 0, price: { regular: 0 }, badge: 'OFFER', trending: true },
  { id: 'o2', title: 'Gold Member 2x Points Weekend', genre: ['Offer'], language: 'All', rating: 9.8, votes: '40K', duration: 'Weekends', releaseDate: '2026-01-01', poster: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80', backdrop: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80', description: 'Gold, Platinum & Diamond members earn 2x points every Sat & Sun!', cast: [], director: 'ShowMate', pointsReward: 0, price: { regular: 0 }, badge: 'OFFER', trending: false },
]

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const getTabFromParam = () => {
    const t = searchParams.get('tab') || ''
    return TABS.find(tab => tab.toLowerCase() === t.toLowerCase()) || 'All'
  }

  const [activeTab, setActiveTab] = useState(getTabFromParam)
  const [activeLang, setActiveLang] = useState('All Languages')
  const [activeGenres, setActiveGenres] = useState([])
  const [sortBy, setSortBy] = useState('Trending')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    const t = searchParams.get('tab') || ''
    const matched = TABS.find(tab => tab.toLowerCase() === t.toLowerCase())
    if (matched) setActiveTab(matched)
    const q = searchParams.get('q')
    if (q !== null) setSearch(q)
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    const p = new URLSearchParams(searchParams)
    p.set('tab', tab.toLowerCase())
    setSearchParams(p)
  }

  const toggleGenre = (g) =>
    setActiveGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const baseList = useMemo(() => {
    if (activeTab === 'Movies') return movies
    if (activeTab === 'Shows') return shows
    if (activeTab === 'Events') return events
    if (activeTab === 'Offers') return offers
    return allContent
  }, [activeTab])

  const filtered = useMemo(() => {
    let list = [...baseList]

    if (activeLang !== 'All Languages') {
      list = list.filter(m => m.language === activeLang)
    }

    if (activeGenres.length > 0) {
      list = list.filter(m => m.genre?.some(g => activeGenres.includes(g)))
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.genre?.some(g => g.toLowerCase().includes(q)) ||
        m.director?.toLowerCase().includes(q) ||
        m.cast?.some(c => c.toLowerCase().includes(q)) ||
        m.language?.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'Rating: High':  return [...list].sort((a, b) => b.rating - a.rating)
      case 'Rating: Low':   return [...list].sort((a, b) => a.rating - b.rating)
      case 'Points: High':  return [...list].sort((a, b) => b.pointsReward - a.pointsReward)
      case 'Points: Low':   return [...list].sort((a, b) => a.pointsReward - b.pointsReward)
      case 'Newest':        return [...list].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      case 'Oldest':        return [...list].sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
      case 'Trending':      return [...list].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0))
      default:              return list
    }
  }, [baseList, activeLang, activeGenres, search, sortBy])

  const clearAllFilters = () => {
    setActiveGenres([])
    setActiveLang('All Languages')
    setSortBy('Trending')
    setSearch('')
  }

  const hasActiveFilters = activeGenres.length > 0 || activeLang !== 'All Languages' || search.trim()

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p className="section-label" style={{ marginBottom: '4px' }}>Browse</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', letterSpacing: '0.05em' }}>MOVIES & SHOWS</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Book tickets • Earn Points • Get Rewarded</p>
      </div>

      {/* Search + Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
            width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="input-field"
            style={{ paddingLeft: '38px', paddingRight: search ? '36px' : '12px' }}
            placeholder="Search movies, genres, directors, cast..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          )}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field" style={{ width: 'auto', cursor: 'pointer' }}>
          {SORT_OPTIONS.map(o => <option key={o} value={o} style={{ background: '#16162a' }}>{o}</option>)}
        </select>

        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border)' }}>
          {['grid', 'list'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: viewMode === mode ? 'var(--purple)' : 'transparent',
              color: viewMode === mode ? 'white' : 'var(--muted)',
              transition: 'all 0.2s', fontSize: '14px',
            }}>
              {mode === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => handleTabChange(tab)} style={{
            padding: '11px 22px', border: 'none', background: 'none', cursor: 'pointer',
            color: activeTab === tab ? 'white' : 'var(--muted)',
            borderBottom: `2px solid ${activeTab === tab ? 'var(--purple-light)' : 'transparent'}`,
            fontFamily: 'var(--font-body)', fontWeight: activeTab === tab ? 600 : 400,
            fontSize: '14px', whiteSpace: 'nowrap', transition: 'all 0.2s', marginBottom: '-1px',
          }}>
            {tab}
            {tab === 'Shows' && (
              <span style={{ marginLeft: '6px', background: 'rgba(139,92,246,0.25)', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>
                {shows.length}
              </span>
            )}
            {tab === 'Events' && (
              <span style={{ marginLeft: '6px', background: 'rgba(245,158,11,0.25)', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: 700, color: 'var(--gold)' }}>
                {events.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Language sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {LANG_TABS.map(lang => (
          <button key={lang} onClick={() => setActiveLang(lang)} style={{
            padding: '5px 14px', borderRadius: '20px', border: '1px solid',
            borderColor: activeLang === lang ? 'var(--purple-light)' : 'var(--border)',
            background: activeLang === lang ? 'rgba(139,92,246,0.15)' : 'transparent',
            color: activeLang === lang ? 'var(--purple-light)' : 'var(--muted)',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
          }}>
            {lang}
          </button>
        ))}
      </div>

      {/* Genre filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: '4px' }}>Genre:</span>
        {GENRES.map(g => (
          <button key={g} onClick={() => toggleGenre(g)} style={{
            padding: '5px 14px', borderRadius: '20px', border: '1px solid',
            borderColor: activeGenres.includes(g) ? 'var(--purple-light)' : 'var(--border)',
            background: activeGenres.includes(g) ? 'rgba(139,92,246,0.2)' : 'transparent',
            color: activeGenres.includes(g) ? 'var(--purple-light)' : 'var(--muted)',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'var(--font-body)',
          }}>
            {activeGenres.includes(g) ? '✓ ' : ''}{g}
          </button>
        ))}
        {hasActiveFilters && (
          <button onClick={clearAllFilters} style={{
            padding: '5px 14px', borderRadius: '20px',
            border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)',
            color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            Clear All ✕
          </button>
        )}
      </div>

      {/* Results info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Showing <span style={{ color: 'white', fontWeight: 600 }}>{filtered.length}</span> results
          {activeTab !== 'All' && <> in <span style={{ color: 'var(--purple-light)', fontWeight: 600 }}> {activeTab}</span></>}
          {activeLang !== 'All Languages' && <> · <span style={{ color: 'var(--gold)' }}>{activeLang}</span></>}
          {search && <> · "<span style={{ color: 'white' }}>{search}</span>"</>}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Sorted by: <span style={{ color: 'white' }}>{sortBy}</span></p>
      </div>

      {/* Results grid/list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</p>
          <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No results found</p>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>Try different filters or search terms</p>
          <button onClick={clearAllFilters} className="btn-primary" style={{ fontSize: '13px' }}>Clear All Filters</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {filtered.map((movie, idx) => <MovieCard key={`${movie.id}-${idx}`} movie={movie} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((movie, idx) => (
            <div key={`${movie.id}-${idx}`} className="glass"
              style={{ borderRadius: '12px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border)', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-light)'; e.currentTarget.style.transform = 'translateX(4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)' }}>
              <img src={movie.poster} alt={movie.title}
                style={{ width: '80px', objectFit: 'cover', flexShrink: 0, minHeight: '110px' }}
                onError={e => { e.target.style.background = '#16162a' }} />
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{movie.title}</p>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    {movie.genre?.map(g => <span key={g} className="tag tag-genre" style={{ fontSize: '9px' }}>{g}</span>)}
                    <span className="tag tag-lang" style={{ fontSize: '9px' }}>{movie.language}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{movie.duration} · {movie.director}</p>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold)' }}>{movie.rating}</p>
                    <p style={{ fontSize: '10px', color: 'var(--muted)' }}>{movie.votes}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)' }}>+{movie.pointsReward}</p>
                    <p style={{ fontSize: '10px', color: 'var(--muted)' }}>pts</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link to={`/booking/${movie.id}`}><button className="btn-primary" style={{ fontSize: '12px', padding: '8px 18px' }}>Book</button></Link>
                    <Link to={`/movie/${movie.id}`}><button className="btn-outline" style={{ fontSize: '12px', padding: '6px 18px' }}>Details</button></Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Movies