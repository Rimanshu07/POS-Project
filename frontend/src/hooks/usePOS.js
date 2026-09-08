import { useMutation } from '@tanstack/react-query';
import { createOrder } from '../services/api/orders';

export const useCreateOrder = (options = {}) => {
  return useMutation({
    mutationFn: createOrder,
    ...options
  });
};
