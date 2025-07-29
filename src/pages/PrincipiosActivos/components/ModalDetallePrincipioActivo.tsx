import { Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import { useQuery } from "@/hooks/generic";
import { obtenerPrincipioActivoById } from "@/services";

interface ModalDetallePrincipioActivoProps {
    onClose?: () => void;
    open: boolean;
    paId: number;
}

export function ModalDetallePrincipioActivo({ paId, open, onClose }: ModalDetallePrincipioActivoProps) {
    const { fetch, data: pa } = useQuery(obtenerPrincipioActivoById);

    useEffect(() => {
        fetch(paId);
    }, [paId]);

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-h-screen overflow-auto sm:max-w-[600px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogTitle className="text-xl font-bold">Detalles del laboratorio</DialogTitle>

                <div className="space-y-4 text-sm">
                    <div className="flex gap-x-2">
                        <p className="font-semibold">ID:</p>
                        <p>{pa?.id}</p>
                    </div>
                    
                    <Separator />

                    <div>
                        <p className="font-semibold">Nombre:</p>
                        <p>{pa?.nombre}</p>
                    </div>

                    <Separator />

                    <div>
                        <p className="font-semibold">Descripción:</p>
                        <p>{pa?.descripcion}</p>
                    </div>

                    <Separator />
                </div>
            </DialogContent>
        </Dialog>
    );
}
