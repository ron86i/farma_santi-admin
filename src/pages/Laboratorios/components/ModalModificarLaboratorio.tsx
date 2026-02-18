import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { useForm } from "react-hook-form";
import { LaboratorioRequest } from "@/models";
import { useLaboratoriosContext } from "@/context";
import { useEffect } from "react";
import { useQuery } from "@/hooks/generic";
import { obtenerLaboratorioById } from "@/services";
import { useModificarLaboratorio } from "@/hooks";
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
    .string().optional(),
  representante: z.string().optional(),
  email: z.union([
    z.literal(''),
    z.string().email("Debe se un email válido"),
  ]),
  telefono: z.coerce.number({
    invalid_type_error: "El teléfono debe ser un número.",
  }).optional(),
  celular: z.coerce.number({
    required_error: "El teléfono es obligatorio.",
    invalid_type_error: "El teléfono debe ser un número.",
  }).optional(),
});

type FormData = z.infer<typeof schema>;

interface ModalModificarLaboratorioProps {
  laboratorioId: number;
  open: boolean;
  onClose?: () => void;
}

export function ModalModificarLaboratorio({
  laboratorioId,
  open,
  onClose,
}: ModalModificarLaboratorioProps) {
  const { mutate: modificarLaboratorio } = useModificarLaboratorio();
  const { laboratorioAction, setLaboratorioAction } = useLaboratoriosContext();
  const { fetch: fetchLaboratorio, data: laboratorio } = useQuery(obtenerLaboratorioById);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { nombre: "", direccion: "",email:"" },
  });

  // 1) Cargar laboratorio al abrir el modal
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      await fetchLaboratorio(laboratorioId);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, laboratorioId]);

  // 2) Reseteo del form cuando llegan los datos
  useEffect(() => {
    if (laboratorio) {
      form.reset({
        nombre: laboratorio.nombre,
        direccion: laboratorio.direccion ?? "",
      });
    }
  }, [laboratorio, form]);

  // 3) Enviar cambios
  const onSubmit = async (data: FormData) => {
    const laboratorioRequest: LaboratorioRequest = {
      nombre: data.nombre,
      direccion: data.direccion!!,
      representante: data.representante || "",
      celular: data.celular,
      email: data.email,
      telefono: data.telefono
    };

    try {
      const response = await modificarLaboratorio(laboratorioId, laboratorioRequest);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Laboratorio modificado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setLaboratorioAction(!laboratorioAction);
      form.reset();
      onClose?.();
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al modificar laboratorio"
          message={err?.response?.message || err?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  return (
    <Dialog modal defaultOpen={false} open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[96%] w-full overflow-auto sm:max-w-[600px] [&_[data-dialog-close]]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Modificar laboratorio</DialogTitle>
          <DialogDescription>
            Modifica los datos del laboratorio en el sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2 text-black dark:text-white"
          >
            {/* Nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Laboratorio ACME" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dirección */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. Principal #123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Representante</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="example@hotmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="celular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4 px-4 py-2 transition">
              Guardar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
