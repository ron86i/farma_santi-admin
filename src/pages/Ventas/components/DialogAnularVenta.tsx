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
import { useVentasContext } from "@/context";
import { useAnularVenta } from "@/hooks/useVenta";
import { VentaDetail } from "@/models";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogAnularVentaProps {
    venta: VentaDetail;
    onClose?: () => void;
    onConfirmed?: () => void;
    open: boolean;
}

export function DialogAnularVenta({ venta, onClose, open,onConfirmed}: DialogAnularVentaProps) {
    const { mutate: anularVenta, data, loading, error } = useAnularVenta();
    const { ventaAction, setVentaAction } = useVentasContext();
    const onSubmit = async () => {
        try {
            await anularVenta(venta.id);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Venta anulada"
                    message={`La venta ${venta.codigo} fue anulada correctamente.`}
                    date={dateFormat(Date.now())}
                />
            ));
            setVentaAction(!ventaAction)
            onClose?.();
            onConfirmed?.();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al anular venta"
                    message={err?.response?.message || err?.message || `No se pudo anular la venta ${venta.codigo}.`}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={(estado) => !estado && onClose?.()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Estás seguro de anular la venta <strong>{venta.codigo}</strong>?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        Esta acción marcará la venta como <strong>anulada</strong>. Seguirá visible en el historial, pero no afectará totales ni procesos activos.
                        <br />
                        Si fue un error, podrás registrar una nueva venta manualmente, pero esta <u>no se puede recuperar</u>.
                        {error && <p className="text-sm text-red-500">Error: {error}</p>}
                        {data && <p className="text-sm text-green-600">{data?.message}</p>}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onSubmit}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? "Anulando..." : "Confirmar anulación"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
