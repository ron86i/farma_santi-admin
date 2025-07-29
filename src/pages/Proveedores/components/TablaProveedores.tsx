import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProveedoresContext } from "@/context";
import { ProveedorInfo } from "@/models";

import { getNestedValue } from "@/utils";
import dateFormat from "dateformat";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import { MenuAcciones } from "./MenuAcciones";

interface TablaProveedoresProps {
    list: ProveedorInfo[];
    loading: boolean;
    filter?: string;
}
export function TablaProveedores({ list, loading, filter }: TablaProveedoresProps) {

    const [sorted, setSorted] = useState<ProveedorInfo[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const { proveedorAction } = useProveedoresContext()
    useEffect(() => {
        // 1. Clonamos los datos entrantes
        let updated = [...list];

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
        setSorted(updated);
    }, [list, proveedorAction]);

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
            setSorted(list);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

        const sorted = [...list].sort((a, b) => {
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

        setSorted(sorted);
        setSortKey(key);
        setSortDirection(direction);
    };

    const columns = [
        { label: "ID", key: "id", sort: true },
        { label: "NIT", key: "nit", sort: true },
        { label: "Razón Social", key: "razonSocial", sort: true },
        { label: "Representante", key: "representante", sort: true },
        { label: "Dirección", key: "direccion", sort: true },
        { label: "Fecha registro", key: "createdAt", sort: true },
        { label: "Estado", key: "estado", sort: true },
        { label: "Acciones", key: "acciones", sort: false },
    ];

    const searchText = filter?.toLowerCase();
    const filteredList = sorted.filter((item) =>
        [
            item.id,
            item.nit,
            item.razonSocial,
            item.representante,
            item.direccion,
            dateFormat(item.createdAt),
            item.deletedAt ? "Inactivo" : "Activo"
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
                        filteredList.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.nit}</TableCell>
                                <TableCell>{item.razonSocial}</TableCell>
                                <TableCell>{item.representante}</TableCell>
                                <TableCell>{item.direccion}</TableCell>
                                <TableCell>
                                    {dateFormat(item.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.estado === 'Activo' ? 'default' : 'destructive'}>
                                        {item.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <MenuAcciones proveedorId={item.id} deletedAt={item.deletedAt ?? null} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}