import { Badge } from "@/components/ui";
import { VentaDetail } from "@/models";
import dateFormat from "dateformat";
import { Building2, Calendar, CreditCard, Hash, Package, User } from "lucide-react";

interface DetalleVentaProps {
    loading: boolean;
    dataVenta: VentaDetail | null
}
export function DetalleVenta({ loading, dataVenta }: DetalleVentaProps) {

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2 }).format(amount) + ' Bs';
    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
                        <p className="text-neutral-500 dark:text-neutral-400">Cargando información...</p>
                    </div>
                </div>
            ) : dataVenta ? (
                <div className="space-y-4">
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
                                            {dataVenta.codigo}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Fecha</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {dateFormat(dataVenta.fecha, "dd/mm/yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Usuario</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {dataVenta.usuario.username}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Estado</p>
                                        <Badge
                                            className={
                                                dataVenta.estado === "Realizada" ? "bg-green-600 text-white text-xs" :
                                                    dataVenta.estado === "Pendiente" ? "bg-yellow-600 text-white text-xs" :
                                                        dataVenta.estado === "Anulado" ? "bg-red-600 text-white text-xs" :
                                                            "bg-blue-600 text-white text-xs"
                                            }
                                        >
                                            {dataVenta.estado}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
                        <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Cliente
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase">Razón Social</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {dataVenta.cliente.razonSocial}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase">NIT/CI</p>
                                    <p className="text-neutral-900 dark:text-white font-mono">
                                        {dataVenta.cliente.nitCi ?
                                            `${dataVenta.cliente.nitCi}${dataVenta.cliente.complemento || ""}` :
                                            <span className="italic text-neutral-400">Sin registrar</span>
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
                        <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Productos ({dataVenta.detalles.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {dataVenta.detalles.map((d, index) => (
                                <div key={d.id} className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                                                {d.producto.nombreComercial}
                                            </h4>
                                            <p className="text-xs text-neutral-500">
                                                {d.producto.formaFarmaceutica}
                                                {d.producto.laboratorio && ` • ${d.producto.laboratorio}`}
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
                                                {d.cantidad}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-500 uppercase">Precio Unit.</p>
                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                {formatCurrency(d.precio)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-neutral-500 uppercase">Subtotal</p>
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                {formatCurrency(d.precio * d.cantidad)}
                                            </p>
                                        </div>
                                    </div>

                                    {d.lotes?.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-2 uppercase">
                                                Lotes Utilizados
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {d.lotes.map((lote, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="outline"
                                                        className="text-xs border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 font-mono"
                                                    >
                                                        {lote.lote} ({lote.cantidad}) - {dateFormat(lote.fechaVencimiento, "dd/mm/yy")}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                                Total de la Venta
                            </span>
                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {formatCurrency(dataVenta.total)}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        No se pudo cargar la información de la venta
                    </p>
                </div>
            )}
        </>
    )
}