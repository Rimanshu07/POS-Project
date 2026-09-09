import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/api/reports';

export const useSalesReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => reportsApi.getSales(params),
    keepPreviousData: true,
  });
};

export const useProductSalesReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'products', params],
    queryFn: () => reportsApi.getProducts(params),
    keepPreviousData: true,
  });
};

export const useCategorySalesReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'categories', params],
    queryFn: () => reportsApi.getCategories(params),
    keepPreviousData: true,
  });
};

export const usePaymentReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'payments', params],
    queryFn: () => reportsApi.getPayments(params),
    keepPreviousData: true,
  });
};

export const useTaxReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'tax', params],
    queryFn: () => reportsApi.getTax(params),
    keepPreviousData: true,
  });
};

export const useDailySalesReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'daily', params],
    queryFn: () => reportsApi.getDaily(params),
    keepPreviousData: true,
  });
};

export const useDailyProductDetails = (params, enabled = true) => {
  return useQuery({
    queryKey: ['reports', 'daily-details', params],
    queryFn: () => reportsApi.getDailyDetails(params),
    enabled: enabled && Boolean(params?.date),
  });
};

export const useMonthlySalesReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'monthly', params],
    queryFn: () => reportsApi.getMonthly(params),
    keepPreviousData: true,
  });
};

export const useMonthlyProductDetails = (params) => {
  return useQuery({
    queryKey: ['reports', 'monthly-products', params],
    queryFn: () => reportsApi.getMonthlyProducts(params),
    keepPreviousData: true,
  });
};
