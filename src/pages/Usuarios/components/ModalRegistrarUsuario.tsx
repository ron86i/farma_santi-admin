import { useEffect, useState } from "react";
import { z } from "zod";
import { useRegistrarUsuario } from "@/hooks/useUsuario";
import { Rol, UsuarioRequest } from "@/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUsuariosContext } from "@/context/usuarioContex";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button, Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { useQuery } from "@/hooks/generic";
import { obtenerListaRoles } from "@/services";
import { generarPDFUsuario } from "@/utils/pdf";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";
const schema = z.object({
  username: z
    .string({
      required_error: "Campo obligatorio",
    })
    .trim()
    .min(1, { message: "Por favor, ingresa un nombre de usuario" }),
  ci: z
    .coerce
    .number({
      required_error: "El CI es obligatorio",
      invalid_type_error: "El CI debe ser un número.",
    })
    .min(1000000, { message: "El CI debe tener al menos 7 dígitos" })
    .max(99999999, { message: "El CI no puede tener más de 8 dígitos" }),
  complemento: z
    .string()
    .trim()
    .max(2, { message: "El complemento no puede ser mayor a 2 dígitos" })
    .optional(),
  nombres: z
    .string({
      required_error: "Campo obligatorio",
    })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede superar los 50 caracteres" }),
  apellidoPaterno: z
    .string({
      required_error: "Campo obligatorio",
    })
    .min(2, { message: "El apellido paterno debe tener al menos 2 caracteres" })
    .max(50, { message: "El apellido paterno no puede superar los 50 caracteres" }),
  apellidoMaterno: z
    .string({
      required_error: "Campo obligatorio",
    })
    .min(2, { message: "El apellido materno debe tener al menos 2 caracteres" })
    .max(50, { message: "El apellido materno no puede superar los 50 caracteres" }),
  genero: z
    .string({
      required_error: "Campo obligatorio",
    })
    .min(1, { message: "Por favor, selecciona un género" }),
  roles: z
    .array(z.number(), {
      required_error: "Debes seleccionar al menos un rol",
    })
    .min(1, {
      message: "Selecciona al menos un rol para continuar",
    }),
});

type FormData = z.infer<typeof schema>;

interface ModalRegistrarUsuarioProps {
  onClose?: () => void;
  open: boolean;
}

export function ModalRegistrarUsuario({ open, onClose }: ModalRegistrarUsuarioProps) {
  const { fetch: obtenerRoles, data } = useQuery(obtenerListaRoles);
  const { mutate: registrarUsuario } = useRegistrarUsuario();
  const { usuarioAction, setUsuarioAction } = useUsuariosContext();
  const [rolesSelected, setRolesSelected] = useState<number[]>([]);
  const [roles, setRoles] = useState<Rol[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      ci: 0,
      roles: [],
    }
  });
  // Obtener roles
  useEffect(() => {
    obtenerRoles()
  }, []);

  // Obtener roles
  useEffect(() => {
    setRoles(data ?? [])
  }, [data]);



  const onSubmit = async (data: FormData) => {
    const usuarioRequest: UsuarioRequest = {
      username: data.username,
      persona: {
        ci: data.ci,
        complemento: data.complemento,
        nombres: data.nombres,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        genero: data.genero
      },
      roles: data.roles
    };

    try {
      // 1. Registrar usuario
      const response = await registrarUsuario(usuarioRequest);

      // 2. Generar PDF del usuario (si el backend retorna el detalle)
      if (response) {
        generarPDFUsuario(response.data); // Aquí generas el PDF
      }
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Usuario registrado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      // 3. Actualizar estado y cerrar modal
      setUsuarioAction(!usuarioAction);
      form.reset();
      if (onClose) {
        onClose(); // Cierra el modal
      }
    } catch (err:any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al registrar usuario"
          message={err?.response?.message || err?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
    }
  };

  // Update form roles when rolesSelected changes
  useEffect(() => {
    form.setValue("roles", rolesSelected, { shouldValidate: true });
  }, [rolesSelected]);

  // Handle role selection toggle
  const handleRoleToggle = (roleId: number) => {
    setRolesSelected(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  return (
    <Dialog modal defaultOpen={false} open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[96%] w-full overflow-auto sm:max-w-[600px] [&_[data-dialog-close]]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader >
          <DialogTitle>Registrar usuario</DialogTitle>
          <DialogDescription>
            Ingresa los datos del usuario en el sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2 text-black dark:text-white"
          >


            <FormField
              control={form.control}
              name="ci"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CI</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                    <Input type="text" {...field} maxLength={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={50} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apellidoPaterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido Paterno</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={50} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apellidoMaterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido Materno</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={50} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                        <SelectItem value="O">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {rolesSelected.length > 0
                          ? roles
                            .filter((r) => rolesSelected.includes(r.id))
                            .map((r) => r.nombre)
                            .join(", ")
                          : "Selecciona roles"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar rol..." />
                        <CommandList>
                          <CommandEmpty>No se encontraron roles.</CommandEmpty>
                          <CommandGroup>
                            {roles.map((rol) => (
                              <CommandItem key={rol.id} className="cursor-pointer">
                                <div className="flex items-center space-x-2 w-full">
                                  <Checkbox
                                    id={`role-${rol.id}`}
                                    value={rol.id}
                                    checked={rolesSelected.includes(rol.id)}
                                    onCheckedChange={() => handleRoleToggle(rol.id)}
                                  />
                                  <label
                                    htmlFor={`role-${rol.id}`}
                                    className="cursor-pointer w-full"
                                  >
                                    {rol.nombre}
                                  </label>
                                </div>
                              </CommandItem>

                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {form.formState.errors.roles && (
                    <FormMessage>{form.formState.errors.roles.message}</FormMessage>
                  )}
                </FormItem>

              )}
            />

            <Button
              type="submit"
              className="mt-4 px-4 py-2 transition"
            >
              Registrar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

