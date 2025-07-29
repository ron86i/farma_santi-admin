import { CustomToast } from "@/components/toast";
import { AlertDialog,AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction} from "@/components/ui/alert-dialog";
import { useUsuariosContext } from "@/context/usuarioContex";
import { useHabilitarUsuarioById } from "@/hooks";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogHabilitarUsuarioProps {
  usuarioId: number;
  deletedAt: Date | null;
  onClose?: () => void;
  open: boolean;
}

export function DialogHabilitarUsuario({ usuarioId, deletedAt, onClose, open }: DialogHabilitarUsuarioProps) {
  const { mutate: habilitar, data, loading, error } = useHabilitarUsuarioById();
  const { usuarioAction, setUsuarioAction } = useUsuariosContext();
  const onSubmit = async () => {
try {
    const response = await habilitar(usuarioId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Usuario habilitado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));

      setUsuarioAction(!usuarioAction);
      onClose?.();
    } catch (err:any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al habilitar usuario"
          message={err?.response?.message || err?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(estado) => !estado && onClose?.()}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Deseas restaurar este usuario?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <>
              Este usuario fue deshabilitado el{" "}
              <strong>
                {dateFormat(deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}
              </strong>
              . Al restaurarlo, volverá a estar activo y podrá acceder nuevamente al sistema.
            </>
            {error && (
              <p className="mt-2 text-sm text-red-500">
                Ocurrió un error: {error}
              </p>
            )}
            {data && (
              <p className="mt-2 text-sm text-green-600">
                {data.message}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} disabled={loading}>
            {loading ? "Restaurando..." : "Restaurar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
