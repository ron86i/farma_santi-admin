import { useNavigate } from "react-router";
import { useLogOut } from "@/hooks"; // Asegúrate de importar el hook correctamente
import { Menu } from "lucide-react";
import { Divider } from ".";
import { ButtonLink } from "@/components";

type LayoutSidebarProps = {
  toggleSidebar: () => void
}
export function LayoutSidebar({ toggleSidebar }: LayoutSidebarProps) {
  const { error, logOutUser } = useLogOut(); // Usamos el hook
  const navigate = useNavigate();
  // Esta función solo debe ejecutarse cuando el usuario hace clic en el botón
  const logOut = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir la acción por defecto
    try {
      await logOutUser();
      navigate("/login"); // Redirigir a la página de login después del logout
    } catch (err) {
      alert(error || "Error desconocido");
    }
  };

  return (
    <aside className="max-md:absolute max-md:z-50 w-64 h-full bg-neutral-50 dark:bg-neutral-900 px-6 py-4 border-r border-neutral-200 dark:border-neutral-700 shadow-sm">
      <div className="flex items-center justify-baseline gap-4 mb-8 ">
        <button onClick={toggleSidebar} className="hidden max-md:block text-neutral-800 dark:text-neutral-100 cursor-pointer">
          <Menu className="size-6" />
        </button>
        <h2 className="text-xl font-extrabold text-purple-600 dark:text-purple-400 ">
          Farma Santi
        </h2>
      </div>

      <nav className="flex flex-col gap-2">
        <ButtonLink to="/main/dashboard" title="Inicio" nameIcon="home" />
        <ButtonLink to="/main/usuarios" title="Usuarios" nameIcon="user" />
        <ButtonLink to="/main/roles" title="Roles" nameIcon="shield" />
        <Divider />
        <ButtonLink onClick={logOut} to="#" title="Cerrar sesión" nameIcon="log-out" />

      </nav>
    </aside>
  );


}
