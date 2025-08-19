import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@api/authApi'
import { 
  AuthState, 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest,
  AuthApiError 
} from '@types/interfaces/auth'
import { setToken, setRefreshToken, setStoredUser, clearAuthData, getToken, getRefreshToken, getStoredUser } from '@utils/auth'

// Загружаем сохраненного пользователя и токен при инициализации
const storedUser = getStoredUser()
const token = getToken()

const initialState: AuthState = {
  user: storedUser,
  isAuthenticated: !!(storedUser && token),
  isLoading: false,
  error: null,
}

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      
      // Check if 2FA is required
      if ('requiresTwoFactor' in response && response.requiresTwoFactor) {
        return response // Return 2FA response
      }
      
      // Normal login flow
      if ('accessToken' in response) {
        setToken(response.accessToken)
        setRefreshToken(response.refreshToken)
        setStoredUser(response.user)
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed'
      return rejectWithValue(errorMessage)
    }
  }
)

export const verifyTwoFactorAsync = createAsyncThunk(
  'auth/verifyTwoFactor',
  async (data: { tempToken: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyTwoFactor(data)
      
      setToken(response.accessToken)
      setRefreshToken(response.refreshToken)
      setStoredUser(response.user)
      
      return response
    } catch (error: any) {
      const errorData = error.response?.data as AuthApiError
      return rejectWithValue(errorData?.message || '2FA verification failed')
    }
  }
)

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data)
      
      setToken(response.accessToken)
      setRefreshToken(response.refreshToken)
      setStoredUser(response.user)
      
      return response
    } catch (error: any) {
      const errorData = error.response?.data as AuthApiError
      return rejectWithValue(errorData?.message || 'Registration failed')
    }
  }
)

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = getToken()
      const refreshToken = getRefreshToken()
      
      if (!accessToken || !refreshToken) {
        throw new Error('No tokens available')
      }

      const tokenData: RefreshTokenRequest = {
        accessToken,
        refreshToken
      }
      
      const response = await authApi.refreshToken(tokenData)
      
      setToken(response.accessToken)
      setRefreshToken(response.refreshToken)
      setStoredUser(response.user)
      
      return response
    } catch (error: any) {
      clearAuthData()
      const errorData = error.response?.data as AuthApiError
      return rejectWithValue(errorData?.message || 'Token refresh failed')
    }
  }
)

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
      clearAuthData()
    } catch (error: any) {
      // Clear data even if logout request fails
      clearAuthData()
      const errorData = error.response?.data as AuthApiError
      return rejectWithValue(errorData?.message || 'Logout failed')
    }
  }
)

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser()
      setStoredUser(user)
      return user
    } catch (error: any) {
      const errorData = error.response?.data as AuthApiError
      return rejectWithValue(errorData?.message || 'Failed to get user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      clearAuthData()
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false
        // Check if 2FA is required
        if ('requiresTwoFactor' in action.payload && action.payload.requiresTwoFactor) {
          // Don't set authenticated yet, waiting for 2FA
          state.error = null
        } else {
          // Normal login success
          state.user = action.payload.user
          state.isAuthenticated = true
          state.error = null
        }
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
      })

    // Verify 2FA
    builder
      .addCase(verifyTwoFactorAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyTwoFactorAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(verifyTwoFactorAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
      })

    // Refresh Token
    builder
      .addCase(refreshTokenAsync.pending, (state) => {
        // Don't set loading for background token refresh
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
      })

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })

    // Get current user
    builder
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
      })
  },
})

export const { clearError, setUser, clearAuth } = authSlice.actions
export { verifyTwoFactorAsync }
export default authSlice.reducer