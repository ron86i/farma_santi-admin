import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { useForm } from "react-hook-form";
import { RolRequest } from "@/models";
import { useEffect } from "react";
import { useModificarCategoria } from "@/hooks/useCategoria";
import { useCategoriasContext } from "@/context";
import { useQuery } from "@/hooks/generic";
import { obtenerCategoriaById } from "@/services";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";

const schema = z.object({
  nombre: z
    .string({
      required_error: "Campo obligatorio",
    })
    .trim()
    .min(1, { message: "Por favor, ingresa el nombre de la categoría" })
});

type FormData = z.infer<typeof schema>;

interface ModalModificarCategoriaProps {
  categoriaId: number
  onClose?: () => void;
  open: boolean;
}

export function ModalModificarCategoria({ categoriaId, open, onClose }: ModalModificarCategoriaProps) {
  const { mutate: fetchModificar } = useModificarCategoria();
  const { categoriaAction, setCategoriaAction } = useCategoriasContext();
  const { fetch: fetchObtener, data: categoria } = useQuery(obtenerCategoriaById)



  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nombre: ""
    }
  });

  useEffect(() => {
    const load = async () => {
      await fetchObtener(categoriaId);
    };
    load();
  }, []);

  useEffect(() => {
    if (categoria) {
      form.reset({ nombre: categoria.nombre });
    }
  }, [categoria]);

  const onSubmit = async (data: FormData) => {
    const rolRequest: RolRequest = {
      nombre: data.nombre
    };

    try {
      const response = await fetchModificar(categoriaId, rolRequest);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Categoría modificada"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setCategoriaAction(!categoriaAction);
      form.reset();
      if (onClose) onClose();
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
      <DialogContent className="max-h-[96%] w-full overflow-auto sm:max-w-[600px] [&_[data-dialog-close]]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader >
          <DialogTitle>Modificar categoría</DialogTitle>
          <DialogDescription>
            Modifica los datos del categoría en el sistema.
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
                    <Input placeholder="categoría123" {...field} />
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

