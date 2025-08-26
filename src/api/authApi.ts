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
  
  register: async (userData: { email: string; password: string; name: string }) => {
    const response = await authAPI.register({
      email: userData.email,
      password: userData.password,
      full_name: userData.name,
    });
    return {
      data: {
        user: {
          id: response.user.id,
          email: response.user.email,
          name: response.user.full_name || response.user.username,
          role: response.user.is_superuser ? 'admin' : 'user',
        },
        token: response.access_token,
        refreshToken: response.access_token,
      }
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
};

export default authApi;