import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Checkbox, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useFieldArray, useForm } from "react-hook-form";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";
import { useModificarProducto } from "@/hooks/useProducto";
import { useEffect, useRef, useState } from "react";
import { useProductosContext } from "@/context/productoContext";
import { ProductoRequest } from "@/models/producto";
import { useQuery } from "@/hooks";
import { obtenerListaCategoriasDisponibles, obtenerListaLaboratoriosDisponibles, obtenerListaPrincipiosActivos } from "@/services";
import { ChevronsUpDown, Trash, Loader2, Check, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { obtenerListaFormasFarmaceuticas, obtenerListaUnidadesMedidas, obtenerProductoById } from "@/services/productoService";
import { ModalRegistrarPrincipioActivo } from "@/pages/PrincipiosActivos/components/ModalRegistrarPrincipioActivo";
import { obtenerListaPresentaciones } from "@/services/presentacionService";

const schema = z.object({
    nombreComercial: z.string().min(1, { message: "Campo obligatorio" }),
    stockMin: z.coerce.number().gt(0, { message: "Debe ser mayor a 0" }),
    categorias: z.array(z.number()).min(1, { message: "Selecciona al menos una categoría" }),
    laboratorioId: z.coerce.number().gt(0, { message: "Selecciona un laboratorio" }),
    formaFarmaceuticaId: z.coerce.number().gt(0, { message: "Selecciona una forma farmacéutica" }),
    principiosActivos: z.array(
        z.object({
            principioActivoId: z.number().min(1, ""),
            concentracion: z.coerce.number().min(1, ""),
            unidadMedidaId: z.number().min(1, ""),
        })
    ).min(1, { message: "Agrega al menos un principio activo" }),
    presentacionId: z.number().gt(0, { message: "Selecciona la presentación" }),
    unidadesPresentacion: z.coerce.number().gt(0, { message: "Debe ser mayor a 0" }),
    precioVenta: z.coerce.number().gt(0, { message: "Debe ser mayor a 0" }),
});

type FormData = z.infer<typeof schema>;

interface ModalModificarProductoProps {
    productoId: string;
    onClose?: () => void;
    open: boolean;
}

const urlToFile = async (url: string, filename: string): Promise<File> => {
    const res = await fetch(url);
    const blob = await res.blob();
    const ext = url.split(".").pop()?.split(/\#|\?/)[0] || "jpg";
    return new File([blob], `${filename}.${ext}`, { type: blob.type });
};

export function ModalModificarProducto({ productoId, open, onClose }: ModalModificarProductoProps) {
    const hasMounted = useRef(false)
    const { mutate: modificarProducto } = useModificarProducto();
    const { productoAction, setProductoAction } = useProductosContext();
    const [openModalRegistrarPrincipioActivo, setOpenModalRegistrarPrincipioActivo] = useState(false);
    const [imagenes, setImagenes] = useState<File[]>([]);
    const [categoriasPopoverOpen, setCategoriasPopoverOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Estados para drag and drop
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const { fetch: fetchLaboratorios, data: dataLaboratorios } = useQuery(obtenerListaLaboratoriosDisponibles);
    const { fetch: fetchCategorias, data: dataCategorias } = useQuery(obtenerListaCategoriasDisponibles);
    const { fetch: fetchFormasFarmaceuticas, data: dataFormasFarmaceuticas } = useQuery(obtenerListaFormasFarmaceuticas);
    const { fetch: fetchUnidadesMedidas, data: dataUnidadesMedidas } = useQuery(obtenerListaUnidadesMedidas);
    const { fetch: obtenerProducto, data: producto } = useQuery(obtenerProductoById);
    const { fetch: fetchPrincipiosActivos, data: dataPrincipiosActivos } = useQuery(obtenerListaPrincipiosActivos);
    const { fetch: fetchPresentaciones, data: dataPresentaciones } = useQuery(obtenerListaPresentaciones);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
        defaultValues: {
            nombreComercial: "",
            stockMin: 0,
            precioVenta: 0,
            categorias: [],
            formaFarmaceuticaId: 0,
            laboratorioId: 0,
            unidadesPresentacion: 0,
            presentacionId: 0
        },
    });

    // Función moveImage corregida
    const moveImage = (fromIndex: number, toIndex: number) => {
        // Validaciones de seguridad
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
            fromIndex >= imagenes.length || toIndex >= imagenes.length) {
            return;
        }

        // Crear nueva copia del array
        const newImagenes = [...imagenes];

        // Intercambiar elementos usando destructuring
        [newImagenes[fromIndex], newImagenes[toIndex]] = [newImagenes[toIndex], newImagenes[fromIndex]];

        setImagenes(newImagenes);
    };

    // Handlers para drag and drop corregidos
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        // Hacer el elemento arrastrado un poco transparente
        (e.target as HTMLElement).style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        // Restaurar opacidad
        (e.target as HTMLElement).style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Solo actualizar si es diferente al índice actual
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Solo limpiar si realmente salimos del elemento
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        const draggedIndexFromData = parseInt(e.dataTransfer.getData('text/plain'));

        if (draggedIndexFromData !== null && !isNaN(draggedIndexFromData) && draggedIndexFromData !== dropIndex) {
            // Crear nueva copia del array
            const newImagenes = [...imagenes];

            // Remover elemento de la posición original
            const [draggedItem] = newImagenes.splice(draggedIndexFromData, 1);

            // Insertar en la nueva posición
            newImagenes.splice(dropIndex, 0, draggedItem);

            setImagenes(newImagenes);
        }

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Cargar datos iniciales cuando se abre el modal
    useEffect(() => {
        if (open && !dataLoaded) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    await Promise.all([
                        fetchLaboratorios(),
                        fetchCategorias(),
                        fetchFormasFarmaceuticas(),
                        fetchUnidadesMedidas(),
                        fetchPrincipiosActivos(),
                        obtenerProducto(productoId),
                        fetchPresentaciones(),
                    ]);
                    setDataLoaded(true);
                } catch (err: any) {
                    toast.custom((t) => (
                        <CustomToast
                            t={t}
                            type="error"
                            title="Error al cargar datos"
                            message={err?.response?.message || err?.message || "Error del servidor"}
                            date={dateFormat(Date.now())}
                        />
                    ));
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [open, dataLoaded]);
    const actualizarPrincipiosActivos = useRef(false)

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
        fetchPrincipiosActivos()
    }, [actualizarPrincipiosActivos.current])
    // Poblar el formulario cuando el producto esté disponible
    useEffect(() => {

        if (producto && dataLoaded && !isLoading) {
            const listPA = producto.principiosActivos.map((v) => {
                return { principioActivoId: v.principioActivo.id, concentracion: v.concentracion, unidadMedidaId: v.unidadMedida.id }
            })

            const formData = {
                nombreComercial: producto.nombreComercial || "",
                precioVenta: producto.precioVenta || 0,
                stockMin: producto.stockMin || 0,
                categorias: producto.categorias?.map((v) => v.id) || [],
                laboratorioId: producto.laboratorio?.id || 0,
                formaFarmaceuticaId: producto.formaFarmaceutica?.id || 0,
                principiosActivos: listPA,
                presentacionId: producto.presentacion.id,
                unidadesPresentacion: producto.unidadesPresentacion
            };

            // Usar setTimeout para asegurar que el formulario se actualice correctamente
            setTimeout(() => {
                form.reset(formData);
                // Trigger validation para asegurar que los campos se marquen como válidos
                form.trigger();
            }, 100);

            // Convertir URLs a File[]
            const fetchImagesAsFiles = async () => {
                if (producto.urlFotos && producto.urlFotos.length > 0) {
                    try {
                        const filesFromUrls = await Promise.all(
                            producto.urlFotos.map((url, idx) =>
                                urlToFile(url + "?timestamp=" + Date.now(), `imagen-${idx}`)
                            )
                        );
                        setImagenes(filesFromUrls);
                    } catch (error) {
                        console.warn("Error cargando imágenes:", error);
                        setImagenes([]);
                    }
                } else {
                    setImagenes([]);
                }
            };

            fetchImagesAsFiles();
        }
    }, [producto, dataLoaded, isLoading, form]);
    const { fields, append, remove } = useFieldArray({
        name: "principiosActivos",
        control: form.control,
    });
    // Limpiar estado cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            form.reset();
            setImagenes([]);
            setIsLoading(true);
            setDataLoaded(false);
            setDraggedIndex(null);
            setDragOverIndex(null);
        }
    }, [open, form]);

    const onSubmit = async (data: FormData) => {

        try {
            // Asegurar que los valores sean números
            const processedData: ProductoRequest = {
                ...data,
                laboratorioId: Number(data.laboratorioId),
                formaFarmaceuticaId: Number(data.formaFarmaceuticaId),
                precioVenta: Number(data.precioVenta),
                presentacionId: data.presentacionId,
                unidadesPresentacion: data.unidadesPresentacion
            };

            const response = await modificarProducto(productoId, processedData, imagenes);
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="success"
                    title="Producto modificado"
                    message={response?.message || "Producto modificado correctamente"}
                    date={dateFormat(Date.now())}
                />
            ));
            setProductoAction(!productoAction);
            form.reset();
            setImagenes([]);
            onClose?.();
        } catch (err: any) {
            toast.custom((t) => (
                <CustomToast
                    t={t}
                    type="error"
                    title="Error al modificar producto"
                    message={err?.response?.message || err?.message || "Error del servidor"}
                    date={dateFormat(Date.now())}
                />
            ));
        }
    };

    const handleCategoriaToggle = (id: number, checked: boolean) => {
        const actuales = form.getValues("categorias");
        const nuevas = checked
            ? [...actuales, id]
            : actuales.filter((catId) => catId !== id);

        form.setValue("categorias", nuevas, { shouldValidate: true });
    };

    const handleRemoveImages = () => {
        setImagenes([]);
    };

    const getSelectedCategoriasText = () => {
        const selectedIds = form.watch("categorias");
        if (!selectedIds.length || !dataCategorias) return "Selecciona categorías";
        const selectedNames = dataCategorias
            .filter((cat) => selectedIds.includes(cat.id))
            .map((cat) => cat.nombre);
        return selectedNames.join(", ");
    };

    return (
        <>
            <Dialog modal
                defaultOpen={false}
                open={open}
                onOpenChange={onClose}>
                <DialogContent className="w-full max-h-screen overflow-auto sm:max-w-[750px]"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Modificar producto</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del producto en el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Cargando datos del producto...</span>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">

                                <FormField name="nombreComercial" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Nombre comercial</FormLabel>
                                        <FormControl><Input placeholder="Ej. Paracetamol Plus" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="space-y-2">
                                    <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Principios Activos</FormLabel>

                                    {fields.map((field, index) => {
                                        // IDs ya seleccionados en otros indices (excluyendo el actual)
                                        const selectedIds = fields
                                            .filter((_, i) => i !== index)
                                            .map((f) => f.principioActivoId);

                                        // Validar si el valor actual está repetido
                                        const isDuplicate = selectedIds.includes(field.principioActivoId);

                                        return (
                                            <div
                                                key={field.id}
                                                className="grid grid-cols-12 items-end gap-4 p-4 border rounded-md shadow-sm bg-white dark:bg-neutral-900"
                                            >
                                                {/* Principio activo (Select CMDK) */}
                                                <FormField
                                                    control={form.control}
                                                    name={`principiosActivos.${index}.principioActivoId`}
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-12 lg:col-span-4">
                                                            <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Principio activo</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className="w-full justify-between border-gray-300"
                                                                    >
                                                                        {field.value
                                                                            ? dataPrincipiosActivos?.find((pa) => pa.id === field.value)?.nombre
                                                                            : "Selecciona uno"}
                                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full p-0">
                                                                    <Command>
                                                                        <CommandInput placeholder="Buscar principio activo..." />
                                                                        <CommandEmpty>No se encontró.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {dataPrincipiosActivos?.map((pa) => {
                                                                                const disabled = selectedIds.includes(pa.id);
                                                                                return (
                                                                                    <CommandItem
                                                                                        key={pa.id}
                                                                                        onSelect={() => {
                                                                                            if (!disabled) {
                                                                                                field.onChange(pa.id);
                                                                                            }
                                                                                        }}
                                                                                        disabled={disabled}
                                                                                        className={disabled ? "opacity-50 cursor-not-allowed" : ""}
                                                                                    >
                                                                                        {pa.nombre}
                                                                                        {field.value === pa.id && (
                                                                                            <Check className="ml-auto h-4 w-4" />
                                                                                        )}
                                                                                    </CommandItem>
                                                                                );
                                                                            })}
                                                                        </CommandGroup>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>

                                                            {/* Mostrar error si hay duplicado */}
                                                            {isDuplicate && (
                                                                <p className="text-sm text-red-600 mt-1">Este principio activo ya está seleccionado.</p>
                                                            )}
                                                            <FormMessage className="text-sm text-red-600" />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Concentración */}
                                                <FormField
                                                    control={form.control}
                                                    name={`principiosActivos.${index}.concentracion`}
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-6 lg:col-span-3">
                                                            <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Concentración</FormLabel>
                                                            <Input
                                                                type="number"
                                                                value={field.value === 0 ? "" : field.value ?? ""}
                                                                onChange={(e) =>
                                                                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                                                                }
                                                                placeholder="Ej. 500"
                                                                className="border-gray-300 focus:ring-2 focus:ring-blue-400"
                                                                step="any"
                                                            />
                                                            <FormMessage className="text-sm text-red-600" />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Unidad de medida */}
                                                <FormField
                                                    control={form.control}
                                                    name={`principiosActivos.${index}.unidadMedidaId`}
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-6 lg:col-span-3">
                                                            <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Unidad</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className="w-full justify-between border-gray-300"
                                                                    >
                                                                        {field.value
                                                                            ? dataUnidadesMedidas?.find((um) => um.id === field.value)?.abreviatura
                                                                            : "Seleccione"}
                                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full p-0">
                                                                    <Command>
                                                                        <CommandInput placeholder="Buscar unidad..." />
                                                                        <CommandEmpty>No se encontró.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {dataUnidadesMedidas?.map((um) => (
                                                                                <CommandItem
                                                                                    key={um.id}
                                                                                    onSelect={() => field.onChange(um.id)}
                                                                                >
                                                                                    {um.abreviatura} ({um.nombre})
                                                                                    {field.value === um.id && (
                                                                                        <Check className="ml-auto h-4 w-4" />
                                                                                    )}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage className="text-sm text-red-600" />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Botón eliminar */}
                                                <div className="col-span-12 lg:col-span-2 flex justify-end">
                                                    {fields.length > 1 ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => remove(index)}
                                                            className="text-red-500 hover:bg-red-100"
                                                            aria-label={`Eliminar principio activo ${index + 1}`}
                                                        >
                                                            <Trash className="w-5 h-5" />
                                                        </Button>
                                                    ) : (
                                                        <div className="flex items-center justify-center text-gray-400 select-none">
                                                            <Trash className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                                        {/* Botón para registrar principios activos */}
                                        <Button type="button" className="w-full bg-emerald-500 dark:bg-emerald-800"
                                            onClick={() => { setOpenModalRegistrarPrincipioActivo(true) }
                                            }
                                        >
                                            Registrar principio activo
                                        </Button>
                                        {/* Botón para agregar más */}
                                        <Button type="button" className="w-full bg-blue-500 dark:bg-blue-800"
                                            onClick={() =>
                                                append({
                                                    principioActivoId: 0,
                                                    concentracion: 0,
                                                    unidadMedidaId: 0,
                                                })
                                            }
                                        >
                                            Agregar principio activo
                                        </Button>
                                    </div>
                                </div>
                                {/* Forma Farmaceutiva */}
                                <FormField
                                    control={form.control}
                                    name="formaFarmaceuticaId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Forma Farmacéutica</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value > 0 ? String(field.value) : ""}
                                                    onValueChange={(value) => {
                                                        const numericValue = Number(value);
                                                        field.onChange(numericValue);
                                                        form.trigger("formaFarmaceuticaId");
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona una forma" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Formas farmacéuticas</SelectLabel>
                                                            {dataFormasFarmaceuticas?.map((forma) => (
                                                                <SelectItem key={forma.id} value={String(forma.id)}>
                                                                    {forma.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="w-1/2 flex flex-col space-y-4">
                                    {/* Presentación */}
                                    <FormField
                                        control={form.control}
                                        name={`presentacionId`}
                                        render={({ field }) => (
                                            <FormItem className="col-span-3">
                                                <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Presentación</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className="w-full justify-between border-gray-300"
                                                        >
                                                            {field.value
                                                                ? dataPresentaciones?.find((um) => um.id === field.value)?.nombre
                                                                : "Selecciona una presentación"}
                                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Buscar presentación..." />
                                                            <CommandEmpty>No se encontró.</CommandEmpty>
                                                            <CommandGroup>
                                                                {dataPresentaciones?.map((um) => (
                                                                    <CommandItem
                                                                        key={um.id}
                                                                        onSelect={() => field.onChange(um.id)}
                                                                    >
                                                                        {um.nombre}
                                                                        {field.value === um.id && (
                                                                            <Check className="ml-auto h-4 w-4" />
                                                                        )}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage className="text-sm text-red-600" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField name="unidadesPresentacion" control={form.control} render={({ field }) => (
                                        <FormItem className="col-span-3">
                                            <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Unidades por presentación</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField name="stockMin" control={form.control} render={({ field }) => (
                                        <FormItem className="col-span-3">
                                            <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Stock mínimo (Alerta)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField name="precioVenta" control={form.control} render={({ field }) => (
                                        <FormItem className="col-span-3">
                                            <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Precio (Ud)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                {/* Laboratorio */}
                                <FormField
                                    name="laboratorioId"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Laboratorio</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value > 0 ? String(field.value) : ""}
                                                    onValueChange={(value) => {
                                                        const numericValue = Number(value);
                                                        field.onChange(numericValue);
                                                        form.trigger("laboratorioId");
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un laboratorio" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {dataLaboratorios?.map((lab) => (
                                                            <SelectItem key={lab.id} value={String(lab.id)}>
                                                                {lab.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Campo de categorías */}
                                <FormField name="categorias" control={form.control} render={() => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Categorías</FormLabel>
                                        <Popover open={categoriasPopoverOpen} onOpenChange={setCategoriasPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={categoriasPopoverOpen}
                                                    className="w-full justify-between h-auto items-start"
                                                >
                                                    <span className="whitespace-normal text-left pr-2">
                                                        {getSelectedCategoriasText()}
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar categoría..." />
                                                    <CommandList className="max-h-[300px] overflow-y-auto">
                                                        <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                                                        <CommandGroup className="max-h-[300px] overflow-y-auto touch-action-pan-y">
                                                            {dataCategorias?.map((categoria) => (
                                                                <CommandItem
                                                                    key={categoria.id}
                                                                    onSelect={() => {
                                                                        const currentValues = form.getValues("categorias");
                                                                        const isSelected = currentValues.includes(categoria.id);
                                                                        handleCategoriaToggle(categoria.id, !isSelected);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center space-x-2 w-full">
                                                                        <Checkbox
                                                                            checked={form.watch("categorias").includes(categoria.id)}
                                                                            onChange={() => { }} // Manejado por onSelect del CommandItem
                                                                        />
                                                                        <span className="flex-1">{categoria.nombre}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {/* <formMessage /> */}
                                    </FormItem>
                                )} />

                                {/* Sección de imágenes mejorada */}
                                <FormItem>
                                    {imagenes.length > 0 && (
                                        <ScrollArea className="w-full rounded-md border whitespace-nowrap p-2">
                                            <div className="flex gap-3">
                                                {imagenes.map((file, index) => (
                                                    <div
                                                        key={`${file.name}-${index}`}
                                                        className={`relative w-24 h-24 rounded overflow-hidden border flex flex-col group transition-all duration-200 ${dragOverIndex === index ? 'border-blue-500 bg-blue-50' : ''
                                                            } ${draggedIndex === index ? 'scale-95' : ''}`}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, index)}
                                                        onDragEnd={handleDragEnd}
                                                        onDragOver={(e) => handleDragOver(e, index)}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={(e) => handleDrop(e, index)}
                                                    >
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`preview-${index}`}
                                                            className="object-cover w-full h-full cursor-move pointer-events-none"
                                                        />

                                                        {/* Botones de reordenamiento mejorados */}
                                                        <div className="absolute top-1 left-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {index > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveImage(index, index - 1)}
                                                                    className="bg-blue-600 text-white rounded p-1 hover:bg-blue-700 transition text-xs"
                                                                    title="Mover hacia la izquierda"
                                                                    style={{ width: 20, height: 20 }}
                                                                >
                                                                    ←
                                                                </button>
                                                            )}
                                                            {index < imagenes.length - 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveImage(index, index + 1)}
                                                                    className="bg-blue-600 text-white rounded p-1 hover:bg-blue-700 transition text-xs"
                                                                    title="Mover hacia la derecha"
                                                                    style={{ width: 20, height: 20 }}
                                                                >
                                                                    →
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Botón eliminar */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setImagenes(imagenes.filter((_, i) => i !== index))}
                                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
                                                            aria-label="Eliminar imagen"
                                                            title="Eliminar imagen"
                                                            style={{ width: 24, height: 24 }}
                                                        >
                                                            <Trash size={16} />
                                                        </button>

                                                        {/* Indicador de orden */}
                                                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                                                            {index + 1}
                                                        </div>

                                                        {/* Indicador visual de drag over */}
                                                        {dragOverIndex === index && draggedIndex !== index && (
                                                            <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-100/20 rounded" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}

                                    <FormLabel className="font-semibold text-neutral-900 dark:text-neutral-100">Imágenes</FormLabel>
                                    <div className="flex flex-row gap-2.5">
                                        <FormControl>
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    setImagenes(files);
                                                }}
                                            />
                                        </FormControl>
                                        <Button type="button" onClick={handleRemoveImages}>
                                            <Trash />
                                        </Button>
                                    </div>
                                </FormItem>

                                <Button type="submit" className="mt-4" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Cargando...
                                        </>
                                    ) : (
                                        'Guardar'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
            {openModalRegistrarPrincipioActivo &&
                <ModalRegistrarPrincipioActivo open={openModalRegistrarPrincipioActivo} onClose={() => setOpenModalRegistrarPrincipioActivo(false)} onEnviarDato={(_) => { actualizarPrincipiosActivos.current = !actualizarPrincipiosActivos.current }} />
            }
        </>
    );
}