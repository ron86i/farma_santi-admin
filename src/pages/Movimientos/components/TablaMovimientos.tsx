import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getNestedValue } from "@/utils";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { MovimientoInfo } from "@/models";
import dateFormat from "dateformat";

type TablaMovimientosProps = {
  list: MovimientoInfo[];
  loading: boolean;
  filter?: string;
};

export function TablaMovimientos({ list, loading, filter }: TablaMovimientosProps) {
  const [sortedData, setSortedData] = useState<MovimientoInfo[]>([]);
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

    setSortedData(updated);
  }, [list, sortKey, sortDirection]);

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
    { label: "Código", key: "codigo", sort: true },
    { label: "Estado", key: "estado", sort: true },
    { label: "Fecha y hora", key: "fecha", sort: true },
    { label: "Tipo", key: "tipo", sort: true },
    { label: "Usuario", key: "usuario.username", sort: true }
  ];

  const searchText = filter?.toLowerCase();
  const filteredMovimientos = sortedData.filter((item) =>
    [item.codigo, item.estado, item.tipo, item.usuario?.username]
      .filter(Boolean)
      .some((field) =>
        field?.toString().toLowerCase().includes(searchText ?? "")
      )
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
                Cargando...
              </TableCell>
            </TableRow>
          ) : (
            filteredMovimientos.map((item) => (
              <TableRow key={`${item.tipo}-${item.id}`}>
                <TableCell>{item.codigo}</TableCell>
                <TableCell>
                  <EstadoBadge estado={item.estado} />
                </TableCell>
                <TableCell>{dateFormat(item.fecha,"dd/mm/yyyy hh:mm:ss", true)}</TableCell>
                <TableCell>
                  <TipoBadge tipo={item.tipo} />
                </TableCell>
                <TableCell>{item.usuario?.username}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Badge para estado: Pendiente, Completado, Anulado, Realizada
function EstadoBadge({ estado }: { estado: string }) {
  const estadoMap: Record<string, { label: string; color: string }> = {
    Pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-900" },
    Completado: { label: "Completado", color: "bg-green-100 text-green-800 dark:bg-green-300 dark:text-green-900" },
    Anulado: { label: "Anulado", color: "bg-red-100 text-red-800 dark:bg-red-300 dark:text-red-900" },
    Realizada: { label: "Realizada", color: "bg-green-100 text-green-800 dark:bg-green-300 dark:text-green-900" }
  };

  const estadoData = estadoMap[estado] ?? {
    label: estado,
    color: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded ${estadoData.color}`}>
      {estadoData.label}
    </span>
  );
}

// Badge para tipo: Compra o Venta
function TipoBadge({ tipo }: { tipo: string }) {
  const tipoMap: Record<string, { label: string; color: string }> = {
    COMPRA: { label: "COMPRA", color: "bg-blue-100 text-blue-800 dark:bg-blue-300 dark:text-blue-900" },
    VENTA: { label: "VENTA", color: "bg-purple-100 text-purple-800 dark:bg-purple-300 dark:text-purple-900" }
  };

  const tipoData = tipoMap[tipo] ?? {
    label: tipo,
    color: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded ${tipoData.color}`}>
      {tipoData.label}
    </span>
  );
}
