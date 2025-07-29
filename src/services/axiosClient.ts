// axios.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { useNavigate } from 'react-router';

export const baseUrl = 'http://localhost:8890/api/v1'
// Crear una instancia de Axios con configuración predeterminada
const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl, // Cambia la URL base según tu API
  headers: {
    'Content-Type': 'application/json', // Tipo de contenido predeterminado
    // Agrega otros encabezados si es necesario (por ejemplo, para autenticación)
  },
  withCredentials:true,
});

// Configuración de interceptores para manejar respuestas o errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    // Aquí puedes agregar lógica para manejar respuestas exitosas
    return response;
  },
  (error) => {
        if (error.response && error.response.status === 401) {
            // Verificar si el usuario ya está en la página de login
            const currentPath = window.location.pathname; // Obtener la ruta actual
            if (currentPath !== '/login') {
                // Usamos useNavigate para redirigir sin recargar la página
                const navigate = useNavigate();
                navigate('/login'); // Redirige a la página de login
            }
        }
    return Promise.reject(error);
  }
);

// Exportar la instancia configurada
export default apiClient;

// Utilidad para manejar errores Axios de forma consistente
export function parseAxiosError(err: unknown, fallbackMsg: string) {
  const axiosError = err as AxiosError;

  if (axiosError.response?.data && typeof axiosError.response.data === "object") {
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
