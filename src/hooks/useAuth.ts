import { useAppSelector } from '../store/hooks';

// Hook for accessing auth data using Redux
export const useAuth = () => {
  const authState = useAppSelector((state) => state.auth);
  
  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error
  };
};