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

type TablaProductosProps = {
    productos: ProductoInfo[];
    loading: boolean;
    filter?: string;
};

export function TablaProductos({ productos, loading, filter }: TablaProductosProps) {
    const [sortedProductos, setSortedProductos] = useState<ProductoInfo[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
        // { label: "ID", key: "id", sortable: true },
        { label: "Foto", key: "urlFoto", sortable: false }, // nueva columna para la foto
        { label: "Nombre Comercial", key: "nombreComercial", sortable: true },
        { label: "Forma Farmacéutica", key: "formaFarmaceutica", sortable: true },
        { label: "Laboratorio", key: "laboratorio", sortable: true },
        { label: "Precio Compra (Bs)", key: "precioCompra", sortable: true },
        { label: "Precio Venta (Bs)", key: "precioVenta", sortable: true },
        { label: "Stock Mínimo", key: "stockMin", sortable: true },
        { label: "Stock", key: "stock", sortable: true },
        { label: "Estado", key: "estado", sortable: true },
        { label: "Acciones", key: "acciones", sortable: false },
    ];

    const searchText = filter?.toLowerCase();

    const filteredProductos = sortedProductos.filter((producto) =>
        [
            producto.id,
            producto.nombreComercial,
            producto.formaFarmaceutica,
            producto.laboratorio,
            producto.estado,
            producto.precioCompra.toString(),
            producto.precioVenta.toString(),
            producto.stockMin.toString(),
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
                                {/* Aquí podrías poner un spinner o indicador de carga */}
                                Cargando...
                            </TableCell>
                        </TableRow>
                    ) : filteredProductos.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center">
                                No hay productos para mostrar
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredProductos.map((producto) => (
                            <TableRow key={producto.id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage className="rounded-full size-8" src={producto.urlFoto + "?timestamp=" + Date.now()} alt={producto.nombreComercial} loading="lazy" />
                                        <AvatarFallback>
                                            {producto.nombreComercial.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{producto.nombreComercial}</TableCell>
                                <TableCell>{producto.formaFarmaceutica}</TableCell>
                                <TableCell>{producto.laboratorio ?? ""}</TableCell>
                                <TableCell align="right">{producto.precioCompra.toFixed(2)}</TableCell>
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
                                    align="right"
                                    className={
                                        producto.stock < producto.stockMin
                                            ? "text-red-600 font-semibold"
                                            : producto.stock === producto.stockMin
                                                ? "text-yellow-600 font-semibold"
                                                : "text-green-600 font-semibold"
                                    }
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
        </div>
    );
}
