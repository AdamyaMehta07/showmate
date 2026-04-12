const mongoose = require('mongoose')

// ─── Seat Schema ─────────────────────────────────────────────
const seatSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g. "F4"
  type: { type: String, enum: ['regular', 'premium', 'recliner'], default: 'regular' },
  price: { type: Number, required: true },
})

// ─── Booking Schema ──────────────────────────────────────────
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },

  movieTitle: { type: String, required: true },
  moviePoster: { type: String, default: '' },
  language: { type: String, default: '' },

  theatre: { type: String, required: true },
  theatreLocation: { type: String, default: '' },
  showTime: { type: String, required: true },
  showDate: { type: String, required: true },

  seats: [seatSchema],

  totalAmount: { type: Number, required: true },
  convenienceFee: { type: Number, default: 0 },
  walletDiscount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },

  // ─── Points ───────────────────────────────
  pointsEarned: { type: Number, default: 0 },
  pointsUsed: { type: Number, default: 0 },

  // ─── Payment ──────────────────────────────
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },

  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },

  // ─── Status ───────────────────────────────
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'pending',
  },

  bookingRef: { type: String, unique: true },
}, { timestamps: true })

// Auto booking reference
bookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
    this.bookingRef = `SM-${new Date().getFullYear()}-${rand}`
  }
  next()
})

module.exports = mongoose.model('Booking', bookingSchema)