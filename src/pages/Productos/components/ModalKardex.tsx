import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDownRight, ArrowUpRight, Loader2, Inbox, CalendarClock, Hash, FileText, User, AlertTriangle, Download, Ban } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import dateFormat from "dateformat";
import { MovimientoKardex } from "@/models";
import { obtenerMovimientosKardex, obtenerProductoById } from "@/services";
import { baseUrl } from "@/services/axiosClient";
import { useQuery } from "@/hooks";
import { Badge } from "@/components/ui/badge";

interface ModalKardexProps {
    open: boolean;
    onClose: () => void;
    productoId: string;
}

export function ModalKardex({ open, onClose, productoId }: ModalKardexProps) {
    const [movimientos, setMovimientos] = useState<MovimientoKardex[]>([]);
    const [downloading, setDownloading] = useState(false);

    // Hooks de consulta
    const { fetch: fetchMKs, data: dataMKs, loading: loadingMovimientos } = useQuery(obtenerMovimientosKardex);
    const { fetch: fetchProducto, data: dataProducto, loading: loadingProducto } = useQuery(obtenerProductoById);

    // 1. Efecto para cargar datos al abrir
    useEffect(() => {
        if (open && productoId) {
            const query = `productoId=${productoId}`;
            fetchMKs(query);
            fetchProducto(productoId);
        } else {
            setMovimientos([]);
        }
    }, [open, productoId]);

    // 2. Procesar datos de movimientos
    useEffect(() => {
        if (dataMKs && Array.isArray(dataMKs)) {
            const mappedData: MovimientoKardex[] = dataMKs.map((item: MovimientoKardex) => ({
                idFila: item.idFila,
                productoId: item.productoId,
                loteId: item.loteId,
                codigoLote: item.codigoLote,
                fechaVencimiento: item.fechaVencimiento,
                tipoMovimiento: item.tipoMovimiento,
                fechaMovimiento: item.fechaMovimiento,
                documento: item.documento,
                concepto: item.concepto,
                usuario: item.usuario,
                cantidadEntrada: Number(item.cantidadEntrada || 0),
                cantidadSalida: Number(item.cantidadSalida || 0),
                costoUnitario: Number(item.costoUnitario || 0),
                totalMoneda: Number(item.totalMoneda || 0)
            }));
            setMovimientos(mappedData);
        }
    }, [dataMKs]);

    // 3. Cálculo de saldos y vencidos
    const { dataConSaldos, stockVencido } = useMemo(() => {
        let saldoAcumulado = 0;
        let vencidos = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizar a medianoche para comparación justa

        const data = movimientos.map((mov) => {
            // Cálculo de saldo general
            if (mov.tipoMovimiento === 'ENTRADA') {
                saldoAcumulado += mov.cantidadEntrada;
            } else {
                saldoAcumulado -= mov.cantidadSalida;
            }

            // Cálculo de stock vencido (acumulado histórico de lotes expirados)
            if (mov.fechaVencimiento) {
                const fechaVenc = new Date(mov.fechaVencimiento);
                if (fechaVenc < today) {
                    if (mov.tipoMovimiento === 'ENTRADA') {
                        vencidos += mov.cantidadEntrada;
                    } else {
                        vencidos -= mov.cantidadSalida;
                    }
                }
            }

            return { ...mov, saldoActual: saldoAcumulado };
        });

        return { dataConSaldos: data, stockVencido: vencidos };
    }, [movimientos]);

    // 4. Lógica de Exportación
    const handleExport = async () => {
        if (!productoId) return;

        try {
            setDownloading(true);
            const url = `${baseUrl}/reportes/kardex/${productoId}`;

            const response = await axios.get(url, {
                responseType: "blob",
                timeout: 30000,
                headers: { Accept: "application/pdf" },
                withCredentials: true,
            });

            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const downloadUrl = URL.createObjectURL(pdfBlob);

            const link = document.createElement("a");
            link.href = downloadUrl;
            // Usamos ID en lugar de código para el nombre del archivo
            link.download = `kardex-${dataProducto?.id || productoId}.pdf`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);

        } catch (err) {
            console.error("Error al exportar kardex:", err);
        } finally {
            setDownloading(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-[95vw] lg:max-w-[1000px] h-[90vh] flex flex-col p-0 gap-0 bg-white dark:bg-neutral-950 overflow-hidden border-neutral-200 dark:border-neutral-800 shadow-2xl">

                {/* --- HEADER --- */}
                <DialogHeader className="px-6 py-5 border-b bg-neutral-50 dark:bg-neutral-900/50 flex-shrink-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1.5 w-full">

                            {/* Título, Badge y Botón Exportar */}
                            <div className="flex items-center justify-between md:justify-start gap-4">
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                        Kardex Físico
                                    </DialogTitle>
                                    {/* Cambiado a ID en lugar de código */}
                                    <Badge variant="outline" className="ml-2 font-mono text-xs">
                                        {dataProducto?.id || productoId || "..."}
                                    </Badge>
                                </div>

                                {/* Botón Exportar */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 bg-white dark:bg-neutral-900 ml-auto md:ml-4"
                                    onClick={handleExport}
                                    disabled={downloading || loadingMovimientos}
                                >
                                    {downloading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Download className="h-3.5 w-3.5" />
                                    )}
                                    <span className="hidden sm:inline text-xs">
                                        {downloading ? "Generando..." : "Descargar PDF"}
                                    </span>
                                </Button>
                            </div>

                            {/* Información del Producto */}
                            {loadingProducto ? (
                                <div className="space-y-2 animate-pulse mt-1">
                                    <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                                    <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                                </div>
                            ) : dataProducto ? (
                                <div className="space-y-1">
                                    <h4 className="text-base font-medium text-primary/90">
                                        {dataProducto.nombreComercial}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        <span className="flex items-center gap-1">
                                            <Inbox className="w-3 h-3" />
                                            {dataProducto.laboratorio?.nombre || "Laboratorio desc."}
                                        </span>
                                        <span className="w-px h-3 bg-neutral-300 dark:bg-neutral-700 hidden sm:block" />
                                        <span>
                                            {dataProducto.formaFarmaceutica?.nombre || "Forma desc."}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-400">Información del producto no disponible</p>
                            )}
                        </div>

                        {/* Resumen de Stock y Vencidos */}
                        <div className="hidden sm:flex items-end gap-6 min-w-[200px]">
                            {/* Indicador de Vencidos */}
                            {stockVencido > 0 && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-red-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                                        <Ban className="w-3 h-3" /> Vencidos
                                    </span>
                                    <span className="text-xl font-mono font-bold text-red-600 dark:text-red-400">
                                        {stockVencido}
                                    </span>
                                </div>
                            )}

                            {/* Indicador de Stock Actual */}
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Stock Actual</span>
                                <span className={`text-2xl font-mono font-bold ${Number(dataProducto?.stock || 0) > 0 ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400"}`}>
                                    {loadingProducto
                                        ? "..."
                                        : (dataProducto?.stock !== undefined ? dataProducto.stock : (dataConSaldos.length > 0 ? dataConSaldos[dataConSaldos.length - 1].saldoActual : 0))
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* --- TABLA --- */}
                <div className="flex-1 overflow-hidden relative bg-white dark:bg-neutral-950">
                    <div className="absolute inset-0 overflow-auto">
                        <Table className="min-w-[900px] w-full border-collapse">
                            <TableHeader className="sticky top-0 z-20 shadow-sm bg-white dark:bg-neutral-950 ring-1 ring-neutral-200 dark:ring-neutral-800">
                                <TableRow className="hover:bg-transparent border-b border-neutral-200 dark:border-neutral-800">
                                    <TableHead className="w-[140px] pl-6 h-11 bg-neutral-50/80 dark:bg-neutral-900/80">Fecha / Hora</TableHead>
                                    <TableHead className="w-[180px] bg-neutral-50/80 dark:bg-neutral-900/80">Concepto / Doc.</TableHead>
                                    <TableHead className="w-[140px] bg-neutral-50/80 dark:bg-neutral-900/80">Lote</TableHead>
                                    <TableHead className="w-[100px] bg-neutral-50/80 dark:bg-neutral-900/80">Usuario</TableHead>

                                    {/* Columnas Numéricas */}
                                    <TableHead className="text-right w-[100px] bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-l border-emerald-100 dark:border-emerald-900/30">
                                        Entrada
                                    </TableHead>
                                    <TableHead className="text-right w-[100px] bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-l border-rose-100 dark:border-rose-900/30">
                                        Salida
                                    </TableHead>
                                    <TableHead className="text-right w-[100px] bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 font-bold border-l border-neutral-200 dark:border-neutral-800 pr-6">
                                        Saldo
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loadingMovimientos ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 text-neutral-500">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-sm font-medium">Cargando movimientos...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : dataConSaldos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
                                                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-full">
                                                    <Inbox className="h-8 w-8" />
                                                </div>
                                                <p className="text-sm">No hay movimientos registrados para este producto.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    dataConSaldos.map((mov, idx) => (
                                        <TableRow
                                            key={idx}
                                            className="group border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition-colors"
                                        >
                                            {/* Fecha */}
                                            <TableCell className="pl-6 py-3">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-200 font-medium text-xs sm:text-sm">
                                                        <CalendarClock className="w-3.5 h-3.5 text-neutral-400" />
                                                        {dateFormat(mov.fechaMovimiento, "dd/mm/yy")}
                                                    </div>
                                                    <span className="text-[10px] text-neutral-400 pl-5 font-mono">
                                                        {dateFormat(mov.fechaMovimiento, "HH:MM")}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Concepto */}
                                            <TableCell className="py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                                                        <FileText className="w-3 h-3 text-neutral-400" />
                                                        {mov.documento || "S/D"}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide truncate max-w-[150px]" title={mov.concepto}>
                                                        {mov.concepto}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Lote */}
                                            <TableCell className="py-3">
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                                                        <Hash className="w-3 h-3 opacity-50" />
                                                        {mov.codigoLote}
                                                    </div>
                                                    {mov.fechaVencimiento && (
                                                        <span className="text-[10px] text-neutral-400 ml-0.5 flex items-center gap-1">
                                                            Vence:
                                                            <span className={new Date(mov.fechaVencimiento) < new Date() ? "text-red-500 font-bold flex items-center" : ""}>
                                                                {dateFormat(mov.fechaVencimiento, "mm/yy")}
                                                                {new Date(mov.fechaVencimiento) < new Date() && (
                                                                    <AlertTriangle className="w-3 h-3 ml-1" />
                                                                )}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Usuario */}
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                                                    <User className="w-3 h-3 opacity-50" />
                                                    <span className="capitalize truncate max-w-[80px]" title={mov.usuario}>
                                                        {mov.usuario?.split(' ')[0].toLowerCase()}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Entrada */}
                                            <TableCell className="text-right font-mono text-sm py-3 bg-emerald-50/20 dark:bg-emerald-950/10 border-l border-neutral-100 dark:border-neutral-800 group-hover:bg-emerald-50/40 dark:group-hover:bg-emerald-900/20 transition-colors">
                                                {mov.cantidadEntrada > 0 ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                                                        +{mov.cantidadEntrada}
                                                        <ArrowDownRight className="w-3 h-3 opacity-50" />
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-300 dark:text-neutral-700">-</span>
                                                )}
                                            </TableCell>

                                            {/* Salida */}
                                            <TableCell className="text-right font-mono text-sm py-3 bg-rose-50/20 dark:bg-rose-950/10 border-l border-neutral-100 dark:border-neutral-800 group-hover:bg-rose-50/40 dark:group-hover:bg-rose-900/20 transition-colors">
                                                {mov.cantidadSalida > 0 ? (
                                                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-end gap-1">
                                                        -{mov.cantidadSalida}
                                                        <ArrowUpRight className="w-3 h-3 opacity-50" />
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-300 dark:text-neutral-700">-</span>
                                                )}
                                            </TableCell>

                                            {/* Saldo */}
                                            <TableCell className="text-right font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100 py-3 pr-6 bg-neutral-50/50 dark:bg-neutral-900/20 border-l border-neutral-200 dark:border-neutral-800">
                                                {mov.saldoActual}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex justify-between items-center flex-shrink-0">
                    <p className="text-xs text-neutral-400 hidden sm:block">
                        Mostrando {dataConSaldos.length} movimientos
                    </p>
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cerrar
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}