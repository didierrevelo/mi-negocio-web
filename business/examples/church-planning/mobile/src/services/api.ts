// ============================================
// SERVICIO API - CHURCH PLANNING MOBILE
// ============================================
// Qué: Cliente HTTP para comunicar la app con el backend
// Cómo: Usa Axios con interceptores para auth automática
// Conecta: Con backend routes/, con AsyncStorage para tokens
// Seguridad: Token JWT en cada request, HTTPS

// Axios: Library HTTP para hacer requests al backend
// Conecta: Con backend routes/ (auth, services, team, songs, files, notifications)
import axios from 'axios';

// AsyncStorage: Almacenamiento local en React Native
// Conecta: Con LoginScreen (guarda token), con ProfileScreen (lee usuario)
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base del backend
// En desarrollo: localhost
// En producción: URL de Railway
// Conecta: Con PRODUCTION.md (Railway URL)
const API_URL = __DEV__ 
  ? 'http://localhost:3000' 
  : 'https://church-planning-api.up.railway.app';

// ============================================
// INSTANCIA DE AXIOS
// ============================================
// Qué: Crea cliente HTTP con configuración base
// Seguridad: HTTPS en producción
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,  // 10 segundos timeout
});

// ============================================
// INTERCEPTOR DE REQUESTS
// ============================================
// Qué: Agrega token JWT a cada request automáticamente
// Cómo: Lee token de AsyncStorage y lo agrega al header
// Seguridad: Token se renueva con refresh
// Conecta: Con authAPI.login (guarda token), con middleware/auth.ts (verifica)
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// INTERCEPTOR DE RESPONSES
// ============================================
// Qué: Maneja errores 401 (token expirado)
// Cómo: Limpia storage y redirige a login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      // El navigator se encarga de redirigir a Login
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
// Qué: Login, obtener perfil, invitar usuarios
// Conecta: Con routes/auth.ts, con LoginScreen.tsx, ProfileScreen.tsx
export const authAPI = {
  // Login: Retorna token y datos de usuario
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  // Obtener perfil del usuario autenticado
  getMe: () => api.get('/auth/me'),
  
  // Invitar usuario (solo admin)
  invite: (data: { email: string; name: string; phone?: string; ministryIds?: string[]; roleIds?: string[] }) =>
    api.post('/auth/invite', data)
};

// ============================================
// SERVICES API
// ============================================
// Qué: CRUD de servicios y segmentos
// Conecta: Con routes/services.ts, con HomeScreen.tsx, ServiceDetailScreen.tsx
export const servicesAPI = {
  // Listar todos los servicios
  getAll: () => api.get('/services'),
  
  // Obtener detalle de un servicio (con equipo, songs, files)
  getById: (id: string) => api.get(`/services/${id}`),
  
  // Crear servicio (solo admin)
  create: (data: { title: string; date: string; time: string; type?: string; notes?: string }) =>
    api.post('/services', data),
  
  // Actualizar servicio
  update: (id: string, data: any) =>
    api.patch(`/services/${id}`, data),
  
  // Eliminar servicio
  delete: (id: string) => api.delete(`/services/${id}`)
};

// ============================================
// SEGMENTS API
// ============================================
// Qué: CRUD de segmentos del orden del culto
// Conecta: Con routes/services.ts (segments endpoints)
export const segmentsAPI = {
  // Listar segmentos de un servicio
  getByService: (serviceId: string) =>
    api.get(`/services/${serviceId}/segments`),
  
  // Crear segmento
  create: (serviceId: string, data: any) =>
    api.post(`/services/${serviceId}/segments`, data),
  
  // Actualizar segmento (reordenar, editar)
  update: (id: string, data: any) =>
    api.patch(`/services/segments/${id}`, data),
  
  // Eliminar segmento
  delete: (id: string) =>
    api.delete(`/services/segments/${id}`)
};

// ============================================
// TEAM API
// ============================================
// Qué: Asignación de personas a servicios
// Conecta: Con routes/team.ts, con ServiceDetailScreen.tsx
export const teamAPI = {
  // Obtener equipo agrupado por ministerio
  getByService: (serviceId: string) =>
    api.get(`/team/${serviceId}`),
  
  // Asignar persona al equipo
  addMember: (serviceId: string, data: { userId: string; ministryId: string; ministryRoleId: string }) =>
    api.post(`/team/${serviceId}`, data),
  
  // Actualizar estado (confirmado/no puede/inconveniente)
  updateStatus: (id: string, data: { status: string; note?: string }) =>
    api.patch(`/team/${id}/status`, data),
  
  // Eliminar persona del equipo
  removeMember: (id: string) => api.delete(`/team/${id}`)
};

// ============================================
// POSITIONS API
// ============================================
// Qué: Solicitudes de instrumentos/posiciones
// Conecta: Con routes/team.ts (positions endpoints)
export const positionsAPI = {
  // Listar posiciones solicitadas
  getByService: (serviceId: string) =>
    api.get(`/team/positions/${serviceId}`),
  
  // Crear solicitud de posición
  create: (serviceId: string, data: { ministryRoleId: string; userId?: string }) =>
    api.post(`/team/positions/${serviceId}`, data),
  
  // Responder solicitud (aceptar/rechazar)
  respond: (id: string, status: 'accepted' | 'rejected') =>
    api.patch(`/team/positions/${id}/respond`, { status })
};

// ============================================
// SONGS API
// ============================================
// Qué: Set list musical
// Conecta: Con routes/songs.ts, con SongsScreen.tsx
export const songsAPI = {
  // Listar canciones del servicio
  getByService: (serviceId: string) =>
    api.get(`/songs/${serviceId}`),
  
  // Agregar canción al set list
  create: (serviceId: string, data: any) =>
    api.post(`/songs/${serviceId}`, data),
  
  // Actualizar canción (tono, letra, partitura)
  update: (id: string, data: any) =>
    api.patch(`/songs/${id}`, data),
  
  // Obtener historial de cambios
  getHistory: (id: string) =>
    api.get(`/songs/${id}/history`),
  
  // Eliminar canción
  delete: (id: string) => api.delete(`/songs/${id}`)
};

// ============================================
// MINISTRIES API
// ============================================
// Qué: CRUD de ministerios y roles
// Conecta: Con routes/ministries.ts
export const ministriesAPI = {
  // Listar ministerios activos
  getAll: () => api.get('/ministries'),
  
  // Crear ministerio (solo admin)
  create: (name: string) =>
    api.post('/ministries', { name }),
  
  // Actualizar ministerio
  update: (id: string, data: any) =>
    api.patch(`/ministries/${id}`, data),
  
  // Listar roles de un ministerio
  getRoles: (id: string) =>
    api.get(`/ministries/${id}/roles`),
  
  // Crear rol en ministerio
  createRole: (ministryId: string, name: string) =>
    api.post(`/ministries/${ministryId}/roles`, { name }),
  
  // Actualizar rol
  updateRole: (id: string, data: any) =>
    api.patch(`/ministries/roles/${id}`, data)
};

// ============================================
// FILES API
// ============================================
// Qué: Subida y gestión de archivos
// Conecta: Con routes/files.ts, con AWS S3 (presigned URLs)
export const filesAPI = {
  // Listar archivos del servicio
  getByService: (serviceId: string) =>
    api.get(`/files/${serviceId}`),
  
  // Obtener presigned URL para subir a S3
  upload: (serviceId: string, data: { filename: string; filetype: string; filesize: number; ministryId?: string }) =>
    api.post(`/files/${serviceId}/upload`, data),
  
  // Eliminar archivo
  delete: (id: string) => api.delete(`/files/${id}`)
};

// ============================================
// NOTIFICATIONS API
// ============================================
// Qué: Notificaciones del usuario
// Conecta: Con routes/notifications.ts, con ProfileScreen.tsx
export const notificationsAPI = {
  // Listar notificaciones
  getAll: () => api.get('/notifications'),
  
  // Contar no leídas (para badge)
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  // Marcar una como leída
  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  // Marcar todas como leídas
  markAllRead: () =>
    api.patch('/notifications/read-all')
};

export default api;
