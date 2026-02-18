import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { baseUrl } from "@/services/axiosClient";
import axios from "axios";
import { useNavigate } from "react-router";
import { FileText, Filter, RefreshCw, Download, ExternalLink, Eye } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ReporteClientes() {
  const navigate = useNavigate();
  const titulo = "Reporte de Clientes";
  const descripcion = "Información de clientes del sistema.";

  // Filtro
  const [estado, setEstado] = useState("Todos");

  // Estados de control
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mostrarVisor, setMostrarVisor] = useState(false);

  // Construir URL con filtro
  const construirURL = () => {
    const query = new URLSearchParams();
    if (estado && estado !== "Todos") query.append("estado", estado);
    return `${baseUrl}/reportes/clientes?${query.toString()}`;
  };

  // Generar PDF
  const generarReporte = async () => {
    setLoading(true);
    setError("");
    setMostrarVisor(false);

    try {
      const url = construirURL();

      const response = await axios.get(url, {
        responseType: "blob",
        timeout: 30000,
        headers: { Accept: "application/pdf" },
        withCredentials: true,
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setMostrarVisor(true);
    } catch (err: any) {
      console.error(err);
      setError("Error al generar el reporte. Verifique el filtro o el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltro = () => {
    setEstado("Todos");
    setPdfUrl("");
    setMostrarVisor(false);
    setError("");
  };

  const descargarPDF = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `reporte-clientes-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const abrirEnNuevaPestana = () => {
    if (pdfUrl) window.open(pdfUrl, "_blank");
    else window.open(construirURL(), "_blank");
  };

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
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{titulo}</h1>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-8">{descripcion}</p>
      </div>

      {/* Filtro de estado */}
      <div className="bg-white dark:bg-neutral-900 border rounded-lg p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Filtro</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Estado</label>
            <Select value={estado} onValueChange={setEstado} disabled={loading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={generarReporte} disabled={loading} className="flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {loading ? "Generando..." : "Generar Reporte"}
          </Button>
          <Button variant="outline" onClick={limpiarFiltro} disabled={loading}>
            Limpiar Filtro
          </Button>
          {pdfUrl && (
            <Button variant="secondary" onClick={descargarPDF}>
              <Download className="w-4 h-4" /> Descargar PDF
            </Button>
          )}
        </div>
      </div>

      {/* Errores */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Visor de PDF */}
      {mostrarVisor && pdfUrl && (
        <div className="mx-auto w-full border rounded-2xl shadow-md overflow-hidden bg-white dark:bg-neutral-900 mt-4">
          <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-b flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {titulo} - {new Date().toLocaleDateString()}
            </span>
            <Button size="sm" variant="outline" onClick={abrirEnNuevaPestana}>
              <ExternalLink className="w-3 h-3 mr-1" />
              Nueva Pestaña
            </Button>
          </div>
          <iframe src={pdfUrl} title={titulo} className="w-full" style={{ height: "75vh" }} />
        </div>
      )}

      {/* Estado inicial */}
      {!mostrarVisor && !loading && !error && (
        <div className="mx-auto w-full border rounded-2xl shadow-md overflow-hidden bg-white dark:bg-neutral-900 p-8 text-center mt-4">
          <FileText className="w-16 h-16 mx-auto text-neutral-400 dark:text-neutral-600" />
          <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{titulo}</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Seleccione el estado y presione "Generar Reporte" para crear el PDF
          </p>
        </div>
      )}

      {/* Cargando */}
      {loading && (
        <div className="mx-auto w-full border rounded-2xl shadow-md overflow-hidden bg-white dark:bg-neutral-900 p-8 text-center mt-4">
          <RefreshCw className="w-16 h-16 mx-auto text-primary animate-spin" />
          <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Generando Reporte</h3>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Por favor espere...</p>
        </div>
      )}
    </div>
  );
}
