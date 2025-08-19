// Backend DTOs for Authentication module

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
}

// User information from backend
export interface UserInfo {
  id: string
  email: string
  userName?: string
  name?: string // Поле name из ответа бэкенда
  fullName?: string
  firstName: string
  lastName: string
  phone?: string // Поле phone из ответа бэкенда
  phoneNumber?: string
  department?: string | null
  position?: string | null
  emailConfirmed?: boolean
  twoFactorEnabled?: boolean
  roles: string[]
  permissions?: string[]
  avatarUrl?: string
  isActive?: boolean
  isVendor?: boolean
  createdAt?: string
  lastLogin?: string | null
}

// Authentication requests
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber?: string
  acceptTerms: boolean
}

export interface RefreshTokenRequest {
  accessToken: string
  refreshToken: string
}

// Authentication responses
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo // Изменено с userInfo на user для соответствия бэкенду
  expiresAt?: string
  expiresIn?: number
  tokenType?: string
}

export interface LoginResponse extends ApiResponse<AuthResponse> {}
export interface RegisterResponse extends ApiResponse<AuthResponse> {}
export interface RefreshResponse extends ApiResponse<AuthResponse> {}
export interface MeResponse extends ApiResponse<UserInfo> {}

// Password management
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

// Two-factor authentication
export interface Enable2FAResponse {
  qrCodeUri: string
  manualEntryKey: string
}

export interface Verify2FARequest {
  code: string
}

// Email confirmation
export interface ConfirmEmailRequest {
  userId: string
  token: string
}

export interface ResendEmailConfirmationRequest {
  email: string
}