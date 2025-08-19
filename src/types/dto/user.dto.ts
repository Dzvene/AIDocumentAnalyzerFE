// Backend DTOs for Users module
import { ApiResponse } from './auth.dto'

export interface UserDto {
  id: string
  email: string
  userName: string
  firstName?: string
  lastName?: string
  fullName?: string
  department?: string
  position?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
  roles: string[]
}

export interface CreateUserDto {
  email: string
  userName: string
  password: string
  firstName?: string
  lastName?: string
  department?: string
  position?: string
  isActive?: boolean
  roles?: string[]
}

export interface UpdateUserDto {
  email?: string
  firstName?: string
  lastName?: string
  department?: string
  position?: string
  isActive?: boolean
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserProfileDto {
  id: string
  userId: string
  bio?: string
  phone?: string
  address?: string
  avatarUrl?: string
  birthDate?: string
  skills?: string
  interests?: string
  createdAt: string
  updatedAt: string
}

export interface UserPreferencesDto {
  id: string
  userId: string
  language: string
  theme: string
  notifications: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  currency: string
  timezone: string
  searchRadius: number
  defaultDeliveryType?: string
  savedAddresses?: AddressDto[]
  paymentMethods?: PaymentMethodDto[]
}

export interface AddressDto {
  id: string
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
  isDefault: boolean
  type: 'home' | 'work' | 'other'
}

export interface PaymentMethodDto {
  id: string
  type: 'card' | 'bank' | 'wallet'
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  brand?: string
  isDefault: boolean
}

export interface UserActivityDto {
  id: string
  userId: string
  action: string
  entity: string
  entityId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export interface UserListRequest {
  search?: string
  email?: string
  userName?: string
  firstName?: string
  lastName?: string
  department?: string
  position?: string
  isActive?: boolean
  roles?: string[]
  createdFrom?: string
  createdTo?: string
  lastLoginFrom?: string
  lastLoginTo?: string
  sortBy?: string
  sortDescending?: boolean
  page?: number
  pageSize?: number
}

export interface UserStatsDto {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsersThisMonth: number
  newUsersThisWeek: number
  usersOnlineNow: number
  usersByRole: Record<string, number>
  usersByDepartment: Record<string, number>
  userGrowth: Array<{
    date: string
    count: number
  }>
}

// Response types
export interface UserListResponse extends ApiResponse<{
  users: UserDto[]
  totalCount: number
  page: number
  pageSize: number
}> {}

export interface UserResponse extends ApiResponse<UserDto> {}

export interface UserProfileResponse extends ApiResponse<UserProfileDto> {}

export interface UserPreferencesResponse extends ApiResponse<UserPreferencesDto> {}

export interface UserActivityResponse extends ApiResponse<{
  activities: UserActivityDto[]
  totalCount: number
  page: number
  pageSize: number
}> {}

export interface UserStatsResponse extends ApiResponse<UserStatsDto> {}