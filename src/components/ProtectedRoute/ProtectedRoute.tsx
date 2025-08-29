import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@store/hooks'
import { ROUTES } from '@constants/routes'
import { LoadingSpinner } from '@components'
import { getToken } from '@utils/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)
  const hasToken = !!getToken()
  const hasUserData = !!localStorage.getItem('user_data')

  // If we have tokens and user data but auth hasn't been restored yet, show loading
  if (hasToken && hasUserData && !user && !isLoading) {
    return <LoadingSpinner />
  }

  // If loading auth state, show loading spinner
  if (isLoading) {
    return <LoadingSpinner />
  }

  // If not authenticated and no token, redirect to login
  if (!isAuthenticated && !hasToken) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // If we have a token but not authenticated yet, show loading
  if (hasToken && !isAuthenticated) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}