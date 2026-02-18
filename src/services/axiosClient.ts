import axios, { AxiosError, type AxiosInstance } from 'axios';


const isBrowser = typeof window !== 'undefined';

// @ts-ignore
const runtimeEnv = isBrowser ? window.ENV : undefined;


export const VITE_API_URL = runtimeEnv?.VITE_API_URL || import.meta.env.VITE_API_URL;
export const baseUrl = VITE_API_URL + '/api/v1';

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


apiClient.interceptors.request.use(
  (config) => {
    // Solo usamos 'localStorage' si estamos en un navegador
    if (isBrowser) {
      const token = localStorage.getItem("token"); // O donde sea que guardes el token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response, // respuestas exitosas
  (error: AxiosError) => {
    // Solo usamos 'window.location' si estamos en un navegador
    if (isBrowser && error.response?.status === 401) {
      const currentPath = window.location.pathname;

      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Utilidad para manejar errores (esta parte estaba perfecta)
export function parseAxiosError(err: unknown, fallbackMsg: string) {
  const axiosError = err as AxiosError;

  if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
    const data = axiosError.response.data as any;
    return {
      status: axiosError.response.status,
      message: data.message || fallbackMsg,
    };
  }

  return {
    status: 500,
    message: fallbackMsg,
  };
}

export default apiClient;