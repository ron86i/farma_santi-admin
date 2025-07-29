import { z } from "zod";
import { useRegistrarPrincipioActivo } from "@/hooks"; // Hook personalizado para registrar principio activo
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { useForm } from "react-hook-form";

import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";
import { usePrincipiosActivosContext } from "@/context/principioActivoContext";
import { PrincipioActivo, PrincipioActivoRequest } from "@/models/principioActivo";

const schema = z.object({
  nombre: z
    .string({ required_error: "Campo obligatorio" })
    .trim()
    .min(1, { message: "Por favor, ingresa un nombre del principio activo" }),
  descripcion: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ModalRegistrarPrincipioActivoProps {
  onClose?: () => void;
  open: boolean;
  onEnviarDato?: (valor: PrincipioActivo) => void;
}

export function ModalRegistrarPrincipioActivo({ open, onClose, onEnviarDato }: ModalRegistrarPrincipioActivoProps) {
  const { mutate: registrarPrincipioActivo } = useRegistrarPrincipioActivo();
  const { principioActivoAction, setPrincipioActivoAction } = usePrincipiosActivosContext();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nombre: "",
      descripcion: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    const principioActivoRequest: PrincipioActivoRequest = {
      nombre: data.nombre,
      descripcion: data.descripcion ?? ""
    };

    try {
      const response = await registrarPrincipioActivo(principioActivoRequest);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Principio activo registrado"
          message={response?.message || "Registrado correctamente"}
          date={dateFormat(Date.now())}
        />
      ));
      if (onEnviarDato) {
        onEnviarDato(response?.data as PrincipioActivo)
      }
      setPrincipioActivoAction(!principioActivoAction);
      form.reset();
      if (onClose) onClose();
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al registrar principio activo"
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
          <DialogTitle>Registrar principio activo</DialogTitle>
          <DialogDescription>
            Ingresa los datos del principio activo en el sistema.
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
