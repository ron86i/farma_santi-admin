import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@/hooks";
import { obtenerListaLoteProductos } from "@/services";
import { baseUrl } from "@/services/axiosClient"; 
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ShieldAlert, ShieldCheck, Box, Clock, Download, Loader2 } from "lucide-react";
import { NavBar } from "./components/NavBar"; 

export function ControlVencimientos() {
    const { data: dataLista, fetch: fetchLista, loading } = useQuery(obtenerListaLoteProductos);
    const [downloading, setDownloading] = useState(false);
    
    // Estado para controlar la pestaña activa y disparar la consulta
    const [activeTab, setActiveTab] = useState("proximos");

    // Lógica para obtener las fechas según la pestaña activa
    const getDatesForTab = (tab: string) => {
        const hoy = new Date();
        const tresMeses = new Date();
        tresMeses.setMonth(tresMeses.getMonth() + 3);

        let fechaInicio = "";
        let fechaFin = "";

        if (tab === "vencidos") {
            // Vencidos: Todo lo anterior a HOY (ayer hacia atrás)
            // Backend usa <= fechaFin, así que restamos 1 día a hoy
            const ayer = new Date(hoy);
            ayer.setDate(ayer.getDate() - 1);
            fechaFin = ayer.toISOString().split("T")[0];
        } else if (tab === "proximos") {
            // Próximos: Desde HOY hasta 3 meses
            fechaInicio = hoy.toISOString().split("T")[0];
            fechaFin = tresMeses.toISOString().split("T")[0];
        } else if (tab === "vigentes") {
            // Vigentes: Desde 3 meses + 1 día en adelante
            const inicioVigente = new Date(tresMeses);
            inicioVigente.setDate(inicioVigente.getDate() + 1);
            fechaInicio = inicioVigente.toISOString().split("T")[0];
        }

        return { fechaInicio, fechaFin };
    };

    // Efecto: Cuando cambia la pestaña, consultamos al backend con las fechas automáticas
    useEffect(() => {
        const { fechaInicio, fechaFin } = getDatesForTab(activeTab);
        
        const params = new URLSearchParams();
        if (fechaInicio) params.append("fechaInicio", fechaInicio);
        if (fechaFin) params.append("fechaFin", fechaFin);

        fetchLista(params.toString());
    }, [activeTab]);

    // Clasificación visual (aunque el backend ya filtra, esto agrupa por producto)
    const datos = useMemo(() => {
        // Inicializamos estructura
        const result = { 
            porVencer: [] as any[], 
            vencidos: [] as any[], 
            vigentes: [] as any[], 
            counts: { porVencer: 0, vencidos: 0, vigentes: 0 } 
        };

        if (!dataLista) return result;

        const hoy = new Date();
        const tresMeses = new Date();
        tresMeses.setMonth(tresMeses.getMonth() + 3);

        const rawPorVencer: any[] = [];
        const rawVencidos: any[] = [];
        const rawVigentes: any[] = [];

        // Clasificamos lo que llega del backend para asignarlo a la lista correcta en UI
        dataLista.forEach((lote: any) => {
            if (Number(lote.stock) <= 0) return;

            const fechaVenc = new Date(lote.fechaVencimiento);
            const fechaVencSinHora = new Date(fechaVenc.getFullYear(), fechaVenc.getMonth(), fechaVenc.getDate());
            const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

            if (fechaVencSinHora < hoySinHora) {
                rawVencidos.push(lote);
            } else if (fechaVencSinHora >= hoySinHora && fechaVenc <= tresMeses) {
                rawPorVencer.push(lote);
            } else {
                rawVigentes.push(lote);
            }
        });

        const agrupar = (lista: any[]) => {
            const map = lista.reduce((acc: any, lote: any) => {
                const pid = lote.producto?.id || "ukn";
                if (!acc[pid]) acc[pid] = { producto: lote.producto, lotes: [] };
                acc[pid].lotes.push(lote);
                return acc;
            }, {});
            return Object.values(map);
        };

        // Asignamos
        result.porVencer = agrupar(rawPorVencer);
        result.vencidos = agrupar(rawVencidos);
        result.vigentes = agrupar(rawVigentes);

        // Actualizamos contadores (Nota: Solo mostrará > 0 en la pestaña activa por el filtrado backend)
        result.counts.porVencer = rawPorVencer.length;
        result.counts.vencidos = rawVencidos.length;
        result.counts.vigentes = rawVigentes.length;

        return result;
    }, [dataLista]);

    const handleExport = async () => {
        try {
            setDownloading(true);
            
            // Usamos la misma lógica de fechas de la pestaña activa para el reporte
            const { fechaInicio, fechaFin } = getDatesForTab(activeTab);
            const query = new URLSearchParams();
            if (fechaInicio) query.append("fechaInicio", fechaInicio);
            if (fechaFin) query.append("fechaFin", fechaFin);

            const url = `${baseUrl}/reportes/lotes-productos?${query.toString()}`; 
            
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
            link.download = `reporte-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);

        } catch (err) {
            console.error("Error al exportar reporte:", err);
        } finally {
            setDownloading(false);
        }
    };

    if (loading && !dataLista) return <LoadingSkeleton />;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 p-1">

            {/* NavBar */}
           <NavBar/>

            {/* Toolbar solo con Exportar (Filtros automáticos por pestaña) */}
            <div className="flex justify-end bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2" 
                    onClick={handleExport}
                    disabled={downloading}
                >
                    {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {downloading ? "Generando..." : "Exportar Lista Actual"}
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Tabs List */}
                <TabsList className="grid w-full grid-cols-3 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg">
                    <TabItem
                        value="proximos"
                        label="Por Vencer"
                        count={datos.counts.porVencer}
                        icon={<Clock className="w-4 h-4" />}
                        activeClass="data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-500"
                    />
                    <TabItem
                        value="vencidos"
                        label="Vencidos"
                        count={datos.counts.vencidos}
                        icon={<ShieldAlert className="w-4 h-4" />}
                        activeClass="data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-500"
                    />
                    <TabItem
                        value="vigentes"
                        label="Vigentes"
                        count={datos.counts.vigentes}
                        icon={<ShieldCheck className="w-4 h-4" />}
                        activeClass="data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-500"
                    />
                </TabsList>

                <div className="mt-6">
                    {/* Usamos el contenido según la pestaña activa.
                      Como el backend filtra, los datos llegarán solo al grupo correspondiente,
                      los otros grupos estarán vacíos, por lo que 'ListaTarjetas' manejará el estado vacío correctamente.
                    */}
                    <TabsContent value="proximos">
                        <ListaTarjetas
                            grupos={datos.porVencer}
                            colorAccent="amber"
                            titulo="Próximos a vencer (3 meses)"
                            mensajeVacio={loading ? "Cargando..." : "No hay vencimientos próximos."}
                        />
                    </TabsContent>
                    <TabsContent value="vencidos">
                        <ListaTarjetas
                            grupos={datos.vencidos}
                            colorAccent="rose"
                            titulo="Lotes Vencidos"
                            mensajeVacio={loading ? "Cargando..." : "No hay lotes vencidos."}
                        />
                    </TabsContent>
                    <TabsContent value="vigentes">
                        <ListaTarjetas
                            grupos={datos.vigentes}
                            colorAccent="emerald"
                            titulo="Stock Saludable"
                            mensajeVacio={loading ? "Cargando..." : "No hay stock a largo plazo."}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

function TabItem({ value, label, count, icon, activeClass }: any) {
    return (
        <TabsTrigger
            value={value}
            className={`
                flex items-center gap-2 transition-all duration-200
                data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 
                data-[state=active]:shadow-sm
                ${activeClass}
            `}
        >
            {icon}
            <span className="font-medium">{label}</span>
            {/* Solo mostramos el contador si tiene datos */}
            {count > 0 && (
                <span className="ml-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 px-1.5 text-[10px] font-bold text-neutral-700 dark:text-neutral-200">
                    {count}
                </span>
            )}
        </TabsTrigger>
    );
}

function ListaTarjetas({ grupos, colorAccent, titulo, mensajeVacio }: any) {
    if (!grupos?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/20">
                <Box className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm font-medium">{mensajeVacio}</p>
            </div>
        );
    }

    const styles: any = {
        amber: { border: "border-l-amber-500", text: "text-amber-600 dark:text-amber-500", badge: "border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-400" },
        rose: { border: "border-l-rose-500", text: "text-rose-600 dark:text-rose-500", badge: "border-rose-200 text-rose-700 dark:border-rose-900 dark:text-rose-400" },
        emerald: { border: "border-l-emerald-500", text: "text-emerald-600 dark:text-emerald-500", badge: "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400" }
    };

    const style = styles[colorAccent];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {titulo}
                </h3>
            </div>

            <div className="grid gap-4">
                {grupos.map((grupo: any, idx: number) => (
                    <Card
                        key={idx}
                        className={`
                            overflow-hidden border-l-[3px] 
                            bg-card text-card-foreground shadow-sm
                            hover:shadow-md transition-shadow duration-200
                            dark:bg-neutral-950
                            ${style.border}
                        `}
                    >
                        <CardContent className="p-5">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="md:w-1/3">
                                    <h4 className="text-base font-bold text-foreground">
                                        {grupo.producto?.nombreComercial || "Sin Nombre"}
                                    </h4>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="text-xs font-normal text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200">
                                            {grupo.producto?.laboratorio}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center">
                                            {grupo.producto?.formaFarmaceutica}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="rounded-md border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                        {grupo.lotes.map((lote: any, i: number) => (
                                            <div
                                                key={lote.id}
                                                className={`
                                                    flex items-center justify-between p-3 
                                                    ${i !== grupo.lotes.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''}
                                                `}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-0.5">LOTE</span>
                                                    <span className="text-sm font-medium text-foreground">{lote.lote}</span>
                                                </div>

                                                <div className="flex flex-col text-right mx-4">
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">STOCK</span>
                                                    <span className="text-sm font-medium text-foreground">{lote.stock}</span>
                                                </div>

                                                <div className="flex flex-col items-end min-w-[80px]">
                                                    <div className={`flex items-center gap-1 text-xs font-bold ${style.text}`}>
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(lote.fechaVencimiento).toLocaleDateString("es-BO", { 
                                                            day: 'numeric',
                                                            month: 'short', 
                                                            year: 'numeric' 
                                                        })}
                                                    </div>
                                                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                                                        Vencimiento
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 p-1">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="space-y-4">
                <div className="h-32 w-full bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse border-l-4 border-neutral-300" />
                <div className="h-32 w-full bg-neutral-100 dark:bg-neutral-900 rounded animate-pulse border-l-4 border-neutral-300" />
            </div>
        </div>
    );
}