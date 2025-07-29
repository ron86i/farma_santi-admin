import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, Layers, Pencil, CheckCircle, Ellipsis, CircleSlash } from "lucide-react";
import { useState } from "react";
import { ModalDetalleProducto } from "./ModalDetalleProducto";
import { DialogHabilitarProducto } from "./DialogHabilitarProducto";
import { DialogDeshabilitarProducto } from "./DialogDeshabilitarProducto";
import { ModalModificarProducto } from "./ModalModificarProducto";
import { useNavigate } from "react-router";

type MenuAccionesProps = {
  productoId: string;
  deletedAt: Date | null;
  estado: string;
};

export function MenuAcciones({ productoId, deletedAt, estado }: MenuAccionesProps) {
  const [openModalModificar, setOpenModalModificar] = useState(false);
  const [openModalVer, setOpenModalVer] = useState(false);
  const [openDialogHabilitar, setOpenDialogHabilitar] = useState(false);
  const [openDialogDeshabilitar, setOpenDialogDeshabilitar] = useState(false);
  const navigate = useNavigate();

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

          <DropdownMenuItem onClick={() => navigate(`/main/lotes-productos?buscar=${productoId}`)}>
            <Layers className="w-4 h-4 mr-2 text-muted-foreground" />
            Ver lotes
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenModalModificar(true)}>
            <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
            Modificar
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={estado !== "Inactivo"}
            onClick={() => setOpenDialogHabilitar(true)}
          >
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Habilitar
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={estado !== "Activo"}
            onClick={() => setOpenDialogDeshabilitar(true)}
          >
            <CircleSlash className="w-4 h-4 mr-2 text-red-600" />
            Deshabilitar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openModalModificar && (
        <ModalModificarProducto
          productoId={productoId}
          open={openModalModificar}
          onClose={() => setOpenModalModificar(false)}
        />
      )}

      {openModalVer && (
        <ModalDetalleProducto
          productoId={productoId}
          open={openModalVer}
          onClose={() => setOpenModalVer(false)}
        />
      )}

      {openDialogHabilitar && (
        <DialogHabilitarProducto
          open={openDialogHabilitar}
          onClose={() => setOpenDialogHabilitar(false)}
          deletedAt={deletedAt}
          productoId={productoId}
        />
      )}

      {openDialogDeshabilitar && (
        <DialogDeshabilitarProducto
          open={openDialogDeshabilitar}
          onClose={() => setOpenDialogDeshabilitar(false)}
          productoId={productoId}
        />
      )}
    </>
  );
}
