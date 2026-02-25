import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const workshopAPI = {
  create: (data) => axios.post(`${API_URL}/workshops`, data, { headers: getAuthHeader() }),
  getMy: () => axios.get(`${API_URL}/workshops/me`, { headers: getAuthHeader() }),
  update: (id, data) => axios.put(`${API_URL}/workshops/${id}`, data, { headers: getAuthHeader() }),
  createInviteCode: (id) => axios.post(`${API_URL}/workshops/${id}/invite-codes`, {}, { headers: getAuthHeader() }),
  getInviteCodes: (id) => axios.get(`${API_URL}/workshops/${id}/invite-codes`, { headers: getAuthHeader() })
};

export const managerAPI = {
  getAll: () => axios.get(`${API_URL}/managers`, { headers: getAuthHeader() }),
  remove: (id) => axios.delete(`${API_URL}/managers/${id}`, { headers: getAuthHeader() })
};

export const jobAPI = {
  create: (data) => axios.post(`${API_URL}/jobs`, data, { headers: getAuthHeader() }),
  getAll: (params) => axios.get(`${API_URL}/jobs`, { params, headers: getAuthHeader() }),
  getById: (id) => axios.get(`${API_URL}/jobs/${id}`, { headers: getAuthHeader() }),
  update: (id, data) => axios.put(`${API_URL}/jobs/${id}`, data, { headers: getAuthHeader() })
};

export const paymentAPI = {
  create: (data) => axios.post(`${API_URL}/payments`, data, { headers: getAuthHeader() }),
  getAll: (params) => axios.get(`${API_URL}/payments`, { params, headers: getAuthHeader() }),
  confirm: (id) => axios.put(`${API_URL}/payments/${id}/confirm`, {}, { headers: getAuthHeader() })
};

export const settlementAPI = {
  create: (data) => axios.post(`${API_URL}/settlements`, data, { headers: getAuthHeader() }),
  getAll: (params) => axios.get(`${API_URL}/settlements`, { params, headers: getAuthHeader() }),
  confirm: (id) => axios.put(`${API_URL}/settlements/${id}/confirm`, {}, { headers: getAuthHeader() })
};

export const analyticsAPI = {
  getDashboard: () => axios.get(`${API_URL}/analytics/dashboard`, { headers: getAuthHeader() }),
  exportData: () => axios.get(`${API_URL}/analytics/export`, { 
    headers: getAuthHeader(),
    responseType: 'blob'
  })
};

export const documentAPI = {
  getJobCard: (jobId) => axios.get(`${API_URL}/documents/job-card/${jobId}`, {
    headers: getAuthHeader(),
    responseType: 'blob'
  }),
  getInvoice: (jobId) => axios.get(`${API_URL}/documents/invoice/${jobId}`, {
    headers: getAuthHeader(),
    responseType: 'blob'
  })
};
