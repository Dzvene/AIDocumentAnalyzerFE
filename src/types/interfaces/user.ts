export interface User {
  id: string
  email: string
  userName: string
  firstName?: string
  lastName?: string
  fullName?: string
  department?: string
  position?: string
  roles: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface CreateUserRequest {
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

export interface UpdateUserRequest {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  department?: string
  position?: string
  isActive?: boolean
}

export interface UserListResponse {
  data: User[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  success: boolean
  message?: string
}

export interface UserFilters {
  search?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}


export interface ChangePasswordRequest {
  userId: string
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  newPassword: string
}