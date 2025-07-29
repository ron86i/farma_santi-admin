import { z } from "zod";
import { useRegistrarLaboratorio } from "@/hooks"; // Hook personalizado para registrar laboratorio
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { useForm } from "react-hook-form";
import { LaboratorioRequest } from "@/models"; // Modelo del request
import { useLaboratoriosContext } from "@/context";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";

const schema = z.object({
  nombre: z
    .string({
      required_error: "Campo obligatorio"
    })
    .trim()
    .min(1, { message: "Por favor, ingresa un nombre del laboratorio" }),
  direccion: z
    .string().optional()
});

type FormData = z.infer<typeof schema>;

interface ModalRegistrarLaboratorioProps {
  onClose?: () => void;
  open: boolean;
}

export function ModalRegistrarLaboratorio({ open, onClose }: ModalRegistrarLaboratorioProps) {
  const { mutate: registrarLaboratorio } = useRegistrarLaboratorio();
  const { laboratorioAction, setLaboratorioAction } = useLaboratoriosContext();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nombre: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    const laboratorioRequest: LaboratorioRequest = {
      nombre: data.nombre,
      direccion: data.direccion!!
    };

    try {
      const response = await registrarLaboratorio(laboratorioRequest);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Laboratorio registrado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setLaboratorioAction(!laboratorioAction);
      form.reset();
      if (onClose) onClose();
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al registrar laboratorio"
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
          <DialogTitle>Registrar laboratorio</DialogTitle>
          <DialogDescription>
            Ingresa los datos del laboratorio en el sistema.
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
                  <FormLabel>Nombre del laboratorio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Bayer, Bagó, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección del laboratorio</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. La Paz" {...field} />
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
