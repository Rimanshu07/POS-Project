import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../services/api/users';

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options
  });
};

export const useUpdateUser = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options
  });
};

export const useDeleteUser = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options
  });
};
