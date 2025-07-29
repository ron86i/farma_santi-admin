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
import { VentaInfo } from "@/models";
import dateFormat from "dateformat";
import { MenuAcciones } from "./MenuAcciones";
// import { MenuAcciones } from "./MenuAcciones";

type TablaVentasProps = {
    list: VentaInfo[];
    loading: boolean;
    filter?: string;
};

export function TablaVentas({ list, loading, filter }: TablaVentasProps) {
    const [sortedVentas, setSortedVentas] = useState<VentaInfo[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

        setSortedVentas(updated);
    }, [list, sortKey, sortDirection]);

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" | null = "asc";

        if (sortKey === key) {
            if (sortDirection === "asc") direction = "desc";
            else if (sortDirection === "desc") direction = null;
            else direction = "asc";
        }

        if (direction === null) {
            setSortedVentas(list);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

        setSortKey(key);
        setSortDirection(direction);
    };

    const columns = [
        { label: "Código", key: "codigo", sortable: true },
        { label: "Cliente", key: "cliente", sortable: true },
        { label: "Fecha", key: "fecha", sortable: true },
        { label: "Usuario", key: "usuario", sortable: true },
        { label: "Total (Bs)", key: "total", sortable: true },
        { label: "Estado", key: "estado", sortable: true },
        { label: "Acciones", key: "acciones", sortable: false },
    ];

    const searchText = filter?.toLowerCase();

    const filteredVentas = sortedVentas.filter((venta) =>
        [
            venta.codigo,
            venta.cliente?.nitCi,
            venta.cliente?.razonSocial,
            venta.fecha,
            venta.usuario,
            venta.estado,
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
                                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                className={col.sortable ? "cursor-pointer select-none" : "select-none"}
                            >
                                <div className="flex items-center justify-start gap-1">
                                    {col.label}
                                    {col.sortable && sortKey === col.key &&
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
                                Cargando...
                            </TableCell>
                        </TableRow>
                    ) : filteredVentas.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center">
                                No hay ventas para mostrar
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredVentas.map((venta) => (
                            <TableRow key={venta.id}>
                                <TableCell>{venta.codigo}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{venta.cliente?.razonSocial}</div>
                                        <div className="text-sm text-gray-500">{venta.cliente?.nitCi}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{dateFormat(venta.fecha)}</TableCell>
                                <TableCell>{venta.usuario.username}</TableCell>
                                <TableCell align="right">
                                    {venta.total.toFixed(2) || '0.00'}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={`text-xs px-2 py-1 rounded-md font-medium ${venta.estado === "Pendiente"
                                                ? "bg-yellow-400 text-black dark:bg-yellow-500 dark:text-black"
                                                : venta.estado === "Anulado"
                                                    ? "bg-red-500 text-white dark:bg-red-700 dark:text-white"
                                                    : venta.estado === "Realizada"
                                                        ? "bg-green-500 text-white dark:bg-green-700 dark:text-white"
                                                        : "bg-blue-500 text-white dark:bg-blue-800 dark:text-white"
                                            }`}
                                    >
                                        {venta.estado}
                                    </Badge>

                                </TableCell>
                                <TableCell>
                                    <MenuAcciones ventaId={venta.id} estado={venta.estado} deletedAt={venta.deletedAt} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}