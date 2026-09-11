import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api/axios';
import { LOGIN_ROUTE } from '../routes/routePaths';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const data = await api.get('/auth/me');
        // Backend returns { user: {...} }, axios interceptor unwraps data wrapper
        return data?.user || null;
      } catch (err) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: (responseData) => {
      // Login returns { user: {...} }, extract the user object directly
      queryClient.setQueryData(['auth', 'me'], responseData?.user || responseData);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      window.location.href = LOGIN_ROUTE;
    }
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  };
};
