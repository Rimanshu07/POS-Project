import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, bulkCreateCategories } from '../services/api/categories';

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
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['categories']);
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions
  });
};

export const useUpdateCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['category', variables.id]);
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions
  });
};

export const useDeleteCategory = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['categories']);
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions
  });
};

export const useBulkCreateCategories = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: bulkCreateCategories,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions
  });
};
