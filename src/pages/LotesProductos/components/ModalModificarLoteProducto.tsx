import { z } from "zod";
import { useForm } from "react-hook-form";
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
import {
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import dateFormat from "dateformat";

import { useModificarLoteProducto, useQuery } from "@/hooks";
import { obtenerListaProductos } from "@/services/productoService";
import { obtenerLoteProductoById } from "@/services/loteProductoService";
import { CustomToast } from "@/components/toast";
import { es } from "react-day-picker/locale";
import { useLoteProductosContext } from "@/context/loteProductoLote";

const schema = z.object({
    lote: z.string().min(1, { message: "Número de lote obligatorio" }),
    fechaVencimiento: z.date({ required_error: "La fecha es obligatoria" }),
    productoId: z.string().uuid({ message: "Selecciona un producto válido" })
});

type FormData = z.infer<typeof schema>;

interface ModalModificarLoteProductoProps {
    open: boolean;
    onClose?: () => void;
    loteId: number;
}

export function ModalModificarLoteProducto({ open, onClose, loteId }: ModalModificarLoteProductoProps) {
    const { mutate: modificarLoteProducto } = useModificarLoteProducto();
    const { data: productos, fetch: fetchProductos } = useQuery(obtenerListaProductos);
    const { data: lote, fetch: fetchLote } = useQuery(obtenerLoteProductoById);
    const { loteProductoAction, setLoteProductoAction } = useLoteProductosContext()
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onTouched",
        defaultValues: {
            lote: "",
            fechaVencimiento: new Date(
                new Date(Date.now()).getUTCFullYear(),
                new Date(Date.now()).getUTCMonth(),
                new Date(Date.now()).getUTCDate()
            ),
            productoId: ""
        }
    });

    useEffect(() => {
        fetchProductos();
        fetchLote(loteId);
    }, [loteId]);

    useEffect(() => {
        if (lote) {
            form.reset({
                lote: lote.lote,
                fechaVencimiento: new Date(
                    new Date(lote.fechaVencimiento).getUTCFullYear(),
                    new Date(lote.fechaVencimiento).getUTCMonth(),
                    new Date(lote.fechaVencimiento).getUTCDate()
                ),
                productoId: lote.producto.id
            });
        }
    }, [lote]);

    const onSubmit = async (data: FormData) => {
        try {
            await modificarLoteProducto(loteId, data);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Lote actualizado"
                    message="El lote fue modificado correctamente"
                    date={dateFormat(Date.now())}
                />
            ));
            setLoteProductoAction(!loteProductoAction)
            if (onClose) onClose();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al modificar lote"
                    message={err?.response?.message || err?.message || "Error del servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[95%] overflow-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Modificar lote de producto</DialogTitle>
                    <DialogDescription>Actualiza los datos del lote.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
                        <FormField
                            control={form.control}
                            name="lote"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lote</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej. 10234" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="productoId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Producto</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un producto" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {productos?.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.nombreComercial}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fechaVencimiento"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de vencimiento</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${!field.value ? "text-muted-foreground" : ""
                                                    }`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? dateFormat(field.value, "dd/mm/yyyy") : <span>Seleccione una fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                locale={es}
                                                captionLayout="dropdown"
                                                disabled={{
                                                    before: new Date(), // impide seleccionar días anteriores a hoy
                                                }}
                                                buttonVariant={"default"}
                                                startMonth={new Date()}
                                                endMonth={new Date(new Date().getFullYear() + 50, 11)}
                                                classNames={{
                                                    dropdown_root: "relative flex items-center gap-1 select-none font-medium rounded-lg text-sm h-9 !bg-neutral-50 dark:!bg-neutral-800 !border !border-neutral-200 dark:!border-neutral-600 hover:!shadow-md transition-all duration-200",
                                                    dropdown: "appearance-none !bg-neutral-50 dark:!bg-neutral-800 !text-neutral-700 dark:!text-neutral-200 !border !border-neutral-300 dark:!border-neutral-600 rounded-lg px-3 py-2 text-sm font-medium hover:!bg-neutral-100 dark:hover:!bg-neutral-700 focus:!ring-2 focus:!ring-neutral-400 dark:focus:!ring-neutral-500 transition-all duration-200 cursor-pointer",
                                                    caption_dropdowns: "flex justify-center items-center gap-3 mb-6 px-2",
                                                    dropdown_icon: "ml-1 h-4 w-4 !text-neutral-400 dark:!text-neutral-500 pointer-events-none",
                                                    caption_label: "text-lg font-semibold !text-neutral-800 dark:!text-neutral-200 hidden",
                                                    table: "w-full border-collapse space-y-1",
                                                }}
                                                className="rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-lg border border-neutral-200 dark:border-neutral-700"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Guardar</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
