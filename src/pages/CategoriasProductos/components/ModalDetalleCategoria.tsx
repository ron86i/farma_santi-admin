import { Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import dateFormat from "dateformat";
import { useQuery } from "@/hooks/generic";
import { obtenerCategoriaById } from "@/services";


interface ModalDetalleCategoriaProps {
    onClose?: () => void
    open: boolean;
    categoriaId: number;
}

export function ModalDetalleCategoria({ categoriaId, open, onClose }: ModalDetalleCategoriaProps) {

    const { fetch, data: categoria } = useQuery(obtenerCategoriaById);

    useEffect(() => {
        const obtenerDatos = async () => {
            await fetch(categoriaId);
        };
        obtenerDatos();
    }, [categoriaId]); // Ejecutar cuando cambie el ID


    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto sm:max-w-[600px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-xl font-bold">
                    Detalles de  la categoría
                </DialogTitle>

                <div className="space-y-4 text-sm">
                    <div className="flex gap-x-2">
                        <p className="font-semibold">ID:</p>
                        <p>{categoria?.id}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Nombre:</p>
                        <p>{categoria?.nombre}</p>
                    </div>

                    <Separator />

                    <div>
                        <p className="font-semibold">Fecha de registro:</p>
                        {categoria?.createdAt &&
                            <p>{dateFormat(categoria.createdAt)}</p>}
                    </div>

                    <Separator />
                    <div>
                        <p className="font-semibold">Estado:</p>
                        {categoria?.deletedAt ? (
                            <div>
                                <p className="text-red-500">Eliminado</p>
                                <p className="text-sm text-muted-foreground">
                                    Fecha de eliminación: {dateFormat(categoria.deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}
                                </p>
                            </div>
                        ) : (
                            <p className="text-green-600">Activo</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}