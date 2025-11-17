import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load saved auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsed)
        setUserId(parsed.id || parsed._id || null)
        // Also store role for easy access
        if (parsed.role) {
          localStorage.setItem('userRole', parsed.role)
        }
        setIsAuthenticated(true)
      } catch (err) {
        // ignore parse errors
      }
    }
    setLoading(false)
  }, [])

  const register = async (email, password, meta = {}) => {
    setLoading(true)
    try {
      // call register then login to obtain token + user
      await authAPI.register(email, password, meta)
      const loginRes = await authAPI.login(email, password)
      const { token: newToken, user: userObj } = loginRes.data

      // persist
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userObj))
      localStorage.setItem('userId', userObj.id || userObj._id)
      if (userObj.role) {
        localStorage.setItem('userRole', userObj.role)
      }

      setToken(newToken)
      setUser(userObj)
      setUserId(userObj.id || userObj._id)
      setIsAuthenticated(true)
      setLoading(false)
      return { success: true, message: 'Registered and logged in!' }
    } catch (error) {
      setLoading(false)
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      }
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    try {
      const response = await authAPI.login(username, password)
      const { token: newToken, user: userObj } = response.data

      // persist token and user
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userObj))
      localStorage.setItem('userId', userObj.id || userObj._id)
      if (userObj.role) {
        localStorage.setItem('userRole', userObj.role)
      }

      setToken(newToken)
      setUser(userObj)
      setUserId(userObj.id || userObj._id)
      setIsAuthenticated(true)

      setLoading(false)
      return { success: true, message: 'Logged in successfully!' }
    } catch (error) {
      setLoading(false)
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')

    setUser(null)
    setToken(null)
    setUserId(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    token,
    userId,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook - AuthContext dan foydalanish uchun
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
