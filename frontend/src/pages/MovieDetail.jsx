import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { allContent, theatres } from '../data/mockData'

const MovieDetail = () => {
  const { id } = useParams()
  const movie = allContent.find(m => m.id === parseInt(id)) || allContent[0]
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState(0)

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en', { month: 'short' }),
    }
  })

  const tabs = ['overview', 'cast', 'showtimes', 'reviews']

  return (
    <div>
      {/* Backdrop hero */}
      <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        <img src={movie.backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)' }}
          onError={e => e.target.style.background = 'var(--surface)'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, var(--bg) 0%, rgba(8,8,16,0.4) 60%, transparent 100%)' }} />

        {/* Floating movie info */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', maxWidth: '1280px', margin: '0 auto', padding: '0 24px 32px', display: 'flex', gap: '28px', alignItems: 'flex-end' }}>
          {/* Poster */}
          <div style={{ flexShrink: 0, borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(139,92,246,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <img src={movie.poster} alt={movie.title} style={{ width: '140px', height: '210px', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.background = '#16162a'; e.target.style.minHeight = '210px' }} />
          </div>

          <div style={{ paddingBottom: '8px' }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {movie.genre?.map(g => <span key={g} className="tag tag-genre">{g}</span>)}
              <span className="tag tag-lang">{movie.language}</span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>⏱ {movie.duration}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 56px)', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: '10px' }}>
              {movie.title}
            </h1>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold)' }}>{movie.rating}</span>
                <div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.floor(movie.rating/2) ? 'var(--gold)' : 'rgba(255,255,255,0.2)'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{movie.votes} ratings</p>
                </div>
              </div>
              <div className="points-badge" style={{ fontSize: '13px' }}>
                <span>⭐</span> Book & earn +{movie.pointsReward} pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '48px' }}>

          {/* Left */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
                  color: activeTab === tab ? 'white' : 'var(--muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--purple-light)' : '2px solid transparent',
                  fontFamily: 'var(--font-body)', fontWeight: activeTab === tab ? 600 : 400,
                  fontSize: '14px', textTransform: 'capitalize', transition: 'all 0.2s',
                  marginBottom: '-1px',
                }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="fade-up">
                <h3 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Synopsis</h3>
                <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.8', fontSize: '15px', marginBottom: '32px' }}>{movie.description}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { label: 'Director', value: movie.director },
                    { label: 'Duration', value: movie.duration },
                    { label: 'Language', value: movie.language },
                    { label: 'Release', value: movie.releaseDate },
                  ].map(info => (
                    <div key={info.label} className="glass" style={{ borderRadius: '10px', padding: '14px 16px', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{info.label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>{info.value}</p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <h3 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Ticket Pricing</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {Object.entries(movie.price || {}).map(([type, price]) => (
                    <div key={type} className="glass" style={{ borderRadius: '10px', padding: '14px 20px', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize', marginBottom: '4px' }}>{type}</p>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold)' }}>₹{price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cast */}
            {activeTab === 'cast' && (
              <div className="fade-up">
                <h3 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '20px' }}>Cast & Crew</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                  {movie.cast?.map((actor, i) => (
                    <div key={actor} className="glass" style={{ borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 10px',
                        background: `linear-gradient(135deg, hsl(${i*60},60%,30%), hsl(${i*60+30},60%,20%))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: 700, border: '2px solid rgba(255,255,255,0.1)',
                      }}>
                        {actor.charAt(0)}
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{actor}</p>
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Actor</p>
                    </div>
                  ))}
                  <div className="glass" style={{ borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid rgba(109,40,217,0.3)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 10px', background: 'linear-gradient(135deg, var(--purple), var(--purple-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700 }}>
                      {movie.director?.charAt(0)}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{movie.director}</p>
                    <p style={{ fontSize: '11px', color: 'var(--purple-light)' }}>Director</p>
                  </div>
                </div>
              </div>
            )}

            {/* Showtimes */}
            {activeTab === 'showtimes' && (
              <div className="fade-up">
                {/* Date picker */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {dates.map((d, i) => (
                    <button key={i} onClick={() => setSelectedDate(i)} style={{
                      padding: '10px 14px', borderRadius: '10px', border: '1px solid',
                      borderColor: selectedDate === i ? 'var(--purple-light)' : 'var(--border)',
                      background: selectedDate === i ? 'rgba(139,92,246,0.2)' : 'var(--surface2)',
                      color: selectedDate === i ? 'white' : 'var(--muted)',
                      cursor: 'pointer', textAlign: 'center', flexShrink: 0,
                      fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                    }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{d.day}</p>
                      <p style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>{d.date}</p>
                      <p style={{ fontSize: '10px', color: 'var(--muted)' }}>{d.month}</p>
                    </button>
                  ))}
                </div>

                {/* Theatres */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {theatres.map(theatre => (
                    <div key={theatre.id} className="glass" style={{ borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{theatre.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>📍 {theatre.location}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span className="tag tag-lang">M-Ticket</span>
                          <span className="tag" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', fontSize: '10px' }}>Available</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {theatre.times.map(time => (
                          <Link key={time} to={`/booking/${movie.id}`}>
                            <button style={{
                              padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)',
                              background: 'rgba(34,197,94,0.1)', color: '#4ade80',
                              fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                              transition: 'all 0.2s',
                            }}
                              onMouseEnter={e => { e.target.style.background = 'rgba(34,197,94,0.25)'; e.target.style.transform = 'scale(1.05)' }}
                              onMouseLeave={e => { e.target.style.background = 'rgba(34,197,94,0.1)'; e.target.style.transform = 'scale(1)' }}>
                              {time}
                            </button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="fade-up">
                <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '72px', color: 'var(--gold)', lineHeight: 1 }}>{movie.rating}</p>
                    <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '4px' }}>
                      {[1,2,3,4,5].map(i => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= Math.floor(movie.rating/2) ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{movie.votes} ratings</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(star => (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gold)', width: '20px' }}>{star}★</span>
                        <div className="progress-track" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${[78,65,40,15,5][5-star]}%`, background: star >= 4 ? 'linear-gradient(90deg, var(--gold), var(--gold-light))' : 'linear-gradient(90deg, #6b6b8a, #8888aa)' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', width: '30px' }}>{[78,65,40,15,5][5-star]}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample reviews */}
                {[
                  { user: 'Priya K.', rating: 5, text: 'Absolutely mind-blowing! The visuals and soundtrack are otherworldly. A must-watch on the biggest screen possible.', date: '2 days ago' },
                  { user: 'Rahul M.', rating: 4, text: 'Fantastic direction and performances. The story runs deep and rewards patient viewers. Denis Villeneuve at his finest.', date: '1 week ago' },
                  { user: 'Sneha T.', rating: 5, text: 'Earned my ShowMate points and the movie was totally worth it. Already planning to watch again with the Gold upgrade!', date: '3 days ago' },
                ].map((review, i) => (
                  <div key={i} className="glass" style={{ borderRadius: '12px', padding: '20px', border: '1px solid var(--border)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, hsl(${i*120},60%,35%), hsl(${i*120+40},60%,25%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600 }}>{review.user}</p>
                          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{review.date}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= review.rating ? 'var(--gold)' : 'rgba(255,255,255,0.15)', fontSize: '12px' }}>★</span>)}
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.7' }}>{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar — Book CTA */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-strong" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(109,40,217,0.3)' }}>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Starting from</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--gold)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  ₹{Math.min(...Object.values(movie.price || { a: 200 }))}
                </p>
                <div className="points-badge" style={{ marginBottom: '20px' }}>
                  <span>⭐</span> Earn +{movie.pointsReward} ShowMate Points
                </div>
                <Link to={`/booking/${movie.id}`} style={{ display: 'block' }}>
                  <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}>
                    🎬 Book Tickets Now
                  </button>
                </Link>
                <button onClick={() => setActiveTab('showtimes')} className="btn-outline" style={{ width: '100%', padding: '10px', fontSize: '13px', marginTop: '8px' }}>
                  View Showtimes
                </button>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.06)', borderTop: '1px solid var(--border)', padding: '14px 20px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  🏆 Gold members earn <strong style={{ color: 'var(--gold)' }}>2x points</strong> this weekend
                </p>
              </div>
            </div>

            {/* Quick info */}
            <div className="glass" style={{ borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
              {[
                { icon: '⏱', label: 'Duration', value: movie.duration },
                { icon: '🌐', label: 'Language', value: movie.language },
                { icon: '🎬', label: 'Director', value: movie.director },
                { icon: '📅', label: 'Release', value: movie.releaseDate },
              ].map(info => (
                <div key={info.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{info.icon} {info.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail