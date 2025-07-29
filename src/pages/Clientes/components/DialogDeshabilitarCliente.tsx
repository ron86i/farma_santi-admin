import { CustomToast } from "@/components/toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useClientesContext } from "@/context";
import { useDeshabilitarClienteById } from "@/hooks/useCliente";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogDeshabilitarClienteProps {
    clienteId: number;
    ciNit: string;
    razonSocial: string;
    open: boolean;
    onClose?: () => void;
}

export function DialogDeshabilitarCliente({ clienteId, ciNit, razonSocial, open, onClose }: DialogDeshabilitarClienteProps) {
    const { mutate: deshabilitarCliente, data, loading, error } = useDeshabilitarClienteById();
    const { clienteAction, setClienteAction } = useClientesContext();

    const onSubmit = async () => {
        try {
            const response = await deshabilitarCliente(clienteId);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Cliente deshabilitado"
                    message={response?.message || "El cliente fue deshabilitado correctamente"}
                    date={dateFormat(Date.now())}
                />
            ));
            setClienteAction(!clienteAction);
            onClose?.();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al deshabilitar cliente"
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
                    <AlertDialogTitle>¿Deshabilitar este cliente?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        Esta acción <strong>desactivará al cliente</strong> con CI/NIT <strong>{ciNit}</strong> y razón social <strong>{razonSocial}</strong>.
                        Ya no podrá usarse en nuevas operaciones, aunque podrás volver a habilitarlo más adelante si lo deseas.
                        {error && <p className="text-sm text-red-500">Ocurrió un error: {error}</p>}
                        {data && <p className="text-sm text-green-600">{data.message}</p>}
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
