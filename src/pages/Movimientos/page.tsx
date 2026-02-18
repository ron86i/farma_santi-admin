import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router"; 
import axios from "axios"; // Importamos axios directamente para manejo de blobs
import { useDebounce, useQuery } from "@/hooks";
import { obtenerListaMovimientos } from "@/services";
// Asumo que esta importación existe basada en tu ejemplo anterior. 
// Si 'baseUrl' no se exporta, puedes usar 'import { apiClient } from "@/services"' y 'apiClient.defaults.baseURL'
import { baseUrl } from "@/services/axiosClient"; 

import { NavBar } from "./components/NavBar";
import { TablaMovimientos } from "./components/TablaMovimientos";
import { SearchInput } from "@/components"; 
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Filter, Download, Wallet, Loader2 } from "lucide-react";

export function Movimientos() {
  const { fetch: fetchMovimientos, data: list, loading } = useQuery(obtenerListaMovimientos);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado para controlar la carga de la exportación
  const [downloading, setDownloading] = useState(false);

  // 1. Obtenemos la fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // 2. Leemos los filtros
  const filtroTexto = searchParams.get("buscar") ?? "";
  const filtroTipo = searchParams.get("tipo") ?? "todos";
  const filtroInicio = searchParams.get("fechaInicio") ?? today;
  const filtroFin = searchParams.get("fechaFin") ?? today;
  
  const filtroDebounced = useDebounce(filtroTexto, 400);

  // 3. Efecto para cargar datos
  useEffect(() => {
    const params = new URLSearchParams();
    if (filtroInicio) params.append("fechaInicio", filtroInicio);
    if (filtroFin) params.append("fechaFin", filtroFin);
    params.append("tipo", filtroTipo === "todos" ? "" : filtroTipo);
    if (filtroDebounced) params.append("buscar", filtroDebounced);

    fetchMovimientos(params.toString());
  }, [filtroInicio, filtroFin, filtroTipo, filtroDebounced]); 

  // --- LÓGICA DE EXPORTACIÓN ---
  const handleExport = async () => {
    try {
        setDownloading(true);

        // 1. Construir URL con los mismos filtros actuales
        const query = new URLSearchParams();
        if (filtroInicio) query.append("fechaInicio", filtroInicio);
        if (filtroFin) query.append("fechaFin", filtroFin);
        // Nota: Asegúrate que tu backend entienda 'todos' o cadena vacía. 
        // Aquí replicamos la lógica del useEffect: si es 'todos', enviamos vacío o lo omitimos según tu API.
        if (filtroTipo && filtroTipo !== "todos") query.append("tipo", filtroTipo);
        if (filtroDebounced) query.append("buscar", filtroDebounced);

        // Usamos la ruta indicada concatenada con la Base URL
        // CORRECCIÓN: Apuntamos a /reportes/movimientos según la configuración del backend
        const url = `${baseUrl}/reportes/movimientos?${query.toString()}`;

        // 2. Petición Axios Configurada para Blob
        const response = await axios.get(url, {
            responseType: "blob",
            timeout: 30000,
            headers: { 
                Accept: "application/pdf" // Indicamos que queremos el PDF
            },
            withCredentials: true, // Si tu auth depende de cookies
        });

        // 3. Crear Blob y Link de Descarga
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const downloadUrl = URL.createObjectURL(pdfBlob);
        
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `reporte-movimientos-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // 4. Limpieza
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

    } catch (err) {
        console.error("Error al exportar:", err);
        // Aquí podrías mostrar un toast o alerta de error
    } finally {
        setDownloading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value && value !== "todos") {
        newParams.set(key, value);
    } else {
        newParams.delete(key);
    }
    
    if (!newParams.has('fechaInicio')) {
        newParams.set('fechaInicio', filtroInicio);
        newParams.set('fechaFin', filtroFin);
    }

    setSearchParams(newParams);
  };

  const stats = useMemo(() => {
    if (!list) return {
      totalCount: 0, totalMonto: 0,
      entradasCount: 0, entradasMonto: 0,
      salidasCount: 0, salidasMonto: 0
    };

    return list.reduce((acc: any, curr: any) => {
      const monto = Number(curr.total) || 0;

      acc.totalCount++;
      acc.totalMonto += monto;

      if (curr.tipo === 'COMPRA' || curr.tipo === 'ENTRADA') {
        acc.entradasCount++;
        if (curr.estado !== 'Pendiente') {
          acc.entradasMonto += monto;
        }

      } else if (curr.tipo === 'VENTA' || curr.tipo === 'SALIDA') {
        acc.salidasCount++;
        if (curr.estado !== 'Anulado') {
          acc.salidasMonto += monto;
        }
      }

      return acc;
    }, {
      totalCount: 0, totalMonto: 0,
      entradasCount: 0, entradasMonto: 0,
      salidasCount: 0, salidasMonto: 0
    });
  }, [list]);

  return (
    <div className="min-h-screen bg-background pb-10">
      <NavBar />

      <main className="container max-w-6xl mx-auto p-4 space-y-6">

        {/* Tarjetas de Resumen Financiero */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Volumen Total"
            value={stats.totalMonto}
            subtext={`${stats.totalCount} movimientos`}
            icon={<Wallet className="h-4 w-4 text-neutral-500" />}
            color="bg-card"
          />
          <StatCard
            title="Compras / Entradas"
            value={stats.entradasMonto}
            subtext={`${stats.entradasCount} operaciones`}
            icon={<ArrowDownLeft className="h-4 w-4 text-blue-500" />}
            color="bg-blue-50/30 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/50"
          />
          <StatCard
            title="Ventas / Salidas"
            value={stats.salidasMonto}
            subtext={`${stats.salidasCount} operaciones`}
            icon={<ArrowUpRight className="h-4 w-4 text-purple-500" />}
            color="bg-purple-50/30 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900/50"
          />
        </div>

        {/* Barra de Herramientas */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Grupo de Filtros */}
          <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
            
            {/* Buscador */}
            <div className="w-full sm:max-w-[200px]">
              <SearchInput
                value={filtroTexto}
                onChange={(val: string) => updateFilter("buscar", val)}
                placeholder="Buscar..."
              />
            </div>

            {/* Selector de Fechas */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                    <Input 
                        type="date" 
                        value={filtroInicio} 
                        onChange={(e) => updateFilter("fechaInicio", e.target.value)}
                        className="bg-card w-full sm:w-auto"
                        max={today}
                    />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="relative w-full sm:w-auto">
                    <Input 
                        type="date" 
                        value={filtroFin} 
                        onChange={(e) => updateFilter("fechaFin", e.target.value)}
                        className="bg-card w-full sm:w-auto"
                        max={today}
                    />
                </div>
            </div>

            {/* Selector de Tipo */}
            <Select value={filtroTipo} onValueChange={(val) => updateFilter("tipo", val)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-card">
                <Filter className="mr-2 h-3.5 w-3.5 text-neutral-500" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="COMPRA">Compras</SelectItem>
                <SelectItem value="VENTA">Ventas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 hidden sm:flex"
            onClick={handleExport}
            disabled={downloading}
          >
            {downloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Download className="h-3.5 w-3.5" />
            )}
            {downloading ? "Exportando..." : "Exportar"}
          </Button>
        </div>

        {/* Tabla */}
        <TablaMovimientos
          loading={loading}
          list={list ?? []}
          filter={filtroDebounced}
          filterType={filtroTipo}
        />
      </main>
    </div>
  );
}

// Componente de Tarjeta
function StatCard({ title, value, subtext, icon, color }: any) {
  const formattedValue = new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2
  }).format(value);

  return (
    <Card className={`border shadow-sm ${color}`}>
      <CardContent className="p-5 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{formattedValue}</p>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm border border-border">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}