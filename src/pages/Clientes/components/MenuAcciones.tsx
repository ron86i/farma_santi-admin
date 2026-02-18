import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Eye, Pencil, CheckCircle, Ban, Ellipsis } from "lucide-react";

import { useState } from "react";
import { ModalDetalleCliente } from "@/pages/Clientes/components/ModalDetalleCliente";
import { ModalModificarCliente } from "@/pages/Clientes/components/ModalModificarCliente";
import { DialogHabilitarCliente } from "@/pages/Clientes/components/DialogHabilitarCliente";
import { DialogDeshabilitarCliente } from "./DialogDeshabilitarCliente";

type MenuAccionesProps = {
    clienteId: number;
    ciNit: string;
    razonSocial: string;
    estado: string;
};

export function MenuAcciones({ clienteId, ciNit, razonSocial, estado }: MenuAccionesProps) {
    const [openModalModificar, setOpenModalModificar] = useState(false);
    const [openModalVer, setOpenModalVer] = useState(false);
    const [openDialogHabilitar, setOpenDialogHabilitar] = useState(false)
    const [openDialogDeshabilitar, setOpenDialogDeshabilitar] = useState(false)
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Ellipsis className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-48" align="end" sideOffset={4}>
                    <DropdownMenuItem onClick={() => setOpenModalVer(true)}>
                        <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                        Ver
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setOpenModalModificar(true)}>
                        <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
                        Modificar
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={estado === 'Activo'} onClick={() => setOpenDialogHabilitar(true)}>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Habilitar
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={estado === 'Inactivo'} onClick={() => setOpenDialogDeshabilitar(true)}>
                        <Ban className="w-4 h-4 mr-2 text-yellow-500" />
                        Deshabilitar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {openModalModificar && (
                <ModalModificarCliente
                    clienteId={clienteId}
                    open={openModalModificar}
                    onClose={() => setOpenModalModificar(false)}
                />
            )}
            {openModalVer && (
                <ModalDetalleCliente
                    clienteId={clienteId}
                    open={openModalVer}
                    onClose={() => setOpenModalVer(false)}
                />
            )}
            {openDialogHabilitar &&
                <DialogHabilitarCliente open={openDialogHabilitar} onClose={() => { setOpenDialogHabilitar(false); }} ciNit={ciNit} clienteId={clienteId} razonSocial={razonSocial} />
            }
            {openDialogDeshabilitar &&
                <DialogDeshabilitarCliente open={openDialogDeshabilitar} onClose={() => { setOpenDialogDeshabilitar(false); }} ciNit={ciNit} clienteId={clienteId} razonSocial={razonSocial} />
            }
        </>
    );
}
