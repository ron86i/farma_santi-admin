import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Eye, Pencil, Ellipsis, BadgeCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { ModalDetalleCompra } from "./ModalDetalleCompra";
import { ModalModificarOrdenCompra } from "./ModalModificarOrdenCompra";
import { ModalConfirmarCompra } from "./ModalConfirmarCompra";
import { ModalAnularOrdenCompra } from "./ModalAnularOrdenCompra";

type MenuAccionesProps = {
    compraId: number;
    estado: string;
};

export function MenuAcciones({ estado, compraId }: MenuAccionesProps) {
    const [openModalModificar, setOpenModalModificar] = useState(false);
    const [openModalVer, setOpenModalVer] = useState(false);
    const [openModalConfirmar, setOpenModalConfirmar] = useState(false);
    const [openModalAnular, setOpenModalAnular] = useState(false);

    const puedeEditar = estado === "Pendiente";
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
                        <Eye className="w-4 h-4 mr-2 text-blue-500" />
                        <span >Ver</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={!puedeEditar}
                        onClick={() => setOpenModalModificar(true)}
                    >
                        <Pencil className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>Modificar orden</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={!puedeEditar}
                        onClick={() => setOpenModalConfirmar(true)}
                    >
                        <BadgeCheck className="w-4 h-4 mr-2 text-green-500" />
                        <span >Confirmar compra</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={!puedeEditar}
                        onClick={() => setOpenModalAnular(true)}
                    >
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        <span>Anular compra</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {openModalVer && (
                <ModalDetalleCompra
                    compraId={compraId}
                    open={openModalVer}
                    onClose={() => setOpenModalVer(false)}
                />
            )}

            {openModalModificar && (
                <ModalModificarOrdenCompra
                    compraId={compraId}
                    open={openModalModificar}
                    onClose={() => setOpenModalModificar(false)}
                />
            )}
            {openModalConfirmar && (
                <ModalConfirmarCompra
                    compraId={compraId}
                    open={openModalConfirmar}
                    onClose={() => setOpenModalConfirmar(false)}
                />
            )}
            {openModalAnular && (
                <ModalAnularOrdenCompra
                    compraId={compraId}
                    open={openModalAnular}
                    onClose={() => setOpenModalAnular(false)}
                />
            )}
        </>
    );
}
