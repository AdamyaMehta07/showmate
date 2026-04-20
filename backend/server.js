const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// ─── Middleware ───────────────────────────────────────────────────────────────
// NEW — paste this instead
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/movies',   require('./routes/movies'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/points',   require('./routes/points'))
app.use('/api/payment',  require('./routes/payment'))
app.use('/api/user',     require('./routes/user'))
app.use('/api/forgot-password', require('./routes/forgotPassword'))

// Health check 
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ShowMate API is running 🎬', timestamp: new Date() })
})

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

// ─── Connect DB & Start ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => {
      console.log(`🚀 ShowMate backend running on http://localhost:${PORT}`)
      console.log(`📡 API base: http://localhost:${PORT}/api`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })