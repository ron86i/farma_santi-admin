import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Layers, 
  Pencil, 
  CheckCircle, 
  Ellipsis, 
  CircleSlash, 
  FileText 
} from "lucide-react";

// Importación de Modales (Asumiendo que las rutas son correctas)
import { ModalDetalleProducto } from "./ModalDetalleProducto";
import { DialogHabilitarProducto } from "./DialogHabilitarProducto";
import { DialogDeshabilitarProducto } from "./DialogDeshabilitarProducto";
import { ModalModificarProducto } from "./ModalModificarProducto";
import { ModalKardex } from "./ModalKardex";

// Definimos los tipos de modales posibles para evitar strings mágicos
type ModalType = 'ver' | 'editar' | 'kardex' | 'habilitar' | 'deshabilitar' | null;

type MenuAccionesProps = {
  productoId: string;
  deletedAt: Date | null;
  estado: string; // Idealmente sería: 'Activo' | 'Inactivo'
};

export function MenuAcciones({ productoId, deletedAt, estado }: MenuAccionesProps) {
  const navigate = useNavigate();
  
  // 1. Un único estado para controlar qué modal está abierto
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Helper para cerrar modales
  const closeModal = () => setActiveModal(null);

  // Helper para manejar clics y evitar propagación (útil en tablas)
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-neutral-100">
            <span className="sr-only">Abrir menú</span>
            <Ellipsis className="w-4 h-4 text-neutral-500" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" sideOffset={4}>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          
          {/* GRUPO: VISUALIZACIÓN */}
          <DropdownMenuItem onClick={(e) => handleAction(e, () => setActiveModal('ver'))}>
            <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
            Ver detalles
          </DropdownMenuItem>

          <DropdownMenuItem onClick={(e) => handleAction(e, () => setActiveModal('kardex'))}>
            <FileText className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            Ver Kardex / Historial
          </DropdownMenuItem>

          <DropdownMenuItem onClick={(e) => handleAction(e, () => navigate(`/main/lotes-productos?buscar=${productoId}`))}>
            <Layers className="w-4 h-4 mr-2 text-muted-foreground" />
            Ver lotes activos
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* GRUPO: EDICIÓN */}
          <DropdownMenuItem onClick={(e) => handleAction(e, () => setActiveModal('editar'))}>
            <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
            Modificar
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* GRUPO: ESTADO (Renderizado Condicional) */}
          {estado === "Inactivo" ? (
            <DropdownMenuItem onClick={(e) => handleAction(e, () => setActiveModal('habilitar'))}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Habilitar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={(e) => handleAction(e, () => setActiveModal('deshabilitar'))}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
            >
              <CircleSlash className="w-4 h-4 mr-2" />
              Deshabilitar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* GESTOR DE MODALES */}
      {/* Renderizamos condicionalmente para no montar componentes pesados si no se usan */}
      
      {activeModal === 'editar' && (
        <ModalModificarProducto
          productoId={productoId}
          open={true}
          onClose={closeModal}
        />
      )}

      {activeModal === 'ver' && (
        <ModalDetalleProducto
          productoId={productoId}
          open={true}
          onClose={closeModal}
        />
      )}

      {activeModal === 'habilitar' && (
        <DialogHabilitarProducto
          open={true}
          onClose={closeModal}
          deletedAt={deletedAt}
          productoId={productoId}
        />
      )}

      {activeModal === 'deshabilitar' && (
        <DialogDeshabilitarProducto
          open={true}
          onClose={closeModal}
          productoId={productoId}
        />
      )}

      {activeModal === 'kardex' && (
        <ModalKardex
          open={true}
          onClose={closeModal}
          productoId={productoId}
        />
      )}
    </>
  );
}