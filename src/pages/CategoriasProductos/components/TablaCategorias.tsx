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
import dateFormat from "dateformat";
import { Categoria } from "@/models";
import { useCategoriasContext } from "@/context";
import { MenuAcciones } from "./MenuAcciones";
import { Button } from "@/components/ui/button";

type TablaCategoriasProps = {
    categorias: Categoria[];
    loading: boolean;
    filter?: string;
    pageSize?: number;
};

export function TablaCategorias({
    categorias,
    loading,
    filter,
    pageSize = 6,
}: TablaCategoriasProps) {
    const [sortedCategorias, setSortedCategorias] = useState<Categoria[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const { categoriaAction } = useCategoriasContext();

    useEffect(() => {
        let updated = [...categorias];

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

        setSortedCategorias(updated);
    }, [categorias, categoriaAction, sortKey, sortDirection]);

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" | null = "asc";

        if (sortKey === key) {
            if (sortDirection === "asc") direction = "desc";
            else if (sortDirection === "desc") direction = null;
            else direction = "asc";
        }

        if (direction === null) {
            setSortedCategorias(categorias);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

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
    const filteredCategorias = sortedCategorias.filter((categoria) =>
        [categoria.id, categoria.nombre, categoria.estado, dateFormat(categoria.createdAt)]
            .filter(Boolean)
            .some((field) => field?.toString().toLowerCase().includes(searchText ?? ""))
    );

    // Paginación
    const totalPages = Math.max(1, Math.ceil(filteredCategorias.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCategorias = filteredCategorias.slice(
        startIndex,
        startIndex + pageSize
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
                    ) : paginatedCategorias.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                                No se encontraron resultados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedCategorias.map((categoria) => (
                            <TableRow key={categoria.id}>
                                <TableCell>{categoria.id}</TableCell>
                                <TableCell>{categoria.nombre}</TableCell>
                                <TableCell>{dateFormat(categoria.createdAt)}</TableCell>
                                <TableCell>
                                    <Badge variant={categoria.estado === 'Activo' ? 'default' : 'destructive'}>
                                        {categoria.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <MenuAcciones categoriaId={categoria.id} deletedAt={categoria.deletedAt ?? null} />
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
                    disabled={currentPage === 1 || loading || filteredCategorias.length === 0}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                    Anterior
                </Button>
                <span>
                    Página {currentPage} de {totalPages}
                </span>
                <Button
                    variant="outline"
                    disabled={currentPage === totalPages || loading || filteredCategorias.length === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
