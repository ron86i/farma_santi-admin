import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { getNestedValue } from "@/utils";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import dateFormat from "dateformat";
import { LoteProductoInfo } from "@/models";
import { useLoteProductosContext } from "@/context/loteProductoLote";
import { MenuAcciones } from "./MenuAcciones";
import { Badge } from "@/components/ui";

type TablaLoteProductosProps = {
    lista: LoteProductoInfo[];
    loading: boolean;
    filter?: string;
};

export function TablaLoteProductos({ lista, loading, filter }: TablaLoteProductosProps) {
    const [sortedData, setSortedData] = useState<LoteProductoInfo[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const { loteProductoAction } = useLoteProductosContext();

    useEffect(() => {
        let updated = [...lista];

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
    }, [lista, loteProductoAction]);

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
            setSortedData(lista);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

        const sorted = [...lista].sort((a, b) => {
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
        { label: "Lote", key: "nroLote", sort: true },
        { label: "Fecha vencimiento", key: "fechaVencimiento", sort: true },
        { label: "Producto", key: "producto.nombreComercial", sort: true },
        { label: "Stock", key: "stock", sort: true },
        { label: "Estado", key: "estado", sort: true },
        { label: "Acciones", key: "acciones", sort: false },
    ];

    const searchText = filter?.toLowerCase();
    const filteredLaboratorios = sortedData.filter((item) =>
        [
            item.id,
            item.lote,
            dateFormat(item?.fechaVencimiento, "dd/mm/yyyy", true),
            item.producto.id,
            item.producto.nombreComercial,
            item.estado
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
                                {/* Cargando... */}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredLaboratorios.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.lote}</TableCell>
                                <TableCell>{dateFormat(item?.fechaVencimiento, "dd/mm/yyyy", true)}</TableCell>
                                <TableCell>                                                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{item.producto.nombreComercial}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.producto.formaFarmaceutica} • {item.producto.laboratorio}
                                    </span>
                                </div></TableCell>
                                <TableCell align="right">{item.stock}</TableCell>
                                <TableCell>
                                    <Badge
                                        className={`text-xs px-2 py-1 rounded-md font-medium ${item.estado === "Retirado"
                                            ? "bg-yellow-400 text-black dark:bg-yellow-500 dark:text-black"
                                            : item.estado === "Vencido"
                                                ? "bg-red-500 text-white dark:bg-red-700 dark:text-white"
                                                : item.estado === "Activo"
                                                    ? "bg-green-500 text-white dark:bg-green-700 dark:text-white"
                                                    : "bg-blue-500 text-white dark:bg-blue-800 dark:text-white"
                                            }`}
                                    >
                                        {item.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <MenuAcciones loteId={item.id} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
