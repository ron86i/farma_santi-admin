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
import { ClienteInfo } from "@/models";
import { MenuAcciones } from "./MenuAcciones";
import { Button } from "@/components/ui/button";

type TablaClientesProps = {
    list: ClienteInfo[];
    loading: boolean;
    filter?: string;
    pageSize?: number;
};

export function TablaClientes({ list, loading, filter, pageSize = 6 }: TablaClientesProps) {
    const [sortedData, setSortedData] = useState<ClienteInfo[]>([]);
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
        { label: "NIT/CI", key: "nitCi", sort: true },
        { label: "Razón Social", key: "razonSocial", sort: true },
        { label: "Estado", key: "estado", sort: true },
        { label: "Tipo", key: "tipo", sort: true },
        { label: "Acciones", key: "acciones", sort: false },
    ];

    // Filtro
    const searchText = filter?.toLowerCase();
    const filteredList = sortedData.filter((item) =>
        [
            item.nitCi + "" + item?.complemento,
            item.estado,
            item.razonSocial
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
                                Cargando...
                            </TableCell>
                        </TableRow>
                    ) : filteredList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                                No se encontraron resultados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedList.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {item.nitCi && item.nitCi !== 0
                                        ? `${item.nitCi}${item.complemento ?? ""}`
                                        : "Sin NIT/CI"}
                                </TableCell>
                                <TableCell>{item.razonSocial}</TableCell>
                                <TableCell>
                                    <Badge variant={item.estado === "Activo" ? "default" : "destructive"}>
                                        {item.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.tipo === "NIT" ? "default" : "secondary"}>
                                        {item.tipo}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <MenuAcciones 
                                        clienteId={item.id} 
                                        estado={item.estado} 
                                        ciNit={`${item.nitCi}${item.complemento ?? ""}`} 
                                        razonSocial={item.razonSocial} 
                                    />
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
