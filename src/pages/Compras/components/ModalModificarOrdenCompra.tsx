import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useModificarOrdenCompra, useQuery } from "@/hooks";
import { CompraRequest } from "@/models/compra";
import { obtenerListaProductos, obtenerListaProveedores, obtenerLotesByProductoId } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { LoteProductoSimple } from "@/models";
import { Plus, Trash2, Package, ShoppingCart, Calendar, ShoppingBagIcon, Check, ChevronsUpDown, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { obtenerCompraById } from "@/services/compraService";
import { useComprasContext } from "@/context/compraContext";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { ModalRegistrarLoteProducto } from "@/pages/LotesProductos/components/ModalRegistarLoteProducto";
import { useLoteProductosContext } from "@/context/loteProductoLote";
import { cn } from "@/lib/utils";

interface ModalModificarOrdenCompraProps {
    compraId: number;
    onClose?: () => void;
    open: boolean;
}

const schema = z.object({
    proveedorId: z.coerce.number().gt(0, { message: "Seleccione un proveedor" }),
    comentario: z.string().optional(),
    detalles: z.array(
        z.object({
            productoId: z.string().uuid({ message: "" }),
            cantidad: z.coerce.number().gt(0, { message: "" }),
            precio: z.coerce.number().gt(0, { message: "" }),
            loteProductoId: z.number().gt(0, { message: "" }),
        })
    ),
});

type FormData = z.infer<typeof schema>;

export function ModalModificarOrdenCompra({ compraId, open, onClose }: ModalModificarOrdenCompraProps) {
    const { fetch: fetchProductos, data: dataProductos } = useQuery(obtenerListaProductos);
    const { fetch: fetchProveedores, data: dataProveedores } = useQuery(obtenerListaProveedores);
    const { fetch: fetchLotesProducto, data: dataLoteProducto } = useQuery(obtenerLotesByProductoId);
    const { mutate: modificarOrdenCompra } = useModificarOrdenCompra();
    const { data: dataCompra, fetch: fetchCompra } = useQuery(obtenerCompraById);
    const { compraAction, setCompraAction } = useComprasContext()
    const { loteProductoAction } = useLoteProductosContext();
    const [openModalRegistrarLote, setOpenModalRegistrarLote] = useState(false);
    const [currentProductoIdForLote, setCurrentProductoIdForLote] = useState<string>("");
    const [_, setCurrentIndexForLote] = useState<number>(-1);
    const [openProductoIndex, setOpenProductoIndex] = useState<number | null>(null);
    const [openLoteIndex, setOpenLoteIndex] = useState<number | null>(null);
    const [loadingLotes, setLoadingLotes] = useState<Record<string, boolean>>({});

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onTouched",
        defaultValues: {
            proveedorId: 0,
            comentario: "",
            detalles: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "detalles",
    });

    const [lotesPorDetalle, setLotesPorDetalle] = useState<Record<number, LoteProductoSimple[]>>({});
    const [isLoadingData, setIsLoadingData] = useState(false);
    const lastIndexRef = useRef<number | null>(null);
    const lastProductoIdRef = useRef<string | null>(null);

    const refreshLotesForProducto = async (productoId: string) => {
        if (!productoId) return;

        try {
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: true
            }));

            lastProductoIdRef.current = productoId;
            lastIndexRef.current = 0;

            await fetchLotesProducto(productoId);
        } catch (error) {
            const detallesActuales = form.getValues("detalles");
            const nuevosLotesPorDetalle = { ...lotesPorDetalle };

            detallesActuales.forEach((detalle, index) => {
                if (detalle.productoId === productoId) {
                    nuevosLotesPorDetalle[index] = [];
                }
            });

            setLotesPorDetalle(nuevosLotesPorDetalle);
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: false
            }));
        }
    };

    const onChangeProducto = async (productoId: string, index: number) => {
        form.setValue(`detalles.${index}.productoId`, productoId);
        form.setValue(`detalles.${index}.loteProductoId`, 0);

        lastIndexRef.current = index;
        lastProductoIdRef.current = productoId;

        try {
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: true
            }));

            await fetchLotesProducto(productoId);
        } catch (error) {
            setLotesPorDetalle(prev => ({
                ...prev,
                [index]: [],
            }));

            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: false
            }));
        }
    };

    useEffect(() => {
        if (dataLoteProducto && lastIndexRef.current !== null) {
            setLotesPorDetalle(prev => ({
                ...prev,
                [lastIndexRef.current as number]: Array.isArray(dataLoteProducto) ? dataLoteProducto : [dataLoteProducto]
            }));
            setLoadingLotes(prev => ({
                ...prev,
                [lastProductoIdRef.current as string]: false
            }));
        }
    }, [dataLoteProducto]);

    useEffect(() => {
        if (loteProductoAction && currentProductoIdForLote) {
            refreshLotesForProducto(currentProductoIdForLote);
        }
    }, [loteProductoAction]);

    useEffect(() => {
        const fetchData = async () => {
            if (!open) return;
            setIsLoadingData(true);
            try {
                await Promise.all([
                    fetchProductos(),
                    fetchProveedores(),
                    fetchCompra(compraId)
                ]);
            } catch (err) {
                console.error("Error cargando datos:", err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [open, compraId]);

    useEffect(() => {
        if (dataCompra && dataProductos && dataProveedores && !isLoadingData) {
            const detallesMapeados = dataCompra.detalles?.map(detalle => ({
                productoId: detalle.loteProducto.producto.id,
                cantidad: detalle.cantidad,
                precio: detalle.precio,
                loteProductoId: detalle.loteProducto.id
            })) || [];

            const proveedorId = dataCompra.proveedor?.id || 0;
            // const proveedorExiste = dataProveedores?.some(p => p.id === proveedorId);

            const formData = {
                comentario: dataCompra.comentario || "",
                proveedorId: proveedorId,
                detalles: detallesMapeados,
            };

            setTimeout(() => {
                form.reset(formData);
                form.setValue('proveedorId', proveedorId);
                form.trigger('proveedorId');
            }, 0);

            const cargarLotesIniciales = async () => {
                if (dataCompra.detalles && dataCompra.detalles.length > 0) {
                    const lotesIniciales: Record<number, LoteProductoSimple[]> = {};

                    const lotesPromises = dataCompra.detalles.map(async (detalle, index) => {
                        const productoId = detalle.loteProducto.producto.id;
                        if (productoId) {
                            try {
                                lastIndexRef.current = index;
                                await fetchLotesProducto(productoId);

                                const loteActual: LoteProductoSimple = {
                                    id: detalle.loteProducto.id,
                                    lote: detalle.loteProducto.lote,
                                    fechaVencimiento: detalle.loteProducto.fechaVencimiento
                                };

                                lotesIniciales[index] = [loteActual];
                            } catch (error) {
                                console.error(`Error cargando lotes para producto ${productoId}:`, error);
                                const loteActual: LoteProductoSimple = {
                                    id: detalle.loteProducto.id,
                                    lote: detalle.loteProducto.lote,
                                    fechaVencimiento: detalle.loteProducto.fechaVencimiento
                                };
                                lotesIniciales[index] = [loteActual];
                            }
                        }
                    });

                    await Promise.all(lotesPromises);
                    setLotesPorDetalle(prev => ({ ...prev, ...lotesIniciales }));
                }
            };

            cargarLotesIniciales();
        }
    }, [dataCompra, dataProductos, dataProveedores, isLoadingData]);

    const onSubmit = async (data: CompraRequest) => {
        try {
            const response = await modificarOrdenCompra(compraId, data)
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Orden de compra modificada"
                    message={response?.message || "Orden modificada exitosamente"}
                    date={dateFormat(Date.now())}
                />
            ));
            setCompraAction(!compraAction)
            form.reset();
            if (onClose) onClose();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al modificar orden de compra"
                    message={err?.response?.message || err?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    const handleOpenModalRegistrarLote = (productoId: string, index: number) => {
        setCurrentProductoIdForLote(productoId);
        setCurrentIndexForLote(index);
        setOpenModalRegistrarLote(true);
    };

    const handleCloseModalRegistrarLote = () => {
        const wasOpen = openModalRegistrarLote;
        setOpenModalRegistrarLote(false);

        if (wasOpen && currentProductoIdForLote) {
            setTimeout(() => {
                refreshLotesForProducto(currentProductoIdForLote);
            }, 500);
        }

        setCurrentProductoIdForLote("");
        setCurrentIndexForLote(-1);
    };

    const watchedDetalles = useWatch({
        control: form.control,
        name: "detalles",
    });

    const calcularTotal = () => {
        if (!watchedDetalles) return 0;
        return watchedDetalles.reduce((total, detalle) => {
            const cantidad = Number(detalle?.cantidad) || 0;
            const precio = Number(detalle?.precio) || 0;
            return total + (cantidad * precio);
        }, 0);
    };

    return (
        <Dialog modal open={open} onOpenChange={onClose}>
            <DialogContent
                className="max-h-[96%] w-full overflow-auto sm:max-w-[700px] md:max-w-[1000px] [&_[data-dialog-close]]:hidden"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">Modificar Orden de Compra</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Modifica los detalles de la orden de compra existente.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-muted-foreground">Cargando datos...</span>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Proveedor */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Información del Proveedor
                                    </CardTitle>
                                    <FormField
                                        name="proveedorId"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Proveedor *</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={field.value > 0 ? String(field.value) : ""}
                                                        onValueChange={(value) => {
                                                            field.onChange(Number(value));
                                                            form.trigger("proveedorId");
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full h-11">
                                                            <SelectValue placeholder="Seleccione un proveedor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {dataProveedores?.map((item) => (
                                                                <SelectItem key={item.id} value={String(item.id)}>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{item.razonSocial}</span>
                                                                        <span className="text-xs text-muted-foreground">NIT: {item.nit}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardHeader>
                            </Card>

                            {/* Detalles */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <ShoppingBagIcon className="h-5 w-5" />
                                            Detalles de la Orden
                                        </CardTitle>
                                        {fields.length > 0 && (
                                            <Badge variant="secondary" className="text-sm">
                                                {fields.length} producto{fields.length !== 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {fields.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No hay productos agregados</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {fields.map((item, index) => {
                                                const cantidad = form.getValues(`detalles.${index}.cantidad`) || 0;
                                                const precio = form.getValues(`detalles.${index}.precio`) || 0;
                                                const subtotal = cantidad * precio;
                                                const currentProductoId = form.getValues(`detalles.${index}.productoId`);
                                                const isLoadingLotes = loadingLotes[currentProductoId] || false;
                                                return (
                                                    <Card key={item.id} className="p-0 bg-gray-50 dark:bg-gray-900 border-dashed">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <Badge variant="outline" className="text-xs">
                                                                    Producto #{index + 1}
                                                                </Badge>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => remove(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                {/* Producto */}
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`detalles.${index}.productoId`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-col">
                                                                            <FormLabel className="text-sm font-medium">Producto *</FormLabel>
                                                                            <Popover
                                                                                open={openProductoIndex === index}
                                                                                onOpenChange={(open) => setOpenProductoIndex(open ? index : null)}
                                                                            >
                                                                                <PopoverTrigger asChild>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        role="combobox"
                                                                                        className={cn("w-full justify-between h-11")}
                                                                                    >
                                                                                        {dataProductos?.find(p => p.id === field.value)?.nombreComercial || "Seleccione un producto"}
                                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                    </Button>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent className="w-full p-0">
                                                                                    <Command>
                                                                                        <CommandInput placeholder="Buscar producto..." />
                                                                                        <CommandEmpty>No se encontró producto</CommandEmpty>
                                                                                        <CommandGroup>
                                                                                            {dataProductos?.map((p) => (
                                                                                                <CommandItem
                                                                                                    key={p.id}
                                                                                                    value={p.nombreComercial}
                                                                                                    onSelect={() => {
                                                                                                        onChangeProducto(p.id, index);
                                                                                                        setOpenProductoIndex(null);
                                                                                                    }}
                                                                                                >
                                                                                                    {p.nombreComercial}
                                                                                                    <Check className={cn("ml-auto h-4 w-4", field.value === p.id ? "opacity-100" : "opacity-0")} />
                                                                                                </CommandItem>
                                                                                            ))}
                                                                                        </CommandGroup>
                                                                                    </Command>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                {/* Cantidad */}
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`detalles.${index}.cantidad`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-sm font-medium">Cantidad *</FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    className="h-11"
                                                                                    placeholder="0"
                                                                                    {...field}
                                                                                />
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                {/* Precio */}
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`detalles.${index}.precio`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-sm font-medium">Precio unidad*</FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    className="h-11"
                                                                                    placeholder="0.00"
                                                                                    {...field}
                                                                                />
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>

                                                            {/* Lote */}
                                                            <div className="mt-4 w-full">
                                                                <FormLabel className="text-sm font-medium flex items-center gap-2 mb-2">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Lote *
                                                                </FormLabel>

                                                                <div className="flex gap-2 items-start">
                                                                    <div className="flex-1">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`detalles.${index}.loteProductoId`}
                                                                            render={({ field }) => {
                                                                                const selectedLote = lotesPorDetalle[index]?.find((l) => l.id === field.value);
                                                                                return (
                                                                                    <FormItem className="flex-1">
                                                                                        <Popover open={openLoteIndex === index} onOpenChange={(v) => setOpenLoteIndex(v ? index : null)}>
                                                                                            <PopoverTrigger asChild>
                                                                                                <FormControl>
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        role="combobox"
                                                                                                        aria-expanded={openLoteIndex === index}
                                                                                                        className={cn(
                                                                                                            "w-full justify-between h-11",
                                                                                                            !selectedLote && "text-muted-foreground"
                                                                                                        )}
                                                                                                        disabled={!currentProductoId || isLoadingLotes}
                                                                                                    >
                                                                                                        {isLoadingLotes ? (
                                                                                                            <div className="flex items-center gap-2">
                                                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                                                                <span>Cargando lotes...</span>
                                                                                                            </div>
                                                                                                        ) : selectedLote ? (
                                                                                                            <div className="flex flex-col text-left">
                                                                                                                <span className="text-sm font-medium">{selectedLote.lote}</span>
                                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                                    Vence: {new Date(selectedLote.fechaVencimiento).toLocaleDateString()}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                        ) : !currentProductoId ? (
                                                                                                            "Selecciona un producto primero"
                                                                                                        ) : (
                                                                                                            "Selecciona un lote"
                                                                                                        )}
                                                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                                    </Button>
                                                                                                </FormControl>
                                                                                            </PopoverTrigger>
                                                                                            <PopoverContent className="w-[280px] p-0">
                                                                                                <Command>
                                                                                                    <CommandInput placeholder="Buscar lote..." className="h-9" />
                                                                                                    <CommandList>
                                                                                                        <CommandEmpty>No se encontraron lotes.</CommandEmpty>
                                                                                                        <CommandGroup>
                                                                                                            {lotesPorDetalle[index]?.map((lote) => (
                                                                                                                <CommandItem
                                                                                                                    key={lote.id}
                                                                                                                    value={`${lote.lote}`}
                                                                                                                    onSelect={() => {
                                                                                                                        field.onChange(lote.id);
                                                                                                                        setOpenLoteIndex(null);
                                                                                                                    }}
                                                                                                                    className="flex justify-between items-center px-2 py-1.5"
                                                                                                                >
                                                                                                                    <div className="flex flex-col text-left">
                                                                                                                        <span className="text-sm font-medium">{lote.lote}</span>
                                                                                                                        <span className="text-xs text-muted-foreground">
                                                                                                                            Vence: {new Date(lote.fechaVencimiento).toLocaleDateString()}
                                                                                                                        </span>
                                                                                                                    </div>
                                                                                                                    <Check className="ml-auto h-4 w-4 text-primary" />
                                                                                                                </CommandItem>
                                                                                                            ))}
                                                                                                        </CommandGroup>
                                                                                                    </CommandList>
                                                                                                </Command>
                                                                                            </PopoverContent>
                                                                                        </Popover>
                                                                                    </FormItem>
                                                                                )

                                                                            }}
                                                                        />

                                                                        <Button
                                                                            type="button"
                                                                            onClick={() => handleOpenModalRegistrarLote(currentProductoId, index)}
                                                                            disabled={!currentProductoId}
                                                                            className="inline-flex items-center gap-1"
                                                                        >
                                                                            <PlusCircle className="h-5 w-5" />
                                                                            Nuevo lote
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Subtotal */}
                                                            {subtotal > 0 && (
                                                                <div className="mt-4 pt-3 border-t border-dashed">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-sm text-muted-foreground">Subtotal:</span>
                                                                        <span className="font-semibold text-lg">
                                                                            Bs {subtotal.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-11 border-dashed border-2"
                                        onClick={() => append({ productoId: "", cantidad: 1, precio: 0, loteProductoId: 0 })}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Producto
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Resumen Total */}
                            {fields.length > 0 && (
                                <Card className="p-2 border-blue-200">
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-semibold">Total de la Orden</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-blue-600">
                                                    Bs {calcularTotal().toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Separator />

                            {/* Botones */}
                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 px-8"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-11 px-8 bg-blue-600 hover:bg-blue-700"
                                    disabled={fields.length === 0}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Modificar Orden
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                <ModalRegistrarLoteProducto
                    open={openModalRegistrarLote}
                    onClose={handleCloseModalRegistrarLote}
                    productoId={currentProductoIdForLote}
                />
            </DialogContent>
        </Dialog>
    );
}
