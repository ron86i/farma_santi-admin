import { CustomToast } from "@/components/toast";
import { Button, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { useVentasContext } from "@/context";
import { useQuery } from "@/hooks";
import { useRegistrarVenta } from "@/hooks/useVenta";
import { cn } from "@/lib/utils";
import { ClienteId, VentaRequest } from "@/models";
import { ModalRegistrarCliente } from "@/pages/Clientes/components/ModalRegistrarCliente";
import { obtenerListaClientes, obtenerListaProductos } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import dateFormat from "dateformat";
import { Check, ChevronsUpDown, CreditCard, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ModalDetalleVenta } from "./ModalDetalleVenta";


const formatearStock = (stockTotal: number, unidadesPorPresentacion: number, nombrePresentacion: string, nombreUnidadBase: string = 'Ud') => {
    const stock = Number(stockTotal) || 0;

    if (stock === 0) {
        return `0 ${nombreUnidadBase}s`;
    }

    if (!unidadesPorPresentacion || unidadesPorPresentacion <= 1) {
        return `${stock} ${nombreUnidadBase}${stock > 1 ? 's' : ''}`;
    }

    const presentacionesCompletas = Math.floor(stock / unidadesPorPresentacion);
    const unidadesSueltas = stock % unidadesPorPresentacion;

    const partesTexto = [];

    if (presentacionesCompletas > 0) {
        partesTexto.push(`${presentacionesCompletas} ${nombrePresentacion}${presentacionesCompletas > 1 ? 's' : ''} (${unidadesPorPresentacion})`);
    }

    if (unidadesSueltas > 0) {
        partesTexto.push(`${unidadesSueltas} ${nombreUnidadBase}${unidadesSueltas > 1 ? 's' : ''}`);
    }

    if (partesTexto.length === 0 && stock === 0) {
        return `0 ${nombreUnidadBase}s`;
    }

    return partesTexto.join(' y ');
};

const schema = z.object({
    clienteId: z.coerce.number({ required_error: "Seleccione un cliente", invalid_type_error: "Seleccione un cliente" }).min(0, { message: "Seleccione un cliente" }),
    detalles: z
        .array(
            z.object({
                productoId: z.string(),
                cantidad: z.coerce.number({ required_error: "Ingrese cantidad", invalid_type_error: "Cantidad inválida" }).min(0, { message: "Cantidad mínima es 0" }),
            })
            .superRefine((data, ctx) => {
                const isProductoIdValidUUID = data.productoId ? z.string().uuid().safeParse(data.productoId).success : false;

                if (data.productoId && !isProductoIdValidUUID) {
                     ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         message: "Producto inválido",
                         path: ["productoId"],
                     });
                }

                if (isProductoIdValidUUID && data.cantidad <= 0) {
                     ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Cantidad debe ser mayor a 0",
                        path: ["cantidad"],
                     });
                }
            })
        )
        .min(1, { message: "Agrega al menos un producto" })
        .refine(detalles => detalles.some(d => d.productoId && z.string().uuid().safeParse(d.productoId).success && d.cantidad > 0), {
            message: "Debe haber al menos un producto válido con cantidad mayor a 0",
        }),
    descuento: z.coerce.number().min(0, { message: "Mínimo 0" }).optional(),
    tipoDescuento: z.enum(["porcentaje", "monto"]).optional(),
    tipoPago: z.enum(["Efectivo", "Tarjeta", "Transferencia"]).optional(),
});

type FormData = z.infer<typeof schema>;

interface ModalRegistrarVentaProps {
    onClose?: () => void;
    open: boolean;
}

export function ModalRegistrarVenta({ open, onClose }: ModalRegistrarVentaProps) {
    const hasMounted = useRef(false);
    const { fetch: fetchProductos, data: dataProductos } = useQuery(obtenerListaProductos);
    const [openProductoIndex, setOpenProductoIndex] = useState<number | null>(null);
    const { fetch: fetchClientes, data: dataClientes } = useQuery(obtenerListaClientes);
    const { mutate: registrarVenta, loading: isRegistering } = useRegistrarVenta();
    const { ventaAction, setVentaAction } = useVentasContext();
    const [clienteCreated, setClienteCreated] = useState(false);
    const [openModalRegistrarCliente, setOpenModalRegistrarCliente] = useState(false);
    const [popoverOpenCliente, setPopoverOpenCliente] = useState(false);
    const [openModalDetalleVenta, setOpenModalDetalleVenta] = useState(false);
    const ventaId = useRef(0)

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            clienteId: 0,
            detalles: [{ productoId: "", cantidad: 1 }],
            descuento: 0,
            tipoPago: "Efectivo",
            tipoDescuento: "monto",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "detalles",
    });

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    await fetchClientes();
                    await fetchProductos();
                    const clienteGenerico = dataClientes?.find(c => c.id === 0);
                    if (clienteGenerico && form.getValues("clienteId") === -1) {
                        form.setValue("clienteId", 0);
                    }
                } catch (error) {
                    console.error("Error al cargar datos:", error);
                    toast.error("Error al cargar datos iniciales.");
                }
            };
            fetchData();
        } else {
            form.reset({
                clienteId: 0,
                detalles: [{ productoId: "", cantidad: 1 }],
                descuento: 0,
                tipoPago: "Efectivo",
                tipoDescuento: "monto",
            });
        }
    }, [open]);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        const fetchData = async () => {
            try {
                await fetchClientes();
            } catch (error) {
                console.error("Error al recargar clientes:", error);
            }
        };

        if (clienteCreated) {
            fetchData();
        }
    }, [clienteCreated]);

    const calcularSubtotalLinea = (productoId: string, cantidad: number) => {
        const producto = dataProductos?.find(p => p.id === productoId);
        if (!producto) return 0;
        return (producto.precioVenta || 0) * cantidad;
    };

    const calcularSubtotal = () => {
        const detalles = form.getValues("detalles");
        return detalles.reduce((total, detalle) => {
            const cantidadNum = Number(detalle.cantidad) || 0;
            return total + calcularSubtotalLinea(detalle.productoId, cantidadNum);
        }, 0);
    };

    const calcularTotal = () => {
        const subtotal = calcularSubtotal();
        const tipo = form.getValues("tipoDescuento") || "monto";
        const descuento = Number(form.getValues("descuento")) || 0;

        let descuentoAplicado = 0;
        if (tipo === "porcentaje") {
            descuentoAplicado = subtotal * (descuento / 100);
        } else {
            descuentoAplicado = descuento;
        }

        descuentoAplicado = Math.min(descuentoAplicado, subtotal);
        return Math.max(0, subtotal - descuentoAplicado);
    };

    const calcularResumenPresentaciones = () => {
        const detalles = form.getValues("detalles");
        const resumenPresentaciones = new Map<string, { count: number, nombre: string, unidades: number }>();
        let totalSueltasGenerales = 0;

        detalles.forEach(detalle => {
            if (detalle.productoId) {
                const producto = dataProductos?.find(p => p.id === detalle.productoId);
                if (!producto) return;

                const cantidad = Number(detalle.cantidad) || 0;
                if (cantidad === 0) return;

                const unidadesPorPresentacion = producto.unidadesPresentacion ?? 1;
                const nombrePresentacion = producto.presentacion?.nombre;

                if (!nombrePresentacion || unidadesPorPresentacion <= 1) {
                    totalSueltasGenerales += cantidad;
                } else {
                    const presentacionesCompletas = Math.floor(cantidad / unidadesPorPresentacion);
                    const unidadesSueltas = cantidad % unidadesPorPresentacion;

                    const key = `${nombrePresentacion}|${unidadesPorPresentacion}`;

                    if (presentacionesCompletas > 0) {
                        const current = resumenPresentaciones.get(key) || { count: 0, nombre: nombrePresentacion, unidades: unidadesPorPresentacion };
                        current.count += presentacionesCompletas;
                        resumenPresentaciones.set(key, current);
                    }

                    totalSueltasGenerales += unidadesSueltas;
                }
            }
        });

        const partesTexto = [];

        resumenPresentaciones.forEach((data) => {
            const nombre = data.nombre;
            const plural = data.count > 1 ? 's' : '';
            partesTexto.push(`${data.count} ${nombre}${plural} (${data.unidades})`);
        });

        if (totalSueltasGenerales > 0) {
            partesTexto.push(`${totalSueltasGenerales} Ud${totalSueltasGenerales > 1 ? 's' : ''}`);
        }

        if (partesTexto.length === 0) {
            return "0 Uds.";
        }

        return partesTexto.join(' y ');
    };

    const onSubmit = async (data: FormData) => {
        try {
            const subtotal = calcularSubtotal();
            const tipoDescuento = data.tipoDescuento || "monto";
            const descuentoInput = data.descuento || 0;
            let descuentoAplicado = 0;

            if (tipoDescuento === "porcentaje") {
                descuentoAplicado = subtotal * (descuentoInput / 100);
            } else {
                descuentoAplicado = descuentoInput;
            }

            descuentoAplicado = Math.min(descuentoAplicado, subtotal);
            descuentoAplicado = Math.max(0, descuentoAplicado);

            const ventaData: VentaRequest = {
                clienteId: data.clienteId,
                detalles: data.detalles.map(d => ({
                    productoId: d.productoId,
                    cantidad: d.cantidad,
                })),
                descuento: descuentoAplicado,
                tipoPago: data.tipoPago || "Efectivo",
            };

            const response = await registrarVenta(ventaData);

            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Venta registrada"
                    message={response?.message || "Venta registrada exitosamente"}
                    date={dateFormat(Date.now())}
                />
            ));

            setVentaAction(!ventaAction);

            if (response?.data) {
                ventaId.current = response.data.ventaId;
                setOpenModalDetalleVenta(true);
            } else {
                form.reset();
                if (onClose) onClose();
            }

        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al registrar venta"
                    message={err?.response?.data?.message || err?.message || "No se pudo registrar la venta."}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    const handleRemoveProduct = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        } else {
            form.setValue(`detalles.${index}.productoId`, "");
            form.setValue(`detalles.${index}.cantidad`, 1);
        }
    };

    const handleAddProduct = () => {
        append({
            productoId: "",
            cantidad: 1,
        });
    };

    const getAvailableProducts = (currentIndex: number) => {
        if (!dataProductos) return [];

        const selectedProductIds = form.getValues("detalles")
            .map((detalle, index) => index !== currentIndex ? detalle.productoId : null)
            .filter(Boolean);

        return dataProductos.filter(producto =>
            !selectedProductIds.includes(producto.id) &&
            producto.stock > 0
        );
    };

    const getStockDisponible = (productoId: string | undefined | null): number => {
        if (!productoId) return 0;
        const producto = dataProductos?.find(p => p.id === productoId);
        if (!producto) return 0;
        return producto.stock;
    };

    const canAddMoreProducts = () => {
        if (!dataProductos) return false;

        const selectedProductIds = new Set(
            form.getValues("detalles")
                .map(detalle => detalle.productoId)
                .filter(Boolean)
        );

        return dataProductos.some(producto =>
            producto.stock > 0 && !selectedProductIds.has(producto.id)
        );
    };

    const formatearMoneda = (valor: number) => {
        if (isNaN(valor) || typeof valor !== 'number') {
            return 'Bs. 0,00';
        }
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2,
        }).format(valor);
    };

    const recibirRegistroCliente = (data: ClienteId) => {
        setClienteCreated(true);
        form.setValue("clienteId", data.id);
        setOpenModalRegistrarCliente(false);
    }

    // Función para validar si el formulario puede enviarse
    const isFormValid = () => {
        const clienteId = form.watch("clienteId");
        const detalles = form.watch("detalles");
        
        // Verificar que hay un cliente válido
        if (clienteId < 0) return false;
        
        // Verificar que hay al menos un producto válido
        const hasValidProduct = detalles.some(d => {
            const isValidUUID = d.productoId && z.string().uuid().safeParse(d.productoId).success;
            const isValidCantidad = d.cantidad > 0;
            return isValidUUID && isValidCantidad;
        });
        
        return hasValidProduct;
    };

    form.watch(["detalles", "descuento", "tipoDescuento", "clienteId"]);
    
    return (
        <>
            <Dialog modal open={open} onOpenChange={onClose}>
                <DialogContent
                    className="w-full max-h-[95vh] flex flex-col sm:max-w-[900px]"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader className="mb-4 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                                <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">
                                    Nueva venta
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Registra una nueva venta de productos
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden gap-6">
                            <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6">
                                {/* Campo Cliente */}
                                <div className="flex flex-col md:flex-row items-start md:items-end gap-2 md:gap-4 col-span-2">
                                    <div className="flex-1 w-full">
                                        <FormField
                                            control={form.control}
                                            name="clienteId"
                                            render={({ field }) => {
                                                const selectedCliente = dataClientes?.find((c) => c.id === field.value);

                                                return (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-sm font-medium">Cliente *</FormLabel>
                                                        <Popover
                                                            open={popoverOpenCliente}
                                                            onOpenChange={setPopoverOpenCliente}
                                                        >
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    className={cn(
                                                                        "w-full justify-between h-11",
                                                                        (!selectedCliente && field.value !== 0) && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {selectedCliente ? (
                                                                        <div className="flex flex-col text-left">
                                                                            <span className="text-sm font-medium">
                                                                                {selectedCliente.nitCi
                                                                                    ? `${selectedCliente.nitCi}${selectedCliente.complemento || ""}`
                                                                                    : selectedCliente.id === 0 ? "" : "Sin CI/NIT"}
                                                                            </span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {selectedCliente.razonSocial}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        "Seleccione un cliente"
                                                                    )}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>

                                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Buscar cliente (CI/NIT o Razón Social)..." />
                                                                    <CommandEmpty>No se encontró cliente</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {dataClientes?.map((cliente) => (
                                                                            <CommandItem
                                                                                key={cliente.id}
                                                                                value={`${cliente.nitCi || ""} ${cliente.razonSocial}`}
                                                                                onSelect={() => {
                                                                                    form.setValue("clienteId", cliente.id);
                                                                                    setPopoverOpenCliente(false);
                                                                                }}
                                                                            >
                                                                                <div className="flex flex-col text-left w-full">
                                                                                    <span className="text-sm font-medium">
                                                                                        {cliente.nitCi
                                                                                            ? `${cliente.nitCi}${cliente.complemento || ""}`
                                                                                            : cliente.id === 0 ? "" : "Sin CI/NIT"}
                                                                                    </span>
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        {cliente.razonSocial}
                                                                                    </span>
                                                                                </div>
                                                                                {field.value === cliente.id && (
                                                                                    <Check className="ml-auto h-4 w-4 text-primary" />
                                                                                )}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full md:w-auto h-11 border-dashed hover:border-solid"
                                        onClick={() => {
                                            setOpenModalRegistrarCliente(true);
                                        }}
                                    >
                                        + Nuevo cliente
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <FormLabel>Productos *</FormLabel>

                                    <div className="hidden md:grid md:grid-cols-[2fr_auto_auto_auto_1fr_auto] items-center gap-x-3 gap-y-2 px-3">
                                        <span className="text-xs font-medium text-muted-foreground">Producto</span>
                                        <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Presentación</span>
                                        <span className="text-xs font-medium text-muted-foreground min-w-[80px]">Unidades</span>
                                        <span className="text-xs font-medium text-muted-foreground min-w-[80px] text-right">Total Uds.</span>
                                        <span className="text-xs font-medium text-muted-foreground text-right">Subtotal</span>
                                        <span className="w-10"></span>
                                    </div>

                                    {fields.map((fieldItem, index) => {
                                        const productoId = form.watch(`detalles.${index}.productoId`);
                                        const cantidad = form.watch(`detalles.${index}.cantidad`) || 0;
                                        const subtotalLinea = calcularSubtotalLinea(productoId, cantidad);
                                        const productoSeleccionado = dataProductos?.find(p => p.id === productoId);
                                        const stockDisponible = getStockDisponible(productoId);

                                        const unidadesPorPresentacion = productoSeleccionado?.unidadesPresentacion ?? 1;
                                        const nombrePresentacion = productoSeleccionado?.presentacion?.nombre || "P.";
                                        const nombreUnidadBase = "Ud";

                                        return (
                                            <div
                                                key={fieldItem.id}
                                                className="grid grid-cols-2 md:grid-cols-[2fr_auto_auto_auto_1fr_auto] items-start gap-x-3 gap-y-2 p-3 border rounded-lg bg-neutral-50 dark:bg-neutral-800"
                                            >
                                                <FormField
                                                    control={form.control}
                                                    name={`detalles.${index}.productoId`}
                                                    render={({ field }) => {
                                                        const selectedProduct = dataProductos?.find(p => p.id === field.value);

                                                        return (
                                                            <FormItem className="flex flex-col col-span-2 md:col-span-1">
                                                                <FormLabel className="text-xs md:hidden">Producto *</FormLabel>
                                                                <Popover
                                                                    open={openProductoIndex === index}
                                                                    onOpenChange={(open) => setOpenProductoIndex(open ? index : null)}
                                                                >
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            role="combobox"
                                                                            className={cn(
                                                                                "w-full justify-between h-11 text-xs sm:text-sm",
                                                                                !selectedProduct && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {selectedProduct ? (
                                                                                <div className="flex flex-col items-start text-left overflow-hidden">
                                                                                    <span className="font-medium truncate" title={selectedProduct.nombreComercial}>
                                                                                        {selectedProduct.nombreComercial}
                                                                                    </span>
                                                                                    <span className="text-xs text-muted-foreground truncate" title={`${selectedProduct.formaFarmaceutica} • ${selectedProduct.laboratorio}`}>
                                                                                        {selectedProduct.formaFarmaceutica} • {selectedProduct.laboratorio}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                "Seleccione producto"
                                                                            )}
                                                                            <ChevronsUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                                        <Command>
                                                                            <CommandInput placeholder="Buscar producto..." />
                                                                            <CommandEmpty>No se encontró producto con stock</CommandEmpty>
                                                                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                                                                                {getAvailableProducts(index).map((producto) => (
                                                                                    <CommandItem
                                                                                        key={producto.id}
                                                                                        value={producto.nombreComercial}
                                                                                        onSelect={() => {
                                                                                            field.onChange(producto.id);

                                                                                            const stockNuevo = getStockDisponible(producto.id);
                                                                                            const cantidadActual = form.getValues(`detalles.${index}.cantidad`);
                                                                                            if (cantidadActual > stockNuevo) {
                                                                                                form.setValue(`detalles.${index}.cantidad`, stockNuevo > 0 ? 1 : 0);
                                                                                            } else if (cantidadActual <= 0 && stockNuevo > 0) {
                                                                                                form.setValue(`detalles.${index}.cantidad`, 1);
                                                                                            }
                                                                                            setOpenProductoIndex(null);
                                                                                        }}
                                                                                    >
                                                                                        <div className="flex flex-col text-left w-full">
                                                                                            <span className="text-sm font-medium">{producto.nombreComercial}</span>
                                                                                            <span className="text-xs text-muted-foreground">
                                                                                                {producto.formaFarmaceutica} • {producto.laboratorio}
                                                                                            </span>
                                                                                            <span className="text-xs font-medium text-green-600">
                                                                                                Stock: {formatearStock(producto.stock, producto.unidadesPresentacion, producto.presentacion.nombre)} • {formatearMoneda(producto.precioVenta || 0)}
                                                                                            </span>
                                                                                        </div>
                                                                                        {field.value === producto.id && (
                                                                                            <Check className="ml-auto h-4 w-4 text-primary" />
                                                                                        )}
                                                                                    </CommandItem>
                                                                                ))}
                                                                            </CommandGroup>
                                                                        </Command>
                                                                    </PopoverContent>
                                                                </Popover>
                                                                <FormMessage />
                                                            </FormItem>
                                                        );
                                                    }}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`detalles.${index}.cantidad`}
                                                    render={({ field }) => {
                                                        const total = Number(field.value) || 0;
                                                        let presentaciones = 0;
                                                        let sueltas = 0;

                                                        if (unidadesPorPresentacion > 1) {
                                                            presentaciones = Math.floor(total / unidadesPorPresentacion);
                                                            sueltas = total % unidadesPorPresentacion;
                                                        } else {
                                                            sueltas = total;
                                                        }

                                                        const handlePresentacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const nuevasPresentaciones = Math.max(0, Number(e.target.value) || 0);
                                                            const currentSueltas = total % unidadesPorPresentacion || 0;
                                                            let newTotal = (nuevasPresentaciones * unidadesPorPresentacion) + currentSueltas;
                                                            newTotal = Math.min(newTotal, stockDisponible);
                                                            field.onChange(newTotal);
                                                        };

                                                        const handleSueltasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                            let nuevasSueltas = Math.max(0, Number(e.target.value) || 0);
                                                            if (unidadesPorPresentacion > 1) {
                                                                nuevasSueltas = Math.min(nuevasSueltas, unidadesPorPresentacion - 1);
                                                            }
                                                            const currentPresentaciones = Math.floor(total / unidadesPorPresentacion) || 0;
                                                            let newTotal = (currentPresentaciones * unidadesPorPresentacion) + nuevasSueltas;
                                                            newTotal = Math.min(newTotal, stockDisponible);
                                                            field.onChange(newTotal);
                                                        };

                                                        return (
                                                            <>
                                                                <FormItem className="flex-1 min-w-[80px] col-span-1 md:col-auto">
                                                                    <FormLabel className="text-xs md:hidden">{nombrePresentacion} ({unidadesPorPresentacion})</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            value={presentaciones}
                                                                            onChange={handlePresentacionChange}
                                                                            className="h-11 text-sm rounded-md"
                                                                            placeholder={nombrePresentacion}
                                                                            disabled={unidadesPorPresentacion <= 1 || !productoId}
                                                                            max={unidadesPorPresentacion > 0 ? Math.floor(stockDisponible / unidadesPorPresentacion) : undefined}
                                                                        />
                                                                    </FormControl>
                                                                    {productoId && (
                                                                        <div className="text-xs text-muted-foreground mt-0">
                                                                            Stock: {formatearStock(stockDisponible, unidadesPorPresentacion, nombrePresentacion)}
                                                                        </div>
                                                                    )}
                                                                </FormItem>

                                                                <FormItem className="flex-1 min-w-[80px] col-span-1 md:col-auto">
                                                                    <FormLabel className="text-xs md:hidden">{nombreUnidadBase}s</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            max={unidadesPorPresentacion > 1 ? unidadesPorPresentacion - 1 : stockDisponible}
                                                                            value={sueltas}
                                                                            onChange={handleSueltasChange}
                                                                            className="h-11 text-sm rounded-md"
                                                                            placeholder={nombreUnidadBase + 's'}
                                                                            disabled={!productoId}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            </>
                                                        );
                                                    }}
                                                />

                                                <div className="flex flex-col col-span-1 md:col-auto">
                                                    <FormLabel className="text-xs md:hidden">Total Uds.</FormLabel>
                                                    <div className="h-11 flex items-center justify-end px-3 bg-neutral-100 dark:bg-neutral-900 rounded border text-sm font-medium whitespace-nowrap min-w-[80px]">
                                                        {productoSeleccionado ? `${cantidad} Ud${cantidad !== 1 ? 's' : ''}` : '0 Uds.'}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col col-span-1 md:col-auto">
                                                    <FormLabel className="text-xs md:hidden">Subtotal</FormLabel>
                                                    <div className="h-11 flex items-center justify-end px-3 bg-neutral-100 dark:bg-neutral-900 rounded border text-sm font-medium whitespace-nowrap">
                                                        {productoSeleccionado ? formatearMoneda(subtotalLinea) : 'Bs. 0,00'}
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-full md:w-auto h-11 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded col-span-1 md:col-auto md:self-end"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full mt-2 border-dashed hover:border-solid"
                                        onClick={handleAddProduct}
                                        disabled={!canAddMoreProducts()}
                                    >
                                        + Agregar producto
                                    </Button>

                                    {!canAddMoreProducts() && dataProductos && fields.length > 0 && (
                                        <p className="text-sm text-muted-foreground text-center mt-2">
                                            No hay más productos disponibles con stock para agregar.
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 border-t">
                                    <FormField
                                        control={form.control}
                                        name="tipoDescuento"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo Descuento</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || "monto"}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="Tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="monto">Monto (Bs)</SelectItem>
                                                        <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="descuento"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descuento</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value || 0}
                                                        min={0}
                                                        max={form.getValues("tipoDescuento") === "porcentaje" ? 100 : calcularSubtotal()}
                                                        step={form.getValues("tipoDescuento") === "porcentaje" ? 1 : 0.01}
                                                        onChange={(e) => {
                                                            let value = parseFloat(e.target.value);
                                                            if (isNaN(value) || value < 0) value = 0;

                                                            const tipo = form.getValues("tipoDescuento");
                                                            const subtotal = calcularSubtotal();

                                                            if (tipo === "porcentaje") {
                                                                value = Math.min(value, 100);
                                                            } else {
                                                                value = Math.min(value, subtotal);
                                                            }

                                                            field.onChange(value);
                                                        }}
                                                        className="h-11"
                                                        placeholder="0"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tipoPago"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Forma de Pago</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="Seleccione forma de pago" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                                                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-end">
                                        <div className="w-full max-w-sm space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal:</span>
                                                <span className="text-sm font-medium">{formatearMoneda(calcularSubtotal())}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                                                <span className="text-sm font-medium">Descuento:</span>
                                                <span className="text-sm font-medium">
                                                    - {formatearMoneda(calcularSubtotal() - calcularTotal())}
                                                    ({form.getValues("tipoDescuento") === "porcentaje"
                                                        ? `${form.getValues("descuento") || 0}%`
                                                        : formatearMoneda(form.getValues("descuento") || 0)})
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items:</span>
                                                <span className="text-sm font-medium text-right">{calcularResumenPresentaciones()}</span>
                                            </div>

                                            <div className="flex justify-between items-center border-t pt-2 mt-2">
                                                <span className="text-lg font-bold">Total:</span>
                                                <span className="text-lg font-bold text-primary">{formatearMoneda(calcularTotal())}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isRegistering}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary hover:bg-primary/90 min-w-[150px]"
                                    disabled={isRegistering || !isFormValid()}
                                >
                                    {isRegistering ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CreditCard className="h-4 w-4 mr-2" />
                                    )}
                                    {isRegistering ? "Registrando..." : "Registrar Venta"}
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {openModalRegistrarCliente && (
                <ModalRegistrarCliente
                    onClose={() => { setOpenModalRegistrarCliente(false); }}
                    open={openModalRegistrarCliente}
                    onEnviarDato={recibirRegistroCliente}
                />
            )}

            {openModalDetalleVenta && ventaId.current !== 0 && (
                <ModalDetalleVenta
                    open={openModalDetalleVenta}
                    ventaId={ventaId.current}
                    onClose={() => {
                        setOpenModalDetalleVenta(false);
                        form.reset();
                        if (onClose) onClose();
                    }}
                />
            )}
        </>
    );
}