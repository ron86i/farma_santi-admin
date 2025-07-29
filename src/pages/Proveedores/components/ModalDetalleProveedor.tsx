import { Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import dateFormat from "dateformat";
import { useQuery } from "@/hooks/generic";
import { obtenerProveedorById } from "@/services";


interface ModalDetalleProveedorProps {
    onClose?: () => void
    open: boolean;
    proveedorId: number;
}

export function ModalDetalleProveedor({ proveedorId, open, onClose }: ModalDetalleProveedorProps) {

    const { fetch, data: proveedor } = useQuery(obtenerProveedorById)

    useEffect(() => {
        fetch(proveedorId)
    }, [proveedorId]);

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-xl font-bold">
                    Detalles del proveedor
                </DialogTitle>

                <div className="space-y-4 text-sm">
                    <div className="flex gap-x-2">
                        <p className="font-semibold">ID:</p>
                        <p>{proveedor?.id}</p>
                    </div>
                    <Separator />
                    <div className="flex gap-x-2">
                        <p className="font-semibold">NIT:</p>
                        <p>{proveedor?.nit}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Nombre:</p>
                        <p>{proveedor?.razonSocial}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Representante:</p>
                        <p>{proveedor?.representante}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Dirección:</p>
                        {proveedor?.direccion ? (
                            <p>{proveedor?.direccion}</p>) : (
                            <p className="italic text-muted-foreground">Sin dirección asignada</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Email:</p>
                        {proveedor?.email ? (
                            <p>{proveedor?.email}</p>) : (
                            <p className="italic text-muted-foreground">Sin email asignado</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Teléfono:</p>
                        {proveedor?.telefono ? (
                            <p>{proveedor?.telefono}</p>) : (
                            <p className="italic text-muted-foreground">Sin telefono asignado</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Celular:</p>
                        {proveedor?.celular ? (
                            <p>{proveedor?.celular}</p>) : (
                            <p className="italic text-muted-foreground">Sin celular asignado</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Fecha de registro:</p>
                        {proveedor?.createdAt &&
                            <p>{dateFormat(proveedor.createdAt)}</p>}
                    </div>

                    <Separator />
                    <div>
                        <p className="font-semibold">Estado:</p>
                        {proveedor?.deletedAt ? (
                            <div>
                                <p className="text-red-500">Eliminado</p>
                                <p className="text-sm text-muted-foreground">
                                    Fecha de eliminación: {dateFormat(proveedor.deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}
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