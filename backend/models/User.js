const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const pointsHistorySchema = new mongoose.Schema({
  description: { type: String, required: true },
  points:      { type: Number, required: true },  // positive = earned, negative = redeemed
  type:        { type: String, enum: ['earned', 'redeemed', 'bonus', 'expired'], default: 'earned' },
  bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  date:        { type: Date, default: Date.now },
})

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,  // Never return password in queries by default
  },
  avatar: { type: String, default: '' },

  // ─── Points & Wallet ──────────────────────────────────────────────────────
  points:        { type: Number, default: 100 },   // 100 welcome points on signup
  walletBalance: { type: Number, default: 0 },     // redeemed cash in wallet (₹)
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze',
  },
  pointsHistory: [pointsHistorySchema],

  // ─── Meta ─────────────────────────────────────────────────────────────────
  totalBookings: { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now },
}, { timestamps: true })

// ─── Hash password before save ────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)

  // Set avatar initials
  if (!this.avatar) {
    const parts = this.name.trim().split(' ')
    this.avatar = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }

  // Add welcome points entry on first save
  if (this.isNew) {
    this.pointsHistory.push({
      description: '🎁 Welcome bonus points',
      points: 100,
      type: 'bonus',
    })
  }

  next()
})

// ─── Compare password ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// ─── Calculate & update tier based on points ──────────────────────────────────
userSchema.methods.updateTier = function () {
  const p = this.points
  if (p >= 5000)      this.tier = 'Diamond'
  else if (p >= 3000) this.tier = 'Platinum'
  else if (p >= 1500) this.tier = 'Gold'
  else if (p >= 500)  this.tier = 'Silver'
  else                this.tier = 'Bronze'
}

// ─── Add points helper ────────────────────────────────────────────────────────
userSchema.methods.addPoints = function (amount, description, bookingId = null) {
  this.points += amount
  this.pointsHistory.unshift({
    description,
    points: amount,
    type: amount > 0 ? 'earned' : 'redeemed',
    bookingId,
  })
  this.updateTier()
}

module.exports = mongoose.model('User', userSchema)