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

import { useProductosContext } from "@/context/productoContext";

import { useDeshabilitarProducto } from "@/hooks/useProducto";

import dateFormat from "dateformat";
import { useEffect } from "react";
import { toast } from "sonner";

interface DialogDeshabilitarProductoProps {
    productoId: string;
    onClose?: () => void;
    open: boolean;
}

export function DialogDeshabilitarProducto({ productoId, onClose, open }: DialogDeshabilitarProductoProps) {
    const { mutate: deshabilitarProducto, data, loading, error } = useDeshabilitarProducto();
    const { productoAction, setProductoAction } = useProductosContext();

    const onSubmit = async () => {
        try {
            const response = await deshabilitarProducto(productoId);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Producto deshabilitado"
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
                    title="Error al deshabilitar producto"
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
      <AlertDialogTitle>¿Deseas deshabilitar este producto?</AlertDialogTitle>
      <AlertDialogDescription className="space-y-2">
        Al deshabilitar este producto, dejará de estar disponible para su uso o visualización dentro del sistema.
        <br />
        <strong>Esta acción no eliminará el producto ni sus datos asociados.</strong>
        <br />
        Podrás habilitarlo nuevamente más adelante si es necesario.
        {error && (
          <p className="text-sm text-red-500">
            Ocurrió un error al intentar deshabilitar el producto: {error}
          </p>
        )}
        {data && (
          <p className="text-sm text-green-600">
            {data?.message || "El producto fue deshabilitado correctamente."}
          </p>
        )}
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
