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
  KeyRound,
} from "lucide-react";

import { useState } from "react";
import { ModalModificaUsuario } from "./ModalModificarUsuario";
import { ModalDetalleUsuario } from "./ModalDetalleUsuario";
import { DialogHabilitarUsuario } from "./DialogHabilitarUsuario";
import { DialogDeshabilitarUsuario } from "./DialogDeshabilitarUsuario";
import { DialogRestablecerPasswordUsuario } from "./DialogRestablecerPasswordUsuario";

type MenuAccionesProps = {
  usuarioId: number;
  deletedAt: Date | null;
  username: string;
};

export function MenuAcciones({ usuarioId, deletedAt, username }: MenuAccionesProps) {
  const [openModalModificar, setOpenModalModificar] = useState(false);
  const [openModalVer, setOpenModalVer] = useState(false);
  const [openDialogHabilitar, setOpenDialogHabilitar] = useState(false);
  const [openDialogDeshabilitar, setOpenDialogDeshabilitar] = useState(false);
  const [openDialogRestablecer, setOpenDialogRestablecer] = useState(false);

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
            Modificar
          </DropdownMenuItem>

          <DropdownMenuItem disabled={!deletedAt} onClick={() => setOpenDialogHabilitar(true)}>
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Habilitar
          </DropdownMenuItem>

          <DropdownMenuItem disabled={!!deletedAt} onClick={() => setOpenDialogDeshabilitar(true)}>
            <Ban className="w-4 h-4 mr-2 text-yellow-500" />
            Deshabilitar
          </DropdownMenuItem>

          <DropdownMenuItem disabled={!!deletedAt} onClick={() => setOpenDialogRestablecer(true)}>
            <KeyRound className="w-4 h-4 mr-2 text-blue-500" />
            Restablecer contraseña
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
      {openDialogHabilitar && (
        <DialogHabilitarUsuario
          open={openDialogHabilitar}
          onClose={() => setOpenDialogHabilitar(false)}
          deletedAt={deletedAt}
          usuarioId={usuarioId}
        />
      )}
      {openDialogDeshabilitar && (
        <DialogDeshabilitarUsuario
          open={openDialogDeshabilitar}
          onClose={() => setOpenDialogDeshabilitar(false)}
          deletedAt={deletedAt}
          usuarioId={usuarioId}
        />
      )}
      {openDialogRestablecer && (
        <DialogRestablecerPasswordUsuario
          open={openDialogRestablecer}
          onClose={() => setOpenDialogRestablecer(false)}
          usuarioId={usuarioId}
          username={username}
        />
      )}
    </>
  );
}
