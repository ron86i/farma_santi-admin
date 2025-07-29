import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { useForm } from "react-hook-form";
import { CategoriaRequest } from "@/models";
import { useRegistrarCategoria } from "@/hooks/useCategoria";
import { useCategoriasContext } from "@/context";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";

const schema = z.object({
  nombre: z
    .string({
      required_error: "Campo obligatorio",
    })
    .trim()
    .min(1, { message: "Por favor, ingresa un nombre de la categoría" })
});

type FormData = z.infer<typeof schema>;

interface ModalRegistrarCategoriaProps {
  onClose?: () => void;
  open: boolean;
}

export function ModalRegistrarCategoria({ open, onClose }: ModalRegistrarCategoriaProps) {
  const { mutate } = useRegistrarCategoria();
  const { categoriaAction, setCategoriaAction } = useCategoriasContext();


  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nombre: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    const rolRequest: CategoriaRequest = {
      nombre: data.nombre
    };

    try {
      const response = await mutate(rolRequest);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Categoría registrada"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setCategoriaAction(!categoriaAction);
      form.reset();
      if (onClose) onClose();
    } catch (err:any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al registrar categoría"
          message={err?.response?.message || err?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  return (
    <Dialog modal defaultOpen={false} open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[96%] w-full overflow-auto sm:max-w-[600px] [&_[data-dialog-close]]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader >
          <DialogTitle>Registrar categoría</DialogTitle>
          <DialogDescription>
            Ingresa los datos de la categoría en el sistema.
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
                    <Input placeholder="categoria123" {...field} />
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

