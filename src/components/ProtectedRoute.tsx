import { useQuery } from "@/hooks/generic";
import { MessageResponse } from "@/models";
import { Nothing } from "@/pages";
import { verifyToken } from "@/services";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { fetch, loading } = useQuery(verifyToken);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response:void|MessageResponse = await fetch();

        if (!response) {
          // ❌ No hay sesión → forzar logout
          navigate("/logout", { replace: true });
        }
        // ✅ Si response es true, simplemente dejamos que renderice
      } catch {
        // En caso de error, también lo mandamos al logout
        navigate("/logout", { replace: true });
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <Nothing />; // Pantalla de carga mientras se verifica
  }

  return children ? children : <Outlet />;
}
