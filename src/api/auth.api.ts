import axiosInstance, { handleApiError } from './axios';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// API Service
class AuthAPI {
  private basePath = '/auth';

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        `${this.basePath}/register`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        `${this.basePath}/login`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await axiosInstance.get<User>('/users/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await axiosInstance.patch<User>('/users/me', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await axiosInstance.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await axiosInstance.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await axiosInstance.post('/auth/verify-email', { token });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Logout (clear token on server if needed)
   */
  async logout(): Promise<void> {
    try {
      // Optional: Call logout endpoint if backend tracks sessions
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    }
  }
}

export const authAPI = new AuthAPI();