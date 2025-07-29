import { CustomToast } from "@/components/toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useClientesContext } from "@/context";
import { useHabilitarClienteById } from "@/hooks/useCliente";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface DialogHabilitarClienteProps {
  clienteId: number;
  ciNit: string;
  razonSocial: string;
  open: boolean;
  onClose?: () => void;
}

export function DialogHabilitarCliente({ clienteId, ciNit, razonSocial, open, onClose }: DialogHabilitarClienteProps) {
  const { mutate: habilitarCliente, data, loading, error } = useHabilitarClienteById();
  const { clienteAction, setClienteAction } = useClientesContext();

  const onSubmit = async () => {
    try {
      const response = await habilitarCliente(clienteId);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Cliente habilitado"
          message={response?.message || "El cliente fue restaurado correctamente"}
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
          title="Error al habilitar cliente"
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
          <AlertDialogTitle>¿Restaurar este cliente?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Esta acción volverá a habilitar al cliente con CI/NIT <strong>{ciNit}</strong> y razón social <strong>{razonSocial}</strong> en el sistema.
            {error && <p className="text-sm text-red-500">Ocurrió un error: {error}</p>}
            {data && <p className="text-sm text-green-600">{data.message}</p>}
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
