import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Button,
  Checkbox,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useFieldArray, useForm } from "react-hook-form";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";
import { useRegistrarProducto } from "@/hooks/useProducto";
import { useEffect, useRef, useState } from "react";
import { useProductosContext } from "@/context/productoContext";
import { ProductoRequest } from "@/models/producto";
import { useQuery } from "@/hooks";
import { obtenerListaCategoriasDisponibles, obtenerListaLaboratoriosDisponibles, obtenerListaPrincipiosActivos } from "@/services";
import { Check, ChevronDown, ChevronsUpDown, Trash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { obtenerListaFormasFarmaceuticas, obtenerListaUnidadesMedidas } from "@/services/productoService";
import { ModalRegistrarPrincipioActivo } from "@/pages/PrincipiosActivos/components/ModalRegistrarPrincipioActivo";

const schema = z.object({
  nombreComercial: z.string().min(1, { message: "Campo obligatorio" }),
  formaFarmaceuticaId: z.coerce.number().gt(0, { message: "Campo obligatorio" }),
  precioVenta: z.coerce.number().gt(0, { message: "Debe ser mayor que 0" }),
  stockMin: z.coerce.number().gt(0, { message: "Debe ser mayor a 0" }),
  categorias: z.array(z.number()).min(1, { message: "Selecciona al menos una categoría" }),
  laboratorioId: z.number().gt(0, { message: "Selecciona un laboratorio" }),
  principiosActivos: z.array(
    z.object({
      principioActivoId: z.number().min(1, ""),
      concentracion: z.coerce.number().gt(0, ""),
      unidadMedidaId: z.number().min(1, ""),
    })
  ).min(1, { message: "Agrega al menos un principio activo" }),
});

type FormData = z.infer<typeof schema>;

interface ModalRegistrarProductoProps {
  onClose?: () => void;
  open: boolean;
}

export function ModalRegistrarProducto({ open, onClose }: ModalRegistrarProductoProps) {
  const hasMounted = useRef(false);
  const { mutate: registrarProducto } = useRegistrarProducto();
  const { productoAction, setProductoAction } = useProductosContext();

  const [imagenes, setImagenes] = useState<File[]>([]);
  const [categoriasPopoverOpen, setCategoriasPopoverOpen] = useState(false);

  const { fetch: fetchLaboratorios, data: dataLaboratorios } = useQuery(obtenerListaLaboratoriosDisponibles);
  const { fetch: fetchCategorias, data: dataCategorias } = useQuery(obtenerListaCategoriasDisponibles);
  const { fetch: fetchFormasFarmaceuticas, data: dataFormasFarmaceuticas } = useQuery(obtenerListaFormasFarmaceuticas);
  const { fetch: fetchUnidadesMedidas, data: dataUnidadesMedidas } = useQuery(obtenerListaUnidadesMedidas)
  const { fetch: fetchPrincipiosActivos, data: dataPrincipiosActivos } = useQuery(obtenerListaPrincipiosActivos);

  const [openModalRegistrarPrincipioActivo, setOpenModalRegistrarPrincipioActivo] = useState(false);
  // Estados para drag and drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nombreComercial: "",
      formaFarmaceuticaId: 0,
      precioVenta: 0,
      stockMin: 0,
      categorias: [],
      laboratorioId: 0,
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
  const { fields, append, remove } = useFieldArray({
    name: "principiosActivos",
    control: form.control,
  });

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchLaboratorios(),
          fetchCategorias(),
          fetchFormasFarmaceuticas(),
          fetchUnidadesMedidas(),
          fetchPrincipiosActivos(),
        ]);
      } catch (err: any) {
        toast.custom((t) => (
          <CustomToast
            t={t}
            type="error"
            title="Error al cargar datos para registrar los productos"
            message={err?.response?.message || err?.message || "Error del servidor"}
            date={dateFormat(Date.now())}
          />
        ));
      }
    };

    fetchData();
  }, []);
  const actualizarPrincipiosActivos = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    fetchPrincipiosActivos()
  }, [actualizarPrincipiosActivos.current])

  useEffect(() => {
    if (fields.length === 0) {
      append({
        principioActivoId: 0,
        concentracion: 0,
        unidadMedidaId: 0,
      });
    }
  }, [fields, append]);
  const onSubmit = async (data: ProductoRequest) => {
    try {
      const response = await registrarProducto(data, imagenes);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Producto registrado"
          message={response?.message || "Producto registrado correctamente"}
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
          title="Error al registrar producto"
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
            <DialogTitle>Registrar producto</DialogTitle>
            <DialogDescription>
              Ingresa los datos del producto en el sistema.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
              {/* Campos básicos */}
              <FormField name="nombreComercial" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre comercial</FormLabel>
                  <FormControl><Input placeholder="Ej. Paracetamol Plus" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />



              <div className="space-y-2">
                <FormLabel>Principios Activos</FormLabel>
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
                          <FormItem className="col-span-4">
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


                      <FormField
                        control={form.control}
                        name={`principiosActivos.${index}.concentracion`}
                        render={({ field }) => (
                          <FormItem className="col-span-3">
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
                          <FormItem className="col-span-3">
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
                                    : "Selecciona una"}
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

                      {/* Botón eliminar, solo si hay más de uno */}
                      {fields.length > 1 ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="col-span-2 text-red-500 hover:bg-red-100"
                          aria-label={`Eliminar principio activo ${index + 1}`}
                        >
                          <Trash className="w-5 h-5" />
                        </Button>
                      ) : (
                        <div className="col-span-2 flex items-center justify-center text-gray-400 select-none">
                          <Trash className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  );
                })}

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




              <FormField name="formaFarmaceuticaId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma Farmaceutica</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la forma del producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataFormasFarmaceuticas?.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id.toString()}>
                            {lab.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />


              <div className="flex gap-4">
                <div className="w-1/2">
                  <FormField name="precioVenta" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de venta (Bs)</FormLabel>
                      <FormControl>
                        <Input step="0.01" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="w-1/2">
                  <FormField name="stockMin" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock mínimo</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>


              <FormField name="laboratorioId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Laboratorio</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un laboratorio" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataLaboratorios?.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id.toString()}>
                            {lab.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Campo de categorías corregido */}
              <FormField name="categorias" control={form.control} render={() => (
                <FormItem>
                  <FormLabel>Categorías</FormLabel>
                  <Popover open={categoriasPopoverOpen} onOpenChange={setCategoriasPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoriasPopoverOpen}
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {getSelectedCategoriasText()}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar categoría..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                          <CommandGroup>
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

              {/* Sección de imágenes */}
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

                <FormLabel>Imágenes del producto</FormLabel>
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

              <Button type="submit" className="mt-4">Guardar</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {openModalRegistrarPrincipioActivo &&
        <ModalRegistrarPrincipioActivo open={openModalRegistrarPrincipioActivo} onClose={() => setOpenModalRegistrarPrincipioActivo(false)} onEnviarDato={(_) => { actualizarPrincipiosActivos.current = !actualizarPrincipiosActivos.current }} />
      }
    </>
  );
}