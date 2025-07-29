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
import { useProveedoresContext } from "@/context";
import { useDeshabilitarProveedorById } from "@/hooks";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogDeshabilitarProveedorProps {
    proveedorId: number;
    open: boolean;
    onClose?: () => void;
}

export function DialogDeshabilitarProveedor({ proveedorId, open, onClose }: DialogDeshabilitarProveedorProps) {
    const { mutate: deshabilitarProveedor, data, loading, error } = useDeshabilitarProveedorById();
    const { proveedorAction, setProveedorAction } = useProveedoresContext();

    const onSubmit = async () => {
        try {
            const response = await deshabilitarProveedor(proveedorId);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Proveedor deshabilitado"
                    message={response?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
            setProveedorAction(!proveedorAction);
            onClose?.();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al deshabilitar proveedor"
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
                    <AlertDialogTitle>¿Deshabilitar este proveedor permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción <strong>quitará este proveedor de todas las operaciones</strong> y lo dejará inactivo. Podrás restaurarlo más adelante, pero <u>no</u> se asignará automáticamente a operaciones previas.
                        {error && <p className="mt-2 text-sm text-red-500">Ocurrió un error: {error}</p>}
                        {data && <p className="mt-2 text-sm text-green-600">{data?.message}</p>}
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
