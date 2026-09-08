import api from './axios';

export const createOrder = async (orderData) => {
  return await api.post('/orders', orderData);
};

export const getOrders = async (params) => {
  return await api.get('/orders', { params });
};

export const getOrderById = async (id) => {
  return await api.get(`/orders/${id}`);
};

export const getOrderInvoice = async (id) => {
  return await api.get(`/orders/${id}/invoice`);
};
