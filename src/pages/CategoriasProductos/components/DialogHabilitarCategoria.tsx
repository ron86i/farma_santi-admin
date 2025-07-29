import { CustomToast } from "@/components/toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useCategoriasContext } from "@/context";
import { useHabilitarCategoriaById } from "@/hooks";


import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogHabilitarCategoriaProps {
  categoriaId: number;
  deletedAt: Date;
  open: boolean;
  onClose?: () => void;
}

export function DialogHabilitarCategoria({
  categoriaId,
  deletedAt,
  open,
  onClose,
}: DialogHabilitarCategoriaProps) {
  const { mutate: habilitarCategoria, data, loading, error } = useHabilitarCategoriaById();
  const { categoriaAction, setCategoriaAction } = useCategoriasContext();

  const onSubmit = async () => {
    try {
      const response = await habilitarCategoria(categoriaId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Categoría habilitada"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setCategoriaAction(!categoriaAction);
      onClose?.();
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al habilitar categoría"
          message={err?.response?.message || err?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(estado) => !estado && onClose?.()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Restaurar esta categoría?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Esta categoría se deshabilitó el{" "}
            <strong>{dateFormat(deletedAt, "dddd d 'de' mmmm yyyy, h:MM TT")}</strong>.
            Al restaurarla, volverá a estar disponible para registrar productos y visualizar en el sistema.
            {error && <p className="text-sm text-red-500">Ocurrió un error: {error}</p>}
            {data && <p className="text-sm text-green-600">{data.message}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} disabled={loading}>
            {loading ? "Restaurando…" : "Restaurar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
