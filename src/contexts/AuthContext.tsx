'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token')
    console.log('AuthContext useEffect: Checking for token', token ? 'Token found' : 'No token')

    if (token) {
      // Verify token and get user info
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        console.log('AuthContext useEffect: /api/auth/me response status', res.status)
        return res.json()
      })
      .then(data => {
        console.log('AuthContext useEffect: /api/auth/me response data', data)
        if (data.success && data.data) {
          setUser(data.data)
          console.log('AuthContext useEffect: User set', data.data.email)
        } else {
          console.log('AuthContext useEffect: /api/auth/me failed, removing token')
          localStorage.removeItem('token')
        }
      })
      .catch(error => {
        console.error('AuthContext useEffect: Error fetching /api/auth/me', error)
        localStorage.removeItem('token')
      })
      .finally(() => {
        setLoading(false)
        console.log('AuthContext useEffect: Loading set to false')
      })
    } else {
      setLoading(false)
      console.log('AuthContext useEffect: No token, loading set to false')
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.data.token)
        setUser(data.data.user)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.data.token)
        setUser(data.data.user)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 