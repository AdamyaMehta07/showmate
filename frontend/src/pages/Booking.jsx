import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { allContent, theatres } from '../data/mockData'
import { paymentAPI, bookingsAPI, moviesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// ─── Seat map ─────────────────────────────────────────────────────────────────
const generateSeats = (rows, cols, bookedPct = 0.28) => {
  const labels = 'ABCDEFGHI'.split('')
  const seats  = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      seats.push({
        id:     `${labels[r]}${c + 1}`,
        row:    labels[r],
        col:    c + 1,
        status: Math.random() < bookedPct ? 'booked' : 'available',
        type:   r < 2 ? 'recliner' : r < 5 ? 'premium' : 'regular',
      })
    }
  }
  return seats
}
const SEAT_MAP = generateSeats(9, 12)

// ─── Load Razorpay script ─────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return }
    const script    = document.createElement('script')
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload   = () => resolve(true)
    script.onerror  = () => resolve(false)
    document.body.appendChild(script)
  })

const Booking = () => {
  const { id }                    = useParams()
  const { user, refreshUser }     = useAuth()

  // ── Local mock movie (for UI display) ──────────────────────────────────────
  const mockMovie = allContent.find(m => String(m.id) === String(id)) || allContent[0]

  // ── Real MongoDB movie (fetched from backend) ───────────────────────────────
  // This gives us the real _id needed for booking
  const [realMovieId, setRealMovieId] = useState(null)

  const [step, setStep]                       = useState(1)
  const [selectedSeats, setSelectedSeats]     = useState([])
  const [selectedTheatre, setSelectedTheatre] = useState(theatres[0])
  const [selectedDate, setSelectedDate]       = useState(0)

  // ── Filter times based on current time (today only) ───────────────────────
  const getAvailableTimes = (theatreTimes, dateIndex) => {
    if (dateIndex > 0) return theatreTimes  // future date = all times available
    const now     = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()
    return theatreTimes.filter(time => {
      const [timePart, meridiem] = time.split(' ')
      const [hoursStr, minsStr]  = timePart.split(':')
      let hours = parseInt(hoursStr)
      const mins  = parseInt(minsStr)
      if (meridiem === 'PM' && hours !== 12) hours += 12
      if (meridiem === 'AM' && hours === 12) hours = 0
      const timeMins = hours * 60 + mins
      return timeMins > nowMins + 30  // 30 min buffer before show
    })
  }

  const availableTimes = getAvailableTimes(selectedTheatre.times, selectedDate)
  const [selectedTime, setSelectedTime] = useState(
    () => getAvailableTimes(theatres[0].times, 0)[0] || theatres[0].times[0]
  )
  const [useWallet, setUseWallet]             = useState(false)
  const [paying, setPaying]                   = useState(false)
  const [bookingDone, setBookingDone]         = useState(null)
  const [payError, setPayError]               = useState('')

  // ── Fetch real MongoDB _id by matching movie title ─────────────────────────
  useEffect(() => {
    const fetchRealMovie = async () => {
      try {
        const res = await moviesAPI.getAll({ limit: 50 })
        const found = res.movies?.find(
          m => m.title.toLowerCase().trim() === mockMovie.title.toLowerCase().trim()
        )
        if (found) {
          setRealMovieId(found._id)
          console.log('✅ Found real movie ID:', found._id, 'for:', found.title)
        } else {
          console.warn('⚠️ Movie not found in DB, will use title fallback')
        }
      } catch (e) {
        console.warn('Could not fetch movies from backend:', e.message)
      }
    }
    fetchRealMovie()
  }, [mockMovie.title])

  // Next 7 dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      day:  d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('en', { month: 'short' }),
      full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
  })

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return
    setSelectedSeats(prev =>
      prev.find(s => s.id === seat.id)
        ? prev.filter(s => s.id !== seat.id)
        : prev.length < 8 ? [...prev, seat] : prev
    )
  }

  const getSeatPrice = (type) => {
    const p = mockMovie.price || { recliner: 650, premium: 400, regular: 250 }
    return p[type] || 250
  }

  const subtotal       = selectedSeats.reduce((s, seat) => s + getSeatPrice(seat.type), 0)
  const convenienceFee = selectedSeats.length > 0 ? selectedSeats.length * 25 : 0
  const walletBalance  = user?.walletBalance || 0
  const walletDiscount = useWallet ? Math.min(walletBalance, Math.floor((subtotal + convenienceFee) * 0.2)) : 0
  const finalAmount    = subtotal + convenienceFee - walletDiscount

  // ─── Payment handler ────────────────────────────────────────────────────────
  const handlePayment = async () => {
    setPayError('')
    setPaying(true)

    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay failed to load. Check your internet.')

      // 1. Create Razorpay order
      const orderData = await paymentAPI.createOrder(
        finalAmount,
        mockMovie.title,
        selectedSeats.map(s => s.id)
      )

      // 2. Open Razorpay modal
      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'ShowMate',
        description: `${mockMovie.title} — ${selectedSeats.map(s => s.id).join(', ')}`,
        order_id:    orderData.orderId,
        prefill: {
          name:  user?.name  || '',
          email: user?.email || '',
        },
        theme: { color: '#7c3aed' },

        handler: async (response) => {
          try {
            // 3. Verify payment
            await paymentAPI.verify(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )

            // 4. Create booking — send BOTH _id and title as fallback
            const bookingRes = await bookingsAPI.create({
              movieId:           realMovieId || '',   // MongoDB _id (may be null if backend offline)
              movieTitle:        mockMovie.title,     // ALWAYS send title as fallback
              theatre:           selectedTheatre.name,
              theatreLocation:   selectedTheatre.location,
              showTime:          selectedTime,
              showDate:          dates[selectedDate].full,
              seats:             selectedSeats.map(s => ({
                id:    s.id,
                type:  s.type,
                price: getSeatPrice(s.type),
              })),
              totalAmount:       subtotal,
              convenienceFee,
              walletDiscount,
              finalAmount,
              useWallet,
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            // 5. Refresh user points in navbar
            await refreshUser()

            setBookingDone(bookingRes)
            setStep(3)
          } catch (err) {
            console.error('Booking error after payment:', err)
            setPayError('Payment done but booking failed. Error: ' + err.message)
            setStep(2)
          } finally {
            setPaying(false)
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false)
            setPayError('Payment cancelled. Your seats are still held.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (resp) => {
        setPaying(false)
        setPayError(`Payment failed: ${resp.error.description}`)
      })
      rzp.open()

    } catch (err) {
      setPaying(false)
      setPayError(err.message || 'Payment failed. Try again.')
    }
  }

  // ─── Success screen ─────────────────────────────────────────────────────────
  if (step === 3 && bookingDone) {
    return (
      <div style={{ maxWidth: '560px', margin: '60px auto', padding: '0 24px' }}>
        <div className="glass" style={{ borderRadius: '24px', padding: '48px', border: '1px solid rgba(34,197,94,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '72px', marginBottom: '12px', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '0.05em', marginBottom: '8px' }}>BOOKING CONFIRMED!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '28px', fontSize: '14px' }}>Your tickets are confirmed. Enjoy the show!</p>

          <div style={{ background: 'var(--surface2)', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid var(--border)', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
              <img src={mockMovie.poster} alt="" style={{ width: '64px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                onError={e => e.target.style.background = '#16162a'} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '5px' }}>{mockMovie.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '3px' }}>📍 {selectedTheatre.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '3px' }}>🕐 {selectedTime} · {dates[selectedDate].full}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>💺 {selectedSeats.map(s => s.id).join(', ')}</p>
              </div>
            </div>
            <div className="divider" style={{ marginBottom: '14px' }} />
            <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold)' }}>⭐ ShowMate Points Earned</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold)' }}>+{bookingDone.pointsEarned}</span>
            </div>
            {bookingDone.booking?.bookingRef && (
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '10px', textAlign: 'center' }}>
                Ref: <strong style={{ color: 'white' }}>{bookingDone.booking.bookingRef}</strong>
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/" style={{ flex: 1 }}><button className="btn-outline" style={{ width: '100%' }}>🏠 Home</button></Link>
            <Link to="/profile?tab=bookings" style={{ flex: 1 }}><button className="btn-primary" style={{ width: '100%' }}>🎟 My Bookings</button></Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Seat color ──────────────────────────────────────────────────────────────
  const getSeatStyle = (seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) return { bg: 'var(--gold)', border: 'var(--gold-light)' }
    if (seat.status === 'booked')  return { bg: '#1a1a2e', border: '#2a2a3e', opacity: 0.35, cursor: 'not-allowed' }
    if (seat.type === 'recliner')  return { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.4)' }
    if (seat.type === 'premium')   return { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)' }
    return { bg: 'var(--surface2)', border: 'rgba(255,255,255,0.1)' }
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <Link to={`/movie/${mockMovie.id}`} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          ← Back to {mockMovie.title}
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img src={mockMovie.poster} alt="" style={{ width: '56px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
            onError={e => e.target.style.background = '#16162a'} />
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.05em', marginBottom: '6px' }}>{mockMovie.title}</h1>
            <div className="points-badge">⭐ Book & earn +{mockMovie.pointsReward} pts</div>
            {realMovieId && (
              <p style={{ fontSize: '10px', color: '#4ade80', marginTop: '4px' }}>✅ Connected to live database</p>
            )}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px', maxWidth: '380px' }}>
        {['Select Seats', 'Confirm & Pay', 'Done'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i + 1 <= step ? 'var(--purple)' : 'var(--surface2)', border: `2px solid ${i + 1 <= step ? 'var(--purple-light)' : 'var(--border)'}`, fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '12px', color: i + 1 <= step ? 'white' : 'var(--muted)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: '2px', background: i + 1 < step ? 'var(--purple)' : 'var(--border)', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '36px', alignItems: 'start' }}>

        {/* ── STEP 1: Seat Selection ────────────────────────────────────── */}
        {step === 1 && (
          <div>
            {/* Theatre + Date + Time */}
            <div className="glass" style={{ borderRadius: '14px', padding: '20px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Theatre</p>
                  <select value={selectedTheatre.id}
                    onChange={e => {
                      const t = theatres.find(x => x.id === parseInt(e.target.value))
                      setSelectedTheatre(t)
                      const avail = getAvailableTimes(t.times, selectedDate)
                      setSelectedTime(avail[0] || t.times[0])
                    }}
                    className="input-field" style={{ cursor: 'pointer' }}>
                    {theatres.map(t => <option key={t.id} value={t.id} style={{ background: '#16162a' }}>{t.name} — {t.location}</option>)}
                  </select>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Date</p>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                    {dates.slice(0, 5).map((d, i) => (
                      <button key={i} onClick={() => {
                        setSelectedDate(i)
                        const avail = getAvailableTimes(selectedTheatre.times, i)
                        setSelectedTime(avail[0] || selectedTheatre.times[0])
                      }} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid', borderColor: selectedDate === i ? 'var(--purple-light)' : 'var(--border)', background: selectedDate === i ? 'rgba(139,92,246,0.2)' : 'var(--surface2)', color: selectedDate === i ? 'white' : 'var(--muted)', cursor: 'pointer', textAlign: 'center', flexShrink: 0, fontFamily: 'var(--font-body)' }}>
                        <p style={{ fontSize: '9px', fontWeight: 700 }}>{d.day}</p>
                        <p style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1 }}>{d.date}</p>
                        <p style={{ fontSize: '9px', color: 'var(--muted)' }}>{d.month}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Show Time</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableTimes.length === 0 ? (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#f87171' }}>
                      ❌ No shows available for today. Please select a future date.
                    </div>
                  ) : availableTimes.map(time => (
                    <button key={time} onClick={() => setSelectedTime(time)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid', borderColor: selectedTime === time ? 'var(--purple-light)' : 'var(--border)', background: selectedTime === time ? 'rgba(139,92,246,0.2)' : 'var(--surface2)', color: selectedTime === time ? 'white' : 'var(--muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { bg: 'var(--surface2)',          border: 'rgba(255,255,255,0.1)', label: `Regular ₹${mockMovie.price?.regular || 250}` },
                { bg: 'rgba(245,158,11,0.08)',     border: 'rgba(245,158,11,0.3)', label: `Premium ₹${mockMovie.price?.premium || 400}` },
                { bg: 'rgba(139,92,246,0.12)',     border: 'rgba(139,92,246,0.4)', label: `Recliner ₹${mockMovie.price?.recliner || 650}` },
                { bg: 'var(--gold)',               border: 'var(--gold-light)',     label: 'Selected' },
                { bg: '#1a1a2e', border: '#2a2a3e', label: 'Booked', opacity: 0.4 },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '20px', height: '16px', borderRadius: '3px', background: item.bg, border: `1px solid ${item.border}`, opacity: item.opacity || 1 }} />
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Screen */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ height: '4px', background: 'linear-gradient(90deg, transparent, var(--purple-light), transparent)', borderRadius: '2px', marginBottom: '6px' }} />
              <p style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>All Eyes This Way — SCREEN</p>
            </div>

            {/* Seat Grid */}
            <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
              <div style={{ minWidth: 'fit-content', margin: '0 auto', width: 'fit-content' }}>
                {'ABCDEFGHI'.split('').map(row => {
                  const rowSeats   = SEAT_MAP.filter(s => s.row === row)
                  const isRecliner = rowSeats[0]?.type === 'recliner'
                  return (
                    <div key={row} style={{ display: 'flex', gap: '5px', marginBottom: '6px', alignItems: 'center' }}>
                      <span style={{ width: '16px', fontSize: '10px', color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>{row}</span>
                      {[rowSeats.slice(0, 5), rowSeats.slice(5)].map((half, hi) => (
                        <div key={hi} style={{ display: 'flex', gap: '5px' }}>
                          {half.map(seat => {
                            const st = getSeatStyle(seat)
                            return (
                              <button key={seat.id} onClick={() => toggleSeat(seat)}
                                title={`${seat.id} (${seat.type}) ₹${getSeatPrice(seat.type)}`}
                                style={{ width: isRecliner ? '34px' : '26px', height: isRecliner ? '28px' : '22px', borderRadius: isRecliner ? '6px 6px 3px 3px' : '4px 4px 2px 2px', border: `1px solid ${st.border}`, background: st.bg, cursor: st.cursor || 'pointer', opacity: st.opacity || 1, transition: 'all 0.15s', flexShrink: 0 }}
                                onMouseEnter={e => { if (seat.status !== 'booked') e.currentTarget.style.transform = 'scale(1.15)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                              />
                            )
                          })}
                          {hi === 0 && <div style={{ width: '16px' }} />}
                        </div>
                      ))}
                      <span style={{ width: '16px', fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>{row}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedSeats.map(s => (
                  <div key={s.id} style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: 'var(--purple-light)', fontWeight: 600 }}>
                    {s.id} · {s.type} · ₹{getSeatPrice(s.type)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Confirm & Pay ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="fade-up">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '0.05em', marginBottom: '24px' }}>CONFIRM & PAY</h2>

            <div className="glass" style={{ borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '18px' }}>
                <img src={mockMovie.poster} alt="" style={{ width: '72px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                  onError={e => e.target.style.background = '#16162a'} />
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{mockMovie.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '3px' }}>📍 {selectedTheatre.name} · {selectedTheatre.location}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>🕐 {selectedTime} · {dates[selectedDate].full}</p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {selectedSeats.map(s => (
                      <span key={s.id} style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.3)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: 'var(--purple-light)', fontWeight: 600 }}>{s.id}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divider" style={{ marginBottom: '14px' }} />

              {[
                { label: `Tickets (${selectedSeats.length})`, value: `₹${subtotal}` },
                { label: 'Convenience Fee',                   value: `₹${convenienceFee}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{row.label}</span>
                  <span style={{ fontSize: '13px' }}>{row.value}</span>
                </div>
              ))}

              {/* Wallet toggle */}
              {walletBalance > 0 && (
                <div style={{ background: 'rgba(245,158,11,0.07)', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--gold-light)', marginBottom: '2px' }}>💰 ShowMate Wallet</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Balance: ₹{walletBalance} {useWallet ? `→ -₹${walletDiscount}` : ''}</p>
                  </div>
                  <div onClick={() => setUseWallet(!useWallet)}
                    style={{ width: '42px', height: '24px', borderRadius: '12px', background: useWallet ? 'var(--gold)' : 'var(--surface2)', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <div style={{ position: 'absolute', top: '4px', left: useWallet ? '21px' : '4px', width: '14px', height: '14px', borderRadius: '50%', background: 'white', transition: 'left 0.3s' }} />
                  </div>
                </div>
              )}

              <div className="divider" style={{ margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 700 }}>Total Payable</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--gold)' }}>₹{finalAmount}</span>
              </div>
            </div>

            {payError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#f87171' }}>
                ⚠️ {payError}
              </div>
            )}

            <div style={{ background: 'rgba(34,197,94,0.07)', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(34,197,94,0.2)', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#4ade80' }}>🎉 You'll earn <strong>+{mockMovie.pointsReward} ShowMate Points</strong> after payment!</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>🔒 Secured by Razorpay</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
          </div>
        )}

        {/* ── Right Summary Panel ───────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div className="glass-strong" style={{ borderRadius: '16px', padding: '22px', border: '1px solid rgba(109,40,217,0.3)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '14px' }}>Booking Summary</h3>

            {selectedSeats.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>👆 Select your seats to continue</p>
            ) : (
              <>
                {[
                  { label: 'Movie',    value: mockMovie.title.length > 18 ? mockMovie.title.slice(0, 18) + '…' : mockMovie.title },
                  { label: 'Theatre',  value: selectedTheatre.name },
                  { label: 'Date',     value: dates[selectedDate].full },
                  { label: 'Time',     value: selectedTime },
                  { label: 'Seats',    value: selectedSeats.map(s => s.id).join(', ') },
                  { label: 'Subtotal', value: `₹${subtotal}` },
                  { label: 'Fee',      value: `₹${convenienceFee}` },
                  ...(useWallet ? [{ label: 'Wallet', value: `-₹${walletDiscount}`, color: '#4ade80' }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: row.color || 'white', maxWidth: '160px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)' }}>₹{finalAmount}</span>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '14px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--gold)' }}>⭐ You'll earn +{mockMovie.pointsReward} pts</p>
                </div>
              </>
            )}

            {step === 1 ? (
              <button className="btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '14px', opacity: selectedSeats.length === 0 ? 0.5 : 1 }}
                onClick={() => selectedSeats.length > 0 && availableTimes.length > 0 && setStep(2)}
                disabled={selectedSeats.length === 0 || availableTimes.length === 0}>
                {availableTimes.length === 0 ? '❌ No Shows Today' : 'Proceed to Pay →'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn-gold"
                  style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: 700, opacity: paying ? 0.7 : 1 }}
                  onClick={handlePayment} disabled={paying}>
                  {paying ? '⏳ Processing...' : `💳 Pay ₹${finalAmount} via Razorpay`}
                </button>
                <button className="btn-outline"
                  style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                  onClick={() => { setStep(1); setPayError('') }}>
                  ← Change Seats
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking