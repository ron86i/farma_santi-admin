import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getNestedValue } from "@/utils";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Rol } from "@/models";
import dateFormat from "dateformat";
import { MenuAcciones } from "./MenuAcciones";
import { useRolesContext } from "@/context/rolesContext";

type TablaRolesProps = {
    roles: Rol[];
    loading: boolean;
    filter?: string;
};

export function TablaRoles({ roles: roles, loading, filter }: TablaRolesProps) {
    const [sortedRoles, setSortedRoles] = useState<Rol[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const { rolAction } = useRolesContext()
    useEffect(() => {
        // 1. Clonamos los datos entrantes
        let updated = [...roles];

        // 2. Si ya había columna elegida, la aplicamos de nuevo
        if (sortKey) {
            updated.sort((a, b) => {
                const valueA = getNestedValue(a, sortKey);
                const valueB = getNestedValue(b, sortKey);

                if (typeof valueA === "string" && typeof valueB === "string") {
                    return sortDirection === "asc"
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                }

                if (typeof valueA === "number" && typeof valueB === "number") {
                    return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
                }

                return 0;
            });
        }

        // 3. Actualizamos el estado
        setSortedRoles(updated);
    }, [roles, rolAction]);

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
            setSortedRoles(roles);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

        const sorted = [...roles].sort((a, b) => {
            let valueA = getNestedValue(a, key);
            let valueB = getNestedValue(b, key);
            
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

        setSortedRoles(sorted);
        setSortKey(key);
        setSortDirection(direction);
    };

    const columns = [
        { label: "ID", key: "id", sort: true },
        { label: "Nombre", key: "nombre", sort: true },
        { label: "Fecha registro", key: "createdAt", sort: true },
        { label: "Estado", key: "estado", sort: true },
        { label: "Acciones", key: "acciones", sort: false },
    ];

    const searchText = filter?.toLowerCase();
    const filteredUsers = sortedRoles.filter((rol) =>


        [
            rol.id,
            rol.nombre,
            dateFormat(rol.createdAt),
            rol.deletedAt ? "Inactivo" : "Activo",
        ]
            .filter(Boolean)
            .some((field) => field?.toString().toLowerCase().includes(searchText ?? ""))
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
                        filteredUsers.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.nombre}</TableCell>

                                <TableCell>
                                    {dateFormat(item.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.estado === 'Activo' ? 'default' : 'destructive'}>
                                        {item.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <MenuAcciones rolId={item.id} deletedAt={item.deletedAt ?? null} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
