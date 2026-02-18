import { useEffect, useMemo, useRef, useState } from "react";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { useQuery } from "@/hooks";
import { obtenerListaCompras, obtenerListaVentas } from "@/services";
import { ShoppingCart, Package, TrendingUp, TrendingDown, DollarSign,CreditCard,BarChart3,Image as ImageIcon,Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; 
import { obtenerTopProductos, obtenerEstadisticasDashboard } from "@/services/statService"; 

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,PointElement, LineElement, LineController} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2'; // Importamos Line

// Componentes necesarios para barras y líneas
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement, 
  LineElement,  
  LineController
);

export function Dashboard() {
  
  // Referencia para el gráfico
  const chartRef = useRef<any>(null);
  
  // Estados locales
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Consultas de datos
  const { fetch: fetchVentas, data: dataVentas, loading: loadingVentas } = useQuery(obtenerListaVentas);
  const { fetch: fetchCompras, data: dataCompras, loading: loadingCompras } = useQuery(obtenerListaCompras);
  const { fetch: fetchTopProductos, data: dataTopProductos, loading: loadingTopProductos } = useQuery(obtenerTopProductos);
  const { fetch: fetchStats, data: dataStats, loading: loadingStats } = useQuery(obtenerEstadisticasDashboard);

  useEffect(() => {
    fetchVentas("limit=5");
    fetchCompras("limit=5");
    fetchTopProductos();
    fetchStats(); 
  }, []);

  // --- LÓGICA DE EXPORTACIÓN ---

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-BO", {
        style: "currency",
        currency: "BOB",
        minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // --- PREPARACIÓN DE DATOS PARA EL GRÁFICO DE LÍNEA (Ventas Diarias) ---
  const lineData = useMemo(() => {
    if (!dataStats || !dataStats.ventasDiarias || dataStats.ventasDiarias.length === 0) return null;

    // Ordenar las ventas por fecha ascendente para la gráfica de línea
    const sortedSales = [...dataStats.ventasDiarias].sort((a, b) => 
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    return {
        labels: sortedSales.map(d => new Date(d.fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })),
        datasets: [{
            label: 'Ventas Diarias (Bs)',
            data: sortedSales.map(d => d.total),
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500 light
            borderColor: '#3b82f6', // blue-500
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
            borderWidth: 2,
        }],
    };
  }, [dataStats]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
            callbacks: {
                label: (context: any) => ` Total: ${formatMoney(context.raw)}`,
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: { size: 10 } },
            title: { 
                display: true, 
                text: 'Últimos días', 
                font: { 
                    size: 11, 
                    weight: 'bold' as const // CORRECCIÓN: 'as const' soluciona el error de tipado
                } 
            }
        },
        y: {
            beginAtZero: true,
            grid: { color: '#e5e7eb', borderDash: [5, 5] },
            ticks: { 
                font: { size: 10 },
                callback: (value: any) => formatMoney(value).split(' ')[0] // Mostrar solo el número en el eje Y
            },
        }
    }
  };


  // --- PREPARACIÓN DE DATOS PARA EL GRÁFICO DE BARRAS (Top Productos) ---
  const barData = useMemo(() => {
    if (!dataTopProductos) return null;

    return {
        labels: dataTopProductos.map((p: any) => p.nombreComercial),
        datasets: [
            {
                label: 'Unidades Vendidas',
                data: dataTopProductos.map((p: any) => p.cantidad),
                backgroundColor: 'rgba(16, 185, 129, 0.8)', // emerald-500
                borderColor: '#10b981', 
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
            },
        ],
    };
  }, [dataTopProductos]);

  const chartOptions = {
    indexAxis: 'y' as const, 
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: any, elements: any) => {
        if (elements.length > 0 && dataTopProductos) {
            const index = elements[0].index;
            const producto = dataTopProductos[index];
            if (producto) {
                setSelectedProduct(producto);
            }
        }
    },
    onHover: (event: any, chartElement: any) => {
        event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1f2937',
            padding: 12,
            callbacks: {
                label: (ctx: any) => ` ${ctx.formattedValue} unidades (Click para ver)`
            }
        }
    },
    scales: {
        x: { beginAtZero: true, grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: '#f3f4f6', drawBorder: false }, ticks: { font: { size: 11 }, autoSkip: false } }
    }
  };


  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Panel Principal</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Resumen general de movimientos y actividad.</p>
        </div>

      </div>

      {/* --- KPI CARDS (Usando datos de dataStats) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loadingStats ? "..." : formatMoney(dataStats?.totalVentas ?? 0)}
            </div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" /> 
                <span className="text-emerald-600 font-medium">Histórico</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos / Compras</CardTitle>
            <CreditCard className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loadingStats ? "..." : formatMoney(dataStats?.totalCompras ?? 0)}
            </div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center">
                <TrendingDown className="mr-1 h-3 w-3 text-rose-500" />
                <span className="text-neutral-500 font-medium">Histórico</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loadingStats ? "..." : dataStats?.cantidadVentas ?? 0}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Total realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Compras</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loadingStats ? "..." : dataStats?.cantidadCompras ?? 0}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Total realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* --- GRÁFICA DE TENDENCIA DIARIA (LÍNEA) --- */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">
                Tendencia de Ingresos
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent className="h-[300px] p-4 pt-0">
            {loadingStats ? (
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : lineData ? (
                <Line data={lineData} options={lineChartOptions} />
            ) : (
                <p className="text-sm text-neutral-400 text-center pt-10">Datos de ventas diarias no disponibles.</p>
            )}
        </CardContent>
      </Card>


      {/* --- SECCIÓN INFERIOR --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 items-start">
        
        {/* Ventas Recientes */}
        <Card className="col-span-full lg:col-span-3 h-full">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimos movimientos de salida.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingVentas ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-10 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"/>)}
                </div>
            ) : (
                <div className="space-y-4">
                    {(dataVentas || []).map((venta: any, i: number) => (
                        <TransactionItem key={i} tipo="venta" data={venta} formatMoney={formatMoney} />
                    ))}
                    {(!dataVentas?.length) && <p className="text-sm text-neutral-500 text-center">Sin datos recientes.</p>}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Compras Recientes */}
        <Card className="col-span-full md:col-span-1 lg:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Compras Recientes</CardTitle>
            <CardDescription>Últimas entradas.</CardDescription>
          </CardHeader>
          <CardContent>
             {loadingCompras ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-10 w-full bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"/>)}
                </div>
            ) : (
                <div className="space-y-4">
                    {(dataCompras || []).map((compra: any, i: number) => (
                         <TransactionItem key={i} tipo="compra" data={compra} formatMoney={formatMoney} />
                    ))}
                     {(!dataCompras?.length) && <p className="text-sm text-neutral-500 text-center">Sin datos recientes.</p>}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico Top Productos */}
        <Card className="col-span-full md:col-span-1 lg:col-span-2 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                    <BarChart3 className="w-4 h-4" />
                    Top Productos
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center min-h-[300px] p-4">
                {loadingTopProductos ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full border-2 border-t-emerald-500 animate-spin" />
                    </div>
                ) : barData ? (
                    <div className="w-full h-[300px]">
                        <Bar ref={chartRef} data={barData} options={chartOptions} />
                    </div>
                ) : (
                    <p className="text-sm text-neutral-400">Sin estadísticas.</p>
                )}
            </CardContent>
        </Card>

      </div>

      {/* --- MODAL DETALLE PRODUCTO --- */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">
                    {selectedProduct?.nombreComercial}
                </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative w-full aspect-square max-h-[250px] bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                    {selectedProduct?.fotos && selectedProduct.fotos.length > 0 ? (
                        <img 
                            src={selectedProduct.fotos[0]} 
                            alt={selectedProduct.nombreComercial} 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center text-neutral-400 gap-2">
                            <ImageIcon className="w-12 h-12 opacity-50" />
                            <span className="text-xs">Sin imagen</span>
                        </div>
                    )}
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg w-full text-center border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedProduct?.cantidad}
                    </p>
                    <p className="text-xs uppercase font-semibold text-emerald-700/70 dark:text-emerald-300/70">Unidades Vendidas</p>
                </div>
                <div className="text-xs text-neutral-400 font-mono">ID: {selectedProduct?.id}</div>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Subcomponentes (TransactionItem, EstadoBadge)
function TransactionItem({ tipo, data, formatMoney }: any) {
    const isVenta = tipo === 'venta';
    const isAnulado = data.estado === 'Anulado';
    let Icon = isVenta ? ShoppingCart : Package;
    let iconBg = isVenta ? "bg-blue-100 dark:bg-blue-900/30" : "bg-purple-100 dark:bg-purple-900/30";
    let iconColor = isVenta ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400";

    if (isAnulado) {
        iconBg = "bg-red-100 dark:bg-red-900/30";
        iconColor = "text-red-600 dark:text-red-400";
    }

    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <div className="space-y-0.5 min-w-0">
                    <p className="font-medium truncate max-w-[150px] text-neutral-900 dark:text-neutral-100">
                        {isVenta ? data.cliente?.razonSocial || "Cliente Final" : data.laboratorio?.nombre || "Proveedor"}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                        {new Date(data.fecha).toLocaleDateString("es-BO")} • <span className="font-mono">{data.codigo || "S/C"}</span>
                    </p>
                </div>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
                <div className={`font-medium ${isAnulado ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                    {isVenta ? "+" : "-"}{formatMoney(data.total)}
                </div>
                <EstadoBadge estado={data.estado} anulado={data.anulado} />
            </div>
        </div>
    );
}

function EstadoBadge({ estado, anulado }: any) {
    if (estado === 'Anulado' || anulado) {
        return <span className="inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/20 dark:text-red-400 ml-auto w-fit mt-0.5">Anulado</span>
    }
    if (estado === 'Pendiente') {
        return <span className="inline-flex items-center rounded-full bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400 ml-auto w-fit mt-0.5">Pendiente</span>
    }
    return <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 ml-auto w-fit mt-0.5">OK</span>
}