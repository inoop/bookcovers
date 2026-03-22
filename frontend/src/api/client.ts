import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const isLocalDev = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').includes('localhost');

// Request interceptor for auth token / dev header injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // In local dev, send role and user ID headers
  if (isLocalDev) {
    const devRole = localStorage.getItem('dev_role') || 'admin';
    const devUserId = localStorage.getItem('dev_user_id') || 'dev-admin-001';
    config.headers['X-Dev-Role'] = devRole;
    config.headers['X-Dev-User-Id'] = devUserId;
  }

  return config;
});

// Response interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
