import api from './axios';

export const getCategories = async (params) => {
  return await api.get('/categories', { params });
};

export const getCategoryById = async (id) => {
  return await api.get(`/categories/${id}`);
};

export const createCategory = async (data) => {
  return await api.post('/categories', data);
};

export const updateCategory = async ({ id, data }) => {
  return await api.patch(`/categories/${id}`, data);
};

export const deleteCategory = async (id) => {
  return await api.delete(`/categories/${id}`);
};

export const bulkCreateCategories = async (categories) => {
  return await api.post('/categories/bulk', { categories });
};
