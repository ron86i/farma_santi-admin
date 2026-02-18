import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
// import { NotFound } from "@/pages/NotFound/page";
import { baseUrl } from "@/services/axiosClient";
import axios from "axios";
import { useNavigate } from "react-router";
import { FileText, Filter, Calendar, AlertCircle, RefreshCw, Download, ExternalLink, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ReporteVentas() {
    const navigate = useNavigate();
    const titulo = "Reporte de Ventas";
    const descripcion = "Resumen detallado de las ventas realizadas.";

    // Estados de filtros
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [estado, setEstado] = useState("");

    // Estados de control
    const [pdfUrl, setPdfUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mostrarVisor, setMostrarVisor] = useState(false);

    // Obtener fechas para restricciones
    const obtenerFechaMaxima = () => {
        return new Date().toISOString().split('T')[0]; // Hoy
    };

    const obtenerFechaMinima = () => {
        const fecha = new Date();
        fecha.setFullYear(fecha.getFullYear() - 2); // 2 años atrás
        return fecha.toISOString().split('T')[0];
    };

    // Construir URL con filtros
    const construirURL = () => {
        const query = new URLSearchParams();
        
        if (fechaInicio) query.append("fechaInicio", fechaInicio);
        if (fechaFin) query.append("fechaFin", fechaFin);
        if (estado && estado !== "Todos") query.append("estado", estado);
        
        // Si no hay parámetros, agregar filtro por defecto
        if (!query.toString()) query.append("estado", "");
        
        return `${baseUrl}/reportes/ventas?${query.toString()}`;
    };

    // Generar reporte usando axios
    const generarReporte = async () => {
        setLoading(true);
        setError("");
        setMostrarVisor(false);
        
        try {
            // Validar fechas
            if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
                throw new Error("La fecha de inicio no puede ser posterior a la fecha de fin");
            }

            const url = construirURL();
            console.log("Generando reporte con URL:", url);

            // Hacer petición con axios
            const response = await axios.get(url, {
                responseType: 'blob', // Importante para PDFs
                timeout: 30000, // 30 segundos timeout
                headers: {
                    'Accept': 'application/pdf',
                },
                withCredentials: true,
            });

            // Crear URL del blob para mostrar
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            setPdfUrl(pdfUrl);
            setMostrarVisor(true);
            
        } catch (err: any) {
            console.error("Error al generar reporte:", err);
            
            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    setError("Timeout: El servidor tardó demasiado en responder. Intente nuevamente.");
                } else if (err.response?.status === 404) {
                    setError("Endpoint no encontrado. Verifique que el servidor esté configurado correctamente.");
                } else if (err.response?.status && err.response.status >= 500) {
                    setError("Error del servidor. Contacte al administrador.");
                } else {
                    setError(`Error de red: ${err.message}`);
                }
            } else {
                setError(err.message || "Error desconocido al generar el reporte");
            }
        } finally {
            setLoading(false);
        }
    };

    // Descargar PDF
    const descargarPDF = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Abrir en nueva pestaña
    const abrirEnNuevaPestana = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        } else {
            // Fallback: abrir URL directa
            const url = construirURL();
            window.open(url, '_blank');
        }
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFechaInicio("");
        setFechaFin("");
        setEstado("");
        setError("");
        setPdfUrl("");
        setMostrarVisor(false);
    };

    // Manejar cambio de fecha de inicio
    const manejarCambioFechaInicio = (fecha: string) => {
        setFechaInicio(fecha);
        // Si la fecha de fin es anterior a la nueva fecha de inicio, limpiarla
        if (fechaFin && fecha && new Date(fecha) > new Date(fechaFin)) {
            setFechaFin("");
        }
    };

    // Manejar cambio de fecha de fin
    const manejarCambioFechaFin = (fecha: string) => {
        setFechaFin(fecha);
    };

    // Limpiar URL del blob al desmontar
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);


    return (
        <div className="p-6 space-y-6">
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

            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {titulo}
                    </h1>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-8">
                    {descripcion}
                </p>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-neutral-900 border rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Filtros
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Fecha de Inicio */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Fecha de Inicio
                        </label>
                        <Input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => manejarCambioFechaInicio(e.target.value)}
                            className="w-full"
                            disabled={loading}
                            min={obtenerFechaMinima()}
                            max={fechaFin || obtenerFechaMaxima()}
                        />
                    </div>

                    {/* Fecha de Fin */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Fecha de Fin
                        </label>
                        <Input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => manejarCambioFechaFin(e.target.value)}
                            className="w-full"
                            disabled={loading}
                            min={fechaInicio || obtenerFechaMinima()}
                            max={obtenerFechaMaxima()}
                        />
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Estado de Venta
                        </label>
                        <Select value={estado} onValueChange={setEstado} disabled={loading}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Todos">Todos</SelectItem>
                                <SelectItem value="Realizada">Realizada</SelectItem>
                                <SelectItem value="Anulado">Anulado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                        onClick={generarReporte}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                        {loading ? "Generando..." : "Generar Reporte"}
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        onClick={limpiarFiltros}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        Limpiar Filtros
                    </Button>

                    {/* Botones adicionales cuando hay PDF */}
                    {pdfUrl && (
                        <Button 
                            variant="secondary" 
                            onClick={descargarPDF}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Descargar PDF
                        </Button>
                    )}
                </div>
            </div>

            {/* Mostrar errores */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <div className="mt-2 text-sm">
                            <strong>Sugerencias:</strong>
                            <ul className="list-disc list-inside mt-1">
                                <li>Verifique que el servidor backend esté funcionando</li>
                                <li>Compruebe la URL del endpoint en la consola</li>
                                <li>Revise la configuración de CORS en el servidor</li>
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Visor de PDF */}
            {mostrarVisor && pdfUrl && (
                <div className="mx-auto w-full border rounded-2xl shadow-md overflow-hidden bg-white dark:bg-neutral-900">
                    <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-b">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Reporte de Ventas - {new Date().toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={abrirEnNuevaPestana}>
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Nueva Pestaña
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <iframe
                        src={pdfUrl}
                        title={titulo}
                        className="w-full"
                        style={{ height: "75vh" }}
                    />
                </div>
            )}

            {/* Estado inicial */}
            {!mostrarVisor && !loading && !error && (
                <div className="mx-auto w-full border rounded-2xl shadow-md overflow-hidden bg-white dark:bg-neutral-900 p-8 text-center">
                    <FileText className="w-16 h-16 mx-auto text-neutral-400 dark:text-neutral-600" />
                    <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Reporte de Ventas
                    </h3>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Configure los filtros y presione "Generar Reporte" para crear el PDF
                    </p>
                </div>
            )}

            {/* Estado de carga */}
            {loading && (
                <div className="mx-auto w-full border rounded-2xl shadow-md overflow-hidden bg-white dark:bg-neutral-900 p-8 text-center">
                    <RefreshCw className="w-16 h-16 mx-auto text-primary animate-spin" />
                    <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Generando Reporte
                    </h3>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Por favor espere mientras se procesa su solicitud...
                    </p>
                </div>
            )}
        </div>
    );
}