import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useModificarOrdenCompra, useQuery } from "@/hooks";
import { CompraRequest, DetalleCompraRequest } from "@/models/compra";
import { obtenerListaLaboratoriosDisponibles, obtenerListaProductos, obtenerLotesByProductoId } from "@/services";
import { obtenerCompraById } from "@/services/compraService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { LoteProductoSimple } from "@/models";
import { Plus, Trash2, Package, ShoppingCart, Calendar, ShoppingBagIcon, Check, ChevronsUpDown, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { useComprasContext } from "@/context/compraContext";
import { ModalRegistrarLoteProducto } from "@/pages/LotesProductos/components/ModalRegistarLoteProducto";
import { useLoteProductosContext } from "@/context/loteProductoLote";
import { cn } from "@/lib/utils";

interface ModalModificarOrdenCompraProps {
    compraId: number;
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
                    cantidad: z.coerce.number().gt(0, { message: "" }), // Sigue siendo el total
                })
            ).min(1, { message: "Debe agregar al menos un lote" }),
        })
            .refine(
                (data) => data.precioVenta > data.precioCompra,
                {
                    message: "",
                    path: ["precioVenta"],
                }
            )
    ),
});

type FormData = z.infer<typeof schema>;

export function ModalModificarOrdenCompra({ compraId, open, onClose }: ModalModificarOrdenCompraProps) {
    const { fetch: fetchProductos, data: dataProductos } = useQuery(obtenerListaProductos);
    const { mutate: modificarOrdenCompra } = useModificarOrdenCompra();
    const { fetch: fetchCompra } = useQuery(obtenerCompraById);
    const { compraAction, setCompraAction } = useComprasContext();
    const { loteProductoAction } = useLoteProductosContext();
    const [openModalRegistrarLote, setOpenModalRegistrarLote] = useState(false);
    const [currentProductoIdForLote, setCurrentProductoIdForLote] = useState<string>("");
    const [, setCurrentIndexForLote] = useState<number>(-1);
    const [openProductoIndex, setOpenProductoIndex] = useState<number | null>(null);
    const [openLoteIndex, setOpenLoteIndex] = useState<string | null>(null);
    const [loadingLotes, setLoadingLotes] = useState<Record<string, boolean>>({});
    const { fetch: fetchLaboratorios, data: dataLaboratorios } = useQuery(obtenerListaLaboratoriosDisponibles);
    const [popoverOpenLaboratorio, setPopoverOpenLaboratorio] = useState(false);

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

    const [lotesPorDetalle, setLotesPorDetalle] = useState<Record<number, LoteProductoSimple[]>>({});
    const [isLoadingData, setIsLoadingData] = useState(true);
    const lastIndexRef = useRef<number | null>(null);
    const lastProductoIdRef = useRef<string | null>(null);
    const lastLaboratorioIdRef = useRef<number | null>(null);

    // Watch del laboratorio
    const laboratorioIdWatch = useWatch({
        control: form.control,
        name: "laboratorioId",
    });

    const watchedDetalles = useWatch({
        control: form.control,
        name: "detalles",
    });

    // Función para refrescar lotes de un producto
    const refreshLotesForProducto = async (productoId: string) => {
        if (!productoId) return;

        try {
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: true
            }));

            lastProductoIdRef.current = productoId;
            // Necesitamos esperar a que fetchLotesProducto termine y actualice dataLoteProducto
            const nuevosLotes = await obtenerLotesByProductoId(productoId); // Llamada directa al servicio
            const lotesArray: LoteProductoSimple[] = Array.isArray(nuevosLotes)
                ? nuevosLotes.filter((lote): lote is LoteProductoSimple => lote != null)
                : nuevosLotes ? [nuevosLotes] : [];

            // Actualizar el estado local para todos los detalles con este productoId
            const detallesActuales = form.getValues("detalles");
            const nuevosLotesPorDetalle = { ...lotesPorDetalle };
            detallesActuales.forEach((detalle, index) => {
                if (detalle.productoId === productoId) {
                    nuevosLotesPorDetalle[index] = lotesArray;
                }
            });
            setLotesPorDetalle(nuevosLotesPorDetalle);


        } catch (error) {
            console.error("Error refrescando lotes:", error);
            const detallesActuales = form.getValues("detalles");
            const nuevosLotesPorDetalle = { ...lotesPorDetalle };

            detallesActuales.forEach((detalle, index) => {
                if (detalle.productoId === productoId) {
                    nuevosLotesPorDetalle[index] = [];
                }
            });
            setLotesPorDetalle(nuevosLotesPorDetalle);

        } finally {
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: false
            }));
        }
    };


    // Función para manejar cambio de producto y cargar lotes
    const onChangeProducto = async (productoId: string, index: number) => {
        form.setValue(`detalles.${index}.productoId`, productoId);
        form.setValue(`detalles.${index}.lotesProductos`, []); // Limpiar lotes al cambiar producto

        lastIndexRef.current = index;
        lastProductoIdRef.current = productoId;

        try {
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: true
            }));

            // Llamamos directamente al servicio para obtener los lotes
            const nuevosLotes = await obtenerLotesByProductoId(productoId);
            const lotesArray: LoteProductoSimple[] = Array.isArray(nuevosLotes)
                ? nuevosLotes.filter((lote): lote is LoteProductoSimple => lote != null)
                : nuevosLotes ? [nuevosLotes] : [];

            // Actualizamos el estado local para este índice
            setLotesPorDetalle(prev => ({
                ...prev,
                [index]: lotesArray,
            }));

        } catch (error) {
            console.error("Error cambiando producto y cargando lotes:", error);
            setLotesPorDetalle((prev) => ({
                ...prev,
                [index]: [],
            }));

        } finally {
            setLoadingLotes(prev => ({
                ...prev,
                [productoId]: false
            }));
        }
    };


    // // Efecto: actualizar lotes cuando llegan datos (Ya no es necesario con el cambio en onChangeProducto/refreshLotes)
    // useEffect(() => {
    //     if (dataLoteProducto && lastProductoIdRef.current) {
    //         const lotesArray: LoteProductoSimple[] = Array.isArray(dataLoteProducto)
    //             ? dataLoteProducto.filter((lote): lote is LoteProductoSimple => lote != null)
    //             : dataLoteProducto ? [dataLoteProducto] : [];

    //         // Actualizar todos los detalles que tengan el mismo productoId
    //         const detallesActuales = form.getValues("detalles");
    //         const nuevosLotesPorDetalle = { ...lotesPorDetalle };

    //         detallesActuales.forEach((detalle, index) => {
    //             if (detalle.productoId === lastProductoIdRef.current) {
    //                 nuevosLotesPorDetalle[index] = lotesArray;
    //             }
    //         });
    //         setLotesPorDetalle(nuevosLotesPorDetalle);

    //         setLoadingLotes(prev => ({
    //             ...prev,
    //             [lastProductoIdRef.current!]: false
    //         }));
    //     }
    // }, [dataLoteProducto]);


    // Efecto: refrescar lotes cuando se registra un nuevo lote
    useEffect(() => {
        if (loteProductoAction && currentProductoIdForLote) {
            refreshLotesForProducto(currentProductoIdForLote);
        }
    }, [loteProductoAction]);

    // Efecto: cargar datos iniciales (laboratorios y compra)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true); // Indicar que estamos cargando
            try {
                // Primero cargamos laboratorios y la compra específica
                const [_, compraData] = await Promise.all([
                    fetchLaboratorios(),
                    fetchCompra(compraId)
                ]);

                if (compraData) {
                    const laboratorioId = compraData.laboratorio?.id || 0;

                    // Si hay laboratorio, cargamos los productos asociados AHORA
                    if (laboratorioId) {
                        await fetchProductos(`laboratorioId=${laboratorioId}`);
                    }

                    // Agrupar detalles por producto
                    const detallesPorProducto = new Map<string, {
                        productoId: string;
                        precioCompra: number;
                        precioVenta: number;
                        lotesProductos: Array<{ loteProductoId: number; cantidad: number }>;
                    }>();

                    compraData.detalles?.forEach(detalle => {
                        const productoId = detalle.loteProducto.producto.id;
                        if (!detallesPorProducto.has(productoId)) {
                            detallesPorProducto.set(productoId, {
                                productoId,
                                precioCompra: detalle.precioCompra,
                                precioVenta: detalle.precioVenta,
                                lotesProductos: []
                            });
                        }
                        detallesPorProducto.get(productoId)!.lotesProductos.push({
                            loteProductoId: detalle.loteProducto.id,
                            cantidad: detalle.cantidad
                        });
                    });
                    const detallesMapeados = Array.from(detallesPorProducto.values());

                    const formData = {
                        comentario: compraData.comentario || "",
                        laboratorioId: laboratorioId,
                        detalles: detallesMapeados,
                    };

                    // Resetear formulario con los datos
                    form.reset(formData);
                    lastLaboratorioIdRef.current = laboratorioId; // Guardar el ID inicial


                    // Cargar lotes iniciales para cada producto en los detalles
                    const lotesInicialesPromises = detallesMapeados.map(async (detalle, index) => {
                        try {
                            const lotes = await obtenerLotesByProductoId(detalle.productoId);
                            const lotesArray: LoteProductoSimple[] = Array.isArray(lotes)
                                ? lotes.filter((lote): lote is LoteProductoSimple => lote != null)
                                : lotes ? [lotes] : [];
                            return { index, lotes: lotesArray };
                        } catch (error) {
                            console.error(`Error cargando lotes iniciales para producto ${detalle.productoId}:`, error);
                            return { index, lotes: [] };
                        }
                    });

                    const resultadosLotes = await Promise.all(lotesInicialesPromises);
                    const nuevosLotesPorDetalle: Record<number, LoteProductoSimple[]> = {};
                    resultadosLotes.forEach(resultado => {
                        nuevosLotesPorDetalle[resultado.index] = resultado.lotes;
                    });
                    setLotesPorDetalle(nuevosLotesPorDetalle);
                }

            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
                toast.error("Error al cargar los datos de la compra.");
            } finally {
                setIsLoadingData(false); // Indicar que la carga ha terminado
            }
        };

        if (open && compraId) { // Solo cargar si el modal está abierto y hay un ID
            fetchData();
        } else if (!open) {
            // Resetear todo si el modal se cierra
            form.reset({ laboratorioId: 0, comentario: "", detalles: [] });
            setLotesPorDetalle({});
            setIsLoadingData(true);
            lastLaboratorioIdRef.current = null;
        }

    }, [compraId, open]); // Dependencias clave: compraId y open


    // Efecto: cargar productos cuando cambia el laboratorio (después de la carga inicial)
    useEffect(() => {
        // No ejecutar si aún estamos cargando datos o si el laboratorio no ha cambiado realmente
        if (isLoadingData || !laboratorioIdWatch || laboratorioIdWatch === lastLaboratorioIdRef.current) {
            return;
        }

        // Si el laboratorio es diferente al inicial, SÍ limpiamos detalles
        if (lastLaboratorioIdRef.current !== null && laboratorioIdWatch !== lastLaboratorioIdRef.current) {
            form.setValue("detalles", []);
            setLotesPorDetalle({});
        }

        const cargarProductos = async () => {
            try {
                await fetchProductos(`laboratorioId=${laboratorioIdWatch}`);
                lastLaboratorioIdRef.current = laboratorioIdWatch; // Actualizar la referencia DESPUÉS de cargar
            } catch (error) {
                console.error("Error cargando productos por cambio de laboratorio:", error);
                toast.error("Error al cargar productos para el laboratorio seleccionado.");
            }
        };

        cargarProductos();

    }, [laboratorioIdWatch, isLoadingData]); // Depende del watch y del estado de carga


    const onSubmit = async (data: FormData) => {
        const detallesCompra: DetalleCompraRequest[] = data.detalles.flatMap((detalle) =>
            detalle.lotesProductos.map((lote) => ({
                cantidad: lote.cantidad,
                precioCompra: detalle.precioCompra,
                precioVenta: detalle.precioVenta,
                loteProductoId: lote.loteProductoId,
            }))
        );

        const request: CompraRequest = {
            laboratorioId: data.laboratorioId,
            comentario: data.comentario,
            detalles: detallesCompra,
        };

        try {
            const response = await modificarOrdenCompra(compraId, request); // Ajustado para el hook
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Orden de compra modificada"
                    message={response?.message || "Orden modificada exitosamente"}
                    date={dateFormat(Date.now())}
                />
            ));
            setCompraAction(!compraAction);
            form.reset();
            if (onClose) onClose();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al modificar orden de compra"
                    message={err?.response?.data?.message || err?.message || "Error en el servidor"}
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

    // Calcular total de la orden en tiempo real
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

    const [preciosPorPresentacion, setPreciosPorPresentacion] = useState<Record<number, number>>({});

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
                            <DialogTitle className="text-xl font-semibold">Modificar Orden de Compra #{compraId}</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Modifica los detalles de la orden de compra existente.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Cargando datos de la orden...</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Por favor, espera un momento.</p>
                    </div>
                ) : (
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
                                                                                // Solo si el laboratorio es diferente
                                                                                if (form.getValues("laboratorioId") !== lab.id) {
                                                                                    form.setValue("laboratorioId", lab.id);
                                                                                    // No limpiamos detalles aquí, se maneja en el useEffect de laboratorioIdWatch
                                                                                }
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
                                                // Cálculo del subtotal basado en los lotes y el precio de compra del detalle
                                                const subtotal = detalle.lotesProductos.reduce((sum, lote) => {
                                                    const cantidad = Number(lote.cantidad) || 0;
                                                    const precio = Number(detalle.precioCompra) || 0;
                                                    return sum + (cantidad * precio);
                                                }, 0);
                                                const currentProductoId = detalle.productoId;

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
                                                                    const currentProductoIdLote = form.watch(`detalles.${index}.productoId`); // Asegurar que usamos el ID correcto
                                                                    const selectedLote = lotesPorDetalle[index]?.find(
                                                                        (l) => l.id === Number(loteItem.loteProductoId)
                                                                    );
                                                                    const isLoadingLotes = loadingLotes[currentProductoIdLote]; // Usar el ID correcto

                                                                    return (
                                                                        <div
                                                                            key={`${item.id}-lote-${loteIndex}`} // Key más robusta
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
                                                                                                    disabled={!currentProductoIdLote || isLoadingLotes} // Usar el ID correcto
                                                                                                    className={cn(
                                                                                                        "w-full justify-between h-11 text-left text-sm border-gray-300 bg-white hover:bg-gray-50 transition rounded-xl",
                                                                                                        !selectedLote && "text-muted-foreground"
                                                                                                    )}
                                                                                                >
                                                                                                    {isLoadingLotes ? (
                                                                                                        <div className="flex items-center gap-2 text-gray-500">
                                                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                                                            <span>Cargando...</span> {/* Más corto */}
                                                                                                        </div>
                                                                                                    ) : selectedLote ? (
                                                                                                        <div className="flex flex-col text-left">
                                                                                                            <span className="text-sm font-medium text-gray-800">
                                                                                                                {selectedLote.lote}
                                                                                                            </span>
                                                                                                            <span className="text-xs text-gray-500">
                                                                                                                Vence:{" "}
                                                                                                                {selectedLote.fechaVencimiento ? new Date(selectedLote.fechaVencimiento).toLocaleDateString() : 'N/A'}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    ) : !currentProductoIdLote ? (
                                                                                                        "Selecciona producto" // Más corto
                                                                                                    ) : (lotesPorDetalle[index]?.length === 0 && !isLoadingLotes) ? (
                                                                                                        "No hay lotes" // Indicar si no hay lotes
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
                                                                                                        {(lotesPorDetalle[index]?.length === 0 && !isLoadingLotes)
                                                                                                            ? "No hay lotes disponibles para este producto"
                                                                                                            : isLoadingLotes ? "Cargando..." : "No se encontró lote"}
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
                                                                                                                        {lote.fechaVencimiento ? new Date(lote.fechaVencimiento).toLocaleDateString() : 'N/A'}
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

                                                                                    if (unidadesPorPresentacion > 1) {
                                                                                        presentaciones = Math.floor(total / unidadesPorPresentacion);
                                                                                        sueltas = total % unidadesPorPresentacion;
                                                                                    } else {
                                                                                        sueltas = total;
                                                                                    }

                                                                                    const handlePresentacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                        const nuevasPresentaciones = Number(e.target.value) || 0;
                                                                                        const currentSueltas = total % unidadesPorPresentacion; // Usar las sueltas actuales
                                                                                        const newTotal = (nuevasPresentaciones * unidadesPorPresentacion) + currentSueltas;
                                                                                        field.onChange(newTotal);
                                                                                    };

                                                                                    const handleSueltasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                        const nuevasSueltas = Number(e.target.value) || 0;
                                                                                        const currentPresentaciones = Math.floor(total / unidadesPorPresentacion); // Usar las presentaciones actuales
                                                                                        const newTotal = (currentPresentaciones * unidadesPorPresentacion) + nuevasSueltas;
                                                                                        field.onChange(newTotal);
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
                                                                                                        disabled={unidadesPorPresentacion <= 1}
                                                                                                    />
                                                                                                </FormControl>
                                                                                            </FormItem>

                                                                                            {/* Input para Unidades Sueltas */}
                                                                                            <FormItem className="w-full md:w-36">
                                                                                                <FormLabel className="text-sm font-medium text-gray-700">{nombreUnidadBase}s</FormLabel>
                                                                                                <FormControl>
                                                                                                    <Input
                                                                                                        type="number"
                                                                                                        min={0}
                                                                                                        // Permitir un máximo de unidadesPorPresentacion - 1 si hay presentación
                                                                                                        max={unidadesPorPresentacion > 1 ? unidadesPorPresentacion - 1 : undefined}
                                                                                                        value={sueltas}
                                                                                                        onChange={handleSueltasChange}
                                                                                                        className="h-11 text-sm rounded-xl border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                                                                                                    />
                                                                                                </FormControl>
                                                                                                <FormMessage />
                                                                                            </FormItem>
                                                                                        </>
                                                                                    );
                                                                                }}
                                                                            />

                                                                            {/* Botón eliminar lote */}
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="self-end md:self-center rounded-xl text-red-600 hover:text-red-600"
                                                                                onClick={() => {
                                                                                    // Remover el lote específico del array
                                                                                    const currentLotes = form.getValues(`detalles.${index}.lotesProductos`) || [];
                                                                                    const newLotes = currentLotes.filter((_, idx) => idx !== loteIndex);
                                                                                    form.setValue(`detalles.${index}.lotesProductos`, newLotes);
                                                                                }}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    );
                                                                })}

                                                                <div className="flex flex-wrap gap-3 mt-4">
                                                                    {/* Botón agregar lote */}
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const lotesActuales = form.getValues(`detalles.${index}.lotesProductos`) || [];
                                                                            form.setValue(`detalles.${index}.lotesProductos`, [
                                                                                ...lotesActuales,
                                                                                { loteProductoId: 0, cantidad: 0 }, // Valores iniciales
                                                                            ]);
                                                                        }}
                                                                        disabled={!form.watch(`detalles.${index}.productoId`)}
                                                                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium shadow-sm bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                                    >
                                                                        <PlusCircle className="h-4 w-4" />
                                                                        Agregar otro Lote
                                                                    </Button>

                                                                    {/* Botón nuevo lote */}
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => handleOpenModalRegistrarLote(currentProductoId, index)} // Usar currentProductoId
                                                                        disabled={!currentProductoId} // Usar currentProductoId
                                                                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium shadow-sm bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                                    >
                                                                        <PlusCircle className="h-4 w-4" />
                                                                        Registrar Nuevo Lote
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Subtotal */}
                                                            {subtotal > 0 && (
                                                                <div className="mt-4 pt-3 border-t border-dashed">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-sm text-muted-foreground">Subtotal Producto:</span>
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
                                            append({ productoId: "", precioCompra: 0, lotesProductos: [{ loteProductoId: 0, cantidad: 0 }], precioVenta: 0 }) // Agregar con un lote inicial
                                        }
                                        disabled={!laboratorioIdWatch || isLoadingData} // Deshabilitar si no hay laboratorio o está cargando
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Producto
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Resumen Total */}
                            {fields.length > 0 && (
                                <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800 shadow-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total de la Orden</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {fields.length} producto{fields.length !== 1 ? 's' : ''} en total
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                Bs {calcularTotal().toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Separator />

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 px-8 rounded-lg border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-11 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
                                    disabled={fields.length === 0 || form.formState.isSubmitting || !form.formState.isValid || isLoadingData} // Añadir isValid y isLoadingData
                                >
                                    {form.formState.isSubmitting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                    )}
                                    Guardar Cambios
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