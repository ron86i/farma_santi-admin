import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Eye, Ellipsis, Pencil } from "lucide-react";
//   import { ModalModificaUsuario } from "./ModalModificarUsuario";
import { useState } from "react";


import { ModalDetallePrincipioActivo } from "./ModalDetallePrincipioActivo";
import { ModalModificarPrincipioActivo } from "./ModalModificarPrincipioActivo";


type MenuAccionesProps = {
    paId: number;
};

export function MenuAcciones({ paId }: MenuAccionesProps) {
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

            {openModalVer && (
                <ModalDetallePrincipioActivo paId={paId} open={openModalVer} onClose={() => setOpenModalVer(false)} />
            )}
            {openModalModificar && (
                <ModalModificarPrincipioActivo id={paId} open={openModalModificar} onClose={() => setOpenModalModificar(false)} />
            )}
        </>
    );
}
