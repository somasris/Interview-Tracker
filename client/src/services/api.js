import axios from 'axios';
import { getToken, logout } from '../utils/auth.js';

// ── Axios instance ────────────────────────────────────────────────────
const api = axios.create({
    baseURL: '/api',   // Proxied to http://localhost:5000/api via Vite
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

// Handle 401 globally — log the user out & reload
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// ── Applications ──────────────────────────────────────────────────────
export const applicationsAPI = {
    getAll: (params) => api.get('/applications', { params }),         // { search, result, page, limit }
    getById: (id) => api.get(`/applications/${id}`),
    create: (data) => api.post('/applications', data),
    update: (id, data) => api.put(`/applications/${id}`, data),
    delete: (id) => api.delete(`/applications/${id}`),
};

// ── Stages ────────────────────────────────────────────────────────────
export const stagesAPI = {
    getAll: (appId) => api.get(`/applications/${appId}/stages`),
    add: (appId, data) => api.post(`/applications/${appId}/stages`, data),
    update: (stageId, data) => api.put(`/stages/${stageId}`, data),
    complete: (stageId, data) => api.patch(`/stages/${stageId}/complete`, data),
    delete: (stageId) => api.delete(`/stages/${stageId}`),
    moveNext: (appId) => api.patch(`/applications/${appId}/move-next`),
};

// ── Templates ─────────────────────────────────────────────────────────
export const templatesAPI = {
    getAll: () => api.get('/templates'),
    getStages: (id) => api.get(`/templates/${id}/stages`),
};

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
};

export default api;
