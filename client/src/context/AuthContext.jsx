import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)
const TOKEN_KEY = 'quickcare_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    api
      .me(token)
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken('')
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  async function login(email, password) {
    const data = await api.login({ email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(payload) {
    const data = await api.register(payload)
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return value
}
