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
import { useModificarEstadoRol } from "@/hooks";
import dateFormat from "dateformat";

interface DialogModificarEstadoProps {
    rolId: number;
    deletedAt: Date | null;
    onClose?: () => void;
    open: boolean;
}

export function DialogModificarEstado({ rolId, deletedAt, onClose, open }: DialogModificarEstadoProps) {
    const estaEliminado = Boolean(deletedAt);
    const { fetch, message, loading, error } = useModificarEstadoRol();
    const { rolAction, setRolAction } = useRolesContext();

    const onSubmit = async () => {
        const ok = await fetch(rolId);
        if (ok && onClose) {
            setRolAction(!rolAction);
            onClose();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={(estado) => !estado && onClose?.()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {estaEliminado ? "¿Restaurar este rol?" : "¿Deshabilitar este rol permanentemente?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {estaEliminado ? (
                            <>
                                Este rol se deshabilitó el {""}
                                <strong>
                                    {dateFormat(deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}
                                </strong>
                                . Al restaurarlo, volverá a estar activo; sin embargo, **los usuarios no recuperarán automáticamente este rol**.
                            </>
                        ) : (
                            <>
                                Esta acción <strong>quitará este rol de todos los usuarios</strong> y lo dejará inactivo. Podrás restaurarlo más adelante, pero los usuarios <u>no</u> recuperarán sus roles automáticamente; deberás asignárselos de nuevo manualmente.
                            </>
                        )}
                        {error && <p className="mt-2 text-sm text-red-500">Ocurrió un error: {error}</p>}
                        {message && <p className="mt-2 text-sm text-green-600">{message.message}</p>}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit} disabled={loading}>
                        {loading ? (estaEliminado ? "Restaurando…" : "Deshabilitando…") : estaEliminado ? "Restaurar" : "Deshabilitar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
