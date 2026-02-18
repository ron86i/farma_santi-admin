import { Menu } from "lucide-react"
import { ModeToggle } from "@/components"
import { useQuery } from "@/hooks"
import { obtenerMiUsuario } from "@/services"
import { useEffect } from "react"
import { toast } from "sonner"
import { CustomToast } from "@/components/toast"
import dateFormat from "dateformat"
import { useUsuarioDetailContext } from "@/context/usuarioDetailContext"
import { UsuarioDetail } from "@/models"

interface NavbarProps {
  toggleSidebar: () => void
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const { data: usuario, fetch, loading, error } = useQuery(obtenerMiUsuario)
  const { setUsuario } = useUsuarioDetailContext();
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch()
        setUsuario(response as UsuarioDetail)
      } catch (err: any) {
      }
    };
    fetchUser()
  }, [])

  useEffect(() => {
    if (error) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al obtener información del usuario"
          message={error}
          date={dateFormat(Date.now())}
        />
      ));
    }
  }, [error]);
  
  const nombre = usuario?.username ?? "Invitado"
  const inicial = nombre[0]?.toUpperCase() ?? "?"

  return (
    <header className="bg-neutral-50 dark:bg-neutral-900 px-4 md:px-6 py-3 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        {/* Sección izquierda */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-neutral-800 dark:text-neutral-100 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 p-2 rounded-lg transition-all"
            aria-label="Abrir menú"
          >
            <Menu className="size-6" />
          </button>
          <h1 className="text-base md:text-xl font-semibold text-neutral-800 dark:text-neutral-100 tracking-wide hidden sm:block">
            Panel de Administración
          </h1>
          <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 tracking-wide sm:hidden">
            Panel
          </h1>
        </div>

        {/* Sección derecha */}
        <div className="flex items-center gap-2 md:gap-4">
          <ModeToggle />

          {error && (
            <span className="text-xs md:text-sm text-red-500 hidden sm:inline">
              Error al cargar usuario
            </span>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex flex-col text-end md:flex">
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {loading ? "Cargando..." : nombre}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {loading ? "" : "Conectado"}
              </span>
            </div>

            <div className="relative">
              <div className="select-none w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-blue-300 dark:ring-indigo-700 transition-all">
                {inicial}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime-400 border-2 border-white dark:border-neutral-900 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}