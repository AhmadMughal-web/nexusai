import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('nai_token')
    const saved = localStorage.getItem('nai_user')
    if (token && saved) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(JSON.parse(saved))
      } catch {
        _clear()
      }
    }
    setLoading(false)
  }, [])

  const _save = (data) => {
    localStorage.setItem('nai_token', data.token)
    localStorage.setItem('nai_user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
  }

  const _clear = () => {
    localStorage.removeItem('nai_token')
    localStorage.removeItem('nai_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password })
    _save(data)
  }

  const signup = async (name, username, email, password) => {
    const { data } = await api.post('/auth/signup', { name, username, email, password })
    _save(data)
  }

  const loginAsGuest = async () => {
    const { data } = await api.post('/auth/guest')
    _save(data)
  }

  // Called manually (logout button)
  const logoutManual = () => {
    _clear()
    toast.success('Logged out successfully')
  }

  // Called automatically on 401
  const logout = useCallback(() => {
    _clear()
    toast.error('Session expired — please log in again')
  }, [])

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  }

  const resetPassword = async (token, password) => {
    const { data } = await api.patch(`/auth/reset-password/${token}`, { password })
    _save(data)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, signup, loginAsGuest,
      logout, logoutManual,
      forgotPassword, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
