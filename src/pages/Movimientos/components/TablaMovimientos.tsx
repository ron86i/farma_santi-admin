import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getNestedValue } from "@/utils";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Inbox } from "lucide-react";
import { MovimientoInfo } from "@/models"; 
import dateFormat from "dateformat";
import { Button } from "@/components/ui/button";

type TablaMovimientosProps = {
  list: MovimientoInfo[];
  loading: boolean;
  filter?: string;
  filterType?: string;
  pageSize?: number;
};

export function TablaMovimientos({ list, loading, filter, filterType = "todos", pageSize = 10 }: TablaMovimientosProps) {
  const [sortedData, setSortedData] = useState<MovimientoInfo[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Formateador de moneda para Bolivia (Bs)
  const currencyFormatter = new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2
  });

  // Resetear paginación al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, filterType]);

  // Lógica de Ordenamiento
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

  // Columnas: Se agregó 'total'
  const columns = [
    { label: "Código", key: "codigo", sort: true },
    { label: "Tipo", key: "tipo", sort: true },
    { label: "Estado", key: "estado", sort: true },
    { label: "Fecha", key: "fecha", sort: true },
    { label: "Usuario", key: "usuario.username", sort: true },
    { label: "Total", key: "total", sort: true, align: "right" } // Alineado derecha
  ];

  // Filtrado combinado
  const filteredList = sortedData.filter((item) => {
    const matchesType = filterType === "todos" || item.tipo === filterType;
    const searchText = filter?.toLowerCase() ?? "";
    
    const matchesText = [
        item.codigo, 
        item.estado, 
        item.tipo, 
        item.usuario?.username,
        item.total?.toString() // Permite buscar por monto
    ]
      .filter(Boolean)
      .some((field) => field?.toString().toLowerCase().includes(searchText));

    return matchesType && matchesText;
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedList = filteredList.slice(startIndex, startIndex + pageSize);

  return (
    <div className="border rounded-md bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-50">
            {columns.map((col: any) => (
              <TableHead
                key={col.key}
                onClick={col.sort ? () => handleSort(col.key) : undefined}
                className={`
                    select-none font-semibold h-10
                    ${col.sort ? "cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100" : ""}
                    ${col.align === 'right' ? "text-right" : "text-left"}
                `}
              >
                <div className={`flex items-center gap-2 ${col.align === 'right' ? "justify-end" : ""}`}>
                  {col.label}
                  {col.sort && sortKey === col.key && (
                    sortDirection === "asc" 
                        ? <ArrowUp className="h-3.5 w-3.5 text-neutral-500" /> 
                        : <ArrowDown className="h-3.5 w-3.5 text-neutral-500" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-neutral-500">
                <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Cargando...
                </div>
              </TableCell>
            </TableRow>
          ) : filteredList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center text-neutral-500 space-y-2">
                    <Inbox className="h-8 w-8 opacity-50" />
                    <p>No se encontraron movimientos</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedList.map((item) => (
              <TableRow key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                <TableCell className="font-mono text-xs font-medium">{item.codigo}</TableCell>
                <TableCell>
                  <TipoBadge tipo={item.tipo} />
                </TableCell>
                <TableCell>
                  <EstadoBadge estado={item.estado} />
                </TableCell>
                <TableCell className="text-neutral-600 dark:text-neutral-400 text-xs whitespace-nowrap">
                    {dateFormat(item.fecha, "dd mmm yyyy, HH:MM", true)}
                </TableCell>
                <TableCell className="capitalize text-sm text-neutral-600 dark:text-neutral-400">
                    {item.usuario?.username}
                </TableCell>
                <TableCell className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                    {currencyFormatter.format(Number(item.total))}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Footer Paginación */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-neutral-50/30 dark:bg-neutral-900/10">
        <span className="text-xs text-neutral-500">
            {filteredList.length} registros encontrados
        </span>
        <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 text-xs px-2"
            >
              Anterior
            </Button>
            <span className="text-xs font-medium min-w-[3rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 text-xs px-2"
            >
              Siguiente
            </Button>
        </div>
      </div>
    </div>
  );
}

// --- Badges Auxiliares ---
function EstadoBadge({ estado }: { estado: string }) {
    const styles: any = {
        Pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50",
        Completado: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50",
        Realizada: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50",
        Anulado: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50",
    };
    const style = styles[estado] || "bg-neutral-100 text-neutral-600 border-neutral-200";
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${style}`}>{estado}</span>;
}

function TipoBadge({ tipo }: { tipo: string }) {
    const styles: any = {
        COMPRA: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
        ENTRADA: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
        VENTA: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20",
        SALIDA: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20",
        AJUSTE: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
    };
    const style = styles[tipo] || "text-neutral-600 bg-neutral-100";
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${style}`}>{tipo}</span>;
}