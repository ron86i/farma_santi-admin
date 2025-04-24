import { Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import dateFormat from "dateformat";
import { useObtenerRolById } from "@/hooks";


interface ModalDetalleRolProps {
    onClose?: () => void
    open: boolean;
    rolId: number;
}

export function ModalDetalleRol({ rolId, open, onClose }: ModalDetalleRolProps) {

    const { fetchObtener, rol } = useObtenerRolById();

    useEffect(() => {
        const obtenerDatos = async () => {
            await fetchObtener(rolId);
        };
        obtenerDatos();
    }, [rolId]); // Ejecutar cuando cambie el ID


    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full overflow-auto sm:max-w-[600px] [&_[data-dialog-close]]:hidden"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-xl font-bold">
                    Detalles del rol
                </DialogTitle>

                <div className="space-y-4 text-sm">
                    <div className="flex gap-x-2">
                        <p className="font-semibold">ID:</p>
                        <p>{rol?.id}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Nombre:</p>
                        <p>{rol?.nombre}</p>
                    </div>

                    <Separator />

                    <div>
                        <p className="font-semibold">Fecha de creación:</p>
                        {rol?.createdAt &&
                            <p>{dateFormat(rol.createdAt)}</p>}
                    </div>

                    <Separator />
                    <div>
                        <p className="font-semibold">Estado:</p>
                        {rol?.deletedAt ? (
                            <div>
                                <p className="text-red-500">Eliminado</p>
                                <p className="text-sm text-muted-foreground">
                                    Fecha de eliminación: {dateFormat(rol.deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}
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