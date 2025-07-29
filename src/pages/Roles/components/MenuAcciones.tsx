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
//   import { ModalModificaUsuario } from "./ModalModificarUsuario";
  import { useState } from "react";
import { ModalModificarRol } from "./ModalModificarRol";
import { ModalDetalleRol } from "./ModalDetalleRol";
import { DialogHabilitarRol } from "./DialogHabilitarRol";
import { DialogDeshabilitarRol } from "./DialogDeshabilitarRol";
//   import { ModalDetalleUsuario } from "./ModalDetalleUsuario";
//   import { DialogModificarStatus } from "./DialogModificarStatus";
  
  type MenuAccionesProps = {
    rolId: number;
    deletedAt: Date | null;
  };
  
  export function MenuAcciones({ rolId, deletedAt }: MenuAccionesProps) {
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
  
            <DropdownMenuItem disabled={deletedAt?false:true} onClick={() => setOpenDialogHabilitar(true)}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Habilitar
            </DropdownMenuItem>
  
            <DropdownMenuItem disabled={deletedAt?true:false} onClick={() => setOpenDialogDeshabilitar(true)}>
              <Ban className="w-4 h-4 mr-2 text-yellow-500" />
              Deshabilitar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  
        {openModalModificar && (
          <ModalModificarRol
            rolId={rolId}
            open={openModalModificar}
            onClose={() => setOpenModalModificar(false)}
          />
        )}
        {openModalVer && (
          <ModalDetalleRol
            rolId={rolId}
            open={openModalVer}
            onClose={() => setOpenModalVer(false)}
          />
        )}
      {openDialogHabilitar && 
        <DialogHabilitarRol open={openDialogHabilitar} onClose={() => { setOpenDialogHabilitar(false) }} deletedAt={deletedAt} rolId={rolId} />
      }
      {openDialogDeshabilitar && 
        <DialogDeshabilitarRol open={openDialogDeshabilitar} onClose={() => { setOpenDialogDeshabilitar(false) }} rolId={rolId} />
      }
      </>
    );
  }
  