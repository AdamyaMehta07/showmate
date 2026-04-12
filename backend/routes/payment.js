const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay')
const crypto = require('crypto')
const { protect } = require('../middleware/auth')

// ─── Initialize Razorpay ──────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ─── POST /api/payment/create-order ──────────────────────────────────────────
// Called BEFORE showing Razorpay checkout modal
// Frontend sends amount → Backend creates Razorpay order → Returns order_id to frontend
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, movieTitle, seats } = req.body  // amount in ₹

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' })
    }

    // Razorpay requires amount in PAISE (1 ₹ = 100 paise)
    const amountInPaise = Math.round(amount * 100)

    const orderOptions = {
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `showmate_${Date.now()}`,
      notes: {
        movie:  movieTitle || 'ShowMate Booking',
        seats:  seats ? seats.join(', ') : '',
        userId: req.user._id.toString(),
      },
    }

    const order = await razorpay.orders.create(orderOptions)

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,  // Frontend needs this to init Razorpay
    })
  } catch (error) {
    console.error('Razorpay order error:', error)
    res.status(500).json({ success: false, message: 'Failed to create payment order.' })
  }
})

// ─── POST /api/payment/verify ─────────────────────────────────────────────────
// Called AFTER Razorpay payment modal closes with success
// Verifies the payment signature to ensure it's authentic (not tampered)
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields.' })
    }

    // HMAC-SHA256 signature verification
    // Razorpay docs: signature = HMAC_SHA256(orderId + '|' + paymentId, secret)
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' })
    }

    // Payment is verified ✅
    res.json({
      success: true,
      message: 'Payment verified successfully ✅',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    })
  } catch (error) {
    console.error('Payment verify error:', error)
    res.status(500).json({ success: false, message: 'Payment verification failed.' })
  }
})

// ─── GET /api/payment/key — get Razorpay key for frontend ────────────────────
router.get('/key', protect, (req, res) => {
  res.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID })
})

module.exports = router