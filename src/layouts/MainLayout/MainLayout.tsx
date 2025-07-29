import { useAutoRefreshToken } from "@/hooks";
import { LayoutSidebar, Navbar } from "./components";
import { Outlet } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { useUsuarioDetailContext } from "@/context/usuarioDetailContext";

export function MainLayout() {
  useAutoRefreshToken("exp-access-token");
  const { usuario, clearUsuario } = useUsuarioDetailContext();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Inicializa roles desde usuario o vacío
  const [rolesNombres, setRolesNombres] = useState<string[]>(() =>
    usuario?.roles?.map((r) => r.nombre) ?? []
  );

  // Actualiza roles cada vez que cambia usuario
  useEffect(() => {
    const nuevosRoles = usuario?.roles?.map((r) => r.nombre) ?? [];
    setRolesNombres(nuevosRoles);
  }, [usuario]);

  // Memoriza toggleSidebar para no crear función nueva en cada render
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((v) => !v);
  }, []);

  return (
    <div className="flex overflow-auto transition-discrete duration-100">
      {sidebarOpen && (
        <LayoutSidebar
          key={rolesNombres.join(",")} // Forzar remount cuando roles cambian
          toggleSidebar={toggleSidebar}
          role={rolesNombres}
          clearUsuario={clearUsuario}
        />
      )}
      <div className="flex flex-col flex-1 w-full h-screen">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 bg-neutral-50 dark:bg-neutral-900 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
