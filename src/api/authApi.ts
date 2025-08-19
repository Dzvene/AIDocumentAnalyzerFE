import { apiClient } from './config'
import { 
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  RefreshResponse,
  MeResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  Enable2FAResponse,
  Verify2FARequest,
  ConfirmEmailRequest,
  ResendEmailConfirmationRequest,
  ApiResponse,
  UserInfo,
  AuthResponse,
  RefreshTokenRequest
} from '@types/dto/auth.dto'

export const authApi = {
  // Core authentication
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // Бэкенд возвращает AuthResponse напрямую, не в обертке ApiResponse
    return apiClient.post<AuthResponse>('/api/auth-module/register', data)
  },

  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/api/auth-module/login', credentials)
  },

  refresh: async (): Promise<AuthResponse> => {
    // The refresh logic is handled in the axios interceptor
    // This is for manual refresh if needed
    return apiClient.post<AuthResponse>('/api/auth-module/refresh')
  },

  logout: async (): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/logout')
  },

  getCurrentUser: async (): Promise<MeResponse> => {
    return apiClient.get<MeResponse>('/api/auth-module/me')
  },

  // Password management
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/change-password', data)
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/forgot-password', data)
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/reset-password', data)
  },

  // Two-factor authentication
  enable2FA: async (): Promise<ApiResponse<Enable2FAResponse>> => {
    return apiClient.post<ApiResponse<Enable2FAResponse>>('/api/auth-module/2fa/enable')
  },

  verify2FA: async (data: Verify2FARequest): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/2fa/verify', data)
  },
  
  verifyTwoFactor: async (data: { tempToken: string; code: string }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/api/auth-module/2fa/verify-login', data)
  },
  
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/api/auth-module/refresh', data)
  },

  disable2FA: async (code: string): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/2fa/disable', { code })
  },

  // Email confirmation
  confirmEmail: async (data: ConfirmEmailRequest): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/confirm-email', data)
  },

  resendEmailConfirmation: async (data: ResendEmailConfirmationRequest): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/resend-confirmation', data)
  },

  // Validation endpoints
  checkEmailAvailability: async (email: string): Promise<ApiResponse<{ available: boolean }>> => {
    return apiClient.get<ApiResponse<{ available: boolean }>>(`/api/auth-module/check-email/${email}`)
  },

  checkUsernameAvailability: async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
    return apiClient.get<ApiResponse<{ available: boolean }>>(`/api/auth-module/check-username/${username}`)
  },

  // User profile update
  updateProfile: async (data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> => {
    return apiClient.put<ApiResponse<UserInfo>>('/api/auth-module/profile', data)
  },

  // Avatar management
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiClient.post<ApiResponse<{ avatarUrl: string }>>('/api/auth-module/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  deleteAvatar: async (): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>('/api/auth-module/avatar')
  },

  // Session management
  getSessions: async (): Promise<ApiResponse<Array<{
    id: string
    device: string
    browser: string
    ipAddress: string
    lastActive: string
    current: boolean
  }>>> => {
    return apiClient.get<ApiResponse<Array<any>>>('/api/auth-module/sessions')
  },

  revokeSession: async (sessionId: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/api/auth-module/sessions/${sessionId}`)
  },

  revokeAllSessions: async (): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/auth-module/sessions/revoke-all')
  }
}