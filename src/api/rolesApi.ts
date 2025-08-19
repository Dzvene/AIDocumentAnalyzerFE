import { apiClient } from './config'
import {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleSearchParams,
  AssignRoleRequest,
  BulkAssignRoleRequest,
  RoleListResponse,
  RoleResponse,
  PermissionListResponse,
  UserRolesResponse,
  RoleStatisticsResponse,
  RoleTemplatesResponse,
  ApiResponse
} from '@types/dto/roles.dto'

export const rolesApi = {
  // Role management
  getRoles: async (params?: RoleSearchParams): Promise<RoleListResponse> => {
    return apiClient.get<RoleListResponse>('/api/roles', { params })
  },

  createRole: async (data: CreateRoleRequest): Promise<RoleResponse> => {
    return apiClient.post<RoleResponse>('/api/roles', data)
  },

  getRoleById: async (id: string): Promise<RoleResponse> => {
    return apiClient.get<RoleResponse>(`/api/roles/${id}`)
  },

  updateRole: async (id: string, data: UpdateRoleRequest): Promise<RoleResponse> => {
    return apiClient.put<RoleResponse>(`/api/roles/${id}`, data)
  },

  deleteRole: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/api/roles/${id}`)
  },

  // Clone a role
  cloneRole: async (id: string, newName: string): Promise<RoleResponse> => {
    return apiClient.post<RoleResponse>(`/api/roles/${id}/clone`, { name: newName })
  },

  // Permission management
  getPermissions: async (params?: {
    category?: string
    searchTerm?: string
  }): Promise<PermissionListResponse> => {
    return apiClient.get<PermissionListResponse>('/api/rolepermissions', { params })
  },

  getPermissionById: async (id: string): Promise<ApiResponse<Permission>> => {
    return apiClient.get<ApiResponse<Permission>>(`/api/rolepermissions/${id}`)
  },

  getPermissionCategories: async (): Promise<ApiResponse<Array<{
    name: string
    description: string
    count: number
  }>>> => {
    return apiClient.get<ApiResponse<Array<any>>>('/api/rolepermissions/categories')
  },

  // User role assignment
  assignRoleToUser: async (data: AssignRoleRequest): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/api/rolepermissions/assign', data)
  },

  bulkAssignRole: async (data: BulkAssignRoleRequest): Promise<ApiResponse<{
    assigned: number
    failed: Array<{ userId: string; error: string }>
  }>> => {
    return apiClient.post<ApiResponse<{
      assigned: number
      failed: Array<{ userId: string; error: string }>
    }>>('/api/rolepermissions/bulk-assign', data)
  },

  removeRoleFromUser: async (userId: string, roleId: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/api/rolepermissions/users/${userId}/roles/${roleId}`)
  },

  // Get user roles and permissions
  getUserRoles: async (userId: string): Promise<UserRolesResponse> => {
    return apiClient.get<UserRolesResponse>(`/api/rolepermissions/users/${userId}/roles`)
  },

  getUserPermissions: async (userId: string): Promise<ApiResponse<Permission[]>> => {
    return apiClient.get<ApiResponse<Permission[]>>(`/api/rolepermissions/users/${userId}/permissions`)
  },

  checkUserPermission: async (userId: string, permission: string): Promise<ApiResponse<{ hasPermission: boolean }>> => {
    return apiClient.get<ApiResponse<{ hasPermission: boolean }>>(`/api/rolepermissions/users/${userId}/has-permission/${permission}`)
  },

  // Current user permissions
  getMyRoles: async (): Promise<UserRolesResponse> => {
    return apiClient.get<UserRolesResponse>('/api/rolepermissions/my-roles')
  },

  getMyPermissions: async (): Promise<ApiResponse<Permission[]>> => {
    return apiClient.get<ApiResponse<Permission[]>>('/api/rolepermissions/my-permissions')
  },

  checkMyPermission: async (permission: string): Promise<ApiResponse<{ hasPermission: boolean }>> => {
    return apiClient.get<ApiResponse<{ hasPermission: boolean }>>(`/api/rolepermissions/check-permission/${permission}`)
  },

  // Role statistics
  getRoleStatistics: async (roleId: string): Promise<RoleStatisticsResponse> => {
    return apiClient.get<RoleStatisticsResponse>(`/api/roles/${roleId}/statistics`)
  },

  getRoleUsers: async (roleId: string, params?: {
    page?: number
    pageSize?: number
    searchTerm?: string
  }): Promise<ApiResponse<{
    users: Array<{
      id: string
      email: string
      name: string
      assignedAt: string
      expiresAt?: string
    }>
    totalCount: number
  }>> => {
    return apiClient.get<ApiResponse<{
      users: Array<any>
      totalCount: number
    }>>(`/api/roles/${roleId}/users`, { params })
  },

  // Role templates
  getRoleTemplates: async (): Promise<RoleTemplatesResponse> => {
    return apiClient.get<RoleTemplatesResponse>('/api/roles/templates')
  },

  createRoleFromTemplate: async (templateName: string, customizations?: {
    name?: string
    description?: string
    additionalPermissions?: string[]
    removePermissions?: string[]
  }): Promise<RoleResponse> => {
    return apiClient.post<RoleResponse>('/api/roles/from-template', {
      templateName,
      ...customizations
    })
  },

  // Bulk operations
  bulkUpdateRoles: async (updates: Array<{ id: string } & Partial<UpdateRoleRequest>>): Promise<ApiResponse<{
    updated: Role[]
    failed: Array<{ id: string; error: string }>
  }>> => {
    return apiClient.put<ApiResponse<{
      updated: Role[]
      failed: Array<{ id: string; error: string }>
    }>>('/api/roles/bulk-update', { updates })
  },

  bulkDeleteRoles: async (roleIds: string[]): Promise<ApiResponse<{
    deleted: number
    failed: Array<{ id: string; error: string }>
  }>> => {
    return apiClient.delete<ApiResponse<{
      deleted: number
      failed: Array<{ id: string; error: string }>
    }>>('/api/roles/bulk-delete', { roleIds })
  },

  // Export/Import
  exportRoles: async (format: 'json' | 'csv'): Promise<Blob> => {
    return apiClient.get<Blob>('/api/roles/export', {
      params: { format },
      responseType: 'blob'
    })
  },

  importRoles: async (file: File): Promise<ApiResponse<{
    imported: number
    updated: number
    failed: Array<{
      row: number
      error: string
    }>
  }>> => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post<ApiResponse<{
      imported: number
      updated: number
      failed: Array<{
        row: number
        error: string
      }>
    }>>('/api/roles/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Audit log
  getRoleAuditLog: async (roleId: string, params?: {
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{
    logs: Array<{
      id: string
      action: string
      userId: string
      userName: string
      changes: any
      timestamp: string
    }>
    totalCount: number
  }>> => {
    return apiClient.get<ApiResponse<{
      logs: Array<any>
      totalCount: number
    }>>(`/api/roles/${roleId}/audit-log`, { params })
  }
}