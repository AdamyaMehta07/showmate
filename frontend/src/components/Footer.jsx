import { Link } from 'react-router-dom'

const Footer = () => {
  const links = {
    Movies: ['Now Showing', 'Coming Soon', 'Top Rated', 'Languages'],
    Shows: ['Web Series', 'Live Events', 'Comedy Shows', 'Concerts'],
    Company: ['About Us', 'Careers', 'Press', 'Blog'],
    Support: ['Help Center', 'Contact Us', 'Refund Policy', 'Terms'],
  }

  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', marginTop: '80px' }}>
      {/* Points CTA banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(109,40,217,0.3), rgba(245,158,11,0.15))',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '0.05em', marginBottom: '8px' }}>
            EVERY BOOKING EARNS <span className="gradient-text-gold">REWARDS</span>
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
            Collect ShowMate Points on every ticket. Redeem for real cashback.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth"><button className="btn-gold" style={{ fontSize: '13px', padding: '10px 24px' }}>Join Free →</button></Link>
            <Link to="/profile"><button className="btn-outline" style={{ fontSize: '13px', padding: '10px 24px' }}>View Rewards</button></Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '40px' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--purple), var(--gold))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 900,
              }}>S</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.05em' }}>
                SHOW<span style={{ color: 'var(--gold)' }}>MATE</span>
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.7', maxWidth: '220px', marginBottom: '20px' }}>
              India's smartest ticketing platform. Book movies, earn points, get rewarded.
            </p>

            {/* Tier badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loyalty Tiers</p>
              {['🥉 Bronze', '🥈 Silver', '🥇 Gold', '💎 Platinum', '🔷 Diamond'].map(tier => (
                <div key={tier} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{tier}</div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>{cat}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map(item => (
                  <a key={item} href="#" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="divider" style={{ margin: '40px 0' }} />

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
            © 2026 ShowMate. Built with ❤️ for cinema lovers.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a key={item} href="#" style={{ color: 'var(--muted)', fontSize: '12px', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['📱', '💻', '📺'].map((icon, i) => (
              <div key={i} style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', border: '1px solid var(--border)' }}>
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer