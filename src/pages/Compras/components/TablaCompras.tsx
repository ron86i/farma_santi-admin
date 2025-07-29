import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { CompraInfo } from "@/models/compra";
import { getNestedValue } from "@/utils";
import dateFormat from "dateformat";
import { ArrowDown, ArrowUp, SplineIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { MenuAcciones } from "./MenuAcciones";

type TablaComprasProps = {
    list: CompraInfo[];
    loading: boolean;
    filter?: string;
};

export function TablaCompras({ list, loading, filter }: TablaComprasProps) {
    const [sortedData, setSortedData] = useState<CompraInfo[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    // const { laboratorioAction } = useLaboratoriosContext();

    useEffect(() => {
        let updated = [...list];

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

        setSortedData(updated);
    }, [list]);

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
            setSortedData(list);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

        const sorted = [...list].sort((a, b) => {
            const valueA = getNestedValue(a, key);
            const valueB = getNestedValue(b, key);

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

        setSortedData(sorted);
        setSortKey(key);
        setSortDirection(direction);
    };

    const columns = [
        { label: "Codigo", key: "codigo", sort: true },
        { label: "Fecha registro", key: "createdAt", sort: true },
        { label: "Proveedor", key: "proveedor.razonSocial", sort: true },
        { label: "Usuario", key: "usuario.username", sort: true },
        { label: "Estado", key: "estado", sort: true },
        { label: "Total (Bs)", key: "total", sort: true },
        { label: "Acciones", key: "acciones", sort: false },
    ];

    const searchText = filter?.toLowerCase();
    const filteredLaboratorios = sortedData.filter((item) =>
        [
            dateFormat(item.fecha,"dd/mm/yyyy hh:mm:ss", true),
            item.codigo,
            item.estado,
            item.usuario.username,
            item.proveedor.razonSocial,
            item.proveedor.nit,
            item.total
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
                                <div className="flex items-center gap-1">
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
                                <SplineIcon></SplineIcon>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredLaboratorios.map((item) => (
                            <TableRow key={item.id}>
                                {/* id */}
                                <TableCell className="text-sm">{item.codigo}</TableCell>
                                {/* Fecha */}
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {dateFormat(item.fecha,"dd/mm/yyyy hh:mm:ss", true)}
                                </TableCell>

                                {/* Proveedor */}
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{item.proveedor.razonSocial}</span>
                                        <span className="text-xs text-muted-foreground">NIT: {item.proveedor.nit}</span>
                                    </div>
                                </TableCell>

                                {/* Usuario */}
                                <TableCell className="text-sm">{item.usuario.username}</TableCell>

                                {/* Estado */}
                                <TableCell>
                                    <Badge
                                        className={`text-xs px-2 py-1 rounded-md font-medium ${item.estado === "Pendiente"
                                            ? "bg-yellow-400 text-black dark:bg-yellow-500 dark:text-black"
                                            : item.estado === "Anulado"
                                                ? "bg-red-500 text-white dark:bg-red-700 dark:text-white"
                                                : "bg-blue-500 text-white dark:bg-blue-800 dark:text-white"
                                            }`}
                                    >
                                        {item.estado}
                                    </Badge>
                                </TableCell>

                                {/* Total */}
                                <TableCell className="text-sm font-medium  whitespace-nowrap">
                                    {item.total.toFixed(2)}
                                </TableCell>

                                {/* Acciones (placeholder) */}
                                <TableCell>
                                    <MenuAcciones compraId={item.id} estado={item.estado} />
                                </TableCell>
                            </TableRow>

                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}