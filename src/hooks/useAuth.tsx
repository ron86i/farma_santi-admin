import { useEffect, useState } from "react";
import { Message } from "@/models";

import { logIn, logOut, refreshToken, verifyToken } from "@/services";
import { useNavigate } from "react-router";

type cookieName = "exp-access-token" | "exp-refresh-token"



export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await logIn(credentials); // ✅ Llama a la función real de login
      setMessage({message: response.message });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, message };
}



export function useLogOut() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const logOutUser = async () => {
    setLoading(true);
    setError(null); // Resetear el error antes de intentar el logout
    try {
      const response = await logOut(); // Llama a la función de logout
      setMessage(response); // Guardar la respuesta
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido"); // Manejo de error
    } finally {
      setLoading(false);
    }
  };

  // Retornamos solo la función logOutUser y los estados que necesitamos
  return { message, loading, error, logOutUser };
}


export function useRefreshToken() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, _] = useState<Message | null>(null);

  const refreshAccessToken = async () => {
    setLoading(true);
    setError(null); // Resetear el error antes de intentar refrescar el token
    try {
      await refreshToken(); // Llama a la función de refresh
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido"); // Manejo de error
    } finally {
      setLoading(false);
    }
  };

  return { message, loading, error, refreshAccessToken };
}


const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

const refreshCookie = async (cookieName: string, refreshAccessToken: () => Promise<void>, navigate: Function) => {
  const expire = getCookie(cookieName); // Obtener la cookie con el nombre proporcionado

  if (expire != null) {
    const expireTime = parseInt(expire, 10) * 1000; // Convertir a milisegundos
    const now = Date.now();
    const timeLeft = expireTime - now;

    // Si quedan menos de 2 minutos antes de la expiración, refrescar el token inmediatamente
    if (timeLeft < 2 * 60 * 1000 && timeLeft !== 0) {
      try {
        await refreshAccessToken(); // Refrescar token inmediatamente
        // console.log("Token refrescado correctamente");
      } catch (error) {
        // console.error("Error al refrescar el token", error);
      }
    }
  } else {
    navigate("/"); // Redirigir al login si no hay cookie 'expire'
  }
};



export function useAutoRefreshToken(cookieName: cookieName) {
  const { refreshAccessToken } = useRefreshToken();
  const navigate = useNavigate();

  useEffect(() => {
    const refreshToken = () => {
      refreshCookie(cookieName, refreshAccessToken, navigate);
    };

    // Ejecutar inmediatamente al montar el componente
    refreshToken();

    // Configurar el intervalo para verificar la expiración
    const interval = setInterval(() => {
      refreshToken(); // Solo refresca si es necesario
    }, 60 * 1000); // Verificar cada minuto

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, [cookieName, refreshAccessToken, navigate]);

}


export function useVerifyToken() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const verifyAccessToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await verifyToken(); // Llamada al backend
      setMessage(response);
      return true; // True si es válido
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
      return false; // False si hay error
    } finally {
      setLoading(false);
    }
  };

  return { message, loading, error, verifyAccessToken };
}
