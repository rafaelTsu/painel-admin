import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store'; // Pinia store

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // send cookies when cross-domain requests
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor for Auth Header
api.interceptors.request.use(
  (config) => {
    // We will read from localStorage for simplicity and reliability across refreshes
    // The Auth Store will keep localStorage in sync
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error normalization and Token Refresh
api.interceptors.response.use(
  (response) => {
      // If the response holds a new access token (e.g. from refresh endpoint call made manually?)
      // Usually checking is done on error.
      return response.data; // Unpack data
  }, 
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
        
        // If the error comes from the refresh endpoint itself, we are doomed -> Logout
        if (originalRequest.url.includes('/auth/refresh')) {
            const authStore = useAuthStore();
            authStore.logout();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({resolve, reject});
            }).then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return api(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Call refresh endpoint
            // We use a raw axios call to avoid interceptors just in case, but using `api` is okay if we handle the /refresh URL check above.
            // But to be cleaner, let's use the instance.
            const { accessToken } = await api.post('/auth/refresh');
            
            // Update Store
            const authStore = useAuthStore();
            authStore.setAuth(authStore.user, accessToken);
            
            // Process Queue
            processQueue(null, accessToken);
            
            // Retry Original
            originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
            return api(originalRequest);
        } catch (err) {
            processQueue(err, null);
            const authStore = useAuthStore();
            authStore.logout();
            window.location.href = '/login';
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }

    // Normalize error
    const message = error.response?.data?.message || 'An unexpected error occurred';
    const status = error.response?.status;
    const details = error.response?.data?.details; // If Joi validation errors
    
    const apiError = new Error(message);
    apiError.status = status;
    apiError.details = details;
    
    return Promise.reject(apiError);
  }
);

export default api;
