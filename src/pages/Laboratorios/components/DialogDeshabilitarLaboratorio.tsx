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
import { useLaboratoriosContext } from "@/context";
import { useDeshabilitarLaboratorioById } from "@/hooks";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogDeshabilitarLaboratorioProps {
  laboratorioId: number;
  onClose?: () => void;
  open: boolean;
}

export function DialogDeshabilitarLaboratorio({ laboratorioId, onClose, open }: DialogDeshabilitarLaboratorioProps) {
  const { mutate: deshabilitarLaboratorio, data, loading, error } = useDeshabilitarLaboratorioById();
  const { laboratorioAction, setLaboratorioAction } = useLaboratoriosContext();

  const onSubmit = async () => {
    try {
      const response = await deshabilitarLaboratorio(laboratorioId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Laboratorio deshabilitado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setLaboratorioAction(!laboratorioAction);
      onClose?.();
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al deshabilitar laboratorio"
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
          <AlertDialogTitle>¿Deshabilitar este laboratorio?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Esta acción <strong>desactivará este laboratorio</strong> en el sistema.
            Podrás restaurarlo más adelante, pero sus asociaciones con productos u otras entidades <u>no</u> se restaurarán automáticamente.
            {error && <p className="text-sm text-red-500">Ocurrió un error: {error}</p>}
            {data && <p className="text-sm text-green-600">{data?.message}</p>}
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
