import { Button, Dialog, DialogContent, DialogTitle } from "@/components/ui";
import { useQuery } from "@/hooks";
import { obtenerVentaById } from "@/services";
import { useEffect, useState } from "react";
import { DetalleVenta } from "./DetalleVenta";
import { DialogAnularVenta } from "./DialogAnularVenta";

interface ModalAnularVentaProps {
    ventaId: number;
    onClose?: () => void;
    open: boolean;
}

export function ModalAnularVenta({ open, onClose, ventaId }: ModalAnularVentaProps) {
    const [openDialogAnular, setOpenDiaglogAnular] = useState(false);
    const { fetch: fetchVenta, data: dataVenta, loading } = useQuery(obtenerVentaById);
    useEffect(() => {
        if (ventaId && open) fetchVenta(ventaId);
    }, [ventaId, open]);

    return (
        <>
            <Dialog modal open={open} onOpenChange={onClose}>
                <DialogContent
                    className="w-full max-h-screen overflow-auto sm:max-w-[900px]"
                    onInteractOutside={e => e.preventDefault()}
                    onEscapeKeyDown={e => e.preventDefault()}
                >
                    <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-white border-b pb-3">
                        Anular venta
                    </DialogTitle>
                    <DetalleVenta loading={loading} dataVenta={dataVenta} />
                    <Button variant="destructive" onClick={() => { setOpenDiaglogAnular(true) }} >Anular venta</Button>
                </DialogContent>
            </Dialog>
            {openDialogAnular &&
                <DialogAnularVenta venta={dataVenta!!} open={openDialogAnular} onClose={() => { setOpenDiaglogAnular(false) }} onConfirmed={()=>{onClose?.()}}/>
            }
        </>
    );
}