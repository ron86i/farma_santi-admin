import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { NotFound } from "@/pages/NotFound/page";
import { baseUrl } from "@/services/axiosClient";
import { useNavigate, useParams } from "react-router";
import { FileText } from "lucide-react";

export function VisualizadorReporte() {
  const { tipo } = useParams();
  const navigate = useNavigate();

  const TITULOS: Record<string, string> = {
    usuarios: "Reporte de Usuarios",
    ventas: "Reporte de Ventas",
    compras: "Reporte de Compras",
    clientes: "Reporte de Clientes",
    inventario: "Reporte de Inventario",
    "lotes-productos": "Reporte de Lotes de Productos",
  };

  const DESCRIPCIONES: Record<string, string> = {
    usuarios: "Visualiza la lista completa de usuarios registrados.",
    ventas: "Resumen detallado de las ventas realizadas.",
    compras: "Historial de compras y proveedores.",
    clientes: "Información de clientes del sistema.",
    inventario: "Stock disponible en almacén.",
    "lotes-productos": "Control de productos por lote y vencimiento.",
  };

  const titulo = tipo && TITULOS[tipo];
  const descripcion = tipo && DESCRIPCIONES[tipo];
  const url = tipo ? `${baseUrl}/reportes/${tipo}` : null;

  if (!titulo || !url) {
    return <NotFound />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => navigate("/main/reportes")}
            >
              Reportes
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{titulo}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Título y descripción */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {titulo}
          </h1>
        </div>
        {descripcion && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-8">
            {descripcion}
          </p>
        )}
      </div>

      {/* Contenedor del iframe */}
      <div className="mx-auto w-full md:w-3/4 border rounded-2xl shadow-md overflow-hidden bg-white dark:bg-neutral-900">
        <iframe
          src={url}
          title={titulo}
          className="w-full"
          style={{ height: "80vh" }}
        />
      </div>
    </div>
  );
}
