import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Eye, Pencil, Ellipsis } from "lucide-react";
import { useState } from "react";
import { ModalDetalleLoteProducto } from "./ModalDetalleLoteProducto";
import { ModalModificarLoteProducto } from "./ModalModificarLoteProducto";

type MenuAccionesProps = {
    loteId: number;
};

export function MenuAcciones({ loteId }: MenuAccionesProps) {
    const [openModalModificar, setOpenModalModificar] = useState(false);
    const [openModalVer, setOpenModalVer] = useState(false);
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
                </DropdownMenuContent>
            </DropdownMenu>

            {openModalModificar && (
                <ModalModificarLoteProducto
                    loteId={loteId}
                    open={openModalModificar}
                    onClose={() => setOpenModalModificar(false)}
                />
            )}
            {openModalVer && (
                <ModalDetalleLoteProducto
                    loteId={loteId}
                    open={openModalVer}
                    onClose={() => setOpenModalVer(false)}
                />
            )}
        </>
    );
}
