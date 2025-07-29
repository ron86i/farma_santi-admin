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
import { useHabilitarLaboratorioById } from "@/hooks";

import dateFormat from "dateformat";
import { useEffect } from "react";
import { toast } from "sonner";

interface DialogHabilitarLaboratorioProps {
  laboratorioId: number;
  deletedAt: Date | null;
  onClose?: () => void;
  open: boolean;
}

export function DialogHabilitarLaboratorio({ laboratorioId, deletedAt, onClose, open }: DialogHabilitarLaboratorioProps) {
  const { mutate: habilitarLaboratorio, data, loading, error } = useHabilitarLaboratorioById();
  const { laboratorioAction, setLaboratorioAction } = useLaboratoriosContext();

  const onSubmit = async () => {
    try {
      const response = await habilitarLaboratorio(laboratorioId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Laboratorio habilitado"
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
          title="Error al habilitar laboratorio"
          message={err?.response?.message || err?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  useEffect(() => {
    if (data && !loading) {
      const timeout = setTimeout(() => {
        onClose?.();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [data, loading, onClose]);

  return (
    <AlertDialog open={open} onOpenChange={(estado) => !estado && onClose?.()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Habilitar este laboratorio?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Este laboratorio fue deshabilitado el{" "}
            <strong>{dateFormat(deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}</strong>. Al
            habilitarlo, volverá a estar disponible para su uso, pero <strong>los productos o asociaciones no se restauran automáticamente</strong>.
            {error && <p className="text-sm text-red-500">Ocurrió un error: {error}</p>}
            {data && <p className="text-sm text-green-600">{data?.message}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} disabled={loading}>
            {loading ? "Habilitando…" : "Habilitar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
