import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@constants/common'
import { User } from '@types/interfaces/auth'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token)
}

export const removeRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem(USER_STORAGE_KEY)
  if (userData) {
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }
  return null
}

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export const removeStoredUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY)
}

export const clearAuthData = (): void => {
  removeToken()
  removeRefreshToken()
  removeStoredUser()
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch {
    return true
  }
}