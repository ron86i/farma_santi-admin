import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UsuarioInfo } from "@/models/usuario";
import { getNestedValue } from "@/utilities";
import { useEffect, useState } from "react";
import { MenuAcciones } from "./MenuAccciones";
import { ArrowDown, ArrowUp } from "lucide-react";

type TablaUsuariosProps = {
  users: UsuarioInfo[];
  loading: boolean;
  filter?: string;
};

export function TablaUsuarios({ users, loading, filter }: TablaUsuariosProps) {
  const [sortedUsers, setSortedUsers] = useState<UsuarioInfo[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setSortedUsers(users);
  }, [users]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";

    if (sortKey === key) {
      if (sortDirection === "asc") {
        direction = "desc";
      } else if (sortDirection === "desc") {
        direction = null;
      } else {
        direction = "asc";
      }
    }

    if (direction === null) {
      setSortedUsers(users);
      setSortKey(null);
      setSortDirection("asc");
      return;
    }

    const sorted = [...users].sort((a, b) => {
      let valueA = getNestedValue(a, key);
      let valueB = getNestedValue(b, key);
      if (key === "deletedAt") {
        // Si deletedAt es null o no
        valueA = a.deletedAt ? "Inactivo" : "Activo";
        valueB = b.deletedAt ? "Inactivo" : "Activo";
    }
      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }

      return 0;
    });

    setSortedUsers(sorted);
    setSortKey(key);
    setSortDirection(direction);
  };

  const columns = [
    { label: "CI", key: "persona.ci", sort: true },
    { label: "Usuario", key: "username", sort: true },
    { label: "Nombres", key: "persona.nombres", sort: true },
    { label: "Apellido Paterno", key: "persona.apellidoPaterno", sort: true },
    { label: "Apellido Materno", key: "persona.apellidoMaterno", sort: true },
    { label: "Género", key: "persona.genero", sort: true },
    { label: "Estado", key: "deletedAt", sort: true },
    { label: "Acciones", key: "acciones", sort: false },
  ];

  const searchText = filter?.toLowerCase();
  const filteredUsers = sortedUsers.filter((user) =>
    [
      user.username,
      user.persona.ci?.toString() + user.persona.complemento,
      user.persona.complemento,
      user.persona.nombres,
      user.persona.apellidoPaterno,
      user.persona.apellidoMaterno,
      user.persona.genero,
    ]
      .filter(Boolean)
      .some((field) => field?.toLowerCase().includes(searchText ?? ""))
  );

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                onClick={col.sort ? () => handleSort(col.key) : undefined}
                className={col.sort ? "cursor-pointer select-none" : "select-none"}
              >
                <div className="flex items-center justify-start gap-1">
                  {col.label}
                  {col.sort && sortKey === col.key &&
                    (sortDirection === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                {/* <Spinner /> */}
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.persona.ci}>
                <TableCell>
                  {user.persona.ci}
                  {user.persona.complemento}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.persona.nombres}</TableCell>
                <TableCell>{user.persona.apellidoPaterno}</TableCell>
                <TableCell>{user.persona.apellidoMaterno}</TableCell>
                <TableCell className="text-center">
                  {user.persona.genero}
                </TableCell>
                <TableCell className="text-center">
                  {user.deletedAt ? (
                    <Badge variant="destructive">Inactivo</Badge>
                  ) : (
                    <Badge variant="default">Activo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <MenuAcciones usuarioId={user.id} deletedAt={user.deletedAt ?? null} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
