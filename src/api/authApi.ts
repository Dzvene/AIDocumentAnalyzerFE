import { authAPI } from './auth.api';

// Re-export the authAPI as authApi for backward compatibility
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await authAPI.login(credentials);
    return {
      data: {
        user: {
          id: response.user.id,
          email: response.user.email,
          name: response.user.full_name || response.user.username,
          role: response.user.is_superuser ? 'admin' : 'user',
        },
        token: response.access_token,
        refreshToken: response.access_token, // Using same token for now
      }
    };
  },
  
  register: async (userData: { email: string; password: string; full_name: string }) => {
    const response = await authAPI.register({
      email: userData.email,
      password: userData.password,
      full_name: userData.full_name,
    });
    // Registration now returns email verification status
    return {
      data: response
    };
  },
  
  logout: async () => {
    await authAPI.logout();
  },
  
  refreshToken: async () => {
    // For now, just get the current user profile as a refresh check
    const user = await authAPI.getProfile();
    return {
      data: {
        token: localStorage.getItem('token') || '',
        refreshToken: localStorage.getItem('refreshToken') || '',
      }
    };
  },
  
  checkAuth: async () => {
    const user = await authAPI.getProfile();
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name || user.username,
          role: user.is_superuser ? 'admin' : 'user',
        }
      }
    };
  },
  
  forgotPassword: async (data: { email: string }) => {
    await authAPI.requestPasswordReset(data.email);
    return { data: { message: 'Password reset email sent' } };
  },
  
  resetPassword: async (token: string, password: string) => {
    await authAPI.resetPassword(token, password);
    return { data: { message: 'Password reset successful' } };
  },
  
  verifyEmail: async (token: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Email verification failed');
    }
    
    return { data: await response.json() };
  },
  
  resendVerification: async (email: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to resend verification email');
    }
    
    return { data: await response.json() };
  },
  
  googleCallback: async (code: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/oauth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Google authentication failed');
    }
    
    return { data: await response.json() };
  },
};

export default authApi;