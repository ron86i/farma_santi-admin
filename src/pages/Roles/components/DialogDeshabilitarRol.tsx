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
import { useDeshabilitarRolById } from "@/hooks";
import dateFormat from "dateformat";
import { toast } from "sonner";


interface DialogDeshabilitarRolProps {
  rolId: number;
  onClose?: () => void;
  open: boolean;
}

export function DialogDeshabilitarRol({ rolId, onClose, open }: DialogDeshabilitarRolProps) {
  const { mutate: deshabilitarRol, data, loading, error } = useDeshabilitarRolById();
  const { rolAction, setRolAction } = useRolesContext();

  const onSubmit = async () => {
    try {
      const response = await deshabilitarRol(rolId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Rol deshabilitado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setRolAction(!rolAction);
      onClose?.();
    } catch (err: any) {
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

  return (
    <AlertDialog open={open} onOpenChange={(estado) => !estado && onClose?.()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Deshabilitar este rol permanentemente?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Esta acción <strong>quitará este rol de todos los usuarios</strong> y lo dejará inactivo.
            Podrás restaurarlo más adelante, pero los usuarios <u>no</u> recuperarán el rol automáticamente; deberás asignarlo de nuevo manualmente.
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
