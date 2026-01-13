import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// OAuth API
export const oauthApi = {
  initiateGoogle: () => api.get('/oauth/google'),
  initiateFacebook: () => api.get('/oauth/facebook'),
};

// Ad Accounts API
export const adAccountsApi = {
  getAll: () => api.get('/ad-accounts'),
  getOne: (id: string) => api.get(`/ad-accounts/${id}`),
  delete: (id: string) => api.delete(`/ad-accounts/${id}`),
  sync: (id: string, startDate: string, endDate: string) =>
    api.post(`/ad-accounts/${id}/sync`, { startDate, endDate }),
};

// Metrics API
export const metricsApi = {
  getUserMetrics: (params: {
    startDate: string;
    endDate: string;
    adAccountId?: string;
  }) => api.get('/metrics', { params }),
  getByAdAccount: (adAccountId: string, startDate: string, endDate: string) =>
    api.get(`/metrics/account/${adAccountId}`, {
      params: { startDate, endDate },
    }),
};

// Benchmarks API
export const benchmarksApi = {
  getBenchmarks: (params: {
    startDate: string;
    endDate: string;
    platform?: string;
  }) => api.get('/benchmarks', { params }),
  compareToBenchmark: (params: {
    startDate: string;
    endDate: string;
    platform?: string;
  }) => api.get('/benchmarks/compare', { params }),
  triggerCalculation: (data: {
    startDate: string;
    endDate: string;
    platform?: string;
  }) => api.post('/benchmarks/calculate', data),
};
