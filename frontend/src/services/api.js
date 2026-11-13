import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lrb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  getMe: () => api.get('/auth/me')
};

export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  checkAvailability: (id, params) => api.get(`/resources/${id}/availability`, { params }),
  create: (payload) => api.post('/resources', payload),
  update: (id, payload) => api.put(`/resources/${id}`, payload),
  remove: (id) => api.delete(`/resources/${id}`)
};

export const bookingAPI = {
  create: (payload) => api.post('/bookings', payload),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  getAllAdmin: (params) => api.get('/bookings', { params }),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  getStats: () => api.get('/bookings/stats')
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`)
};

export default api;

