import ResetPassword from './pages/ResetPassword'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import Booking from './pages/Booking'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

// Protected route — redirects to /auth if not logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'float 1.5s ease-in-out infinite' }}>🎬</div>
        <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>LOADING...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <Navbar />
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/movies"     element={<Movies />} />
          <Route path="/movie/:id"  element={<MovieDetail />} />
          <Route path="/auth"       element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Protected routes */}
          <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App