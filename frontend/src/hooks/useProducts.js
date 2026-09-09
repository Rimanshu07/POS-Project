import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../services/api/products';

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['products']);
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions
  });
};

export const useUpdateProduct = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', variables.id]);
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions
  });
};

export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['products']);
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions
  });
};
