import { useEffect, useState } from "react";
import { MessageResponse, UserRequest } from "@/models";

import { logIn, logOut, refreshToken, verifyToken } from "@/services";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "./generic";

type cookieName = "exp-access-token" | "exp-refresh-token"



export function useLogin() {
  return useMutation((credentials: UserRequest)=>{
    return logIn(credentials)
  })
}


export function useLogOut() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<MessageResponse | null>(null);

  const logOutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await logOut();
      setMessage(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return { message, loading, error, logOutUser };
}

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

const refreshCookie = async (cookieName: string, fetch: () => Promise<void | MessageResponse>, navigate: Function) => {
  const expire = getCookie(cookieName); // Obtener la cookie con el nombre proporcionado

  if (expire != null) {
    const expireTime = parseInt(expire, 10) * 1000; // Convertir a milisegundos
    const now = Date.now();
    const timeLeft = expireTime - now;

    // Si quedan menos de 2 minutos antes de la expiración, refrescar el token inmediatamente
    if (timeLeft < 2 * 60 * 1000 && timeLeft !== 0) {
      try {
        await fetch(); // Refrescar token inmediatamente
        // console.log("Token refrescado correctamente");
      } catch (error) {
        console.error("Error al refrescar el token", error);
      }
    }
  } else {
    navigate("/");
  }
};



export function useAutoRefreshToken(cookieName: cookieName) {
  const { fetch } = useQuery(refreshToken)
  const navigate = useNavigate();

  useEffect(() => {
    const refreshToken = () => {
      refreshCookie(cookieName, fetch, navigate);
    };

    // Ejecutar inmediatamente al montar el componente
    refreshToken();

    // Configurar el intervalo para verificar la expiración
    const interval = setInterval(() => {
      refreshToken(); // Solo refresca si es necesario
    }, 60 * 1000); // Verificar cada minuto

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, [cookieName, fetch, navigate]);

}

export function useVerifyToken() {
  return useMutation(()=>{
    return verifyToken()
  })
}
