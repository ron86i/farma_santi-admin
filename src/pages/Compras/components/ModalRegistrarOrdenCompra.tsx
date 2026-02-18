import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useRegistrarOrdenCompra } from "@/hooks";
import { CompraRequest, DetalleCompraRequest } from "@/models/compra";
import { obtenerListaLaboratoriosDisponibles, obtenerListaProductos, obtenerLotesByProductoId } from "@/services";
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
// Esquema para el formulario
const schema = z.object({
    laboratorioId: z.number().gt(0, { message: "Selecciona un laboratorio" }),
    comentario: z.string().optional(),
    detalles: z.array(
        z.object({
            productoId: z.string().uuid({ message: "" }),
            precioCompra: z.coerce.number().gt(0, { message: "" }),
            precioVenta: z.coerce.number().gt(0, { message: "" }),
            lotesProductos: z.array(
                z.object({
                    loteProductoId: z.number().gt(0, { message: "" }),
                    cantidad: z.coerce.number().gt(0, { message: "" }), // La cantidad sigue siendo el total de unidades
                })
            ).min(1, { message: "Debe agregar al menos un lote" }),

        })
            .refine(
                (data) => data.precioVenta > data.precioCompra,
                {
                    message: "",
                    path: ["precioVenta"],
                })
    ),
});


type FormData = z.infer<typeof schema>;

export function ModalRegistrarOrdenCompra({ open, onClose }: ModalRegistrarOrdenCompraProps) {
    const { fetch: fetchProductos, data: dataProductos } = useQuery(obtenerListaProductos);
    const { fetch: fetchLaboratorios, data: dataLaboratorios } = useQuery(obtenerListaLaboratoriosDisponibles);
    const { fetch: fetchLotesProducto, data: dataLoteProducto } = useQuery(obtenerLotesByProductoId);
    const { mutate: registrarOrdenCompra } = useRegistrarOrdenCompra();
    const { compraAction, setCompraAction } = useComprasContext()
    const { loteProductoAction } = useLoteProductosContext();
    const [openModalRegistrarLote, setOpenModalRegistrarLote] = useState(false);
    const [currentProductoIdForLote, setCurrentProductoIdForLote] = useState<string>("");
    const [_, setCurrentIndexForLote] = useState<number>(-1);
    const [openProductoIndex, setOpenProductoIndex] = useState<number | null>(null);
    const [openLoteIndex, setOpenLoteIndex] = useState<string | null>(null);
    const [popoverOpenLaboratorio, setPopoverOpenLaboratorio] = useState(false);
    const [openModalDetalleCompra, setOpenModalDetalleCompra] = useState(false)
    const compraId = useRef(0)
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            laboratorioId: 0,
            comentario: "",
            detalles: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "detalles",
    });
    const [preciosPorPresentacion, setPreciosPorPresentacion] = useState<Record<number, number>>({});
    const [preciosInicializados, setPreciosInicializados] = useState<Record<number, boolean>>({});
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

    // Función para calcular precio por unidad desde precio de presentación
    const calcularPrecioUnidad = (precioPresentacion: number, unidadesPresentacion: number): number => {
        if (unidadesPresentacion <= 1) return precioPresentacion;
        return Number((precioPresentacion / unidadesPresentacion).toFixed(2));
    };

    // Función para manejar cambio en precio de presentación
    const handlePrecioPresentacionChange = (
        index: number,
        valor: string,
        unidadesPresentacion: number
    ) => {
        const precioPresentacion = Number(valor) || 0;
        setPreciosPorPresentacion(prev => ({
            ...prev,
            [index]: precioPresentacion
        }));

        // Calcular y actualizar precio por unidad
        const precioUnidad = calcularPrecioUnidad(precioPresentacion, unidadesPresentacion);
        form.setValue(`detalles.${index}.precioCompra`, precioUnidad);
    };

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


    const onSubmit = async (data: FormData) => {
        try {
            // Convertir la estructura del formulario al modelo esperado por el backend
            const detallesCompra: DetalleCompraRequest[] = data.detalles.flatMap((detalle) =>
                detalle.lotesProductos.map((lote) => ({
                    cantidad: lote.cantidad,
                    precioCompra: detalle.precioCompra, // o detalle.precioVenta si deseas enviar precio de venta
                    precioVenta: detalle.precioVenta,
                    loteProductoId: lote.loteProductoId,
                }))
            );

            const request: CompraRequest = {
                laboratorioId: data.laboratorioId,
                comentario: data.comentario,
                detalles: detallesCompra,
            };

            // Llamada al servicio
            const response = await registrarOrdenCompra(request);

            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Orden de compra registrada"
                    message={response?.message || "Operación exitosa"}
                    date={dateFormat(Date.now())}
                />
            ));

            if (response?.data) {
                compraId.current = response.data.id;
            }

            setOpenModalDetalleCompra(true);
            setCompraAction(!compraAction);

            // Reset de formulario y estados locales
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
        // Carga inicial de laboratorio
        const fetchData = async () => {
            try {
                await Promise.all([fetchLaboratorios()]);
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
    // Calcular total de la orden en tiempo real por lote usando precio del producto
    const calcularTotal = () => {
        if (!watchedDetalles) return 0;

        return watchedDetalles.reduce((total, detalle) => {
            const subtotalDetalle = detalle.lotesProductos.reduce((subtotal, lote) => {
                const cantidad = Number(lote.cantidad) || 0;
                const precio = Number(detalle.precioCompra) || 0; // precio del producto
                return subtotal + cantidad * precio;
            }, 0);

            return total + subtotalDetalle;
        }, 0);
    };





    // Estado para el laboratorio seleccionado
    const selectedLaboratorioId = form.watch("laboratorioId");

    // Efecto para cargar productos solo cuando cambia el laboratorio
    useEffect(() => {
        if (selectedLaboratorioId) {
            fetchProductos(`laboratorioId=${selectedLaboratorioId}`);
        }
    }, [selectedLaboratorioId]);
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
                                    Registra una nueva orden de compra con los detalles de productos y la.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Información del Laboratorio */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Información del Laboratorio
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="laboratorioId"
                                        render={({ field }) => {
                                            dataLaboratorios?.find((c) => c.id === field.value);

                                            return (
                                                <FormField
                                                    control={form.control}
                                                    name="laboratorioId"
                                                    render={({ field }) => {
                                                        const selectedLaboratorio = dataLaboratorios?.find((c) => c.id === field.value);

                                                        return (
                                                            <FormItem className="flex flex-col">
                                                                <FormLabel className="text-sm font-medium">Laboratorio *</FormLabel>
                                                                <Popover open={popoverOpenLaboratorio} onOpenChange={setPopoverOpenLaboratorio}>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            role="combobox"
                                                                            className={cn(
                                                                                "w-full justify-between h-11",
                                                                                !selectedLaboratorio && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {selectedLaboratorio ? selectedLaboratorio.nombre : "Seleccione un laboratorio"}
                                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                        </Button>
                                                                    </PopoverTrigger>

                                                                    <PopoverContent className="w-full p-0">
                                                                        <Command>
                                                                            <CommandInput placeholder="Buscar laboratorio..." />
                                                                            <CommandEmpty>No se encontró laboratorio</CommandEmpty>
                                                                            <CommandGroup>
                                                                                {dataLaboratorios?.map((lab) => (
                                                                                    <CommandItem
                                                                                        key={lab.id}
                                                                                        value={lab.nombre}
                                                                                        onSelect={() => {
                                                                                            // Actualizamos laboratorio
                                                                                            form.setValue("laboratorioId", lab.id);

                                                                                            // 🔹 Reseteamos detalles de productos y lotes
                                                                                            form.setValue("detalles", []);

                                                                                            setPopoverOpenLaboratorio(false);
                                                                                        }}
                                                                                    >
                                                                                        <div className="flex flex-col text-left">
                                                                                            <span className="text-sm font-medium">{lab.nombre}</span>
                                                                                        </div>
                                                                                        {field.value === lab.id && <Check className="ml-auto h-4 w-4 text-primary" />}
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
                                                const detalle = form.getValues(`detalles.${index}`);
                                                let cantidad = 0
                                                detalle.lotesProductos.forEach((l) => {
                                                    cantidad += l.cantidad
                                                })
                                                const subtotal = cantidad * detalle.precioCompra;
                                                const currentProductoId = detalle.productoId

                                                const selectedProducto = dataProductos?.find((p) => p.id === currentProductoId);
                                                const unidadesPorPresentacion = selectedProducto?.unidadesPresentacion ?? 1;
                                                const nombrePresentacion = selectedProducto?.presentacion?.nombre || "Presentación";
                                                const nombreUnidadBase = "Ud";
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

                                                            {/* Producto + Precios */}

                                                            <div className="flex flex-col gap-4 w-full mt-4 border border-gray-200 bg-muted/30 rounded-2xl p-4 shadow-sm">
                                                                {/* Producto */}
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`detalles.${index}.productoId`}
                                                                    render={({ field }) => {
                                                                        const selectedProducto = dataProductos?.find((c) => c.id === field.value);
                                                                        // Solo establecer precios iniciales una vez por índice cuando se selecciona un producto
                                                                        if (selectedProducto && field.value && !preciosInicializados[index]) {
                                                                            setTimeout(() => {
                                                                                form.setValue(`detalles.${index}.precioCompra`, selectedProducto.precioCompra || 0);
                                                                                form.setValue(`detalles.${index}.precioVenta`, selectedProducto.precioVenta || 0);
                                                                                setPreciosInicializados(prev => ({
                                                                                    ...prev,
                                                                                    [index]: true
                                                                                }));
                                                                            }, 0);
                                                                        }
                                                                        // Productos ya seleccionados en otros índices
                                                                        const productosSeleccionados = form.getValues("detalles")
                                                                            .map((d: any) => d.productoId)
                                                                            .filter((id: string) => id && id !== field.value);

                                                                        // Filtrar productos para que no aparezcan los repetidos
                                                                        const productosDisponibles = dataProductos?.filter(
                                                                            (p) => !productosSeleccionados.includes(p.id)
                                                                        );

                                                                        return (
                                                                            <FormItem className="flex-1">
                                                                                <FormLabel className="text-sm font-medium text-gray-700">Producto *</FormLabel>
                                                                                <Popover
                                                                                    open={openProductoIndex === index}
                                                                                    onOpenChange={(open) => setOpenProductoIndex(open ? index : null)}
                                                                                >
                                                                                    <PopoverTrigger asChild>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            role="combobox"
                                                                                            className={cn(
                                                                                                "w-full justify-between h-11 text-left text-sm border-gray-300 bg-white hover:bg-gray-50 transition rounded-xl",
                                                                                                !selectedProducto && "text-muted-foreground"
                                                                                            )}
                                                                                        >
                                                                                            {selectedProducto ? (
                                                                                                <div className="flex flex-col text-left">
                                                                                                    <span className="text-sm font-medium text-gray-800">
                                                                                                        {selectedProducto.nombreComercial}
                                                                                                    </span>
                                                                                                    <span className="text-xs text-gray-500">
                                                                                                        {selectedProducto.formaFarmaceutica} • {selectedProducto.laboratorio}
                                                                                                    </span>
                                                                                                </div>
                                                                                            ) : (
                                                                                                "Seleccione un producto"
                                                                                            )}
                                                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                        </Button>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent className="w-full p-0 rounded-xl shadow-lg border border-gray-200">
                                                                                        <Command>
                                                                                            <CommandInput placeholder="Buscar producto..." />
                                                                                            <CommandEmpty className="p-2 text-center text-gray-500">
                                                                                                No se encontró producto
                                                                                            </CommandEmpty>
                                                                                            <CommandGroup>
                                                                                                {productosDisponibles?.map((p) => (
                                                                                                    <CommandItem
                                                                                                        key={p.id}
                                                                                                        value={p.nombreComercial}
                                                                                                        onSelect={() => {
                                                                                                            onChangeProducto(p.id, index);
                                                                                                            setOpenProductoIndex(null);
                                                                                                        }}
                                                                                                        className="flex justify-between items-center py-2 px-3 hover:bg-primary/10 rounded-lg"
                                                                                                    >
                                                                                                        <div className="flex flex-col text-left">
                                                                                                            <span className="text-sm font-medium text-gray-800">{p.nombreComercial}</span>
                                                                                                            <span className="text-xs text-gray-500">
                                                                                                                {p.formaFarmaceutica} • {p.laboratorio}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        {field.value === p.id && <Check className="ml-2 h-4 w-4 text-primary" />}
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

                                                                <div className="flex flex-col md:flex-row md:items-end gap-4">
                                                                    {/* Precio de Compra por Presentación */}
                                                                    {selectedProducto && selectedProducto.unidadesPresentacion > 1 && (
                                                                        <FormItem className="w-full md:w-44">
                                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                                Precio Compra ({selectedProducto.presentacion?.nombre || 'Present.'})
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    placeholder="0.00"
                                                                                    value={preciosPorPresentacion[index] || ''}
                                                                                    onChange={(e) => handlePrecioPresentacionChange(
                                                                                        index,
                                                                                        e.target.value,
                                                                                        selectedProducto.unidadesPresentacion
                                                                                    )}
                                                                                    className="h-11 text-sm rounded-xl border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                                                                                />
                                                                            </FormControl>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                {selectedProducto.unidadesPresentacion} unidades
                                                                            </p>
                                                                        </FormItem>
                                                                    )}

                                                                    {/* Precio de Compra por Unidad */}
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`detalles.${index}.precioCompra`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="w-full md:w-40">
                                                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                                                    Precio Compra (Ud) *
                                                                                </FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        step="0.01"
                                                                                        placeholder="0.00"
                                                                                        {...field} // Mantener enlace con RHF
                                                                                        onChange={(e) => {
                                                                                            const precioUnitarioNum = parseFloat(e.target.value) || 0;
                                                                                            // 1. Actualizar react-hook-form
                                                                                            field.onChange(precioUnitarioNum); // O field.onChange(e) si prefieres el evento

                                                                                            // 2. Calcular y actualizar el estado del precio por presentación
                                                                                            const unidades = selectedProducto?.unidadesPresentacion;
                                                                                            if (unidades && unidades > 0) {
                                                                                                const precioPresentacionCalculado = precioUnitarioNum * unidades;
                                                                                                setPreciosPorPresentacion(prev => {
                                                                                                    const updated = Array.isArray(prev) ? [...prev] : { ...prev };
                                                                                                    // Guardar con 2 decimales
                                                                                                    updated[index] = parseFloat(precioPresentacionCalculado.toFixed(2));
                                                                                                    return updated;
                                                                                                });
                                                                                            } else {
                                                                                                // Si no hay unidades válidas, limpiar el precio por presentación
                                                                                                setPreciosPorPresentacion(prev => {
                                                                                                    const updated = Array.isArray(prev) ? [...prev] : { ...prev };
                                                                                                    delete updated[index]; // O poner 0 o ''
                                                                                                    return updated;
                                                                                                });
                                                                                            }
                                                                                        }}
                                                                                        className="h-11 text-sm rounded-xl border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary text-right" // Añadido text-right
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    Actual: {selectedProducto?.precioCompra} Bs
                                                                                </p>
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    {/* Precio de Venta */}
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`detalles.${index}.precioVenta`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="w-full md:w-40">
                                                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                                                    Precio Venta (Ud) *
                                                                                </FormLabel>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        step="0.01"
                                                                                        placeholder="0.00"
                                                                                        {...field}
                                                                                        className="h-11 text-sm rounded-xl border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    Actual: {selectedProducto?.precioVenta} Bs
                                                                                </p>
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    {/* Indicador de Margen */}
                                                                    {detalle.precioCompra > 0 && detalle.precioVenta > 0 && (
                                                                        <div className="w-full md:w-32 flex flex-col gap-1">
                                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                                Margen
                                                                            </FormLabel>
                                                                            <div className={`h-11 flex items-center justify-center rounded-xl border px-3 ${detalle.precioVenta > detalle.precioCompra
                                                                                ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                                                                                : detalle.precioVenta === detalle.precioCompra
                                                                                    ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700'
                                                                                    : 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                                                                                }`}>
                                                                                <span className={`text-sm font-semibold ${detalle.precioVenta > detalle.precioCompra
                                                                                    ? 'text-green-700 dark:text-green-400'
                                                                                    : detalle.precioVenta === detalle.precioCompra
                                                                                        ? 'text-yellow-700 dark:text-yellow-400'
                                                                                        : 'text-red-700 dark:text-red-400'
                                                                                    }`}>
                                                                                    {((detalle.precioVenta - detalle.precioCompra) / detalle.precioCompra * 100).toFixed(1)}%
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 mt-2">
                                                                                Actual: {
                                                                                    (() => {
                                                                                        // Obtener precios (convierte a número, 0 si no es válido)
                                                                                        const precioVenta = Number(selectedProducto?.precioVenta) || 0;
                                                                                        const precioCompra = Number(selectedProducto?.precioCompra) || 0;
                                                                                        let margen = 0; // Valor por defecto

                                                                                        // Calcular margen SOLO si precioCompra es positivo (evita división por cero)
                                                                                        if (precioCompra > 0) {
                                                                                            margen = ((precioVenta - precioCompra) / precioCompra) * 100;
                                                                                        }

                                                                                        // Verificar si el resultado NO es un número finito (NaN, Infinity, -Infinity)
                                                                                        if (!isFinite(margen)) {
                                                                                            margen = 0; // Poner 0 si no es finito
                                                                                        }

                                                                                        // Formatear y devolver
                                                                                        return margen.toFixed(1) + '%';
                                                                                    })()
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>



                                                            {/* Lotes - múltiples por detalle */}
                                                            <div className="mt-6 w-full space-y-4">
                                                                <FormLabel className="text-sm font-semibold flex items-center gap-2 mb-2 text-gray-800">
                                                                    <Calendar className="h-4 w-4 text-primary" />
                                                                    Lotes *
                                                                </FormLabel>

                                                                {form.watch(`detalles.${index}.lotesProductos`)?.map((loteItem, loteIndex) => {
                                                                    const currentProductoId = form.watch(`detalles.${index}.productoId`);
                                                                    const selectedLote = lotesPorDetalle[index]?.find(
                                                                        (l) => l.id === Number(loteItem.loteProductoId)
                                                                    );
                                                                    const isLoadingLotes = loadingLotes[currentProductoId];

                                                                    return (
                                                                        <div
                                                                            key={loteIndex}
                                                                            className="flex flex-col md:flex-row md:items-end gap-3 p-4 border border-gray-200 bg-muted/30 rounded-2xl shadow-sm transition-all hover:shadow-md"
                                                                        >
                                                                            {/* Selector de Lote */}
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`detalles.${index}.lotesProductos.${loteIndex}.loteProductoId`}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="flex-1 w-full">
                                                                                        <FormLabel className="text-sm font-medium text-gray-700">Lote</FormLabel>
                                                                                        <Popover
                                                                                            open={openLoteIndex === `${index}-${loteIndex}`}
                                                                                            onOpenChange={(open) =>
                                                                                                setOpenLoteIndex(open ? `${index}-${loteIndex}` : null)
                                                                                            }
                                                                                        >
                                                                                            <PopoverTrigger asChild>
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    role="combobox"
                                                                                                    disabled={!currentProductoId || isLoadingLotes}
                                                                                                    className={cn(
                                                                                                        "w-full justify-between h-11 text-left text-sm border-gray-300 bg-white hover:bg-gray-50 transition rounded-xl",
                                                                                                        !selectedLote && "text-muted-foreground"
                                                                                                    )}
                                                                                                >
                                                                                                    {isLoadingLotes ? (
                                                                                                        <div className="flex items-center gap-2 text-gray-500">
                                                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                                                            <span>Cargando lotes...</span>
                                                                                                        </div>
                                                                                                    ) : selectedLote ? (
                                                                                                        <div className="flex flex-col text-left">
                                                                                                            <span className="text-sm font-medium text-gray-800">
                                                                                                                {selectedLote.lote}
                                                                                                            </span>
                                                                                                            <span className="text-xs text-gray-500">
                                                                                                                Vence:{" "}
                                                                                                                {new Date(selectedLote.fechaVencimiento).toLocaleDateString()}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    ) : !currentProductoId ? (
                                                                                                        "Selecciona un producto primero"
                                                                                                    ) : (
                                                                                                        "Selecciona un lote"
                                                                                                    )}
                                                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                                                                                                </Button>
                                                                                            </PopoverTrigger>

                                                                                            <PopoverContent className="w-full p-0 rounded-xl shadow-lg border border-gray-200">
                                                                                                <Command>
                                                                                                    <CommandInput placeholder="Buscar lote..." />
                                                                                                    <CommandEmpty className="p-2 text-center text-gray-500">
                                                                                                        {lotesPorDetalle[index]?.length === 0
                                                                                                            ? "No hay lotes disponibles"
                                                                                                            : "No se encontró lote"}
                                                                                                    </CommandEmpty>
                                                                                                    <CommandGroup>
                                                                                                        {lotesPorDetalle[index]?.map((lote) => (
                                                                                                            <CommandItem
                                                                                                                key={lote.id}
                                                                                                                value={lote.lote}
                                                                                                                onSelect={() => {
                                                                                                                    form.setValue(
                                                                                                                        `detalles.${index}.lotesProductos.${loteIndex}.loteProductoId`,
                                                                                                                        lote.id
                                                                                                                    );
                                                                                                                    setOpenLoteIndex(null);
                                                                                                                }}
                                                                                                                className="flex justify-between items-center py-2 px-3 hover:bg-primary/10 rounded-lg"
                                                                                                            >
                                                                                                                <div className="flex flex-col text-left">
                                                                                                                    <span className="text-sm font-medium text-gray-800">
                                                                                                                        {lote.lote}
                                                                                                                    </span>
                                                                                                                    <span className="text-xs text-gray-500">
                                                                                                                        Vence:{" "}
                                                                                                                        {new Date(lote.fechaVencimiento).toLocaleDateString()}
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                                {Number(field.value) === lote.id && (
                                                                                                                    <Check className="ml-2 h-4 w-4 text-primary" />
                                                                                                                )}
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

                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`detalles.${index}.lotesProductos.${loteIndex}.cantidad`}
                                                                                render={({ field }) => {


                                                                                    const total = Number(field.value) || 0;
                                                                                    let presentaciones = 0;
                                                                                    let sueltas = 0;

                                                                                    // Calcular cuántas presentaciones y sueltas son
                                                                                    if (unidadesPorPresentacion > 1) {
                                                                                        presentaciones = Math.floor(total / unidadesPorPresentacion);
                                                                                        sueltas = total % unidadesPorPresentacion;
                                                                                    } else {
                                                                                        sueltas = total; // Si no hay presentación, todo es "unidades"
                                                                                    }

                                                                                    // Handler cuando cambia el input de "Presentaciones"
                                                                                    const handlePresentacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                        const nuevasPresentaciones = Number(e.target.value) || 0;
                                                                                        // Calculamos el nuevo total y actualizamos el form state
                                                                                        const newTotal = (nuevasPresentaciones * unidadesPorPresentacion) + sueltas;
                                                                                        field.onChange(newTotal); // Esto actualiza react-hook-form
                                                                                    };

                                                                                    // Handler cuando cambia el input de "Unidades Sueltas"
                                                                                    const handleSueltasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                        const nuevasSueltas = Number(e.target.value) || 0;
                                                                                        // Calculamos el nuevo total y actualizamos el form state
                                                                                        const newTotal = (presentaciones * unidadesPorPresentacion) + nuevasSueltas;
                                                                                        field.onChange(newTotal); // Esto actualiza react-hook-form
                                                                                    };

                                                                                    return (
                                                                                        <>
                                                                                            {/* Input para Presentaciones */}
                                                                                            <FormItem className="w-full md:w-36">
                                                                                                <FormLabel className="text-sm font-medium text-gray-700">{nombrePresentacion}{unidadesPorPresentacion > 1 ? ` (${unidadesPorPresentacion})` : ''}</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input
                                                                                                        type="number"
                                                                                                        min={0}
                                                                                                        value={presentaciones}
                                                                                                        onChange={handlePresentacionChange}
                                                                                                        className="h-11 text-sm rounded-xl border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                                                                                                        // Deshabilitamos si el producto no tiene unidades de presentación (o es 1)
                                                                                                        disabled={unidadesPorPresentacion <= 1}
                                                                                                    />
                                                                                                </FormControl>
                                                                                                {/* El FormMessage se moverá al siguiente campo */}
                                                                                            </FormItem>

                                                                                            {/* Input para Unidades Sueltas */}
                                                                                            <FormItem className="w-full md:w-36">
                                                                                                <FormLabel className="text-sm font-medium text-gray-700">{nombreUnidadBase}s</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input
                                                                                                        type="number"
                                                                                                        min={0}
                                                                                                        value={sueltas}
                                                                                                        onChange={handleSueltasChange}
                                                                                                        className="h-11 text-sm rounded-xl border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                                                                                                    />
                                                                                                </FormControl>
                                                                                                {/* El mensaje de error (ej. "cantidad > 0") aparecerá aquí */}
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        </>
                                                                                    );
                                                                                }}
                                                                            />

                                                                            {/* Botón eliminar */}
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="self-end md:self-center rounded-xl text-red-600 hover:text-red-600"
                                                                                onClick={() => {
                                                                                    const nuevosLotes = [...(form.getValues(`detalles.${index}.lotesProductos`) ?? [])];
                                                                                    nuevosLotes.splice(loteIndex, 1);
                                                                                    form.setValue(`detalles.${index}.lotesProductos`, nuevosLotes);
                                                                                }}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    );
                                                                })}

                                                                <div className="flex flex-wrap gap-3 mt-4">
                                                                    {/* Botón agregar lote directamente */}
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const lotesActuales = form.getValues(`detalles.${index}.lotesProductos`) || [];
                                                                            form.setValue(`detalles.${index}.lotesProductos`, [
                                                                                ...lotesActuales,
                                                                                { loteProductoId: 0, cantidad: 0 },
                                                                            ]);
                                                                        }}
                                                                        disabled={!form.watch(`detalles.${index}.productoId`)}
                                                                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium shadow-sm bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                                    >
                                                                        <PlusCircle className="h-4 w-4" />
                                                                        Agregar lote
                                                                    </Button>

                                                                    {/* Botón abrir modal para registrar nuevo lote */}
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => handleOpenModalRegistrarLote(currentProductoId, index)}
                                                                        disabled={!currentProductoId}
                                                                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium shadow-sm bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                                            append({ productoId: "", precioCompra: 0, lotesProductos: [], precioVenta: 0 })
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