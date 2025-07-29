import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { useForm } from "react-hook-form";
import { RolRequest } from "@/models";
import { useRolesContext } from "@/context/rolesContext";
import { useEffect } from "react";
import { useQuery } from "@/hooks/generic";
import { obtenerRolById } from "@/services";
import { useModificarRol } from "@/hooks";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";

const schema = z.object({
  nombre: z
    .string({ required_error: "Campo obligatorio" })
    .trim()
    .min(1, { message: "Por favor, ingresa el nombre del rol" })
    .max(50, { message: "Límite de carácteres excedido" }),
});

type FormData = z.infer<typeof schema>;

interface ModalModificarRolProps {
  rolId: number
  onClose?: () => void;
  open: boolean;
}

export function ModalModificarRol({ rolId, open, onClose }: ModalModificarRolProps) {
  const { mutate: modificarRol } = useModificarRol();
  const { rolAction, setRolAction } = useRolesContext();
  const { fetch: fetchObtener, data: rol } = useQuery(obtenerRolById)



  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nombre: ""
    }
  });

  // 1) Traer el rol cuando el modal se abra o cambie el id
  useEffect(() => {
    const load = async () => {
      await fetchObtener(rolId);          // esto actualiza 'rol' internamente
    };
    load();
  }, []);

  // 2) Cuando 'rol' cambie, reseteamos el form
  useEffect(() => {
    if (rol) {
      form.reset({ nombre: rol.nombre });
    }
    // también podrías gestionar error aquí si lo deseas
  }, [rol]);

  const onSubmit = async (data: FormData) => {
    const rolRequest: RolRequest = {
      nombre: data.nombre
    };

    try {
      const response = await modificarRol(rolId, rolRequest);
      setRolAction(!rolAction);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Rol modificado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      form.reset();
      if (onClose) onClose();
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al modificar rol"
          message={err?.response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      console.error("Error al modificar:", err);
    }
  };

  return (
    <Dialog modal defaultOpen={false} open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[96%] w-full overflow-auto sm:max-w-[600px] [&_[data-dialog-close]]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader >
          <DialogTitle>Modificar rol</DialogTitle>
          <DialogDescription>
            Modifica los datos del rol en el sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2 text-black dark:text-white"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="rol123" {...field} max={50} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-4 px-4 py-2 transition"
            >
              Guardar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

