// ─── Base URL (set VITE_API_URL in your .env file) ────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('showmate_token')
export const setToken = (t) => localStorage.setItem('showmate_token', t)
export const removeToken = () => localStorage.removeItem('showmate_token')

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('showmate_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}
export const setStoredUser = (u) => localStorage.setItem('showmate_user', JSON.stringify(u))
export const removeStoredUser = () => localStorage.removeItem('showmate_user')

// ─── Base fetch wrapper ───────────────────────────────────────────────────────
const api = async (endpoint, options = {}) => {
  const token = getToken()
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, config)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
export const authAPI = {
  register: (name, email, password) =>
    api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  login: (email, password) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => api('/auth/me'),

  updatePassword: (currentPassword, newPassword) =>
    api('/auth/update-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOVIES
// ═══════════════════════════════════════════════════════════════════════════════
export const moviesAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return api(`/movies${q ? '?' + q : ''}`)
  },
  getTrending: () => api('/movies/trending'),
  getById: (id) => api(`/movies/${id}`),
  seed: () => api('/movies/seed', { method: 'POST' }),
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════════
export const bookingsAPI = {
  create: (data) =>
    api('/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getMyBookings: () => api('/bookings/my'),

  getById: (id) => api(`/bookings/${id}`),

  cancel: (id) => api(`/bookings/${id}`, { method: 'DELETE' }),
}

// ═══════════════════════════════════════════════════════════════════════════════
// POINTS
// ═══════════════════════════════════════════════════════════════════════════════
export const pointsAPI = {
  getSummary: () => api('/points/summary'),
  getHistory: (page = 1) => api(`/points/history?page=${page}`),
  redeem: (pointsToRedeem) =>
    api('/points/redeem', { method: 'POST', body: JSON.stringify({ pointsToRedeem }) }),
  getTiers: () => api('/points/tiers'),
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT (Razorpay)
// ═══════════════════════════════════════════════════════════════════════════════
export const paymentAPI = {
  createOrder: (amount, movieTitle, seats) =>
    api('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, movieTitle, seats }),
    }),

  verify: (razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    api('/payment/verify', {
      method: 'POST',
      body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
    }),
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER
// ═══════════════════════════════════════════════════════════════════════════════
export const userAPI = {
  getProfile: () => api('/user/profile'),
  updateProfile: (name) =>
    api('/user/profile', { method: 'PUT', body: JSON.stringify({ name }) }),
}