import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { login, signup } from '../api/Auth/auth'
import type { LoginRequest, LoginResponse, SignupRequest } from '../api/Auth/auth'

interface User {
  id: number
  username: string
  name?: string        
  role: 'admin' | 'student' | 'instructor'
  email?: string
  avatar?: string
  phone?: string
  address?: string 
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (credentials: LoginRequest) => Promise<'admin' | 'student' | 'instructor'>
  signup: (userData: SignupRequest) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  resetPassword: (newPassword: string) => Promise<void>
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
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Checking the token stored on app mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    
    if (storedToken && storedUser && tokenExpiry) {
      // Check if token is expired (token expires in 1 hour = 3600000 ms)
      const currentTime = Date.now()
      const expiryTime = parseInt(tokenExpiry)
      
      if (currentTime < expiryTime) {
        setIsAuthenticated(true)
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      } else {
        // Token is expired, clear everything
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('tokenExpiry')
        setIsAuthenticated(false)
        setUser(null)
        setToken(null)
      }
    }
  }, [])

  const handleLogin = async (credentials: LoginRequest): Promise<'admin' | 'student' | 'instructor'> => {
    try {
      const response: LoginResponse = await login(credentials)
      if (response.success === 'true') {
        const userData: User = {
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          email: credentials.email
        }
        
        // Token expires in 1 hour (3600000 ms)
        const expiryTime = Date.now() + 60 * 60 * 1000
        
        setIsAuthenticated(true)
        setUser(userData)
        setToken(response.data.token)
        
        // Store in localStorage for persistence across tabs/refreshes
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('tokenExpiry', expiryTime.toString())
        
        return response.data.role
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
    } catch (error) {
      throw error
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiry')
  }

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    updateProfile: function (_updates: Partial<User>): Promise<void> {
      throw new Error('Function not implemented.')
    },
    resetPassword: function (_newPassword: string): Promise<void> {
      throw new Error('Function not implemented.')
    }
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}