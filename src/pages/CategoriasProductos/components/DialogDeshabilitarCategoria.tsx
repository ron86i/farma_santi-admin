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
import { useDeshabilitarCategoriaById } from "@/hooks";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogDeshabilitarCategoriaProps {
  categoriaId: number;
  open: boolean;
  onClose?: () => void;
}

export function DialogDeshabilitarCategoria({
  categoriaId,
  open,
  onClose,
}: DialogDeshabilitarCategoriaProps) {
  const { mutate: deshabilitarCategoria, data, loading, error } = useDeshabilitarCategoriaById();
  const { categoriaAction, setCategoriaAction } = useCategoriasContext();

  const onSubmit = async () => {
    try {
      const response = await deshabilitarCategoria(categoriaId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Categoría deshabilitada"
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
          title="Error al deshabilitar categoría"
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
          <AlertDialogTitle>¿Deshabilitar esta categoría?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Esta acción <strong>desactivará la categoría</strong>, por lo que ya no podrá ser usada para registrar nuevos productos ni aparecerá en la interfaz pública.
            Puedes volver a habilitarla más adelante si lo deseas.
            {error && <p className="text-sm text-red-500">Ocurrió un error: {error}</p>}
            {data && <p className="text-sm text-green-600">{data.message}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} disabled={loading}>
            {loading ? "Deshabilitando…" : "Deshabilitar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
