import api from './axios';

export const reportsApi = {
  getSales: (params) => api.get('/reports/sales', { params }),
  getProducts: (params) => api.get('/reports/products', { params }),
  getCategories: (params) => api.get('/reports/categories', { params }),
  getPayments: (params) => api.get('/reports/payments', { params }),
  getTax: (params) => api.get('/reports/tax', { params }),
  getDaily: (params) => api.get('/reports/daily', { params }),
  getDailyDetails: (params) => api.get('/reports/daily/details', { params }),
  getMonthly: (params) => api.get('/reports/monthly', { params }),
  getMonthlyProducts: (params) => api.get('/reports/monthly/products', { params })
};
