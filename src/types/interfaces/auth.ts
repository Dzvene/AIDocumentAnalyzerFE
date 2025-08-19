// Типы согласно API бекенда
export interface User {
  id: string
  email: string
  name?: string
  fullName?: string
  firstName?: string
  lastName?: string
  phone?: string
  department?: string
  position?: string
  roles: string[]
  permissions?: string[]
  avatar?: string
  isEmailVerified?: boolean
  isTwoFactorEnabled?: boolean
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
  phone?: string
  newsletter?: boolean
  confirmPassword?: string
  firstName?: string
  lastName?: string
  department?: string
  position?: string
  agreeTerms?: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string // ISO string
  user: User
}

export interface RefreshTokenRequest {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthApiError {
  message: string
  errors?: string[]
}