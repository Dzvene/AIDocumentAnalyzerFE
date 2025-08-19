import { apiClient } from './config'
import {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  PasswordChangeRequest,
  UserProfileDto,
  UserPreferencesDto,
  UserActivityDto,
  UserListRequest,
  UserListResponse,
  UserResponse,
  UserProfileResponse,
  UserPreferencesResponse,
  UserActivityResponse,
  UserStatsResponse,
  AddressDto,
  PaymentMethodDto
} from '@types/dto/user.dto'

export const usersApi = {
  // User CRUD operations
  getUsers: async (params?: UserListRequest): Promise<UserListResponse> => {
    return apiClient.get<UserListResponse>('/api/users', { params })
  },

  getUserById: async (userId: string): Promise<UserResponse> => {
    return apiClient.get<UserResponse>(`/api/users/${userId}`)
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    return apiClient.get<UserResponse>('/api/users/me')
  },

  createUser: async (data: CreateUserDto): Promise<UserResponse> => {
    return apiClient.post<UserResponse>('/api/users', data)
  },

  updateUser: async (userId: string, data: UpdateUserDto): Promise<UserResponse> => {
    return apiClient.put<UserResponse>(`/api/users/${userId}`, data)
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/users/${userId}`)
  },

  // User status management
  activateUser: async (userId: string): Promise<UserResponse> => {
    return apiClient.post<UserResponse>(`/api/users/${userId}/activate`)
  },

  deactivateUser: async (userId: string): Promise<UserResponse> => {
    return apiClient.post<UserResponse>(`/api/users/${userId}/deactivate`)
  },

  toggleUserStatus: async (userId: string): Promise<UserResponse> => {
    return apiClient.post<UserResponse>(`/api/users/${userId}/toggle-status`)
  },

  // Password management
  changePassword: async (userId: string, data: PasswordChangeRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/api/users/${userId}/change-password`, data)
  },

  changeMyPassword: async (data: PasswordChangeRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/api/users/me/change-password', data)
  },

  resetUserPassword: async (userId: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/api/users/${userId}/reset-password`, { newPassword })
  },

  // Role management
  getUserRoles: async (userId: string): Promise<string[]> => {
    return apiClient.get<string[]>(`/api/users/${userId}/roles`)
  },

  updateUserRoles: async (userId: string, roles: string[]): Promise<UserResponse> => {
    return apiClient.put<UserResponse>(`/api/users/${userId}/roles`, { roles })
  },

  addUserRole: async (userId: string, roleId: string): Promise<UserResponse> => {
    return apiClient.post<UserResponse>(`/api/users/${userId}/roles/${roleId}`)
  },

  removeUserRole: async (userId: string, roleId: string): Promise<UserResponse> => {
    return apiClient.delete<UserResponse>(`/api/users/${userId}/roles/${roleId}`)
  },

  // User profile
  getUserProfile: async (userId: string): Promise<UserProfileResponse> => {
    return apiClient.get<UserProfileResponse>(`/api/users/${userId}/profile`)
  },

  updateUserProfile: async (userId: string, data: Partial<UserProfileDto>): Promise<UserProfileResponse> => {
    return apiClient.put<UserProfileResponse>(`/api/users/${userId}/profile`, data)
  },

  uploadAvatar: async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiClient.post<{ avatarUrl: string }>(`/api/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  deleteAvatar: async (userId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/users/${userId}/avatar`)
  },

  // User preferences
  getUserPreferences: async (userId: string): Promise<UserPreferencesResponse> => {
    return apiClient.get<UserPreferencesResponse>(`/api/users/${userId}/preferences`)
  },

  updateUserPreferences: async (userId: string, data: Partial<UserPreferencesDto>): Promise<UserPreferencesResponse> => {
    return apiClient.put<UserPreferencesResponse>(`/api/users/${userId}/preferences`, data)
  },

  // User addresses
  getUserAddresses: async (userId: string): Promise<AddressDto[]> => {
    return apiClient.get<AddressDto[]>(`/api/users/${userId}/addresses`)
  },

  addUserAddress: async (userId: string, address: Omit<AddressDto, 'id'>): Promise<AddressDto> => {
    return apiClient.post<AddressDto>(`/api/users/${userId}/addresses`, address)
  },

  updateUserAddress: async (userId: string, addressId: string, data: Partial<AddressDto>): Promise<AddressDto> => {
    return apiClient.put<AddressDto>(`/api/users/${userId}/addresses/${addressId}`, data)
  },

  deleteUserAddress: async (userId: string, addressId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/users/${userId}/addresses/${addressId}`)
  },

  setDefaultAddress: async (userId: string, addressId: string): Promise<AddressDto> => {
    return apiClient.post<AddressDto>(`/api/users/${userId}/addresses/${addressId}/set-default`)
  },

  // Payment methods
  getUserPaymentMethods: async (userId: string): Promise<PaymentMethodDto[]> => {
    return apiClient.get<PaymentMethodDto[]>(`/api/users/${userId}/payment-methods`)
  },

  addPaymentMethod: async (userId: string, data: Omit<PaymentMethodDto, 'id'>): Promise<PaymentMethodDto> => {
    return apiClient.post<PaymentMethodDto>(`/api/users/${userId}/payment-methods`, data)
  },

  deletePaymentMethod: async (userId: string, paymentMethodId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/users/${userId}/payment-methods/${paymentMethodId}`)
  },

  setDefaultPaymentMethod: async (userId: string, paymentMethodId: string): Promise<PaymentMethodDto> => {
    return apiClient.post<PaymentMethodDto>(`/api/users/${userId}/payment-methods/${paymentMethodId}/set-default`)
  },

  // User activity
  getUserActivity: async (userId: string, params?: {
    startDate?: string
    endDate?: string
    action?: string
    entity?: string
    page?: number
    pageSize?: number
  }): Promise<UserActivityResponse> => {
    return apiClient.get<UserActivityResponse>(`/api/users/${userId}/activity`, { params })
  },

  // User statistics
  getUserStats: async (): Promise<UserStatsResponse> => {
    return apiClient.get<UserStatsResponse>('/api/users/stats')
  },

  // Validation
  checkEmailExists: async (email: string, excludeUserId?: string): Promise<{ exists: boolean }> => {
    return apiClient.post<{ exists: boolean }>('/api/users/check-email', { email, excludeUserId })
  },

  checkUsernameExists: async (username: string, excludeUserId?: string): Promise<{ exists: boolean }> => {
    return apiClient.post<{ exists: boolean }>('/api/users/check-username', { username, excludeUserId })
  },

  // Bulk operations
  bulkActivateUsers: async (userIds: string[]): Promise<{ updated: number; errors: string[] }> => {
    return apiClient.post<{ updated: number; errors: string[] }>('/api/users/bulk-activate', { userIds })
  },

  bulkDeactivateUsers: async (userIds: string[]): Promise<{ updated: number; errors: string[] }> => {
    return apiClient.post<{ updated: number; errors: string[] }>('/api/users/bulk-deactivate', { userIds })
  },

  bulkDeleteUsers: async (userIds: string[]): Promise<{ deleted: number; errors: string[] }> => {
    return apiClient.post<{ deleted: number; errors: string[] }>('/api/users/bulk-delete', { userIds })
  },

  // Export/Import
  exportUsers: async (format: 'csv' | 'json' | 'xlsx', filters?: UserListRequest): Promise<Blob> => {
    return apiClient.get<Blob>('/api/users/export', {
      params: { format, ...filters },
      responseType: 'blob'
    })
  },

  importUsers: async (file: File): Promise<{
    imported: number
    updated: number
    errors: Array<{ row: number; error: string }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<{
      imported: number
      updated: number
      errors: Array<{ row: number; error: string }>
    }>('/api/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}