import { createContext, useContext, useState, useEffect } from 'react'
import {
  authAPI,
  getStoredUser, setStoredUser, removeStoredUser,
  setToken, removeToken, getToken,
} from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser)
  const [loading, setLoading] = useState(!!getToken()) // true only if token exists

  // On mount: if token exists, verify it and refresh user data
  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    authAPI.me()
      .then(data => { setUser(data.user); setStoredUser(data.user) })
      .catch(() => { removeToken(); removeStoredUser(); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await authAPI.login(email, password)
    setToken(data.token)
    setStoredUser(data.user)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const data = await authAPI.register(name, email, password)
    setToken(data.token)
    setStoredUser(data.user)
    setUser(data.user)
    return data
  }

  const logout = () => {
    removeToken()
    removeStoredUser()
    setUser(null)
  }

  // Call this after any action that changes points/tier (booking, redeem)
  const refreshUser = async () => {
    try {
      const data = await authAPI.me()
      setUser(data.user)
      setStoredUser(data.user)
    } catch (e) { /* silent */ }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}