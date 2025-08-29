import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@api/authApi';
import type { RootState } from '@store/store';

interface User {
  id: string | number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Check for existing auth data on initialization
const existingToken = localStorage.getItem('token');
const existingRefreshToken = localStorage.getItem('refreshToken');
const existingUserData = localStorage.getItem('user_data');

let initialUser = null;
if (existingUserData) {
  try {
    initialUser = JSON.parse(existingUserData);
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    localStorage.removeItem('user_data');
  }
}

const initialState: AuthState = {
  user: initialUser,
  token: existingToken,
  refreshToken: existingRefreshToken,
  isAuthenticated: !!(existingToken && initialUser),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    return response.data;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; full_name: string }) => {
    const response = await authApi.register(userData);
    return response.data;
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ token }: { token: string }) => {
    const response = await authApi.verifyEmail(token);
    return response.data;
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async ({ email }: { email: string }) => {
    const response = await authApi.resendVerification(email);
    return response.data;
  }
);

export const handleGoogleCallback = createAsyncThunk(
  'auth/googleCallback',
  async ({ code }: { code: string }) => {
    const response = await authApi.googleCallback(code);
    return response.data;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async () => {
    const response = await authApi.refreshToken();
    return response.data;
  }
);

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const response = await authApi.checkAuth();
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user_data', JSON.stringify(user));
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user_data');
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('user_data', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        // After registration, user needs to verify email
        // Don't set authenticated until email is verified
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_data');
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('user_data', JSON.stringify(action.payload.user));
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_data');
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      // Email verification
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.access_token);
        localStorage.setItem('user_data', JSON.stringify(action.payload.user));
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Email verification failed';
      })
      // Google OAuth
      .addCase(handleGoogleCallback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleGoogleCallback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.access_token);
        localStorage.setItem('user_data', JSON.stringify(action.payload.user));
      })
      .addCase(handleGoogleCallback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Google sign-in failed';
      });
  },
});

export const { setCredentials, clearAuth, setError, clearError } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;