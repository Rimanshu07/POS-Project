import api from './axios';

export const getDashboardData = async (params) => {
  const data = await api.get('/dashboard', { params });
  return data;
};
