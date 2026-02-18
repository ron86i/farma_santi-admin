import { Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import dateFormat from "dateformat";
import { useQuery } from "@/hooks/generic";
import { obtenerLaboratorioById } from "@/services";

interface Props {
    onClose?: () => void;
    open: boolean;
    laboratorioId: number;
}

export function ModalDetalleLaboratorio({ laboratorioId, open, onClose }: Props) {
    const { fetch, data: laboratorio } = useQuery(obtenerLaboratorioById);

    useEffect(() => {
        fetch(laboratorioId);
    }, [laboratorioId]);

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto sm:max-w-[600px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-xl font-bold">Detalles del laboratorio</DialogTitle>

                <div className="space-y-4 text-sm">
                    <div className="flex gap-x-2">
                        <p className="font-semibold">ID:</p>
                        <p>{laboratorio?.id}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Nombre:</p>
                        <p>{laboratorio?.nombre}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Dirección:</p>
                        {laboratorio?.direccion ? (
                            <p>{laboratorio?.direccion}</p>) : (
                            <p className="italic text-muted-foreground">Sin dirección asignada</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Representante:</p>
                        <p>{laboratorio?.representante}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Email:</p>
                        {laboratorio?.email ? (
                            <p>{laboratorio?.email}</p>) : (
                            <p className="italic text-muted-foreground">Sin email asignado</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Teléfono:</p>
                        {laboratorio?.telefono ? (
                            <p>{laboratorio?.telefono}</p>) : (
                            <p className="italic text-muted-foreground">Sin telefono asignado</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Celular:</p>
                        {laboratorio?.celular ? (
                            <p>{laboratorio?.celular}</p>) : (
                            <p className="italic text-muted-foreground">Sin celular asignado</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Fecha de registro:</p>
                        {laboratorio?.createdAt && <p>{dateFormat(laboratorio.createdAt)}</p>}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold">Estado:</p>
                        <div>
                            <p className={laboratorio?.estado === "Activo" ? "text-green-600" : "text-red-500"}>{laboratorio?.estado}</p>
                            {/* {laboratorio?.deletedAt &&
                                <p className="text-sm text-muted-foreground">
                                    Fecha de eliminación: {dateFormat(laboratorio.deletedAt, "dddd d 'de' mmmm yyyy, h:MM TT")}
                                </p>
                            } */}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
