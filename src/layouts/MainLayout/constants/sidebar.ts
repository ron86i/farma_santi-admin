import { logOut } from "@/services";
import { IconName } from "lucide-react/dynamic";

export type NavItem = {
  title: string;
  to: string;
  icon: IconName;
  onClick?: () => void;
  className?: string;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
  showSeparatorAfter?: boolean;
};

// Función que recibe clearUsuario y devuelve las secciones con logout personalizado
export function getSections(clearUsuario: () => void): Map<string, NavSection[]> {
  return new Map([
    [
      "ADMIN",
      [
        {
          label: "General",
          items: [{ to: "/main/dashboard", title: "Inicio", icon: "home" }],
        },
        {
          label: "Administración",
          items: [
            { to: "/main/usuarios", title: "Usuarios", icon: "user" },
            { to: "/main/roles", title: "Roles", icon: "shield" },
            { to: "/main/backups", title: "Respaldos", icon: "database-backup" },
          ],
        },
        {
          label: "Inventario",
          items: [
            { to: "/main/categorias-productos", title: "Categorías", icon: "container" },
            { to: "/main/laboratorios", title: "Laboratorios", icon: "flask-round" },
            { to: "/main/productos", title: "Productos", icon: "package" },
            { to: "/main/lotes-productos", title: "Lotes", icon: "layers" },
            { to: "/main/principios-activos", title: "Principios Activos", icon: "dna" },
          ],
        },
        {
          label: "Operaciones",
          items: [
            { to: "/main/ventas", title: "Ventas", icon: "credit-card" },
            { to: "/main/compras", title: "Compras", icon: "shopping-cart" },
          ],
        },
        {
          label: "Información",
          items: [
            { to: "/main/clientes", title: "Clientes", icon: "users" },
            { to: "/main/control-vencimientos", title: "Alertas de Stock", icon: "bell" },
            { to: "/main/movimientos", title: "Movimientos", icon: "activity" },
            { to: "/main/reportes", title: "Reportes", icon: "bar-chart" },
          ],
        },
        {
          label: "Sesión",
          items: [
            {
              to: "/logout",
              title: "Cerrar sesión",
              icon: "log-out",
              onClick: async () => {
                await logOut();
                clearUsuario();
              },
              className:
                "hover:bg-red-400/50 dark:hover:bg-red-600/50 dark:text-red-600 dark:hover:text-neutral-200",
            },
          ],
        },
      ],
    ],
    [
      "GERENTE",
      [
        {
          label: "General",
          items: [{ to: "/main/dashboard", title: "Inicio", icon: "home" }],
        },
        {
          label: "Administración",
          items: [
            { to: "/main/usuarios", title: "Usuarios", icon: "user" },
            { to: "/main/roles", title: "Roles", icon: "shield" },
            { to: "/main/backups", title: "Respaldos", icon: "database-backup" },
          ],
        },
        {
          label: "Inventario",
          items: [
            { to: "/main/categorias-productos", title: "Categorías", icon: "container" },
            { to: "/main/laboratorios", title: "Laboratorios", icon: "flask-round" },
            { to: "/main/productos", title: "Productos", icon: "package" },
            { to: "/main/lotes-productos", title: "Lotes", icon: "layers" },
            { to: "/main/principios-activos", title: "Principios Activos", icon: "dna" },
          ],
        },
        {
          label: "Operaciones",
          items: [
            { to: "/main/ventas", title: "Ventas", icon: "credit-card" },
            { to: "/main/compras", title: "Compras", icon: "shopping-cart" },
          ],
        },
        {
          label: "Información",
          items: [
            { to: "/main/clientes", title: "Clientes", icon: "users" },
            { to: "/main/control-vencimientos", title: "Alertas de Stock", icon: "bell" },
            { to: "/main/movimientos", title: "Movimientos", icon: "activity" },
            { to: "/main/reportes", title: "Reportes", icon: "bar-chart" },
          ],
        },
        {
          label: "Sesión",
          items: [
            {
              to: "/logout",
              title: "Cerrar sesión",
              icon: "log-out",
              onClick: async () => {
                await logOut();
                clearUsuario();
              },
              className:
                "hover:bg-red-400/50 dark:hover:bg-red-600/50 dark:text-red-600 dark:hover:text-neutral-200",
            },
          ],
        },
      ],
    ],
    [
      "FARMACEUTICO",
      [
        {
          label: "General",
          items: [{ to: "/main/dashboard", title: "Inicio", icon: "home" }],
        },
        {
          label: "Operaciones",
          items: [
            { to: "/main/ventas", title: "Ventas", icon: "credit-card" },
          ],
        },

        {
          label: "Información",
          items: [
            { to: "/main/clientes", title: "Clientes", icon: "users" },
            { to: "/main/notificaciones", title: "Notificaciones", icon: "bell" },
            { to: "/main/movimientos", title: "Movimientos", icon: "activity" },
            { to: "/main/reportes", title: "Reportes", icon: "bar-chart" },
          ],
        },
        {
          label: "Sesión",
          items: [
            {
              to: "/logout",
              title: "Cerrar sesión",
              icon: "log-out",
              onClick: async () => {
                await logOut();
                clearUsuario();
              },
              className:
                "hover:bg-red-400/50 dark:hover:bg-red-600/50 dark:text-red-600 dark:hover:text-neutral-200",
            },
          ],
        },
      ],
    ],
    [
      "AUXILIAR DE ALMACEN",
      [
        {
          label: "General",
          items: [{ to: "/main/dashboard", title: "Inicio", icon: "home" }],
        },
        {
          label: "Inventario",
          items: [
            { to: "/main/categorias-productos", title: "Categorías", icon: "container" },
            { to: "/main/laboratorios", title: "Laboratorios", icon: "flask-round" },
            { to: "/main/productos", title: "Productos", icon: "package" },
            { to: "/main/lotes-productos", title: "Lotes", icon: "layers" },
            { to: "/main/principios-activos", title: "Principios Activos", icon: "dna" },
          ],
        },
        {
          label: "Operaciones",
          items: [
            { to: "/main/compras", title: "Compras", icon: "shopping-cart" },
          ],
        },
        {
          label: "Sesión",
          items: [
            {
              to: "/logout",
              title: "Cerrar sesión",
              icon: "log-out",
              onClick: async () => {
                await logOut();
                clearUsuario();
              },
              className:
                "hover:bg-red-400/50 dark:hover:bg-red-600/50 dark:text-red-600 dark:hover:text-neutral-200",
            },
          ],
        },
      ],
    ],
  ]);
}