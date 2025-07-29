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
import { useRolesContext } from "@/context/rolesContext";
import { useHabilitarRolById } from "@/hooks";

import dateFormat from "dateformat";
import { useEffect } from "react";
import { toast } from "sonner";

interface DialogHabilitarRolProps {
  rolId: number;
  deletedAt: Date | null;
  onClose?: () => void;
  open: boolean;
}

export function DialogHabilitarRol({ rolId, deletedAt, onClose, open }: DialogHabilitarRolProps) {
  const { mutate: habilitarRol, data, loading, error } = useHabilitarRolById();
  const { rolAction, setRolAction } = useRolesContext();

  const onSubmit = async () => {
    try {
      const response = await habilitarRol(rolId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Rol habilitado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setRolAction(!rolAction);
      onClose?.();
    } catch (err:any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al habilitar rol"
          message={err?.response?.message || err?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  useEffect(() => {
    if (data?.message && !loading) {
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
          <AlertDialogTitle>¿Habilitar este rol?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Este rol fue deshabilitado el{" "}
            <strong>{dateFormat(deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}</strong>. Al
            habilitarlo, volverá a estar disponible para su uso, pero <strong>los usuarios no recuperarán automáticamente este rol</strong>.
            {error && <p className="text-sm text-red-500">Ocurrió un error: {error}</p>}
            {data?.message && <p className="text-sm text-green-600">{data.message}</p>}
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
