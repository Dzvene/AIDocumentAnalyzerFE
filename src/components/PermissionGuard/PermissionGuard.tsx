import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@store/hooks'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@constants/routes'

interface PermissionGuardProps {
  children: React.ReactNode
  permissions?: string[]
  roles?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback,
  redirectTo = ROUTES.HOME
}) => {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Check role-based access
  const hasRequiredRole = () => {
    if (roles.length === 0) return true
    
    if (requireAll) {
      return roles.every(role => user.roles?.includes(role))
    }
    return roles.some(role => user.roles?.includes(role))
  }

  // Check permission-based access
  const hasRequiredPermission = () => {
    if (permissions.length === 0) return true
    
    const userPermissions = user.permissions || []
    
    if (requireAll) {
      return permissions.every(permission => userPermissions.includes(permission))
    }
    return permissions.some(permission => userPermissions.includes(permission))
  }

  // Check if user has access
  const hasAccess = hasRequiredRole() && hasRequiredPermission()

  if (!hasAccess) {
    // If fallback component provided, render it
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Otherwise redirect
    return <Navigate to={redirectTo} replace />
  }

  // User has access, render children
  return <>{children}</>
}

// Hook for checking permissions programmatically
export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth)
  
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false
  }
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false
    return permissions.some(permission => user.permissions!.includes(permission))
  }
  
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user?.permissions) return false
    return permissions.every(permission => user.permissions!.includes(permission))
  }
  
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false
  }
  
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.roles) return false
    return roles.some(role => user.roles.includes(role))
  }
  
  const hasAllRoles = (roles: string[]): boolean => {
    if (!user?.roles) return false
    return roles.every(role => user.roles.includes(role))
  }
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    userPermissions: user?.permissions || [],
    userRoles: user?.roles || []
  }
}