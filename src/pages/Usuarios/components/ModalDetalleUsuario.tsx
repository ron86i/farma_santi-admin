import { Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import dateFormat from "dateformat";
import { useQuery } from "@/hooks/generic";
import { obtenerUsuarioById } from "@/services";


interface ModalDetalleUsuarioProps {
    onClose?: () => void
    open: boolean;
    usuarioId: number;
}

export function ModalDetalleUsuario({ usuarioId, open, onClose }: ModalDetalleUsuarioProps) {

    const { fetch, data: usuario } = useQuery(obtenerUsuarioById);

    useEffect(() => {
        const obtenerDatos = async () => {
            await fetch(usuarioId);
        };
        obtenerDatos();
    }, [usuarioId]); // Ejecutar cuando cambie el ID


    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto sm:max-w-[600px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-xl font-bold">
                    Detalles del usuario
                </DialogTitle>

                <div className="space-y-4 text-sm">
                    <div>
                        <p className="font-semibold">CI:</p>
                        <p>{usuario?.persona?.ci} {usuario?.persona?.complemento ?? ""}</p>
                    </div>

                    <Separator />

                    <div>
                        <p className="font-semibold">Nombre completo:</p>
                        <p>
                            {usuario?.persona?.nombres} {usuario?.persona?.apellidoPaterno} {usuario?.persona?.apellidoMaterno}
                        </p>
                    </div>

                    <Separator />

                    <div>
                        <p className="font-semibold">Género:</p>
                        <p>
                            {usuario?.persona?.genero === "M" ? "Masculino"
                                : usuario?.persona?.genero === "F" ? "Femenino"
                                    : "Otro"}
                        </p>
                    </div>

                    <Separator />

                    <div>
                        <p className="font-semibold">Nombre de usuario:</p>
                        <p>{usuario?.username}</p>
                    </div>

                    <Separator />

                    <div>
                        <p className="font-semibold">Roles asignados:</p>
                        <ul className="list-disc list-inside">
                            {usuario?.roles?.length ? (
                                usuario.roles.map((rol) => (
                                    <li key={rol.id}>{rol.nombre}</li>
                                ))
                            ) : (
                                <p className="italic text-muted-foreground">Sin roles asignados</p>
                            )}
                        </ul>
                    </div>
                </div>

                <Separator />
                <div>
                    <p className="font-semibold">Fecha de registro:</p>
                    {usuario?.createdAt &&
                        <p> {dateFormat(usuario.createdAt)}</p>
                    }
                </div>
                <Separator />
                <div>
                    <p className="font-semibold">Fecha de última modificación:</p>
                    {usuario?.updatedAt &&
                        <p> {dateFormat(usuario.updatedAt)}</p>
                    }
                </div>

                <Separator />
                <div>
                    <p className="font-semibold">Estado:</p>
                    <div>
                        <p className={usuario?.estado === "Activo" ? "text-green-600" : "text-red-500"}>{usuario?.estado}</p>
                        {usuario?.deletedAt &&
                            <p className="text-sm text-muted-foreground">
                                Fecha de eliminación: {dateFormat(usuario.deletedAt, "dddd d 'de' mmmm yyyy, h:MM TT")}
                            </p>
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}