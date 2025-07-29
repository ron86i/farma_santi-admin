import { Dialog, DialogContent, Separator } from "@/components/ui";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import dateFormat from "dateformat";
import { useQuery } from "@/hooks/generic";
import { obtenerClienteById } from "@/services";

interface ModalDetalleClienteProps {
  onClose?: () => void;
  open: boolean;
  clienteId: number;
}

export function ModalDetalleCliente({ clienteId, open, onClose }: ModalDetalleClienteProps) {
  const { fetch, data: cliente } = useQuery(obtenerClienteById);

  useEffect(() => {
    const obtenerDatos = async () => {
      await fetch(clienteId);
    };
    obtenerDatos();
  }, [clienteId]);

  return (
    <Dialog modal open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-h-screen overflow-auto sm:max-w-[600px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-xl font-bold">Detalles del cliente</DialogTitle>

        <div className="space-y-4 text-sm">
          <div className="flex gap-x-2">
            <p className="font-semibold">ID:</p>
            <p>{cliente?.id}</p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">{cliente?.estado === 'NIT'?'NIT':'CI'}</p>
            <p>
              {cliente?.nitCi ?? "—"} {cliente?.complemento ?? ""}
            </p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">Razón Social:</p>
            <p>{cliente?.razonSocial}</p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">Email:</p>
            <p>{cliente?.email}</p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">Teléfono:</p>
            <p>{cliente?.telefono || "—"}</p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">Fecha de registro:</p>
            <p>{cliente?.createdAt && dateFormat(cliente.createdAt)}</p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">Estado:</p>
            {cliente?.deletedAt ? (
              <div>
                <p className="text-red-500">Eliminado</p>
                <p className="text-sm text-muted-foreground">
                  Fecha de eliminación:{" "}
                  {dateFormat(cliente.deletedAt, "dddd d 'de' mmmm yyyy, h:MM TT")}
                </p>
              </div>
            ) : (
              <p className="text-green-600">Activo</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
