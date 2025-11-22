import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checkingSetup, setCheckingSetup] = useState(true)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await api.get('/setup/status')
      if (!response.data.configured) {
        router.push('/setup')
        return
      }
    } catch (error) {
      console.error('Erro ao verificar status de setup:', error)
    } finally {
      setCheckingSetup(false)
    }
  }

  useEffect(() => {
    if (!loading && !checkingSetup) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router, checkingSetup])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}