import { CustomToast } from "@/components/toast";
import { Button, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { useVentasContext } from "@/context";
import { useQuery } from "@/hooks";
import { useRegistrarVenta } from "@/hooks/useVenta";
import { cn } from "@/lib/utils";
import { ClienteId } from "@/models";
import { ModalRegistrarCliente } from "@/pages/Clientes/components/ModalRegistrarCliente";
import { obtenerListaClientes, obtenerListaProductos } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import dateFormat from "dateformat";
import { Check, ChevronsUpDown, CreditCard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ModalDetalleVenta } from "./ModalDetalleVenta";

const schema = z.object({
    clienteId: z.coerce.number({ message: "Seleccione un cliente" }).gte(0, { message: "Seleccione un cliente" }),
    detalles: z
        .array(
            z.object({
                productoId: z.string().uuid({ message: "" }),
                cantidad: z.coerce.number({ message: "" }).gt(0, { message: "" }),
            })
        )
        .min(1, { message: "Agrega al menos un producto" }),
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
    const { mutate: registrarVenta } = useRegistrarVenta();
    const { ventaAction, setVentaAction } = useVentasContext();
    const [clienteCreated, setClienteCreated] = useState(false);
    const [openModalRegistrarCliente, setOpenModalRegistrarCliente] = useState(false);
    const [popoverOpenCliente, setPopoverOpenCliente] = useState(false);
    const [openModalDetalleVenta, setOpenModalDetalleVenta] = useState(false);
    const ventaId = useRef(0)
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onTouched",
        defaultValues: {
            clienteId: -1,
            detalles: [{
                productoId: "",
                cantidad: 1,
            }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "detalles",
    });

    // Cargar productos al abrir el modal
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    await Promise.all([fetchProductos(), fetchClientes()]);
                } catch (error) {
                    console.error("Error al cargar datos:", error);
                }
            };
            fetchData();
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
                console.error("Error al cargar datos:", error);
            }
        };

        fetchData();
    }, [clienteCreated]);

    // Función para calcular el subtotal de una línea
    const calcularSubtotalLinea = (productoId: string, cantidad: number) => {
        const producto = dataProductos?.find(p => p.id === productoId);
        if (!producto) return 0;
        return (producto.precioVenta || 0) * cantidad;
    };

    // Función para calcular el subtotal total
    const calcularSubtotal = () => {
        const detalles = form.getValues("detalles");
        return detalles.reduce((total, detalle) => {
            return total + calcularSubtotalLinea(detalle.productoId, detalle.cantidad || 0);
        }, 0);
    };

    // Función para calcular el total (puedes agregar impuestos aquí si es necesario)
    const calcularTotal = () => {
        const subtotal = calcularSubtotal();
        // Aquí puedes agregar impuestos si es necesario
        // const impuesto = subtotal * 0.13; // Ejemplo: 13% de impuesto
        // return subtotal + impuesto;
        return subtotal;
    };

    // Watch para recalcular cuando cambien los productos o cantidades
    form.watch("detalles");

    const onSubmit = async (data: FormData) => {
        try {
            const response = await registrarVenta(data);
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
                ventaId.current = response?.data.ventaId
                setOpenModalDetalleVenta(true)
            }
            form.reset();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al registrar venta"
                    message={err?.response?.message || err?.message || `No se pudo registrar la venta.`}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    const handleRemoveProduct = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const handleAddProduct = () => {
        append({
            productoId: "",
            cantidad: 1,
        });
    };

    // Función para obtener productos disponibles (no seleccionados y con stock)
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

    // Función para obtener el stock disponible de un producto
    const getStockDisponible = (productoId: string, currentIndex: number) => {
        const producto = dataProductos?.find(p => p.id === productoId);
        if (!producto) return 0;

        // Calcular cuánto stock ya está siendo usado en otros campos
        const stockUsado = form.getValues("detalles")
            .reduce((total, detalle, index) => {
                if (index !== currentIndex && detalle.productoId === productoId) {
                    return total + (detalle.cantidad || 0);
                }
                return total;
            }, 0);

        return Math.max(0, producto.stock - stockUsado);
    };

    // Función para validar si se puede agregar más productos
    const canAddMoreProducts = () => {
        if (!dataProductos) return false;

        const selectedProductIds = form.getValues("detalles")
            .map(detalle => detalle.productoId)
            .filter(Boolean);

        return dataProductos.some(producto =>
            !selectedProductIds.includes(producto.id) &&
            producto.stock > 0
        );
    };

    // Función para formatear números como moneda
    const formatearMoneda = (valor: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2,
        }).format(valor);
    };
    const recibirRegistroCliente = (data: ClienteId) => {
        console.log(data);
        setClienteCreated(!clienteCreated)
        form.setValue("clienteId", data.id)
    }
    return (
        <>
            <Dialog modal open={open} onOpenChange={onClose}>
                <DialogContent
                    className="w-full max-h-screen overflow-auto sm:max-w-[900px]"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader className="mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                                                    !selectedCliente && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {selectedCliente ? (
                                                                    <div className="flex flex-col text-left">
                                                                        <span className="text-sm font-medium">
                                                                            {selectedCliente.nitCi
                                                                                ? `${selectedCliente.nitCi}${selectedCliente.complemento || ""}`
                                                                                : "Sin CI/NIT"}
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
                                                        <PopoverContent className="w-full p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Buscar cliente..." />
                                                                <CommandEmpty>No se encontró cliente</CommandEmpty>
                                                                <CommandGroup>
                                                                    {dataClientes?.map((cliente) => (
                                                                        <CommandItem
                                                                            key={cliente.id}
                                                                            value={`${cliente.nitCi}${cliente.complemento} ${cliente.razonSocial}`}
                                                                            onSelect={() => {
                                                                                form.setValue("clienteId", cliente.id);
                                                                                setPopoverOpenCliente(false);
                                                                            }}
                                                                        >
                                                                            <div className="flex flex-col text-left w-full">
                                                                                <span className="text-sm font-medium">
                                                                                    {cliente.nitCi
                                                                                        ? `${cliente.nitCi}${cliente.complemento || ""}`
                                                                                        : "Sin CI/NIT"}
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
                                    className="w-full md:w-auto"
                                    onClick={() => {
                                        setOpenModalRegistrarCliente(true);
                                    }}
                                >
                                    Nuevo cliente
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <FormLabel>Productos</FormLabel>

                                {fields.map((field, index) => {
                                    const productoId = form.getValues(`detalles.${index}.productoId`);
                                    const cantidad = form.getValues(`detalles.${index}.cantidad`) || 0;
                                    const subtotalLinea = calcularSubtotalLinea(productoId, cantidad);
                                    const producto = dataProductos?.find(p => p.id === productoId);

                                    return (
                                        <div
                                            key={field.id}
                                            className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_80px] items-end gap-4 p-4 border rounded-lg"
                                        >
                                            {/* Selector de producto */}
                                            <FormField
                                                control={form.control}
                                                name={`detalles.${index}.productoId`}
                                                render={({ field }) => {
                                                    const selectedProduct = dataProductos?.find(p => p.id === field.value);

                                                    return (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Producto *</FormLabel>
                                                            <Popover
                                                                open={openProductoIndex === index}
                                                                onOpenChange={(open) => setOpenProductoIndex(open ? index : null)}
                                                            >
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className={cn(
                                                                            "w-full justify-between h-11",
                                                                            !selectedProduct && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {selectedProduct ? (
                                                                            <div className="flex flex-col items-start text-left">
                                                                                <span className="font-medium text-sm">{selectedProduct.nombreComercial}</span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {selectedProduct.formaFarmaceutica} • {selectedProduct.laboratorio}
                                                                                </span>
                                                                            </div>
                                                                        ) : (
                                                                            "Seleccione el producto"
                                                                        )}
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full p-0">
                                                                    <Command>
                                                                        <CommandInput placeholder="Buscar producto..." />
                                                                        <CommandEmpty>No se encontró producto</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {getAvailableProducts(index).map((producto) => (
                                                                                <CommandItem
                                                                                    key={producto.id}
                                                                                    value={producto.nombreComercial}
                                                                                    onSelect={() => {
                                                                                        field.onChange(producto.id);
                                                                                        const stockDisponible = getStockDisponible(producto.id, index);
                                                                                        const cantidadActual = form.getValues(`detalles.${index}.cantidad`);
                                                                                        if (cantidadActual > stockDisponible) {
                                                                                            form.setValue(`detalles.${index}.cantidad`, stockDisponible);
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
                                                                                            Stock: {producto.stock} • {formatearMoneda(producto.precioVenta || 0)}
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

                                            {/* Input cantidad */}
                                            <FormField
                                                control={form.control}
                                                name={`detalles.${index}.cantidad`}
                                                render={({ field }) => {
                                                    const productoId = form.getValues(`detalles.${index}.productoId`);
                                                    const stockDisponible = getStockDisponible(productoId, index);

                                                    return (
                                                        <FormItem>
                                                            <FormLabel>Cantidad *</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        {...field}
                                                                        className="w-full h-11 rounded border px-3"
                                                                        placeholder="0"
                                                                        min={1}
                                                                        max={stockDisponible}
                                                                        onChange={(e) => {
                                                                            const value = parseInt(e.target.value) || 0;
                                                                            const limitedValue = Math.min(Math.max(value, 0), stockDisponible);
                                                                            field.onChange(limitedValue);
                                                                        }}
                                                                    />
                                                                    {productoId && (
                                                                        <div className="p-1 absolute -bottom-5 left-0 text-xs text-muted-foreground">
                                                                            Máx: {stockDisponible}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    );
                                                }}
                                            />

                                            {/* Subtotal por línea */}
                                            <div className="flex flex-col">
                                                <FormLabel>Subtotal</FormLabel>
                                                <div className="h-11 flex items-center px-3 bg-neutral-100 dark:bg-neutral-900 rounded border text-right text-sm font-medium">
                                                    {producto ? formatearMoneda(subtotalLinea) : 'Bs. 0,00'}
                                                </div>
                                            </div>

                                            {/* Botón eliminar */}
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="w-full h-11"
                                                onClick={() => handleRemoveProduct(index)}
                                                disabled={fields.length === 1}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    );
                                })}

                                {/* Botón agregar producto */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={handleAddProduct}
                                    disabled={!canAddMoreProducts()}
                                >
                                    + Agregar producto
                                </Button>

                                {/* Mensaje informativo cuando no hay más productos disponibles */}
                                {!canAddMoreProducts() && dataProductos && (
                                    <p className="text-sm text-muted-foreground text-center mt-2">
                                        No hay más productos disponibles con stock
                                    </p>
                                )}
                            </div>

                            {/* Resumen de totales */}
                            <div className="border-t pt-4">
                                <div className="flex justify-end">
                                    <div className="w-full max-w-sm space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Subtotal:</span>
                                            <span className="text-sm font-medium">{formatearMoneda(calcularSubtotal())}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t pt-2">
                                            <span className="text-lg font-bold">Total:</span>
                                            <span className="text-lg font-bold text-blue-600">{formatearMoneda(calcularTotal())}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Registrar venta
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
                    onConfirmed={() => { setClienteCreated(!clienteCreated); }}
                    onEnviarDato={recibirRegistroCliente}
                />
            )}
            {openModalDetalleVenta && ventaId.current != 0 && (
                <ModalDetalleVenta
                    open={openModalDetalleVenta}
                    ventaId={ventaId.current}
                    onClose={() => {
                        setOpenModalDetalleVenta(false);
                        onClose?.();
                    }}
                />

            )}
        </>
    );
}