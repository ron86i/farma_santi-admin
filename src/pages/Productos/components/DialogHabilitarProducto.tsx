import { CustomToast } from "@/components/toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useProductosContext } from "@/context/productoContext";
import { useHabilitarProducto } from "@/hooks/useProducto";
import dateFormat from "dateformat";
import { useEffect } from "react";
import { toast } from "sonner";

interface DialogHabilitarProductoProps {
    productoId: string;
    deletedAt: Date | null;
    onClose?: () => void;
    open: boolean;
}

export function DialogHabilitarProducto({ productoId, deletedAt, onClose, open }: DialogHabilitarProductoProps) {
    const { mutate: habilitarProducto, data, loading, error } = useHabilitarProducto();
    const { productoAction, setProductoAction } = useProductosContext();

    const onSubmit = async () => {
        try {
            const response = await habilitarProducto(productoId);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Producto habilitado"
                    message={response?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
            setProductoAction(!productoAction);
            onClose?.();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al habilitar producto"
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
                    <AlertDialogTitle>¿Deseas habilitar este producto?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        Este producto fue deshabilitado el{" "}
                        <strong>{dateFormat(deletedAt!!, "dddd d 'de' mmmm yyyy, h:MM TT")}</strong>.
                        <br />
                        Al habilitarlo, volverá a estar disponible en el sistema.
                        <br />
                        <strong>Nota:</strong> las asociaciones previas u otros datos relacionados no se restauran automáticamente.
                        {error && (
                            <p className="text-sm text-red-500">
                                Ocurrió un error al intentar habilitar el producto: {error}
                            </p>
                        )}
                        {data && (
                            <p className="text-sm text-green-600">
                                {data?.message || "El producto se habilitó correctamente."}
                            </p>
                        )}
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
