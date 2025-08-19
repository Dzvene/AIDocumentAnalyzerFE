// Backend DTOs for Roles & Permissions (RBAC) module
import { ApiResponse } from './auth.dto'

export interface Permission {
  id: string
  name: string
  category: string
  description: string
  resource?: string
  action?: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem: boolean
  isDefault: boolean
  priority: number
  createdAt: string
  updatedAt: string
  usersCount?: number
}

export interface CreateRoleRequest {
  name: string
  description: string
  permissions: string[] // Permission IDs
  isDefault?: boolean
  priority?: number
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[] // Permission IDs
  isDefault?: boolean
  priority?: number
}

export interface RoleSearchParams {
  searchTerm?: string
  isSystem?: boolean
  isDefault?: boolean
  category?: string
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'priority' | 'created' | 'users'
  sortDirection?: 'asc' | 'desc'
}

export interface UserRole {
  userId: string
  roleId: string
  role: Role
  assignedAt: string
  assignedBy?: string
  expiresAt?: string
}

export interface AssignRoleRequest {
  userId: string
  roleId: string
  expiresAt?: string
}

export interface BulkAssignRoleRequest {
  userIds: string[]
  roleId: string
  expiresAt?: string
}

export interface PermissionCategory {
  name: string
  description: string
  permissions: Permission[]
  icon?: string
}

// Permission categories enum
export enum PermissionCategories {
  USER_MANAGEMENT = 'User Management',
  VENDOR_MANAGEMENT = 'Vendor Management',
  PRODUCT_MANAGEMENT = 'Product Management',
  ORDER_MANAGEMENT = 'Order Management',
  BILLING = 'Billing',
  REPORTS = 'Reports',
  SETTINGS = 'Settings',
  CONTENT_MANAGEMENT = 'Content Management',
  MARKETING = 'Marketing',
  SUPPORT = 'Support',
  SYSTEM = 'System'
}

// Common permissions enum
export enum Permissions {
  // User Management
  VIEW_USERS = 'users.view',
  CREATE_USERS = 'users.create',
  EDIT_USERS = 'users.edit',
  DELETE_USERS = 'users.delete',
  MANAGE_USER_ROLES = 'users.roles',
  
  // Vendor Management
  VIEW_VENDORS = 'vendors.view',
  CREATE_VENDORS = 'vendors.create',
  EDIT_VENDORS = 'vendors.edit',
  DELETE_VENDORS = 'vendors.delete',
  APPROVE_VENDORS = 'vendors.approve',
  VERIFY_VENDORS = 'vendors.verify',
  
  // Product Management
  VIEW_PRODUCTS = 'products.view',
  CREATE_PRODUCTS = 'products.create',
  EDIT_PRODUCTS = 'products.edit',
  DELETE_PRODUCTS = 'products.delete',
  APPROVE_PRODUCTS = 'products.approve',
  
  // Order Management
  VIEW_ORDERS = 'orders.view',
  EDIT_ORDERS = 'orders.edit',
  CANCEL_ORDERS = 'orders.cancel',
  REFUND_ORDERS = 'orders.refund',
  
  // Billing
  VIEW_BILLING = 'billing.view',
  MANAGE_BILLING = 'billing.manage',
  PROCESS_PAYMENTS = 'billing.payments',
  MANAGE_SUBSCRIPTIONS = 'billing.subscriptions',
  
  // Reports
  VIEW_REPORTS = 'reports.view',
  GENERATE_REPORTS = 'reports.generate',
  EXPORT_REPORTS = 'reports.export',
  
  // Marketing
  VIEW_CAMPAIGNS = 'marketing.campaigns.view',
  CREATE_CAMPAIGNS = 'marketing.campaigns.create',
  EDIT_CAMPAIGNS = 'marketing.campaigns.edit',
  DELETE_CAMPAIGNS = 'marketing.campaigns.delete',
  APPROVE_CAMPAIGNS = 'marketing.campaigns.approve',
  
  // System
  VIEW_SETTINGS = 'system.settings.view',
  EDIT_SETTINGS = 'system.settings.edit',
  VIEW_LOGS = 'system.logs.view',
  MANAGE_INTEGRATIONS = 'system.integrations',
  SYSTEM_ADMIN = 'system.admin'
}

// Default roles
export enum DefaultRoles {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  VENDOR_OWNER = 'Vendor Owner',
  VENDOR_MANAGER = 'Vendor Manager',
  VENDOR_STAFF = 'Vendor Staff',
  CUSTOMER = 'Customer',
  SUPPORT_AGENT = 'Support Agent',
  MARKETING_MANAGER = 'Marketing Manager',
  CONTENT_EDITOR = 'Content Editor',
  ANALYST = 'Analyst'
}

export interface RoleTemplate {
  name: string
  description: string
  suggestedPermissions: string[]
  category: string
}

export interface RoleStatistics {
  roleId: string
  totalUsers: number
  activeUsers: number
  recentActivity: Array<{
    userId: string
    userName: string
    action: string
    timestamp: string
  }>
  permissionUsage: Array<{
    permissionId: string
    permissionName: string
    usageCount: number
  }>
}

// Response types
export interface RoleListResponse extends ApiResponse<{
  roles: Role[]
  totalCount: number
  page: number
  pageSize: number
}> {}

export interface RoleResponse extends ApiResponse<Role> {}

export interface PermissionListResponse extends ApiResponse<{
  permissions: Permission[]
  categories: PermissionCategory[]
  totalCount: number
}> {}

export interface UserRolesResponse extends ApiResponse<{
  userRoles: UserRole[]
  effectivePermissions: Permission[]
}> {}

export interface RoleStatisticsResponse extends ApiResponse<RoleStatistics> {}

export interface RoleTemplatesResponse extends ApiResponse<RoleTemplate[]> {}