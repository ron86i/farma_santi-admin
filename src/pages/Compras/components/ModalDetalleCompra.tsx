import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@/hooks";
import { obtenerCompraById } from "@/services/compraService";
import { FileText } from "lucide-react";
import { useEffect } from "react";
import { DetalleCompra } from "./DetalleCompra";

interface ModalDetalleCompraProps {
    compraId: number;
    onClose?: () => void;
    open: boolean;
}

export function ModalDetalleCompra({ compraId, open, onClose }: ModalDetalleCompraProps) {
    const { data: dataCompra, fetch: fetchCompra, loading } = useQuery(obtenerCompraById);

    useEffect(() => {
        if (open) fetchCompra(compraId);
    }, [open]);

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto sm:max-w-[900px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <FileText className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                Detalle de Orden de Compra
                            </DialogTitle>

                        </div>
                    </div>
                </DialogHeader>

                <DetalleCompra loading={loading} dataCompra={dataCompra}/>
            </DialogContent>
        </Dialog>
    );
}