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
import { useUsuariosContext } from "@/context/usuarioContex";
  import { useModificareStatusUsuario } from "@/hooks/useUsuario";
  import dateFormat from "dateformat";
  
  interface DialogModificarStatusProps {
    usuarioId: number;
    deletedAt: Date | null;
    onClose?: () => void;
    open: boolean;
  }
  
  export function DialogModificarStatus({
    usuarioId,
    deletedAt,
    onClose,
    open,
  }: DialogModificarStatusProps) {
    const estaEliminado = !!deletedAt;
    const { fetchModificar, message, loading, error } = useModificareStatusUsuario();
    const { usuarioAction, setUsuarioAction } = useUsuariosContext();
    const onSubmit = async () => {
      const ok = await fetchModificar(usuarioId);
      if (ok && onClose) {
        setUsuarioAction(!usuarioAction)
        onClose();
      }
    };
  
    return (
      <AlertDialog open={open} onOpenChange={(estado) => !estado && onClose?.()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {estaEliminado
                ? "¿Deseas restaurar este usuario?"
                : "¿Deseas deshabilitar este usuario?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {estaEliminado ? (
                <>
                  Este usuario fue deshabilitado el{" "}
                  <strong>
                    {dateFormat(deletedAt, "dddd d 'de' mmmm yyyy, h:MM TT")}
                  </strong>
                  . Al restaurarlo, volverá a estar activo y podrá acceder nuevamente al sistema.
                </>
              ) : (
                <>
                  Esta acción deshabilitará al usuario. No podrá iniciar sesión ni realizar acciones
                  en el sistema. Podrás restaurarlo más adelante si lo deseas.
                </>
              )}
              {error && (
                <p className="mt-2 text-sm text-red-500">
                  Ocurrió un error: {error}
                </p>
              )}
              {message && (
                <p className="mt-2 text-sm text-green-600">
                  {message.message}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onSubmit} disabled={loading}>
              {loading
                ? (estaEliminado ? "Restaurando..." : "Deshabilitando...")
                : (estaEliminado ? "Restaurar" : "Deshabilitar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  