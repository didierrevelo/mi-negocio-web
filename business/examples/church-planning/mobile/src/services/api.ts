import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () => api.get('/auth/me'),
  
  invite: (data: { email: string; name: string; phone?: string; ministryIds?: string[]; roleIds?: string[] }) =>
    api.post('/auth/invite', data)
};

// Services
export const servicesAPI = {
  getAll: () => api.get('/services'),
  
  getById: (id: string) => api.get(`/services/${id}`),
  
  create: (data: { title: string; date: string; time: string; type?: string; notes?: string }) =>
    api.post('/services', data),
  
  update: (id: string, data: any) =>
    api.patch(`/services/${id}`, data),
  
  delete: (id: string) => api.delete(`/services/${id}`)
};

// Segments
export const segmentsAPI = {
  getByService: (serviceId: string) =>
    api.get(`/services/${serviceId}/segments`),
  
  create: (serviceId: string, data: any) =>
    api.post(`/services/${serviceId}/segments`, data),
  
  update: (id: string, data: any) =>
    api.patch(`/services/segments/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/services/segments/${id}`)
};

// Team
export const teamAPI = {
  getByService: (serviceId: string) =>
    api.get(`/team/${serviceId}`),
  
  addMember: (serviceId: string, data: { userId: string; ministryId: string; ministryRoleId: string }) =>
    api.post(`/team/${serviceId}`, data),
  
  updateStatus: (id: string, data: { status: string; note?: string }) =>
    api.patch(`/team/${id}/status`, data),
  
  removeMember: (id: string) => api.delete(`/team/${id}`)
};

// Positions
export const positionsAPI = {
  getByService: (serviceId: string) =>
    api.get(`/team/positions/${serviceId}`),
  
  create: (serviceId: string, data: { ministryRoleId: string; userId?: string }) =>
    api.post(`/team/positions/${serviceId}`, data),
  
  respond: (id: string, status: 'accepted' | 'rejected') =>
    api.patch(`/team/positions/${id}/respond`, { status })
};

// Songs
export const songsAPI = {
  getByService: (serviceId: string) =>
    api.get(`/songs/${serviceId}`),
  
  create: (serviceId: string, data: any) =>
    api.post(`/songs/${serviceId}`, data),
  
  update: (id: string, data: any) =>
    api.patch(`/songs/${id}`, data),
  
  getHistory: (id: string) =>
    api.get(`/songs/${id}/history`),
  
  delete: (id: string) => api.delete(`/songs/${id}`)
};

// Ministries
export const ministriesAPI = {
  getAll: () => api.get('/ministries'),
  
  create: (name: string) =>
    api.post('/ministries', { name }),
  
  update: (id: string, data: any) =>
    api.patch(`/ministries/${id}`, data),
  
  getRoles: (id: string) =>
    api.get(`/ministries/${id}/roles`),
  
  createRole: (ministryId: string, name: string) =>
    api.post(`/ministries/${ministryId}/roles`, { name }),
  
  updateRole: (id: string, data: any) =>
    api.patch(`/ministries/roles/${id}`, data)
};

// Files
export const filesAPI = {
  getByService: (serviceId: string) =>
    api.get(`/files/${serviceId}`),
  
  upload: (serviceId: string, data: { filename: string; filetype: string; filesize: number; ministryId?: string }) =>
    api.post(`/files/${serviceId}/upload`, data),
  
  delete: (id: string) => api.delete(`/files/${id}`)
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllRead: () =>
    api.patch('/notifications/read-all')
};

export default api;
