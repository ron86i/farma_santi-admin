import { useVerifyToken } from "@/hooks";
import { Nothing } from "@/pages";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";


interface ProtectedRouteProps {
  redirectTo: string;
  valid: boolean;
  children?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo,
  valid,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { verifyAccessToken } = useVerifyToken();
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [isChecked, setIsChecked] = useState(false); // Para asegurar que se ejecutó la verificación

  useEffect(() => {
    const checkSession = async () => {
      try {
        const isValid = await verifyAccessToken(); // Verificamos el token
        if (isValid !== valid) {
          // Si el token es válido, mostramos el contenido (o rutas protegidas)
          setIsChecked(true); // Verificación completada, se puede mostrar contenido
        } else {
          navigate(redirectTo); // Si el token no es válido, redirigimos
        }
      } catch (error) {
        console.error("Error verificando el token:", error);
        navigate(redirectTo); // Redirigimos al login si hubo un error
      } finally {
        setIsLoading(false); // Desactivamos el estado de carga
      }
    };

     checkSession(); // Ejecutamos la verificación
  }, [valid, redirectTo]);

  if (isLoading || !isChecked) {
    return <Nothing />; // Mientras se verifica el token, mostramos una pantalla de carga
  }

  return children ? children : <Outlet />; // Una vez verificado, renderizamos el contenido
}
