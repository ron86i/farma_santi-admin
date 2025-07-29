import { Badge } from "@/components/ui";
import { CompraDetail } from "@/models";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import dateFormat from "dateformat";
import { Building2, Calendar, CreditCard, Hash, Package, User } from "lucide-react";

interface DetalleCompraProps {
    loading: boolean;
    dataCompra: CompraDetail | null
}

export function DetalleCompra({ loading, dataCompra }: DetalleCompraProps) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(amount) + ' Bs';
    }

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
                        <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                                Información General
                            </h3>
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
                                    <p className="text-xs text-neutral-500 uppercase">Razón Social</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {dataCompra.proveedor.razonSocial}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase">NIT</p>
                                    <p className="text-neutral-900 dark:text-white font-mono">
                                        {dataCompra.proveedor.nit || <span className="italic text-neutral-400">Sin registrar</span>}
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
                                Productos ({dataCompra.detalles.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {dataCompra.detalles.map((detalle, index) => (
                                <div key={detalle.id} className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            {/* <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-300">
                                                            ID: {detalle.loteProducto.producto.id}
                                                        </span>
                                                    </div> */}
                                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                                                {detalle.loteProducto.producto.nombreComercial}
                                            </h4>
                                            <p className="text-xs text-neutral-500">
                                                Laboratorio: {detalle.loteProducto.producto.laboratorio}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Lote: {detalle.loteProducto.lote} • Vence: {format(
                                                    new Date(detalle.loteProducto.fechaVencimiento),
                                                    "dd/MM/yyyy",
                                                    { locale: es }
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-xs text-neutral-500 uppercase">Item {index + 1}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-500 uppercase">Cantidad</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                {detalle.cantidad}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-500 uppercase">Precio Unit.</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                {formatCurrency(detalle.precio)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-500 uppercase">Subtotal</p>
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                {formatCurrency(detalle.precio * detalle.cantidad)}
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