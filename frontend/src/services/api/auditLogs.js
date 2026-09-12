import api from './axios';

export const getAuditLogs = async (params) => {
  return await api.get('/audit-logs', { params });
};
