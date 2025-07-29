import { useQuery } from "@/hooks/generic";
import { Nothing } from "@/pages";
import { verifyToken } from "@/services";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { fetch, error, loading } = useQuery(verifyToken);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await fetch();
        if (error == null) {
          setIsChecked(true);
        } else {
          navigate("/logout");
        }
      } catch (error) {
        console.error("Error verificando el token:", error);
        navigate("/login");
      }
    };

    checkSession();
  }, []);

  if (loading || !isChecked) {
    return <Nothing />; // Mientras se verifica el token, mostramos una pantalla de carga
  }

  return children ? children : <Outlet />; // Una vez verificado, renderizamos el contenido
}