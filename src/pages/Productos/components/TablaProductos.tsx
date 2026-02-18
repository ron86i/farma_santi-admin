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
import { ProductoInfo } from "@/models/producto";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { MenuAcciones } from "./MenuAcciones";
import { Button } from "@/components/ui/button";

type TablaProductosProps = {
    productos: ProductoInfo[];
    loading: boolean;
    filter?: string;
    pageSize?: number; // 👈 configurable
};

export function TablaProductos({ productos, loading, filter, pageSize = 6 }: TablaProductosProps) {
    const [sortedProductos, setSortedProductos] = useState<ProductoInfo[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let updated = [...productos];

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

        setSortedProductos(updated);
        setCurrentPage(1); // 👈 reset al cambiar productos u orden
    }, [productos, sortKey, sortDirection]);

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" | null = "asc";

        if (sortKey === key) {
            if (sortDirection === "asc") direction = "desc";
            else if (sortDirection === "desc") direction = null;
            else direction = "asc";
        }

        if (direction === null) {
            setSortedProductos(productos);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

        setSortKey(key);
        setSortDirection(direction);
    };

    const columns = [
        { label: "Foto", key: "urlFoto", sortable: false },
        { label: "Nombre Comercial", key: "nombreComercial", sortable: true },
        { label: "Forma Farmacéutica", key: "formaFarmaceutica", sortable: true },
        { label: "Laboratorio", key: "laboratorio", sortable: true },
        { label: "Precio Venta (Bs)", key: "precioVenta", sortable: true },
        { label: "Stock Min (Uds)", key: "stockMin", sortable: true },
        { label: "Stock", key: "stock", sortable: true },
        { label: "Stock (Uds)", key: "stockUds", sortable: true },
        { label: "Estado", key: "estado", sortable: true },
        { label: "Acciones", key: "acciones", sortable: false },
    ];

    // 🔹 Filtro
    const searchText = filter?.toLowerCase();
    const filteredProductos = sortedProductos.filter((producto) =>
        [
            producto.id,
            producto.nombreComercial,
            producto.formaFarmaceutica,
            producto.laboratorio,
            producto.estado,
            producto.precioVenta.toString(),
            producto.stockMin.toString(),
            producto.stock.toString(),
        ]
            .filter(Boolean)
            .some((field) => field?.toString().toLowerCase().includes(searchText ?? ""))
    );

    // 🔹 Paginación
    const totalPages = Math.max(1, Math.ceil(filteredProductos.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProductos = filteredProductos.slice(startIndex, startIndex + pageSize);
    function formatearStock(stockTotal: number, unidadesPorPresentacion: number, nombrePresentacion: string, nombreUnidadBase: string) {
        nombreUnidadBase = "Ud" // Tu lógica original
        // Asegurarnos de que stockTotal sea un número, si es null o undefined, tratar como 0.
        const stock = Number(stockTotal) || 0;

        // Caso 1: Stock es cero.
        if (stock === 0) {
            return `0 ${nombreUnidadBase}s`;
        }

        // Caso 2: La presentación no es válida (0, 1, null) o es igual a 1.
        // Tratar todo como unidades base.
        if (!unidadesPorPresentacion || unidadesPorPresentacion <= 1) {
            return `${stock} ${nombreUnidadBase}${stock > 1 ? 's' : ''}`;
        }

        // Calcular las partes
        const presentacionesCompletas = Math.floor(stock / unidadesPorPresentacion);
        const unidadesSueltas = stock % unidadesPorPresentacion;

        const partesTexto = [];

        // Agregar la parte de las presentaciones (si hay)
        if (presentacionesCompletas > 0) {
            //                                AQUÍ ESTÁ EL CAMBIO   ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
            partesTexto.push(`${presentacionesCompletas} ${nombrePresentacion}${presentacionesCompletas > 1 ? 's' : ''} (${unidadesPorPresentacion})`);
        }

        // Agregar la parte de las unidades sueltas (si hay)
        if (unidadesSueltas > 0) {
            partesTexto.push(`${unidadesSueltas} ${nombreUnidadBase}${unidadesSueltas > 1 ? 's' : ''}`); // Añade 's' si es plural
        }

        // Unir ambas partes con "y"
        return partesTexto.join(' y ');
    };
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
                    ) : paginatedProductos.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center">
                                No hay productos para mostrar
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedProductos.map((producto) => (
                            <TableRow key={producto.id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage
                                            className="rounded-full size-8"
                                            src={producto.urlFoto + "?timestamp=" + Date.now()}
                                            alt={producto.nombreComercial}
                                            loading="lazy"
                                        />
                                        <AvatarFallback>
                                            {producto.nombreComercial.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{producto.nombreComercial}</TableCell>
                                <TableCell>{producto.formaFarmaceutica}</TableCell>
                                <TableCell>{producto.laboratorio ?? ""}</TableCell>
                                {/* <TableCell align="right">{producto.precioCompra.toFixed(2)}</TableCell> */}
                                <TableCell
                                    align="right"
                                    className={
                                        producto.precioVenta < producto.precioCompra
                                            ? "text-red-600 font-semibold"
                                            : producto.precioVenta === producto.precioCompra
                                                ? "text-yellow-600 font-semibold"
                                                : "text-green-600 font-semibold"
                                    }
                                >
                                    {producto.precioVenta.toFixed(2)}
                                </TableCell>
                                <TableCell align="right">{producto.stockMin}</TableCell>
                                <TableCell
                                    align="left"

                                >
                                    {
                                        /* Llamada directa a la función con los datos del producto */
                                        formatearStock(
                                            producto.stock,
                                            producto.unidadesPresentacion,
                                            producto.presentacion.nombre,
                                            "Ud"
                                        )
                                    }
                                </TableCell>
                                                                <TableCell
                                    align="left"

                                >
                                    {producto.stock}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={producto.estado === "Activo" ? "default" : "destructive"}>
                                        {producto.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <MenuAcciones productoId={producto.id} deletedAt={producto.deletedAt} estado={producto.estado} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* 🔹 Paginación siempre visible */}
            <div className="flex justify-center items-center gap-4 p-2">
                <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                    Anterior
                </Button>
                <span>
                    Página {currentPage} de {totalPages}
                </span>
                <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
