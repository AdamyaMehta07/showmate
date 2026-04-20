const express  = require('express')
const router   = express.Router()
const crypto   = require('crypto')
const nodemailer = require('nodemailer')
const User     = require('../models/User')
const jwt      = require('jsonwebtoken')

// ─── Email transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ─── POST /api/forgot-password ────────────────────────────────────────────────
// User enters email → we send reset link
router.post('/', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' })
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal if email exists or not (security)
      return res.json({
        success: true,
        message: 'If this email is registered, a reset link has been sent.',
      })
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET + user.password, // extra security — old token invalid after password change
      { expiresIn: '1h' }
    )

    // Build reset URL
    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`

    // Send email
    const mailOptions = {
      from:    `"ShowMate 🎬" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'ShowMate — Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: white; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">🎬 SHOWMATE</h1>
            <p style="color: #6b6b8a; margin-top: 8px;">Smart Movie Booking</p>
          </div>

          <h2 style="color: white; margin-bottom: 16px;">Reset Your Password</h2>
          <p style="color: #9ca3af; line-height: 1.6;">
            Hi <strong style="color: white;">${user.name}</strong>,<br><br>
            You requested to reset your ShowMate password. Click the button below to create a new password.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetURL}"
              style="background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset Password →
            </a>
          </div>

          <p style="color: #6b6b8a; font-size: 13px; line-height: 1.6;">
            ⏰ This link expires in <strong style="color: white;">1 hour</strong>.<br>
            If you didn't request this, please ignore this email. Your password won't change.
          </p>

          <div style="border-top: 1px solid #1f1f1f; margin-top: 32px; padding-top: 20px; text-align: center;">
            <p style="color: #6b6b8a; font-size: 12px; margin: 0;">
              © 2026 ShowMate. Book. Earn. Reward. 🎬
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    res.json({
      success: true,
      message: 'Password reset link sent to your email! Check your inbox.',
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ success: false, message: 'Failed to send email. Try again.' })
  }
})

// ─── POST /api/forgot-password/reset ─────────────────────────────────────────
// User submits new password with token
router.post('/reset', async (req, res) => {
  try {
    const { token, userId, newPassword } = req.body

    if (!token || !userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' })
    }

    // Get user
    const user = await User.findById(userId).select('+password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    // Verify token using old password as part of secret
    try {
      jwt.verify(token, process.env.JWT_SECRET + user.password)
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Password reset successfully! You can now login.' })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: 'Password reset failed. Try again.' })
  }
})

module.exports = router