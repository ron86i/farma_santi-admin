import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Button,
    Input,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import { useForm } from "react-hook-form";
import { ClienteRequest, TipoCliente } from "@/models";
import { useModificarCliente } from "@/hooks/useCliente";
import { useClientesContext } from "@/context";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";
import { obtenerClienteById } from "@/services";
import { useQuery } from "@/hooks";

// Spinner reutilizable
const Spinner = () => (
    <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span>Cargando datos...</span>
    </div>
);

// Schema con enum
const clienteSchema = z.object({
    nitCi: z
        .string()
        .refine((val) => /^\d+$/.test(val), {
            message: "Solo se permiten números",
        }),
    complemento: z.string().optional(),
    tipo: z.nativeEnum(TipoCliente, {
        required_error: "Selecciona un tipo de documento",
    }),
    razonSocial: z
        .string()
        .trim()
        .min(1, { message: "La razón social es obligatoria" }),
    email: z.union([
        z.literal(""),
        z.string().email("Debe ser correo electrónico válido"),
    ]),
    telefono: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{7,8}$/.test(val), {
            message: "Debe contener 7 a 8 dígitos numéricos",
        }),
})
    .superRefine((data, ctx) => {
        const { tipo, nitCi } = data;

        if (tipo === TipoCliente.CI) {
            // CI puede tener 7-8 dígitos o ser "0"
            if (nitCi !== "0" && (nitCi.length < 7 || nitCi.length > 8)) {
                ctx.addIssue({
                    path: ["nitCi"],
                    code: z.ZodIssueCode.custom,
                    message: "CI debe tener entre 7 y 8 dígitos o ser 0",
                });
            }
        }

        if (tipo === TipoCliente.NIT) {
            // NIT debe tener 7-11 dígitos, pero no puede ser "0"
            if (nitCi === "0" || nitCi.length < 7 || nitCi.length > 11) {
                ctx.addIssue({
                    path: ["nitCi"],
                    code: z.ZodIssueCode.custom,
                    message: "NIT debe tener entre 7 y 11 dígitos (no puede ser 0)",
                });
            }
        }
    });

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ModalModificarClienteProps {
    clienteId: number;
    onClose?: () => void;
    open: boolean;
}

export function ModalModificarCliente({ clienteId, open, onClose }: ModalModificarClienteProps) {
    const { mutate } = useModificarCliente();
    const { clienteAction, setClienteAction } = useClientesContext();
    const { fetch: fetchCliente, data: dataCliente } = useQuery(obtenerClienteById);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
        mode: "onTouched",
        defaultValues: {
            nitCi: "",
            complemento: "",
            tipo: TipoCliente.CI,
            razonSocial: "",
            email: "",
            telefono: "",
        },
    });

    const tipoValue = form.watch("tipo");

    // Carga los datos al abrir modal
    useEffect(() => {
        if (!open) return;
        const load = async () => {
            await fetchCliente(clienteId);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, clienteId]);

    // Reset cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            form.reset();
            setIsLoadingData(true);
        }
    }, [open, form]);

    // Setea valores cuando llegan datos
    useEffect(() => {
        if (dataCliente) {
            form.reset({
                nitCi: dataCliente.nitCi?.toString() ?? "0",
                complemento: dataCliente.complemento ?? "",
                tipo: dataCliente.tipo ?? TipoCliente.NIT,
                razonSocial: dataCliente.razonSocial,
                email: dataCliente.email,
                telefono: dataCliente.telefono?.toString() ?? "",
            });
            setIsLoadingData(false);
        }
    }, [dataCliente]);

    // Limpia complemento si es NIT
    useEffect(() => {
        if (tipoValue === TipoCliente.NIT) {
            form.setValue("complemento", "");
        }
    }, [tipoValue, form]);

    const onSubmit = async (data: ClienteFormData) => {
        const clienteData: ClienteRequest = {
            nitCi: data.nitCi ? Number(data.nitCi) : undefined,
            complemento: data.complemento || undefined,
            tipo: data.tipo,
            razonSocial: data.razonSocial,
            email: data.email,
            telefono: data.telefono ? Number(data.telefono) : undefined,
        };

        try {
            const response = await mutate(clienteId, clienteData);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Cliente modificado"
                    message={response?.message || "Cliente actualizado exitosamente"}
                    date={dateFormat(Date.now())}
                />
            ));
            setClienteAction(!clienteAction);
            form.reset();
            onClose?.();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al modificar cliente"
                    message={err?.response?.message || err?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="max-h-[96%] w-full overflow-auto sm:max-w-[600px] [&_[data-dialog-close]]:hidden"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Modificar cliente</DialogTitle>
                    <DialogDescription>
                        Completa los datos para modificar el cliente.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingData ? (
                    <Spinner />
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-2 text-black dark:text-white"
                        >
                            <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona un tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Tipo documento</SelectLabel>
                                                        <SelectItem value={TipoCliente.NIT}>NIT</SelectItem>
                                                        <SelectItem value={TipoCliente.CI}>CI</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nitCi"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NIT/CI</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. 12345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="complemento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Complemento</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej. A1"
                                                {...field}
                                                disabled={tipoValue === TipoCliente.NIT}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="razonSocial"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Razón Social</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre o empresa" {...field} />
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
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="cliente@email.com" {...field} />
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
                                            <Input placeholder="71234567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="mt-4"
                                disabled={!form.formState.isValid || form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Guardando..." : "Modificar Cliente"}
                            </Button>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
