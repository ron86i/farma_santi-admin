import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Ellipsis, X } from "lucide-react";
import { useState } from "react";
import { ModalDetalleVenta } from "./ModalDetalleVenta";
import { ModalAnularVenta } from "./ModalAnularVenta";

type MenuAccionesProps = {
    ventaId: number;
    deletedAt: Date | null;
    estado: string;
};

export function MenuAcciones({ ventaId, deletedAt, estado }: MenuAccionesProps) {
    const [openModalVer, setOpenModalVer] = useState(false);
    const [openModalAnular, setOpenModalAnular] = useState(false);

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
                        Ver detalle
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={(estado == "Anulado" || deletedAt) ? true : false} onClick={() => setOpenModalAnular(true)}>
                        <X className="w-4 h-4 mr-2 text-red-500" />
                        Anular
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>
            {openModalVer &&
                <ModalDetalleVenta ventaId={ventaId} open={openModalVer} onClose={()=>{setOpenModalVer(false)}}/>
            }
            {openModalAnular &&
                <ModalAnularVenta ventaId={ventaId} open={openModalAnular} onClose={()=>{setOpenModalAnular(false)}}/>
            }
        </>
    );
}
