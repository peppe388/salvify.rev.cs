'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from './api'
import { User } from './types'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('salvify_token')
    if (t) {
      setToken(t)
      api.getMe()
        .then(u => setUser(u))
        .catch(() => { localStorage.removeItem('salvify_token') })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password)
    localStorage.setItem('salvify_token', res.token)
    setToken(res.token)
    setUser(res.user)
  }

  const register = async (email: string, name: string, password: string) => {
    const res = await api.register(email, name, password)
    localStorage.setItem('salvify_token', res.token)
    setToken(res.token)
    setUser(res.user)
  }

  const logout = () => {
    localStorage.removeItem('salvify_token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    const u = await api.getMe()
    setUser(u)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
