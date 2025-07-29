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
import { useLaboratoriosContext } from "@/context";
import { LaboratorioInfo } from "@/models/laboratorio";
import { MenuAcciones } from "./MenuAcciones";

type TablaLaboratoriosProps = {
    laboratorios: LaboratorioInfo[];
    loading: boolean;   
    filter?: string;
};

export function TablaLaboratorios({ laboratorios, loading, filter }: TablaLaboratoriosProps) {
    const [sortedData, setSortedData] = useState<LaboratorioInfo[]>([]);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const { laboratorioAction } = useLaboratoriosContext();

    useEffect(() => {
        let updated = [...laboratorios];

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
    }, [laboratorios, laboratorioAction]);

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
            setSortedData(laboratorios);
            setSortKey(null);
            setSortDirection("asc");
            return;
        }

        const sorted = [...laboratorios].sort((a, b) => {
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
        { label: "ID", key: "id", sort: true },
        { label: "Nombre", key: "nombre", sort: true },
        { label: "Fecha registro", key: "createdAt", sort: true },
        { label: "Estado", key: "estado", sort: true },
        { label: "Acciones", key: "acciones", sort: false },
    ];

    const searchText = filter?.toLowerCase();
    const filteredLaboratorios = sortedData.filter((lab) =>
        [
            lab.id,
            lab.nombre,
            dateFormat(lab.createdAt),
            lab.estado,
            lab.direccion
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
                        filteredLaboratorios.map((lab) => (
                            <TableRow key={lab.id}>
                                <TableCell>{lab.id}</TableCell>
                                <TableCell>{lab.nombre}</TableCell>
                                <TableCell>{dateFormat(lab.createdAt)}</TableCell>
                                <TableCell>
                                    <Badge variant={lab.estado === "Activo" ? "default" : "destructive"}>
                                        {lab.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <MenuAcciones laboratorioId={lab.id} deletedAt={lab.deletedAt!! ?? null} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
