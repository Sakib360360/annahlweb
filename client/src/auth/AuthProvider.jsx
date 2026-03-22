import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('anahl:auth')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser(parsed.user)
        setToken(parsed.token)
      } catch {
        localStorage.removeItem('anahl:auth')
      }
    }
    setReady(true)
  }, [])

  const login = async ({ id, email, password }) => {
    try {
      const response = await apiLogin({ id, email, password })
      setUser(response.user)
      setToken(response.token)

      localStorage.setItem(
        'anahl:auth',
        JSON.stringify({ user: response.user, token: response.token }),
      )

      return response
    } catch (error) {
      setUser(null)
      setToken(null)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('anahl:auth')
  }

  const value = useMemo(
    () => ({ user, token, ready, login, logout }),
    [user, token, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
