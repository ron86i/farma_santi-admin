import { NavBar } from "./components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Users,
  Boxes,
  ClipboardList,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router";

export function Reportes() {
  const navigate = useNavigate();

  const reportes = [
    {
      title: "Reporte de Usuarios",
      description: "Listado completo de los usuarios registrados en el sistema.",
      icon: <Users className="w-6 h-6 text-yellow-600" />,
      path: "/main/reportes/usuarios",
    },
    {
      title: "Reporte de Ventas",
      description: "Detalle de todas las ventas realizadas.",
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
      path: "/main/reportes/ventas",
    },
    {
      title: "Reporte de Compras",
      description: "Registro de compras y proveedores.",
      icon: <ClipboardList className="w-6 h-6 text-green-600" />,
      path: "/main/reportes/compras",
    },
    {
      title: "Reporte de Clientes",
      description: "Información sobre los clientes registrados.",
      icon: <Users className="w-6 h-6 text-purple-600" />,
      path: "/main/reportes/clientes",
    },
    {
      title: "Reporte de Inventario",
      description: "Estado actual del inventario disponible.",
      icon: <Boxes className="w-6 h-6 text-teal-600" />,
      path: "/main/reportes/inventario",
    },
    {
      title: "Reporte de Lotes de Productos",
      description: "Control de vencimientos y stock por lote.",
      icon: <Layers className="w-6 h-6 text-rose-600" />,
      path: "/main/reportes/lotes-productos",
    },
  ];

  return (
    <>
      <NavBar />
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Reportes del Sistema
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Visualiza y descarga los diferentes reportes generados por el sistema.
            Aquí encontrarás informes de usuarios, ventas, compras, inventario y más.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {reportes.map((reporte) => (
            <Card
              key={reporte.title}
              onClick={() => navigate(reporte.path)}
              className="cursor-pointer hover:shadow-md transition-all"
            >
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center gap-3">
                  {reporte.icon}
                  <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                    {reporte.title}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 ml-9">
                  {reporte.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
