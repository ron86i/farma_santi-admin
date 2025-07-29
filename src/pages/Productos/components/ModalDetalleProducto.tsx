import { Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import dateFormat from "dateformat";
import { useQuery } from "@/hooks/generic";
import { obtenerProductoById } from "@/services/productoService";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


interface ModalDetalleProductoProps {
    onClose?: () => void
    open: boolean;
    productoId: string;
}

export function ModalDetalleProducto({ productoId, open, onClose }: ModalDetalleProductoProps) {

    const { fetch, data: producto } = useQuery(obtenerProductoById)

    useEffect(() => {
        fetch(productoId)
    }, [productoId]);

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-w-4xl max-h-[95vh] overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-xl font-bold">
                    Detalles del producto
                </DialogTitle>

                {/* Contenedor principal con scroll */}
                <div className="flex flex-col gap-4 overflow-y-auto">
                    {/* ScrollArea para las imágenes */}
                    <ScrollArea className="w-full h-54 rounded-md border">
                        <div className="flex w-max space-x-4 p-4">
                            {producto?.urlFotos?.length ? (
                                producto.urlFotos.map((foto, idx) => (
                                    <figure key={idx} className="shrink-0 size-44">
                                        <div className="w-full h-full overflow-hidden rounded-md border shadow-md transition-transform duration-300 hover:scale-105">
                                            <img
                                                src={foto}
                                                alt={`Foto ${idx + 1} del producto`}
                                                title={`Foto ${idx + 1}`}
                                                className="object-cover w-full h-full"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/placeholder-image.png";
                                                }}
                                            />
                                        </div>
                                    </figure>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic p-4">No hay imágenes disponibles</p>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {/* ScrollArea para el contenido de detalles */}
                    {/* <ScrollArea className="flex-1 max-h-96"> */}
                    <div className="space-y-4 text-sm pr-4 overflow-y-auto">
                        <Separator />
                        <div className="flex gap-x-2">
                            <p className="font-semibold">Nombre comercial:</p>
                            <p>{producto?.nombreComercial}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="font-semibold">Principios Activos</p>
                            {producto?.principiosActivos?.length ? (
                                <ul className="mt-1 space-y-1 list-disc list-inside">
                                    {producto.principiosActivos.map((pa, index) => (
                                        <li key={index}>
                                            {pa.principioActivo?.nombre} - {pa.concentracion} {pa.unidadMedida?.abreviatura}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay principios activos registrados.</p>
                            )}
                        </div>

                        <Separator />

                        <div>
                            <p className="font-semibold">Forma farmaceutica:</p>
                            <p>{producto?.formaFarmaceutica.nombre}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="font-semibold">Laboratorio:</p>
                            <p>{producto?.laboratorio.nombre}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="font-semibold">Precio de compra promedio:</p>
                            <p>{producto?.precioCompra} Bs.</p>
                        </div>

                        <Separator />
                        <div>
                            <p className="font-semibold">Precio de venta:</p>
                            <p
                                className={
                                    (producto?.precioVenta || 0) < (producto?.precioCompra || 0)
                                        ? "text-red-600 font-semibold"
                                        : producto?.precioVenta === producto?.precioCompra
                                            ? "text-yellow-600 font-semibold"
                                            : "text-green-600 font-semibold"
                                }
                            >
                                {producto?.precioVenta} Bs.
                            </p>
                        </div>

                        <Separator />
                        <div>
                            <p className="font-semibold">Stock mínimo:</p>
                            <p>{producto?.stockMin}</p>
                        </div>

                        <Separator />
                        <div>
                            <p className="font-semibold">Stock actual:</p>
                            <p
                                className={
                                    (producto?.stock || 0) < (producto?.stockMin || 0)
                                        ? "text-red-600 font-semibold"
                                        : producto?.stock === producto?.stockMin
                                            ? "text-yellow-600 font-semibold"
                                            : "text-green-600 font-semibold"
                                }
                            >
                                {producto?.stock}
                            </p>
                        </div>

                        <Separator />
                        <div>
                            <p className="font-semibold">Estado:</p>
                            {producto?.estado == "Inactivo" ? (
                                <div>
                                    <p className="text-red-500">Eliminado</p>
                                    <p className="text-sm text-muted-foreground">
                                        Fecha de eliminación: {dateFormat(producto.deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-green-600">Activo</p>
                            )}
                        </div>
                    </div>
                    {/* </ScrollArea> */}
                </div>
            </DialogContent>
        </Dialog>
    )
}