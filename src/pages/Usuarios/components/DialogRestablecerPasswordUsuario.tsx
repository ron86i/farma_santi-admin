import { CustomToast } from "@/components/toast";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import { useUsuariosContext } from "@/context/usuarioContex";
import { useRestablecerPasswordUsuarioById } from "@/hooks"; // <-- Debes crearlo si no existe
import { generarPDFUsuario } from "@/utils/pdf";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogRestablecerPasswordUsuarioProps {
    usuarioId: number;
    username: string;
    open: boolean;
    onClose?: () => void;
}

export function DialogRestablecerPasswordUsuario({
    usuarioId,
    username,
    open,
    onClose
}: DialogRestablecerPasswordUsuarioProps) {
    const { mutate: restablecer, error, data, loading } = useRestablecerPasswordUsuarioById();
    const { usuarioAction, setUsuarioAction } = useUsuariosContext();

    const onSubmit = async () => {
        try {
            const response = await restablecer(usuarioId);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Contraseña restablecida"
                    message={response?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
            if (response?.data) {
                generarPDFUsuario(response.data); // Genera PDF si la respuesta contiene datos
            }

            setUsuarioAction(!usuarioAction);
            if (onClose) onClose();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al restablecer contraseña"
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
                        ¿Restablecer contraseña del usuario?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        <>
                            Esta acción restablecerá la contraseña del usuario <strong>{username}</strong> al valor predeterminado.
                            Luego, podrá ingresar con la nueva contraseña.
                        </>
                        {error && (
                            <p className="mt-2 text-sm text-red-500">
                                Ocurrió un error: {error}
                            </p>
                        )}
                        {data?.message && (
                            <p className="mt-2 text-sm text-green-600">
                                {data.message}
                            </p>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit} disabled={loading}>
                        {loading ? "Restableciendo..." : "Restablecer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
