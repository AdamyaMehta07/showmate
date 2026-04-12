const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// ─── Tier thresholds ─────────────────────────────────────────────────────────
const TIERS = [
  { name: 'Bronze',   min: 0,    max: 499,  color: '#cd7f32', icon: '🥉', cashback: 0,   pointsPerRedeem: 500, cashPerRedeem: 50  },
  { name: 'Silver',   min: 500,  max: 1499, color: '#c0c0c0', icon: '🥈', cashback: 50,  pointsPerRedeem: 500, cashPerRedeem: 55  },
  { name: 'Gold',     min: 1500, max: 2999, color: '#f59e0b', icon: '🥇', cashback: 150, pointsPerRedeem: 500, cashPerRedeem: 60  },
  { name: 'Platinum', min: 3000, max: 4999, color: '#8b5cf6', icon: '💎', cashback: 350, pointsPerRedeem: 500, cashPerRedeem: 70  },
  { name: 'Diamond',  min: 5000, max: Infinity, color: '#06b6d4', icon: '🔷', cashback: 700, pointsPerRedeem: 500, cashPerRedeem: 80 },
]

const getTierInfo = (points) => {
  const current = TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0]
  const currentIndex = TIERS.indexOf(current)
  const next = TIERS[currentIndex + 1] || null
  const progress = next ? ((points - current.min) / (next.min - current.min)) * 100 : 100
  return { current, next, progress: Math.min(progress, 100), remaining: next ? next.min - points : 0 }
}

// ─── GET /api/points/summary — user's full points summary ────────────────────
router.get('/summary', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const tierInfo = getTierInfo(user.points)

    res.json({
      success: true,
      points:        user.points,
      walletBalance: user.walletBalance,
      tier:          user.tier,
      tierInfo,
      tiers:         TIERS,
      totalBookings: user.totalBookings,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch points summary.' })
  }
})

// ─── GET /api/points/history — points transaction history ────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const { page = 1, limit = 20 } = req.query
    const start = (page - 1) * limit
    const history = user.pointsHistory.slice(start, start + parseInt(limit))

    res.json({
      success: true,
      history,
      total: user.pointsHistory.length,
      page: parseInt(page),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history.' })
  }
})

// ─── POST /api/points/redeem — redeem points for wallet cash ─────────────────
router.post('/redeem', protect, async (req, res) => {
  try {
    const { pointsToRedeem } = req.body

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid points amount.' })
    }

    const user = await User.findById(req.user._id)

    if (user.points < pointsToRedeem) {
      return res.status(400).json({ success: false, message: `Insufficient points. You have ${user.points} pts.` })
    }

    if (pointsToRedeem < 500) {
      return res.status(400).json({ success: false, message: 'Minimum redemption is 500 points.' })
    }

    // Must be a multiple of 500
    if (pointsToRedeem % 500 !== 0) {
      return res.status(400).json({ success: false, message: 'Points must be redeemed in multiples of 500.' })
    }

    // Get cashback rate based on tier
    const tierInfo = getTierInfo(user.points)
    const cashbackRate = tierInfo.current.cashPerRedeem  // e.g. 60 means ₹60 per 500 pts
    const batches = pointsToRedeem / 500
    const cashEarned = batches * cashbackRate

    // Deduct points, add to wallet
    user.addPoints(-pointsToRedeem, `💰 Redeemed ${pointsToRedeem} pts → ₹${cashEarned}`)
    user.walletBalance += cashEarned
    await user.save()

    res.json({
      success: true,
      message: `✅ Redeemed ${pointsToRedeem} points → ₹${cashEarned} added to wallet!`,
      pointsRedeemed: pointsToRedeem,
      cashAdded:     cashEarned,
      newPoints:     user.points,
      newWallet:     user.walletBalance,
      newTier:       user.tier,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Redemption failed.' })
  }
})

// ─── GET /api/points/tiers — all tier info ───────────────────────────────────
router.get('/tiers', async (req, res) => {
  res.json({ success: true, tiers: TIERS })
})

module.exports = router