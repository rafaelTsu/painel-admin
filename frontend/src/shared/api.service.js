import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Response interceptor for error normalization
api.interceptors.response.use(
  (response) => response.data, // Unpack data
  (error) => {
    // Normalize error
    const message = error.response?.data?.message || 'An unexpected error occurred';
    const status = error.response?.status;
    const details = error.response?.data?.details; // If Joi validation errors
    
    const apiError = new Error(message);
    apiError.status = status;
    apiError.details = details;
    
    // Check for 401 and potentially redirect to login or clear token?
    // For now, just reject, let the caller or store handle it.
    
    return Promise.reject(apiError);
  }
);

export default api;
