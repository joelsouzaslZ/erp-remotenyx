import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import api from '../utils/api'
import Cookies from 'js-cookie'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // API já configurada em utils/api.js

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token') || localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error)
      Cookies.remove('token')
      // Token removido pelo interceptor
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data

      Cookies.set('token', token, { expires: 1 }) // 1 dia
      localStorage.setItem('token', token)
      setUser(user)

      router.push('/dashboard')
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro no login' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data

      Cookies.set('token', token, { expires: 1 })
      localStorage.setItem('token', token)
      setUser(user)

      router.push('/dashboard')
      return { success: true }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro no registro' 
      }
    }
  }

  const logout = () => {
    Cookies.remove('token')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}