import { z } from "zod";
import { useEffect } from "react";
import { useQuery, useModificarPrincipioActivo } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { useForm } from "react-hook-form";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";
import { usePrincipiosActivosContext } from "@/context/principioActivoContext";
import { PrincipioActivoRequest } from "@/models/principioActivo";
import { obtenerPrincipioActivoById } from "@/services";

const schema = z.object({
  nombre: z
    .string({ required_error: "Campo obligatorio" })
    .trim()
    .min(1, { message: "Por favor, ingresa un nombre del principio activo" }),
  descripcion: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ModalModificarPrincipioActivoProps {
  open: boolean;
  onClose?: () => void;
  id: number;
}

export function ModalModificarPrincipioActivo({
  id,
  open,
  onClose,
}: ModalModificarPrincipioActivoProps) {
  const { mutate: modificarPrincipioActivo } = useModificarPrincipioActivo();
  const { principioActivoAction, setPrincipioActivoAction } = usePrincipiosActivosContext();
  const { fetch: fetchPA, data: dataPA } = useQuery(obtenerPrincipioActivoById);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  });

  // Fetch al abrir el modal
  useEffect(() => {
    if (open) {
      fetchPA(id);
    }
  }, [id, open]);

  // Cuando llegan los datos, los seteamos en el formulario
  useEffect(() => {
    if (dataPA) {
      form.reset({
        nombre: dataPA.nombre || "",
        descripcion: dataPA.descripcion || "",
      });
    }
  }, [dataPA, form]);

  const onSubmit = async (formData: FormData) => {
    const request: PrincipioActivoRequest = {
      nombre: formData.nombre,
      descripcion: formData.descripcion ?? "",
    };

    try {
      const response = await modificarPrincipioActivo(id, request);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Principio activo modificado"
          message={response?.message || "Modificado correctamente"}
          date={dateFormat(Date.now())}
        />
      ));
      setPrincipioActivoAction(!principioActivoAction);
      form.reset();
      if (onClose) onClose();
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al modificar principio activo"
          message={err?.response?.message || err?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  return (
    <Dialog
      modal
      defaultOpen={false}
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent
        className="max-h-[96%] w-full overflow-auto sm:max-w-[600px] [&_[data-dialog-close]]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Modificar principio activo</DialogTitle>
          <DialogDescription>
            Edita los datos del principio activo en el sistema.
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
                  <FormLabel>Nombre del principio activo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Paracetamol, Ibuprofeno, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional: Descripción del principio activo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4 px-4 py-2 transition">
              Guardar cambios
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
