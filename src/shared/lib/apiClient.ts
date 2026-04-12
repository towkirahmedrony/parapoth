import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://parapoth-backend.onrender.com/api/v1';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
    'x-app-version': APP_VERSION,
  },
});

/**
 * Request Interceptor: Auto inject Supabase session token
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Supabase session fetch error:', error.message);
      }
      
      if (session?.access_token && config.headers) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Auth intercepter error:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Handle global errors like 401 Unauthorized
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request. Dispatching logout event.');
      // Dispatch a custom event so the app (e.g., AuthProvider) can listen and force logout
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
