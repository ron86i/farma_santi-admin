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
  const { fetch, loading } = useQuery(verifyToken);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch();
        if (response) {
          // ✅ Si hay sesión activa, ir al dashboard
          navigate("/main/dashboard", { replace: true });
        }
        // ❌ Si no hay sesión, simplemente dejamos que se muestre <Login />
      } catch {
        // ✅ En caso de error, tampoco navegamos
        // mostramos el login normalmente
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <Nothing />; // Pantalla de carga mientras se verifica
  }

  // ✅ Si no tiene sesión, renderizamos login
  return children ? children : <Outlet />;
}
