import { useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompraDetail } from "@/models";
import dateFormat from "dateformat";
import { 
    Building2, 
    Calendar, 
    CreditCard, 
    Hash, 
    Package, 
    User, 
    Download, 
    Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { baseUrl } from "@/services/axiosClient"; // Asegúrate que esta ruta es correcta en tu proyecto

interface DetalleCompraProps {
    loading: boolean;
    dataCompra: CompraDetail | null
}

const formatearStock = (stockTotal: number, unidadesPorPresentacion: number, nombrePresentacion: string, nombreUnidadBase: string = 'Ud') => {
    const stock = Number(stockTotal) || 0;

    if (stock === 0) {
        return `0 ${nombreUnidadBase}s`;
    }

    if (!unidadesPorPresentacion || unidadesPorPresentacion <= 1) {
        return `${stock} ${nombreUnidadBase}${stock > 1 ? 's' : ''}`;
    }

    const presentacionesCompletas = Math.floor(stock / unidadesPorPresentacion);
    const unidadesSueltas = stock % unidadesPorPresentacion;

    const partesTexto = [];

    if (presentacionesCompletas > 0) {
        partesTexto.push(`${presentacionesCompletas} ${nombrePresentacion}${presentacionesCompletas > 1 ? 's' : ''} (${unidadesPorPresentacion})`);
    }

    if (unidadesSueltas > 0) {
        partesTexto.push(`${unidadesSueltas} ${nombreUnidadBase}${unidadesSueltas > 1 ? 's' : ''}`);
    }

    return partesTexto.join(' y ');
};

export function DetalleCompra({ loading, dataCompra }: DetalleCompraProps) {
    const [downloading, setDownloading] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(amount) + ' Bs';
    }

    // Lógica para exportar PDF
    const handleExport = async () => {
        if (!dataCompra) return;

        try {
            setDownloading(true);
            const url = `${baseUrl}/reportes/compras/${dataCompra.id}`;

            const response = await axios.get(url, {
                responseType: "blob",
                timeout: 30000,
                headers: { Accept: "application/pdf" },
                withCredentials: true,
            });

            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const downloadUrl = URL.createObjectURL(pdfBlob);
            
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `nota-compra-${dataCompra.codigo || dataCompra.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);

        } catch (err) {
            console.error("Error al exportar detalle de compra:", err);
        } finally {
            setDownloading(false);
        }
    };

    // Agrupar lotes por producto
    const detallesAgrupados = dataCompra ? Object.values(
        dataCompra.detalles.reduce((acc: Record<string, any>, detalle) => {
            const prodId = detalle.loteProducto.producto.id;
            if (!acc[prodId]) {
                acc[prodId] = {
                    id: prodId,
                    nombre: detalle.loteProducto.producto.nombreComercial,
                    laboratorio: detalle.loteProducto.producto.laboratorio,
                    precioCompra: detalle.precioCompra,
                    cantidadTotal: 0,
                    lotes: [] as typeof detalle[],
                    unidadesPresentacion: detalle.loteProducto.producto.unidadesPresentacion,
                    nombrePresentacion: detalle.loteProducto.producto.presentacion.nombre,
                };
            }
            acc[prodId].cantidadTotal += detalle.cantidad;
            acc[prodId].lotes.push(detalle);
            return acc;
        }, {})
    ) : [];

    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
                        <p className="text-neutral-500 dark:text-neutral-400">Cargando información...</p>
                    </div>
                </div>
            ) : dataCompra ? (
                <div className="space-y-4 py-2">
                    {/* Información General */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
                        <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                                Información General
                            </h3>
                            {/* BOTÓN DE EXPORTAR */}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-2 bg-white dark:bg-neutral-900"
                                onClick={handleExport}
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Download className="h-3.5 w-3.5" />
                                )}
                                <span className="text-xs">{downloading ? "Generando..." : "Descargar PDF"}</span>
                            </Button>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Código</p>
                                        <p className="font-mono text-sm font-medium text-neutral-900 dark:text-white">
                                            {dataCompra.codigo}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Fecha</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {dateFormat(dataCompra.fecha, "dd/mm/yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Usuario</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {dataCompra.usuario.username}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Estado</p>
                                        <Badge
                                            className={
                                                dataCompra.estado === "Completado" ? "bg-green-600 text-white text-xs" :
                                                    dataCompra.estado === "Pendiente" ? "bg-yellow-600 text-white text-xs" :
                                                        dataCompra.estado === "Anulado" ? "bg-red-600 text-white text-xs" :
                                                            "bg-blue-600 text-white text-xs"
                                            }
                                        >
                                            {dataCompra.estado}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proveedor */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
                        <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Proveedor
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase">Laboratorio</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {dataCompra.laboratorio.nombre}
                                    </p>
                                </div>
                            </div>
                            {dataCompra.comentario && (
                                <div className="mt-4">
                                    <p className="text-xs text-neutral-500 uppercase">Observaciones</p>
                                    <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
                                        {dataCompra.comentario}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Productos */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
                        <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Productos ({detallesAgrupados.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {detallesAgrupados.map((detalleProd, index) => (
                                <div key={detalleProd.id} className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                                                {detalleProd.nombre}
                                            </h4>
                                            <p className="text-xs text-neutral-500">
                                                Laboratorio: {detalleProd.laboratorio}
                                            </p>
                                            {/* Mostrar todos los lotes con su cantidad y fecha */}
                                            <div className="text-xs text-neutral-500 mt-1 space-y-0.5">
                                                <span className="font-medium">Lotes:</span>
                                                {detalleProd.lotes.map((l: any, i: number) => (
                                                    <div key={i} className="pl-2">
                                                        Lote <span className="font-mono">{l.loteProducto.lote}</span> | Cant: <span className="font-medium">{l.cantidad}</span> | Vence: {l.loteProducto.fechaVencimiento ? format(new Date(l.loteProducto.fechaVencimiento), "dd/MM/yyyy", { locale: es }) : 'N/A'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-xs text-neutral-500 uppercase">Item {index + 1}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm mt-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-700">
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-500 uppercase">Cantidad Total</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm">
                                                {formatearStock(
                                                    detalleProd.cantidadTotal,
                                                    detalleProd.unidadesPresentacion,
                                                    detalleProd.nombrePresentacion
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-500 uppercase">Precio Unit.</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                {formatCurrency(detalleProd.precioCompra)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-500 uppercase">Subtotal</p>
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                {formatCurrency(detalleProd.precioCompra * detalleProd.cantidadTotal)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                                Total de la Compra
                            </span>
                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {formatCurrency(dataCompra.total)}
                            </span>
                        </div>
                    </div>

                    {/* Fecha de anulación si aplica */}
                    {dataCompra.estado === "Anulado" && dataCompra.deletedAt && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <div>
                                    <p className="text-xs text-red-600 dark:text-red-400 uppercase font-semibold">
                                        Fecha de Anulación
                                    </p>
                                    <p className="text-red-700 dark:text-red-300 font-medium">
                                        {dateFormat(dataCompra.deletedAt, "dd/mm/yyyy HH:MM")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        No se pudo cargar la información de la compra
                    </p>
                </div>
            )}
        </>
    )
}