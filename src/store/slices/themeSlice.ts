import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { THEME_STORAGE_KEY } from '@constants/common'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  isDark: boolean
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme
  return stored || 'system'
}

const getIsDark = (theme: Theme): boolean => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return theme === 'dark'
}

const initialState: ThemeState = {
  theme: getInitialTheme(),
  isDark: getIsDark(getInitialTheme()),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
      state.isDark = getIsDark(action.payload)
      
      localStorage.setItem(THEME_STORAGE_KEY, action.payload)
      
      // Update document attribute
      if (state.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      state.theme = newTheme
      state.isDark = getIsDark(newTheme)
      
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      
      // Update document attribute
      if (state.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    },
    initializeTheme: (state) => {
      // Initialize theme on app start
      if (state.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
      
      // Listen for system theme changes
      if (state.theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
          state.isDark = e.matches
          if (e.matches) {
            document.documentElement.setAttribute('data-theme', 'dark')
          } else {
            document.documentElement.removeAttribute('data-theme')
          }
        }
        mediaQuery.addEventListener('change', handleChange)
      }
    },
  },
})

export const { setTheme, toggleTheme, initializeTheme } = themeSlice.actions
export default themeSlice.reducer