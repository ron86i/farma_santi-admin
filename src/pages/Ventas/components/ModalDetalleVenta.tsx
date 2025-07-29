import { Dialog, DialogContent, DialogTitle } from "@/components/ui";
import { useQuery } from "@/hooks";
import { obtenerVentaById } from "@/services";
import { useEffect } from "react";
import { DetalleVenta } from "./DetalleVenta";

interface ModalDetalleVentaProps {
    ventaId: number;
    onClose?: () => void;
    open: boolean;
}

export function ModalDetalleVenta({ open, onClose, ventaId }: ModalDetalleVentaProps) {
    const { fetch: fetchVenta, data: dataVenta, loading } = useQuery(obtenerVentaById);

    useEffect(() => {
        if (ventaId && open) fetchVenta(ventaId);
    }, [ventaId, open]);

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto sm:max-w-[900px]"
                onInteractOutside={e => e.preventDefault()}
                onEscapeKeyDown={e => e.preventDefault()}
            >
                <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white border-b pb-3">
                    Detalle de Venta
                </DialogTitle>

                <DetalleVenta loading={loading} dataVenta={dataVenta}/>
            </DialogContent>
        </Dialog>
    );
}