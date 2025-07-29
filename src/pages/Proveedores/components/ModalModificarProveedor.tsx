import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { useForm } from "react-hook-form";
import { useProveedoresContext } from "@/context";
import { useQuery } from "@/hooks/generic";
import { obtenerProveedorById } from "@/services";
import { ProveedorRequest } from "@/models";
import { useModificarProveedor } from "@/hooks";
import { useEffect } from "react";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";

const schema = z.object({
    nit: z.coerce.number({
        required_error: "El NIT es obligatorio.",
        invalid_type_error: "El NIT debe ser un número.",
    }),
    nombre: z.string({
        required_error: "El nombre es obligatorio.",
    }),
    representante: z.string({
        required_error: "El representante es obligatorio.",
    }),
    direccion: z.string().optional(),
    email: z.union([
        z.literal(''),
        z.string().email("Debe se un email válido"),
    ]),
    telefono: z.coerce.number({
        required_error: "El teléfono es obligatorio.",
        invalid_type_error: "El teléfono debe ser un número.",
    }).optional(),
    celular: z.coerce.number({
        required_error: "El teléfono es obligatorio.",
        invalid_type_error: "El teléfono debe ser un número.",
    }).optional(),
});


type FormData = z.infer<typeof schema>;

interface ModalModificarProveedorProps {
    proveedorId: number
    onClose?: () => void;
    open: boolean;
}

export function ModalModificarProveedor({ proveedorId, open, onClose }: ModalModificarProveedorProps) {
    const { fetch: obtenerProveedor, data: proveedor } = useQuery(obtenerProveedorById);
    const { mutate: modificarProveedor } = useModificarProveedor();
    const { proveedorAction, setProveedorAction } = useProveedoresContext();

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onTouched",
        defaultValues: {
            nit: 0,
            nombre: "",
            representante: "",
            direccion: "",
            celular: 0,
            telefono: 0,
            email: "",
        },
    });

    useEffect(() => {
        obtenerProveedor(proveedorId);
    }, [proveedorId]);

    useEffect(() => {
        if (proveedor) {
            form.reset({
                nit: proveedor.nit ?? 0,
                nombre: proveedor.razonSocial ?? "",
                representante: proveedor.representante ?? "",
                direccion: proveedor.direccion ?? "",
                celular: proveedor.celular ?? 0,
                telefono: proveedor.telefono ?? 0,
                email: proveedor.email ?? "",
            });
        }
    }, [proveedor]);


    const onSubmit = async (data: FormData) => {
        const proveedorRequest: ProveedorRequest = {
            nit: data.nit,
            razonSocial: data.nombre,
            representante: data.representante,
            direccion: data.direccion ?? "",
            celular: data.celular,
            telefono: data.telefono,
            email: data.email,
        };

        try {
            const response = await modificarProveedor(proveedorId, proveedorRequest);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Proveedor modificado"
                    message={response?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
            setProveedorAction(!proveedorAction);
            form.reset();
            onClose?.(); // llamada segura opcional
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al modificar proveedor"
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
                    <DialogTitle>Modificar proveedor</DialogTitle>
                    <DialogDescription>
                        Edita los datos del proveedor en el sistema.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-2 text-black dark:text-white"
                    >
                        <FormField
                            control={form.control}
                            name="nit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NIT</FormLabel>
                                    <FormControl>
                                        <Input placeholder="12345678901" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="nombre de proveedor" {...field} />
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
                            name="direccion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Av. La Paz" {...field} />
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

