import { useEffect } from 'react'
import { useAppDispatch } from '@store/hooks'
import { getCurrentUserAsync, refreshTokenAsync } from '@store/slices/authSlice'
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
            await dispatch(refreshTokenAsync()).unwrap()
          } catch (error) {
            console.error('Failed to refresh token:', error)
            // Token refresh failed, user needs to login again
          }
        } else {
          // Token is valid, get current user info
          try {
            await dispatch(getCurrentUserAsync()).unwrap()
          } catch (error) {
            console.error('Failed to get current user:', error)
          }
        }
      }
    }

    initAuth()
  }, [dispatch])

  // Setup token refresh interval
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const token = getToken()
      const refreshToken = getRefreshToken()

      if (token && refreshToken && isTokenExpired(token)) {
        try {
          await dispatch(refreshTokenAsync()).unwrap()
        } catch (error) {
          console.error('Token refresh failed:', error)
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(refreshInterval)
  }, [dispatch])
}