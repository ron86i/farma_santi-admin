import { Badge, Button, Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import dateFormat from "dateformat";
import { useQuery } from "@/hooks/generic";
import { obtenerLoteProductoById } from "@/services/loteProductoService";

interface ModalDetalleLoteProductoProps {
    onClose?: () => void;
    open: boolean;
    loteId: number;
}

export function ModalDetalleLoteProducto({ loteId, open, onClose }: ModalDetalleLoteProductoProps) {
    const { fetch, data: lote } = useQuery(obtenerLoteProductoById);

    useEffect(() => {
        if (loteId) fetch(loteId);
    }, [loteId]);

    const producto = lote?.producto;

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto sm:max-w-[700px] bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-2xl font-bold text-center mb-4">
                    Información Detallada del Lote
                </DialogTitle>

                <div className="space-y-6">
                    {/* Información del Lote */}
                    <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Datos del Lote</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Código de Lote:</span>
                                <span className="text-base font-semibold">{lote?.lote || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Stock Disponible:</span>
                                <span className="text-base font-semibold">{lote?.stock || 0} unidades</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Estado del Lote:</span>
                                <Badge
                                    className={`text-xs px-2 py-1 rounded-md font-medium ${lote?.estado === "Retirado"
                                            ? "bg-yellow-400 text-black dark:bg-yellow-500 dark:text-black"
                                            : lote?.estado === "Vencido"
                                                ? "bg-red-500 text-white dark:bg-red-700 dark:text-white"
                                                : lote?.estado === "Activo"
                                                    ? "bg-green-500 text-white dark:bg-green-700 dark:text-white"
                                                    : "bg-blue-500 text-white dark:bg-blue-800 dark:text-white"
                                        }`}
                                >
                                    {lote?.estado}
                                </Badge>
                            </div>

                            <div className="flex flex-col md:col-span-2">
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Fecha de Vencimiento:</span>
                                <span className="text-base font-semibold">
                                    {lote?.fechaVencimiento ? dateFormat(lote.fechaVencimiento, "dd/mm/yyyy", true) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6 bg-neutral-300 dark:bg-neutral-700" />

                    {/* Información del Producto */}
                    {producto && (
                        <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Información del Producto</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Nombre Comercial:</span>
                                    <span className="text-base font-semibold">{producto.nombreComercial}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Forma Farmacéutica:</span>
                                    <span className="text-base">{producto.formaFarmaceutica}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Laboratorio:</span>
                                    <span className="text-base">{producto.laboratorio}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Precio de Venta:</span>
                                    <span className="text-base font-bold">{producto.precioVenta.toFixed(2)} Bs.</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Estado del Producto:</span>
                                    <Badge
                                        className={`text-xs px-2 py-1 rounded-md font-medium ${producto?.estado === "Inactivo"
                                                ? "bg-red-500 text-white dark:bg-red-700 dark:text-white"
                                                : producto?.estado === "Activo"
                                                    ? "bg-green-500 text-white dark:bg-green-700 dark:text-white"
                                                    : "bg-blue-500 text-white dark:bg-blue-800 dark:text-white"
                                            }`}
                                    >
                                        {producto?.estado}
                                    </Badge>
                                </div>

                                {producto.deletedAt && (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Fecha de Eliminación:</span>
                                        <span className="text-base font-semibold">
                                            {dateFormat(producto.deletedAt, "dd/mm/yyyy")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Botón de cierre */}
                <div className="flex justify-end mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <Button
                        onClick={onClose}
                        className="px-6 py-2 bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600 transition-colors font-medium rounded-lg border border-neutral-300 dark:border-neutral-600"
                    >
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
