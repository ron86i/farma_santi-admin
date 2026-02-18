import { Badge } from "@/components/ui";
import { VentaDetail } from "@/models";
import dateFormat from "dateformat";
import { Building2, Calendar, CreditCard, Hash, Package, User, Percent, Wallet } from "lucide-react";

// +++ AÑADE ESTA FUNCIÓN (o impórtala si la tienes en otro archivo) +++
/**
 * Calcula y formatea una cantidad en presentaciones y unidades sueltas.
 * @param {number} cantidadTotal - La cantidad total en unidades base (ej. 111).
 * @param {number} unidadesPorPresentacion - Unidades por presentación (ej. 36).
 * @param {string} nombrePresentacion - Nombre de la presentación (ej. "Caja").
 * @param {string} nombreUnidadBase - Nombre de la unidad suelta (ej. "Ud").
 * @returns {string} - El texto formateado (ej. "3 Cajas (36) y 3 Uds").
 */
const formatearStock = (cantidadTotal: number, unidadesPorPresentacion: number | null | undefined, nombrePresentacion: string | null | undefined, nombreUnidadBase: string = 'Ud') => {
    const cantidad = Number(cantidadTotal) || 0;
    const unidades = Number(unidadesPorPresentacion) || 1; // Default a 1 si no está definido
    const nombrePres = nombrePresentacion || ''; // Default a '' si no está definido

    if (cantidad === 0) {
        return `0 ${nombreUnidadBase}s`;
    }

    // Si no hay presentación válida (nombre o unidades <= 1), mostrar solo unidades
    if (!nombrePres || unidades <= 1) {
        return `${cantidad} ${nombreUnidadBase}${cantidad > 1 ? 's' : ''}`;
    }

    const presentacionesCompletas = Math.floor(cantidad / unidades);
    const unidadesSueltas = cantidad % unidades;

    const partesTexto = [];

    if (presentacionesCompletas > 0) {
        partesTexto.push(`${presentacionesCompletas} ${nombrePres}${presentacionesCompletas > 1 ? 's' : ''} (${unidades})`);
    }

    if (unidadesSueltas > 0) {
        partesTexto.push(`${unidadesSueltas} ${nombreUnidadBase}${unidadesSueltas > 1 ? 's' : ''}`);
    }

    // Si no hay partes (ej. cantidad=0), devuelve "0 Uds"
    if (partesTexto.length === 0 && cantidad === 0) {
         return `0 ${nombreUnidadBase}s`;
    } else if (partesTexto.length === 0) {
        // Si hay cantidad pero no presentaciones (ej: unidadesPorPresentacion = 1)
         return `${cantidad} ${nombreUnidadBase}${cantidad > 1 ? 's' : ''}`;
    }


    return partesTexto.join(' y ');
};
// +++ FIN DE LA FUNCIÓN +++


interface DetalleVentaProps {
    loading: boolean;
    dataVenta: VentaDetail | null;
}

export function DetalleVenta({ loading, dataVenta }: DetalleVentaProps) {
    const formatCurrency = (amount: number | null | undefined) => {
        const value = Number(amount) || 0;
        return new Intl.NumberFormat("es-BO", { // Cambiado a es-BO para Bolivianos
            style: "currency",
            currency: "BOB", // Moneda Boliviano
            minimumFractionDigits: 2
        }).format(value);
    }


    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-4" /> {/* Usar primary color */}
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
                                            {dateFormat(dataVenta.fecha, "dd/mm/yyyy HH:MM")} {/* Añadir Hora */}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Usuario</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {dataVenta.usuario?.username || 'N/A'} {/* Acceso seguro */}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs text-neutral-500 uppercase">Estado</p>
                                        {/* +++ CORRECCIÓN VARIANTE BADGE +++ */}
                                        <Badge
                                            variant={
                                                dataVenta.estado === "Realizada" ? "default" : // Mapeado a default
                                                dataVenta.estado === "Pendiente" ? "secondary" : // Mapeado a secondary
                                                dataVenta.estado === "Anulado" ? "destructive" :
                                                "default" // Fallback por si acaso
                                            }
                                            // Añadir estilos directos si 'default' no es verde o 'secondary' no es amarillo
                                             className={`text-xs ${
                                                dataVenta.estado === "Realizada" ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700' :
                                                dataVenta.estado === "Pendiente" ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700' : ''
                                            }`}
                                        >
                                            {dataVenta.estado}
                                        </Badge>
                                        {/* +++ FIN CORRECCIÓN +++ */}
                                    </div>
                                </div>
                            </div>

                            {/* Tipo de Pago y Descuento */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800"> {/* Separador sutil */}
                                {dataVenta.tipoPago && (
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-neutral-400" />
                                        <div>
                                            <p className="text-xs text-neutral-500 uppercase">Tipo de Pago</p>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                {dataVenta.tipoPago}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* Mostrar Descuento solo si es mayor a 0 */}
                                {dataVenta.descuento && dataVenta.descuento > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Percent className="h-4 w-4 text-neutral-400" />
                                        <div>
                                            <p className="text-xs text-neutral-500 uppercase">Descuento</p>
                                            <p className="text-sm font-medium text-red-600 dark:text-red-400"> {/* Color rojo para descuento */}
                                                - {formatCurrency(dataVenta.descuento)}
                                            </p>
                                        </div>
                                    </div>
                                )}
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
                                        {dataVenta.cliente?.razonSocial || 'N/A'} {/* Acceso seguro */}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase">NIT/CI</p>
                                    <p className="text-neutral-900 dark:text-white font-mono">
                                        {dataVenta.cliente?.nitCi ? (
                                            `${dataVenta.cliente.nitCi}${dataVenta.cliente.complemento || ""}`
                                        ) : (
                                            <span className="italic text-neutral-400">Sin registrar</span>
                                        )}
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
                                Productos ({dataVenta.detalles?.length || 0}) {/* Acceso seguro */}
                            </h3>
                        </div>
                        {/* Verificar si hay detalles antes de mapear */}
                        {dataVenta.detalles && dataVenta.detalles.length > 0 ? (
                             <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {dataVenta.detalles.map((d, index) => (
                                    <div key={d.id || index} className="p-4"> {/* Usar index como fallback key */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 mr-4"> {/* Añadido margen derecho */}
                                                <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                                                    {d.producto?.nombreComercial || 'Producto Desconocido'} {/* Acceso seguro */}
                                                </h4>
                                                <p className="text-xs text-neutral-500">
                                                    {d.producto?.formaFarmaceutica}
                                                    {d.producto?.laboratorio && ` • ${d.producto.laboratorio}`}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0"> {/* Evitar que se encoja */}
                                                <p className="text-xs text-neutral-500 uppercase">Item {index + 1}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-xs text-neutral-500 uppercase">Cantidad</p>
                                                {/* +++ CAMBIO: Usar formatearStock +++ */}
                                                <p className="font-semibold text-neutral-900 dark:text-white">
                                                    {formatearStock(
                                                        d.cantidad,
                                                        d.producto?.unidadesPresentacion,
                                                        d.producto?.presentacion?.nombre, // Acceder al nombre de la presentación
                                                        'Ud' // Puedes cambiar 'Ud' si prefieres otra unidad base
                                                    )}
                                                </p>
                                                {/* +++ FIN CAMBIO +++ */}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-neutral-500 uppercase">Precio Unit.</p>
                                                <p className="font-semibold text-neutral-900 dark:text-white">
                                                    {formatCurrency(d.precio)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-neutral-500 uppercase">Subtotal</p>
                                                 {/* +++ CORRECCIÓN SUBTOTAL +++ */}
                                                <p className="font-bold text-neutral-900 dark:text-white">
                                                    {formatCurrency(d.precio * d.cantidad)} {/* Calcular aquí */}
                                                </p>
                                                 {/* +++ FIN CORRECCIÓN +++ */}
                                            </div>
                                        </div>

                                        {/* Mostrar Lotes si existen */}
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
                                                            className="text-xs border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 font-mono px-1.5 py-0.5" // Ajuste de padding
                                                        >
                                                            {/* Mostrar lote y cantidad si existe */}
                                                            {lote.lote ? `${lote.lote} (${lote.cantidad || '?'})` : 'Lote desc.'} -{" "}
                                                            {/* Mostrar fecha si existe */}
                                                            {lote.fechaVencimiento ? dateFormat(lote.fechaVencimiento, "dd/mm/yy") : 'S/F'}
                                                        </Badge>

                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="p-4 text-sm text-neutral-500 italic">No hay detalles de productos para esta venta.</p>
                        )}
                    </div>

                    {/* Total */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md p-4 space-y-2">
                        {/* Mostrar subtotal antes de descuento */}
                         <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-300">
                                <span>Subtotal:</span>
                                {/* Asumiendo que 'total' NO incluye el descuento, mostrarlo directamente */}
                                <span className="font-semibold">{formatCurrency(dataVenta.total)}</span>
                         </div>

                        {dataVenta.descuento && dataVenta.descuento > 0 && (
                            <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                                <span>Descuento aplicado:</span>
                                <span className="font-semibold">- {formatCurrency(dataVenta.descuento)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2"> {/* Línea separadora */}
                            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                                Total Pagado
                            </span>
                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {formatCurrency(dataVenta.total - (dataVenta.descuento || 0))} {/* Calcular total final */}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-neutral-500 dark:text-neutral-400">No se pudo cargar la información de la venta o no se encontró.</p> {/* Mensaje más claro */}
                </div>
            )}
        </>
    );
}