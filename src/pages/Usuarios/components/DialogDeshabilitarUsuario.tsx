import { CustomToast } from "@/components/toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useUsuarioDetailContext } from "@/context/usuarioDetailContext";
import { useUsuariosContext } from "@/context/usuarioContex";
import { useDeshabilitarUsuarioById } from "@/hooks";
import { logOut } from "@/services";
import dateFormat from "dateformat";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface DialogDeshabilitarUsuarioProps {
  usuarioId: number;
  deletedAt: Date | null;
  onClose?: () => void;
  open: boolean;
}

export function DialogDeshabilitarUsuario({
  usuarioId,
  deletedAt,
  onClose,
  open
}: DialogDeshabilitarUsuarioProps) {
  const { mutate: deshabilitar, data, loading, error } = useDeshabilitarUsuarioById();
  const { usuarioAction, setUsuarioAction } = useUsuariosContext();
  const { usuario, clearUsuario } = useUsuarioDetailContext();
  const navigate = useNavigate();
  const onSubmit = async () => {
    try {
      const response = await deshabilitar(usuarioId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Usuario deshabilitado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      if (usuario?.id === usuarioId) {
        clearUsuario()
        await logOut()
        navigate("/login");
      }

      setUsuarioAction(!usuarioAction);
      onClose?.();
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al deshabilitar usuario"
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
            ¿Deseas deshabilitar este usuario?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <>
              Esta acción deshabilitará al usuario, impidiendo que acceda al sistema.
              {deletedAt && (
                <>
                  <br />
                  Actualmente fue deshabilitado el{" "}
                  <strong>
                    {dateFormat(deletedAt, "dddd d 'de' mmmm yyyy, h:MM TT")}
                  </strong>
                  .
                </>
              )}
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
          <AlertDialogAction onClick={onSubmit} >
            {loading ? "Deshabilitando..." : "Deshabilitar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
