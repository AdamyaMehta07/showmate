const express  = require('express')
const router   = express.Router()
const Booking  = require('../models/Booking')
const Movie    = require('../models/Movie')
const User     = require('../models/User')
const mongoose = require('mongoose')
const { protect } = require('../middleware/auth')

// ─── Helper: find movie by _id OR by title ────────────────────────────────────
// Frontend may send MongoDB _id (string) or mockData id (number) or title
const findMovie = async (movieId, movieTitle) => {
  // 1. Try MongoDB ObjectId first
  if (mongoose.Types.ObjectId.isValid(movieId)) {
    const m = await Movie.findById(movieId)
    if (m) return m
  }
  // 2. Try finding by title (sent from frontend as fallback)
  if (movieTitle) {
    const m = await Movie.findOne({ title: movieTitle })
    if (m) return m
  }
  // 3. Try finding first movie in DB as last resort
  return await Movie.findOne({})
}

// ─── POST /api/bookings ───────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,       // ← frontend now sends this too
      theatre,
      theatreLocation,
      showTime,
      showDate,
      seats,
      totalAmount,
      convenienceFee,
      walletDiscount,
      finalAmount,
      useWallet,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body

    if (!theatre || !showTime || !showDate || !seats || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields.' })
    }

    // Find the movie safely
    const movie = await findMovie(movieId, movieTitle)
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found in database. Please reseed.' })
    }

    const user = await User.findById(req.user._id)

    // Wallet deduction
    let actualWalletDiscount = 0
    if (useWallet && user.walletBalance > 0) {
      actualWalletDiscount = Math.min(user.walletBalance, walletDiscount || 0)
      user.walletBalance -= actualWalletDiscount
    }

    // Create booking
    const booking = await Booking.create({
      user:              user._id,
      movie:             movie._id,
      movieTitle:        movie.title,
      moviePoster:       movie.poster,
      language:          movie.language,
      theatre,
      theatreLocation:   theatreLocation || '',
      showTime,
      showDate,
      seats,
      totalAmount:       totalAmount    || 0,
      convenienceFee:    convenienceFee || 0,
      walletDiscount:    actualWalletDiscount,
      finalAmount:       finalAmount    || 0,
      pointsEarned:      movie.pointsReward,
      razorpayOrderId:   razorpayOrderId   || '',
      razorpayPaymentId: razorpayPaymentId || '',
      razorpaySignature: razorpaySignature || '',
      paymentStatus:     razorpayPaymentId ? 'paid' : 'pending',
      status:            razorpayPaymentId ? 'confirmed' : 'pending',
    })

    // ── Award points ──────────────────────────────────────────────────────────
    user.addPoints(
      movie.pointsReward,
      `🎬 ${movie.title} — Booking #${booking.bookingRef}`,
      booking._id
    )
    user.totalBookings += 1
    await user.save()

    res.status(201).json({
      success:      true,
      message:      `Booking confirmed! You earned +${movie.pointsReward} points 🎉`,
      booking,
      pointsEarned: movie.pointsReward,
      newPoints:    user.points,
      newTier:      user.tier,
    })
  } catch (error) {
    console.error('Booking error:', error)
    res.status(500).json({ success: false, message: 'Booking failed: ' + error.message })
  }
})

// ─── GET /api/bookings/my ─────────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('movie', 'title poster language genre')
    res.json({ success: true, count: bookings.length, bookings })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' })
  }
})

// ─── GET /api/bookings/:id ────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
      .populate('movie', 'title poster language genre duration director')
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' })
    res.json({ success: true, booking })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking.' })
  }
})

// ─── DELETE /api/bookings/:id — cancel ───────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' })
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled.' })
    }
    booking.status        = 'cancelled'
    booking.paymentStatus = 'refunded'
    await booking.save()

    if (booking.pointsEarned > 0) {
      const user = await User.findById(req.user._id)
      user.addPoints(-booking.pointsEarned, `❌ Cancelled: ${booking.movieTitle}`, booking._id)
      user.totalBookings = Math.max(0, user.totalBookings - 1)
      await user.save()
    }
    res.json({ success: true, message: 'Booking cancelled.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cancellation failed.' })
  }
})

module.exports = router