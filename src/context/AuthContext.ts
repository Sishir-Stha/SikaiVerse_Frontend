import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { login, signup } from '../api/auth/auth'
import type { LoginRequest, LoginResponse, SignupRequest } from '../api/auth/auth'

interface User {
  username: string
  role: 'admin' | 'student' | 'instructor'
  email?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (credentials: LoginRequest) => Promise<void>
  signup: (userData: SignupRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      const response: LoginResponse = await login(credentials)
      if (response.success === 'true') {
        const userData: User = {
          username: response.data.username,
          role: response.data.role,
          email: credentials.email
        }
        setIsAuthenticated(true)
        setUser(userData)
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      throw error
    }
  }

  const handleSignup = async (userData: SignupRequest) => {
    try {
      const response = await signup(userData)
      if (!response.success) {
        throw new Error('Signup failed')
      }
      // Signup successful, but do not log in automatically
    } catch (error) {
      throw error
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}