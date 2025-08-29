import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '@store/store';
import { clearAuth } from '@store/slices/authSlice';
import { showErrorNotification } from '@store/slices/notificationSlice';

// API Base Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5055/api';

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
  console.log('ENV API URL:', process.env.REACT_APP_API_URL);
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token or logout
      store.dispatch(clearAuth());
      store.dispatch(showErrorNotification(
        'Сессия истекла',
        'Пожалуйста, войдите снова.'
      ));
      
      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (!error.response) {
      store.dispatch(showErrorNotification(
        'Ошибка сети',
        'Проверьте подключение к интернету.'
      ));
    }
    
    // Handle server errors
    if (error.response?.status && error.response.status >= 500) {
      store.dispatch(showErrorNotification(
        'Ошибка сервера',
        'Попробуйте позже.'
      ));
    }
    
    return Promise.reject(error);
  }
);

// Helper function for file uploads
export const createFormData = (file: File, additionalData?: Record<string, any>): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.keys(additionalData).forEach(key => {
      const value = additionalData[key];
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
  }
  
  return formData;
};

// Helper function for handling API errors
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
    
    return {
      message: axiosError.response?.data?.detail || 
               axiosError.response?.data?.message || 
               axiosError.message || 
               'Произошла неизвестная ошибка',
      status: axiosError.response?.status,
      details: axiosError.response?.data,
    };
  }
  
  return {
    message: error.message || 'Произошла неизвестная ошибка',
    details: error,
  };
};

export default axiosInstance;