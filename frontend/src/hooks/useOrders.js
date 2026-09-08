import { useQuery } from '@tanstack/react-query';
import { getOrders, getOrderById, getOrderInvoice } from '../services/api/orders';

export const useOrders = (params) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
    keepPreviousData: true,
  });
};

export const useOrderDetails = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
};

export const useOrderInvoice = (id) => {
  return useQuery({
    queryKey: ['order-invoice', id],
    queryFn: () => getOrderInvoice(id),
    enabled: !!id,
  });
};
