import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useRegistrarOrdenCompra } from "@/hooks";
import { CompraRequest } from "@/models/compra";
import { obtenerListaProductos, obtenerListaProveedores, obtenerLotesByProductoId } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { LoteProductoSimple } from "@/models";
import { Plus, Trash2, Package, ShoppingCart, Calendar, ShoppingBagIcon, PlusCircle, ChevronsUpDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { useComprasContext } from "@/context/compraContext";
import { ModalRegistrarLoteProducto } from "@/pages/LotesProductos/components/ModalRegistarLoteProducto";
import { useLoteProductosContext } from "@/context/loteProductoLote";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { ModalConfirmarCompra } from "./ModalConfirmarCompra";

interface ModalRegistrarOrdenCompraProps {
    onClose?: () => void;
    open: boolean;
}

const schema = z.object({
    proveedorId: z.number().gt(0, { message: "Selecciona un proveedor" }),
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

export function ModalRegistrarOrdenCompra({ open, onClose }: ModalRegistrarOrdenCompraProps) {
    const { fetch: fetchProductos, data: dataProductos } = useQuery(obtenerListaProductos);
    const { fetch: fetchProveedores, data: dataProveedores } = useQuery(obtenerListaProveedores);
    const { fetch: fetchLotesProducto, data: dataLoteProducto } = useQuery(obtenerLotesByProductoId);
    const { mutate: registrarOrdenCompra } = useRegistrarOrdenCompra();
    const { compraAction, setCompraAction } = useComprasContext()
    const { loteProductoAction } = useLoteProductosContext();
    const [openModalRegistrarLote, setOpenModalRegistrarLote] = useState(false);
    const [currentProductoIdForLote, setCurrentProductoIdForLote] = useState<string>("");
    const [_, setCurrentIndexForLote] = useState<number>(-1);
    const [openProductoIndex, setOpenProductoIndex] = useState<number | null>(null);
    const [openLoteIndex, setOpenLoteIndex] = useState<number | null>(null);
    const [popoverOpenProveedor, setPopoverOpenProveedor] = useState(false);
    const [openModalDetalleCompra, setOpenModalDetalleCompra] = useState(false)
    const compraId = useRef(0)
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

    // Estado para almacenar lotes por índice detalle
    const [lotesPorDetalle, setLotesPorDetalle] = useState<Record<number, LoteProductoSimple[]>>({});

    // Estado para rastrear qué productos están cargando lotes
    const [loadingLotes, setLoadingLotes] = useState<Record<string, boolean>>({});

    // Ref para controlar índice del detalle que está cargando lotes
    const lastIndexRef = useRef<number | null>(null);
    const lastProductoIdRef = useRef<string | null>(null);

    // Cuando cambie dataLoteProducto, actualizamos el estado para el índice correspondiente
    useEffect(() => {
        if (dataLoteProducto && lastIndexRef.current !== null && lastProductoIdRef.current) {
            const lotesArray: LoteProductoSimple[] = Array.isArray(dataLoteProducto)
                ? dataLoteProducto.filter((lote): lote is LoteProductoSimple => lote != null)
                : dataLoteProducto ? [dataLoteProducto] : [];

            // Actualizar todos los detalles que tengan el mismo productoId
            const detallesActuales = form.getValues("detalles");
            const nuevosLotesPorDetalle = { ...lotesPorDetalle };

            detallesActuales.forEach((detalle, index) => {
                if (detalle.productoId === lastProductoIdRef.current) {
                    nuevosLotesPorDetalle[index] = lotesArray;
                }
            });

            setLotesPorDetalle(nuevosLotesPorDetalle);

            // Limpiar el estado de loading para este producto
            if (lastProductoIdRef.current) {
                setLoadingLotes(prev => ({
                    ...prev,
                    [lastProductoIdRef.current!]: false
                }));
            }
        }
    }, [dataLoteProducto]);

    // Efecto para detectar cambios en loteProductoAction y refrescar lotes
    useEffect(() => {
        if (loteProductoAction && currentProductoIdForLote) {
            // Refrescar lotes para el producto que se acaba de actualizar
            refreshLotesForProducto(currentProductoIdForLote);
        }
    }, [loteProductoAction]);

    // Función para refrescar lotes de un producto específico
    const refreshLotesForProducto = async (productoId: string) => {
        if (!productoId) return;

        try {
            // Marcar como cargando
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: true
            }));

            // Configurar las referencias para el efecto de dataLoteProducto
            lastProductoIdRef.current = productoId;
            lastIndexRef.current = 0; // Solo necesitamos un índice válido

            // Obtener los nuevos lotes del producto
            await fetchLotesProducto(productoId);

        } catch (error) {
            // En caso de error, actualizar con array vacío para los detalles con este productoId
            const detallesActuales = form.getValues("detalles");
            const nuevosLotesPorDetalle = { ...lotesPorDetalle };

            detallesActuales.forEach((detalle, index) => {
                if (detalle.productoId === productoId) {
                    nuevosLotesPorDetalle[index] = [];
                }
            });

            setLotesPorDetalle(nuevosLotesPorDetalle);

            // Limpiar el estado de loading
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: false
            }));
        }
    };

    // Función para manejar cambio de producto y cargar lotes
    const onChangeProducto = async (productoId: string, index: number) => {
        // Actualizamos productoId en el formulario
        form.setValue(`detalles.${index}.productoId`, productoId);
        // Limpiamos loteProductoId porque cambia el producto
        form.setValue(`detalles.${index}.loteProductoId`, 0);

        // Configurar referencias
        lastIndexRef.current = index;
        lastProductoIdRef.current = productoId;

        // Carga lotes para ese producto
        try {
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: true
            }));

            await fetchLotesProducto(productoId);
        } catch (error) {
            setLotesPorDetalle((prev) => ({
                ...prev,
                [index]: [],
            }));

            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: false
            }));
        }
    };

    // Función para abrir modal de registrar lote
    const handleOpenModalRegistrarLote = (productoId: string, index: number) => {
        setCurrentProductoIdForLote(productoId);
        setCurrentIndexForLote(index);
        setOpenModalRegistrarLote(true);
    };

    // Función para cerrar modal de registrar lote y actualizar lotes
    const handleCloseModalRegistrarLote = () => {
        const wasOpen = openModalRegistrarLote;
        setOpenModalRegistrarLote(false);

        // Si el modal se estaba cerrando y había un producto seleccionado, 
        // refrescar los lotes después de un breve delay
        if (wasOpen && currentProductoIdForLote) {
            setTimeout(() => {
                refreshLotesForProducto(currentProductoIdForLote);
            }, 500); // Dar tiempo para que se complete el registro
        }

        setCurrentProductoIdForLote("");
        setCurrentIndexForLote(-1);
    };


    const onSubmit = async (data: CompraRequest) => {
        try {
            const response = await registrarOrdenCompra(data)
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Orden de compra registrada"
                    message={response?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
            if (response?.data){
                compraId.current = response.data.id
            }
            setOpenModalDetalleCompra(true)
            setCompraAction(!compraAction)
            form.reset();
            setLotesPorDetalle({});
            setLoadingLotes({});
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al registrar orden de compra"
                    message={err?.response?.message || err?.message || "Error en el servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    useEffect(() => {
        // Carga inicial de proveedores y productos
        const fetchData = async () => {
            try {
                await Promise.all([fetchProductos(), fetchProveedores()]);
            } catch (err) {
                console.error("Error cargando datos:", err);
            }
        };
        fetchData();
    }, []);

    // Observar cambios en los detalles para cálculos en tiempo real
    const watchedDetalles = useWatch({
        control: form.control,
        name: "detalles",
    });

    // Calcular total de la orden en tiempo real
    const calcularTotal = () => {
        if (!watchedDetalles) return 0;
        return watchedDetalles.reduce((total, detalle) => {
            const cantidad = Number(detalle?.cantidad) || 0;
            const precio = Number(detalle?.precio) || 0;
            return total + (cantidad * precio);
        }, 0);
    };

    return (
        <>
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
                                <DialogTitle className="text-xl font-semibold">Nueva Orden de Compra</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Registra una nueva orden de compra con los detalles de productos y proveedores.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Información del Proveedor */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Información del Proveedor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="proveedorId"
                                        render={({ field }) => {
                                            const selectedProveedor = dataProveedores?.find((c) => c.id === field.value);

                                            return (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium">Proveedor *</FormLabel>
                                                    <Popover
                                                        open={popoverOpenProveedor}
                                                        onOpenChange={setPopoverOpenProveedor}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-full justify-between h-11",
                                                                    !selectedProveedor && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {selectedProveedor ? (
                                                                    <div className="flex flex-col text-left">
                                                                        <span className="text-sm font-medium">{selectedProveedor.razonSocial}</span>
                                                                        <span className="text-xs text-muted-foreground">NIT: {selectedProveedor.nit}</span>
                                                                    </div>
                                                                ) : (
                                                                    "Seleccione un proveedor"
                                                                )}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-full p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Buscar proveedor..." />
                                                                <CommandEmpty>No se encontró proveedor</CommandEmpty>
                                                                <CommandGroup>
                                                                    {dataProveedores?.map((proveedor) => (
                                                                        <CommandItem
                                                                            key={proveedor.id}
                                                                            value={proveedor.razonSocial}
                                                                            onSelect={() => {
                                                                                form.setValue("proveedorId", proveedor.id);
                                                                                setPopoverOpenProveedor(false);
                                                                            }}
                                                                        >
                                                                            <div className="flex flex-col text-left">
                                                                                <span className="text-sm font-medium">{proveedor.razonSocial}</span>
                                                                                <span className="text-xs text-muted-foreground">NIT: {proveedor.nit}</span>
                                                                            </div>
                                                                            {field.value === proveedor.id && (
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
                                </CardContent>
                            </Card>

                            {/* Detalles de la Orden */}
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
                                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No hay productos agregados</p>
                                            <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
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
                                                    <Card key={item.id} className="p-0 bg-neutral-50 dark:bg-neutral-900 border-dashed">
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
                                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                {/* Producto */}
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`detalles.${index}.productoId`}
                                                                    render={({ field }) => {
                                                                        const selectedProducto = dataProductos?.find((c) => c.id === field.value);

                                                                        return (
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
                                                                                            className={cn(
                                                                                                "w-full justify-between h-11",
                                                                                                !selectedProducto && "text-muted-foreground"
                                                                                            )}
                                                                                        >
                                                                                            {selectedProducto ? (
                                                                                                <div className="flex flex-col text-left">
                                                                                                    <span className="text-sm font-medium">{selectedProducto.nombreComercial}</span>
                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                        {selectedProducto.formaFarmaceutica} • {selectedProducto.laboratorio}
                                                                                                    </span>
                                                                                                </div>
                                                                                            ) : (
                                                                                                "Seleccione un producto"
                                                                                            )}
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
                                                                                                        <div className="flex flex-col text-left">
                                                                                                            <span className="text-sm font-medium">{p.nombreComercial}</span>
                                                                                                            <span className="text-xs text-muted-foreground">
                                                                                                                {p.formaFarmaceutica} • {p.laboratorio}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        {field.value === p.id && (
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
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                {/* Precio */}
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`detalles.${index}.precio`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-sm font-medium">Precio unidad *</FormLabel>
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
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>

                                                            {/* Lote - Ahora usando Popover + Command */}
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
                                                                                    <FormItem>
                                                                                        <Popover
                                                                                            open={openLoteIndex === index}
                                                                                            onOpenChange={(open) => setOpenLoteIndex(open ? index : null)}
                                                                                        >
                                                                                            <PopoverTrigger asChild>
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    role="combobox"
                                                                                                    disabled={!currentProductoId || isLoadingLotes}
                                                                                                    className={cn(
                                                                                                        "w-full justify-between h-11",
                                                                                                        !selectedLote && "text-muted-foreground"
                                                                                                    )} >
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
                                                                                            </PopoverTrigger>
                                                                                            <PopoverContent className="w-full p-0">
                                                                                                <Command>
                                                                                                    <CommandInput placeholder="Buscar lote..." />
                                                                                                    <CommandEmpty>
                                                                                                        {lotesPorDetalle[index]?.length === 0
                                                                                                            ? "No hay lotes disponibles"
                                                                                                            : "No se encontró lote"
                                                                                                        }
                                                                                                    </CommandEmpty>
                                                                                                    <CommandGroup>
                                                                                                        {lotesPorDetalle[index]?.map((lote) => (
                                                                                                            <CommandItem
                                                                                                                key={lote.id}
                                                                                                                value={lote.lote}
                                                                                                                onSelect={() => {
                                                                                                                    field.onChange(lote.id);
                                                                                                                    setOpenLoteIndex(null);
                                                                                                                }}
                                                                                                            >
                                                                                                                <div className="flex flex-col text-left">
                                                                                                                    <span className="text-sm font-medium">{lote.lote}</span>
                                                                                                                    <span className="text-xs text-muted-foreground">
                                                                                                                        Vence: {new Date(lote.fechaVencimiento).toLocaleDateString()}
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                                {field.value === lote.id && (
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
                                                                        onClick={() => handleOpenModalRegistrarLote(currentProductoId, index)}
                                                                        disabled={!currentProductoId}
                                                                        className="inline-flex items-center gap-1 rounded-md px-3 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed h-11"
                                                                    >
                                                                        <PlusCircle className="h-4 w-4" />
                                                                        Nuevo lote
                                                                    </Button>
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
                                        className="w-full h-11 border-dashed border-2 hover:border-solid transition-all"
                                        onClick={() =>
                                            append({ productoId: "", cantidad: 1, precio: 0, loteProductoId: 0 })
                                        }
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Producto
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Resumen Total */}
                            {fields.length > 0 && (
                                <Card className="p-2 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-semibold">Total de la Orden</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {fields.length} producto{fields.length !== 1 ? 's' : ''} agregado{fields.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                    Bs {calcularTotal().toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Separator />

                            {/* Botones de Acción */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
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
                                    Registrar Orden
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {/* Modal para registrar lote */}
                    <ModalRegistrarLoteProducto
                        open={openModalRegistrarLote}
                        onClose={handleCloseModalRegistrarLote}
                        productoId={currentProductoIdForLote}
                    />
                </DialogContent>
            </Dialog>
            {openModalDetalleCompra && compraId.current != 0 && (
                <ModalConfirmarCompra
                    compraId={compraId.current}
                    open={openModalDetalleCompra}
                    onClose={() => {
                        setOpenModalDetalleCompra(false);
                        onClose?.();
                    }}
                />
            )}

        </>

    );
}