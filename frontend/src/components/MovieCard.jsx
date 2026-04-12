import { Link } from 'react-router-dom'

const badgeColors = {
  'BLOCKBUSTER': { bg: 'rgba(239,68,68,0.2)', color: '#f87171', border: 'rgba(239,68,68,0.4)' },
  'HIT': { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  'UPCOMING': { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  'SUPERHIT': { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
  'MOST AWAITED': { bg: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: 'rgba(139,92,246,0.4)' },
  'STREAMING': { bg: 'rgba(236,72,153,0.15)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
  'EXCLUSIVE': { bg: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
}

const StarRating = ({ rating }) => {
  const full = Math.floor(rating / 2)
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= full ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

const MovieCard = ({ movie, size = 'md' }) => {
  const badge = badgeColors[movie.badge] || badgeColors['HIT']
  const isLarge = size === 'lg'

  return (
    <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
      <div className="movie-card" style={{ width: isLarge ? '220px' : '180px' }}>
        {/* Poster */}
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '2/3' }}>
          <img
            src={movie.poster}
            alt={movie.title}
            className="card-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.src = `https://via.placeholder.com/400x600/16162a/8b5cf6?text=${encodeURIComponent(movie.title)}` }}
          />

          {/* Badge */}
          {movie.badge && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
              borderRadius: '4px', padding: '2px 8px', fontSize: '9px', fontWeight: 800,
              letterSpacing: '0.1em', backdropFilter: 'blur(8px)',
            }}>
              {movie.badge}
            </div>
          )}

          {/* Points reward */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            borderRadius: '20px', padding: '3px 8px', fontSize: '10px',
            fontWeight: 700, color: 'var(--gold-light)',
            border: '1px solid rgba(245,158,11,0.3)',
          }}>
            ⭐ +{movie.pointsReward}
          </div>

          {/* Hover overlay */}
          <div className="card-overlay">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', letterSpacing: '0.05em', marginBottom: '6px', lineHeight: 1.1 }}>{movie.title}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {movie.genre?.slice(0,2).map(g => (
                <span key={g} className="tag tag-genre" style={{ fontSize: '9px' }}>{g}</span>
              ))}
              <span className="tag tag-lang" style={{ fontSize: '9px' }}>{movie.language}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <StarRating rating={movie.rating} />
              <span style={{ fontSize: '11px', color: 'var(--gold)' }}>{movie.rating}</span>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>({movie.votes})</span>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, var(--purple), var(--purple-light))',
              borderRadius: '6px', padding: '7px', textAlign: 'center',
              fontSize: '12px', fontWeight: 700, color: 'white',
            }}>
              Book Now →
            </div>
          </div>
        </div>

        {/* Card footer */}
        <div style={{ padding: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{movie.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span style={{ fontSize: '12px', color: 'var(--gold)' }}>{movie.rating}</span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{movie.duration}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default MovieCard