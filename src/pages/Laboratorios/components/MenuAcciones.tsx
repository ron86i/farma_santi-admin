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

import { DialogHabilitarLaboratorio } from "./DialogHabilitarLaboratorio";
import { DialogDeshabilitarLaboratorio } from "./DialogDeshabilitarLaboratorio";
import { ModalModificarLaboratorio } from "./ModalModificarLaboratorio";
import { ModalDetalleLaboratorio } from "./ModalDetalleLaboratorio";
//   import { ModalDetalleUsuario } from "./ModalDetalleUsuario";
//   import { DialogModificarStatus } from "./DialogModificarStatus";
  
  type MenuAccionesProps = {
    laboratorioId: number;
    deletedAt: Date | null;
  };
  
  export function MenuAcciones({ laboratorioId, deletedAt }: MenuAccionesProps) {
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
          <ModalModificarLaboratorio
            laboratorioId={laboratorioId}
            open={openModalModificar}
            onClose={() => setOpenModalModificar(false)}
          />
        )}
        {openModalVer && (
          <ModalDetalleLaboratorio
            laboratorioId={laboratorioId}
            open={openModalVer}
            onClose={() => setOpenModalVer(false)}
          />
        )}
      {openDialogHabilitar && 
        <DialogHabilitarLaboratorio open={openDialogHabilitar} onClose={() => { setOpenDialogHabilitar(false) }} deletedAt={deletedAt} laboratorioId={laboratorioId} />
      }
      {openDialogDeshabilitar && 
        <DialogDeshabilitarLaboratorio open={openDialogDeshabilitar} onClose={() => { setOpenDialogDeshabilitar(false) }} laboratorioId={laboratorioId} />
      }
      </>
    );
  }
  