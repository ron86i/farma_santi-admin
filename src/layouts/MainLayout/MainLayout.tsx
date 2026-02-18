import { useAutoRefreshToken } from "@/hooks";
import { LayoutSidebar, Navbar } from "./components";
import { Outlet } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { useUsuarioDetailContext } from "@/context/usuarioDetailContext";

export function MainLayout() {
  useAutoRefreshToken("exp-access-token");
  const { usuario, clearUsuario } = useUsuarioDetailContext();

  const [sidebarOpen, setSidebarOpen] = useState(false); // Cambiado a false para móvil

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
    <div className="flex h-screen overflow-hidden">
      <LayoutSidebar
        key={rolesNombres.join(",")}
        role={rolesNombres}
        clearUsuario={clearUsuario}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 bg-neutral-50 dark:bg-neutral-900 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}