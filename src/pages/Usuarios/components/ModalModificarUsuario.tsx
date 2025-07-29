import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rol, UsuarioRequest } from "@/models";
import { useUsuariosContext } from "@/context/usuarioContex";
import { useModificarUsuario } from "@/hooks/useUsuario";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button, Input } from "@/components/ui";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@/hooks/generic";
import { obtenerListaRoles, obtenerUsuarioById } from "@/services";
import { CustomToast } from "@/components/toast";
import dateFormat from "dateformat";
import { toast } from "sonner";

interface ModalModificarUsuarioProps {
  usuarioId: number;
  onClose?: () => void;
  open: boolean;
}

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

// Modal para modificar usuario
export function ModalModificaUsuario({ usuarioId, open, onClose }: ModalModificarUsuarioProps) {
  const { fetch: fetchRoles, data: dataRoles } = useQuery(obtenerListaRoles);
  const { fetch: fetchObtenerUsuario } = useQuery(obtenerUsuarioById);
  const { mutate: modificarUsuario } = useModificarUsuario();
  const { usuarioAction, setUsuarioAction } = useUsuariosContext();
  const [roles, setRoles] = useState<Rol[]>([])
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      ci: 0,
      roles: [],
    },
  });

  const [rolesSelected, setRolesSelected] = useState<number[]>([]);
  // Efecto separado para escuchar cuando los roles se obtienen
  useEffect(() => {
    if (dataRoles) {
      setRoles(dataRoles);
    }
  }, [dataRoles]);


  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        await fetchRoles();
        const usuario = await fetchObtenerUsuario(usuarioId);

        if (usuario?.persona) {
          const rolesIds = usuario.roles.map((r) => r.id);
          setRolesSelected(rolesIds);

          form.reset({
            ci: usuario.persona.ci,
            nombres: usuario.persona.nombres,
            apellidoPaterno: usuario.persona.apellidoPaterno,
            apellidoMaterno: usuario.persona.apellidoMaterno,
            complemento: usuario.persona.complemento ?? undefined,
            genero: usuario.persona.genero,
            username: usuario.username,
            roles: rolesIds,
          });
        }
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err);
      }
    };

    fetchData();
  }, [open]);

  useEffect(() => {
    form.setValue("roles", rolesSelected);
  }, [rolesSelected, fetchRoles]);

  const handleRoleToggle = (roleId: number) => {
    setRolesSelected((prevSelected) =>
      prevSelected.includes(roleId)
        ? prevSelected.filter((id) => id !== roleId)
        : [...prevSelected, roleId]
    );
  };

  const onSubmit = async (data: FormData) => {
    const usuarioRequest: UsuarioRequest = {
      username: data.username,
      persona: {
        ci: data.ci,
        complemento: data.complemento,
        nombres: data.nombres,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        genero: data.genero,
      },
      roles: data.roles,
    };

    try {
      const response = await modificarUsuario(usuarioId, usuarioRequest);
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Usuario modificado"
          message={response?.message || "Error en el servidor"}
          date={dateFormat(Date.now())}
        />
      ));
      setUsuarioAction(!usuarioAction);
      form.reset();
      // onClose(); // descomenta si quieres cerrar el modal al guardar
    } catch (err: any) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Error al modificar usuario"
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
          <DialogTitle>Modificar usuario</DialogTitle>
          <DialogDescription>
            Actualizar los datos del usuario en el sistema.
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
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
                              <CommandItem
                                key={rol.id}
                                onClick={() => handleRoleToggle(rol.id)}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    className="cursor-pointer"
                                    checked={rolesSelected.includes(rol.id)}
                                    onCheckedChange={() => handleRoleToggle(rol.id)}
                                    id={`role-${rol.id}`}
                                  />
                                  <label htmlFor={`role-${rol.id}`} className="cursor-pointer">{rol.nombre}</label>
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
              Guardar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


