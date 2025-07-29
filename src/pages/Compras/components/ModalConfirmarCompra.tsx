import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCompletarCompra, useQuery } from "@/hooks";
import { obtenerCompraById } from "@/services/compraService";
import { ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { useComprasContext } from "@/context/compraContext";
import { DetalleCompra } from "./DetalleCompra";

interface ModalConfirmarCompraProps {
    compraId: number;
    onClose?: () => void;
    open: boolean;
}

export function ModalConfirmarCompra({ compraId, open, onClose }: ModalConfirmarCompraProps) {
    const { data: dataCompra, fetch: fetchCompra, loading } = useQuery(obtenerCompraById);
    const { mutate: completarCompra } = useCompletarCompra()
    const { compraAction, setCompraAction } = useComprasContext()
    useEffect(() => {
        if (open) fetchCompra(compraId);
    }, [open]);

    const onSubmit = async () => {
        try {
            const response = await completarCompra(compraId)
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Compra registrada"
                    message={response?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
            setCompraAction(!compraAction)
            if (onClose) onClose();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al registrar compra"
                    message={err?.response?.message || err?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    }

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto sm:max-w-[900px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">Confirmación de Compra</DialogTitle>
                            <DialogDescription>
                                Información completa de la orden registrada
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <DetalleCompra loading={loading} dataCompra={dataCompra} />

                <div className="flex justify-end">
                    <Button type="button" className="h-11 px-8 bg-green-500 dark:bg-green-800"
                        onClick={(e) => {
                            e.preventDefault();
                            onSubmit();
                        }}
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Registrar compra
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
