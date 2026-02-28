import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { jwtDecode } from 'jwt-decode'
import { type User } from '../types'
import { tokenStore } from '../api/tokenStore'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setAccessToken: (token: string) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
     const checkAuth = async () => {
    try {
      // Try to refresh token to see if user is still logged in
      const  data  = await authApi.refresh()
      tokenStore.set(data.accessToken)
      setAccessToken(data.accessToken)
      // decode token to get user info
      const details =  jwtDecode<User>(data.accessToken)
      setUser(details)
    } catch {
      // No valid session
    } finally {
      setLoading(false)
    }
  }
  checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    // 1. Call authApi.login
    const data = await authApi.login(email,password)
    tokenStore.set(data.accessToken)
    setAccessToken(data.accessToken)
    // 2. Save accessToken using setAccessToken
    setUser({id:data.id,name:data.name,email})
    // 3. Save user info using setUser (id, name, email)
  }

  const register = async (name: string, email: string, password: string) => {
    // Same as login but call authApi.register
    const data = await authApi.register(name,email,password)
    setAccessToken(data.accessToken)
    tokenStore.set(data.accessToken) 
    setUser({id:data.id,name:data.name,email})
  }

  const logout = async () => {
    // 1. Call authApi.logout
    await authApi.logout()
    setAccessToken(null)
    tokenStore.set(null) 
     setUser(null)
    // 2. Clear accessToken (set to null)
    // 3. Clear user (set to null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      setAccessToken,
      login, 
      register, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}