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
import { useHabilitarProveedorById } from "@/hooks";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogHabilitarProveedorProps {
    proveedorId: number;
    deletedAt: Date;
    open: boolean;
    onClose?: () => void;
}

export function DialogHabilitarProveedor({ proveedorId, deletedAt, open, onClose }: DialogHabilitarProveedorProps) {
    const { mutate: habilitarProveedor, data, loading, error } = useHabilitarProveedorById();
    const { proveedorAction, setProveedorAction } = useProveedoresContext();

    const onSubmit = async () => {
        try {
            const response = await habilitarProveedor(proveedorId);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Proveedor habilitado"
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
                    title="Error al habilitar proveedor"
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
                    <AlertDialogTitle>¿Restaurar este proveedor?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        Este proveedor fue deshabilitado el{" "}
                        <strong>{dateFormat(deletedAt, "dddd d 'de' mmmm yyyy, h:MM TT")}</strong>.
                        Al restaurarlo, volverá a estar activo y disponible para asignaciones y compras.
                        {error && <p className="text-sm text-red-500">Ocurrió un error: {error}</p>}
                        {data && <p className="text-sm text-green-600">{data?.message}</p>}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit} disabled={loading}>
                        {loading ? "Restaurando…" : "Restaurar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
