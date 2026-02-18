import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { CompraInfo } from "@/models/compra";
import { getNestedValue } from "@/utils";
import dateFormat from "dateformat";
import { ArrowDown, ArrowUp, SplineIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { MenuAcciones } from "./MenuAcciones";
import { Button } from "@/components/ui/button";

type TablaComprasProps = {
    list: CompraInfo[];
    loading: boolean;
    filter?: string;
    pageSize?: number;
};

export function TablaCompras({ list, loading, filter, pageSize = 6 }: TablaComprasProps) {
    const [sortedData, setSortedData] = useState<CompraInfo[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);

    // Ordenamiento
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
    }, [list, sortKey, sortDirection]);

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" | null = "asc";

        if (sortKey === key) {
            if (sortDirection === "asc") direction = "desc";
            else if (sortDirection === "desc") direction = null;
            else direction = "asc";
        }

        if (direction === null) {
            setSortedData(list);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

        setSortKey(key);
        setSortDirection(direction);
    };

    const columns = [
        { label: "Codigo", key: "codigo", sort: true },
        { label: "Fecha registro", key: "fecha", sort: true },
        { label: "Proveedor", key: "proveedor.razonSocial", sort: true },
        { label: "Usuario", key: "usuario.username", sort: true },
        { label: "Estado", key: "estado", sort: true },
        { label: "Total (Bs)", key: "total", sort: true },
        { label: "Acciones", key: "acciones", sort: false },
    ];

    // Filtro
    const searchText = filter?.toLowerCase();
    const filteredList = sortedData.filter((item) =>
        [
            dateFormat(item.fecha,"dd/mm/yyyy hh:mm:ss", true),
            item.codigo,
            item.estado,
            item.usuario.username,
            item.laboratorio.nombre,
            item.total
        ]
            .filter(Boolean)
            .some((field) => field?.toString().toLowerCase().includes(searchText ?? ""))
    );

    // Paginación
    const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedList = filteredList.slice(startIndex, startIndex + pageSize);

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
                                <SplineIcon />
                            </TableCell>
                        </TableRow>
                    ) : filteredList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center">
                                No se encontraron resultados
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedList.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-sm">{item.codigo}</TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {dateFormat(item.fecha,"dd/mm/yyyy hh:mm:ss", true)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.laboratorio.nombre}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{item.usuario.username}</TableCell>
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
                                <TableCell className="text-sm font-medium  whitespace-nowrap">
                                    {item.total.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <MenuAcciones compraId={item.id} estado={item.estado} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Paginación */}
            <div className="flex justify-center items-center gap-4 p-2">
                <Button
                    variant="outline"
                    disabled={currentPage === 1 || loading || filteredList.length === 0}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                    Anterior
                </Button>
                <span>
                    Página {currentPage} de {totalPages}
                </span>
                <Button
                    variant="outline"
                    disabled={currentPage === totalPages || loading || filteredList.length === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
