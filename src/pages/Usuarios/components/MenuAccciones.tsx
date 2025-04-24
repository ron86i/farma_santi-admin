import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import {
  Eye,
  Pencil,
  CheckCircle,
  Ban,
  Ellipsis,
} from "lucide-react";
import { ModalModificaUsuario } from "./ModalModificarUsuario";
import { useState } from "react";
import { ModalDetalleUsuario } from "./ModalDetalleUsuario";
import { DialogModificarEstado } from "./DialogModificarEstado";

type MenuAccionesProps = {
  usuarioId: number;
  deletedAt: Date | null;
};

export function MenuAcciones({ usuarioId, deletedAt }: MenuAccionesProps) {
  const [openModalModificar, setOpenModalModificar] = useState(false);
  const [openModalVer, setOpenModalVer] = useState(false);
  const [openDialogModificarStatus, setOpenDialogModificarStatus] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="p-2">
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
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem disabled={deletedAt?false:true} onClick={() => setOpenDialogModificarStatus(true)}>
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Habilitar
          </DropdownMenuItem>

          <DropdownMenuItem disabled={deletedAt?true:false} onClick={() => setOpenDialogModificarStatus(true)}>
            <Ban className="w-4 h-4 mr-2 text-yellow-500" />
            Deshabilitar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openModalModificar && (
        <ModalModificaUsuario
          usuarioId={usuarioId}
          open={openModalModificar}
          onClose={() => setOpenModalModificar(false)}
        />
      )}
      {openModalVer && (
        <ModalDetalleUsuario
          usuarioId={usuarioId}
          open={openModalVer}
          onClose={() => setOpenModalVer(false)}
        />
      )}
      {openDialogModificarStatus && <DialogModificarEstado open={openDialogModificarStatus} onClose={() => { setOpenDialogModificarStatus(false) }} deletedAt={deletedAt} usuarioId={usuarioId} />

      }
    </>
  );
}
