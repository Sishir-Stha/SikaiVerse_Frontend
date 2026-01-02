import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { login, signup } from '../api/auth/auth'
import type { LoginRequest, LoginResponse, SignupRequest } from '../api/auth/auth'

interface User {
  id: number
  username: string
  role: 'admin' | 'student' | 'instructor'
  email?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (credentials: LoginRequest) => Promise<'admin' | 'student' | 'instructor'>
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
    // Checking the token stored
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const loginTime = localStorage.getItem('loginTime')
    
    if (token && storedUser && loginTime) {
      //checking if the token in expired or not
      const currentTime = Date.now()
      const tokenAge = currentTime - parseInt(loginTime)
      const thirtyMinutes = 30 * 60 * 1000
      
      if (tokenAge < thirtyMinutes) {
        setIsAuthenticated(true)
        setUser(JSON.parse(storedUser))
      } else {
        // if Token is expired, clearing the stored data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('loginTime')
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
        setIsAuthenticated(true)
        setUser(userData)
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('loginTime', Date.now().toString())
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('loginTime')
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