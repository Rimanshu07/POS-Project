import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../services/api/categories';

export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['categories']);
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options
  });
};

export const useUpdateCategory = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['category', variables.id]);
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options
  });
};

export const useDeleteCategory = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['categories']);
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options
  });
};
