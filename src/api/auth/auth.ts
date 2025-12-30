export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: string
  data: {
    role: 'admin' | 'student' | 'instructor'
    token: string
    username: string
  }
}

export interface SignupRequest {
  fullName: string
  email: string
  password: string
  role: 'admin' | 'student' | 'instructor'
}

export interface SignupResponse {
  success: boolean
}

const API_BASE_URL = 'http://localhost:8440/api/v1'

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

export const signup = async (userData: SignupRequest): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error('Signup failed')
  }

  return response.json()
}