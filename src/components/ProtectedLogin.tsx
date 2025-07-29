import { useQuery } from "@/hooks/generic";
import { Nothing } from "@/pages";
import { verifyToken } from "@/services";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

interface ProtectedLoginProps {
  children?: React.ReactNode;
}

export function ProtectedLogin({ children }: ProtectedLoginProps) {
  const navigate = useNavigate();
  const { fetch, error, loading } = useQuery(verifyToken);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await fetch();
        if (error == null) {
          navigate("/main/dashboard");
        } else {
          navigate("/");
        }
      } catch (error) {
        // console.error("Error verificando el token:", error);
        navigate("/login");
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <Nothing />; // Mientras se verifica el token, mostramos una pantalla de carga
  }

  return children ? children : <Outlet />; // Una vez verificado, renderizamos el contenido
}