const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ─── Helper: user response (strip sensitive fields) ───────────────────────────
const userResponse = (user) => ({
  _id:           user._id,
  name:          user.name,
  email:         user.email,
  avatar:        user.avatar,
  points:        user.points,
  walletBalance: user.walletBalance,
  tier:          user.tier,
  totalBookings: user.totalBookings,
  memberSince:   user.createdAt?.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
  createdAt:     user.createdAt,
})

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields.' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' })
    }

    const user = await User.create({ name, email, password })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: `Welcome to ShowMate, ${user.name}! 🎬 You got 100 welcome points!`,
      token,
      user: userResponse(user),
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ success: false, message: messages.join('. ') })
    }
    res.status(500).json({ success: false, message: 'Registration failed. Try again.' })
  }
})

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    // Explicitly select password (it's hidden by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' })
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 🎬`,
      token,
      user: userResponse(user),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed. Try again.' })
  }
})

// ─── GET /api/auth/me — get current user ──────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ success: true, user: userResponse(user) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user.' })
  }
})

// ─── PUT /api/auth/update-password ───────────────────────────────────────────
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' })
    }

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password updated successfully.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password update failed.' })
  }
})

module.exports = router