import { useEffect } from 'react'
import { useAppDispatch } from '@store/hooks'
import { checkAuth, refreshTokenThunk } from '@store/slices/authSlice'
import { getToken, getRefreshToken, isTokenExpired } from '@utils/auth'

export const useAuthInit = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      const refreshToken = getRefreshToken()

      if (token && refreshToken) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Try to refresh the token
          try {
            await dispatch(refreshTokenThunk()).unwrap()
          } catch (error) {
            console.error('Failed to refresh token:', error)
            // Clear invalid tokens
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user_data')
          }
        } else {
          // Token is valid, get current user info
          try {
            await dispatch(checkAuth()).unwrap()
          } catch (error) {
            console.error('Failed to get current user:', error)
            // If we can't get user data but token exists, clear auth
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user_data')
          }
        }
      }
    }

    // Only run init if we don't already have auth state
    const existingUserData = localStorage.getItem('user_data')
    const existingToken = localStorage.getItem('token')
    
    if (existingToken && existingUserData) {
      // We have both token and user data, try to validate
      initAuth()
    }
  }, [dispatch])

  // Setup token refresh interval
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const token = getToken()
      const refreshToken = getRefreshToken()

      if (token && refreshToken && isTokenExpired(token)) {
        try {
          await dispatch(refreshTokenThunk()).unwrap()
        } catch (error) {
          console.error('Token refresh failed:', error)
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(refreshInterval)
  }, [dispatch])
}