const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// ─── GET /api/user/profile ───────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({
      success: true,
      user: {
        _id:           user._id,
        name:          user.name,
        email:         user.email,
        avatar:        user.avatar,
        points:        user.points,
        walletBalance: user.walletBalance,
        tier:          user.tier,
        totalBookings: user.totalBookings,
        pointsHistory: user.pointsHistory.slice(0, 20),
        memberSince:   user.createdAt?.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' })
  }
})

// ─── PUT /api/user/profile — update name ─────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    )

    res.json({ success: true, message: 'Profile updated.', user: { name: user.name } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed.' })
  }
})

module.exports = router