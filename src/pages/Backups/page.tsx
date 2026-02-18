import { useEffect, useState } from "react";
import { TablaBackups } from "./components/TablaBackups";
import { Button } from "@/components/ui/button";
import { useQuery } from "@/hooks"; // Tu hook genérico
import { obtenerListaBackups, generarNuevoBackup } from "@/services/backupService";
import { DatabaseBackup, Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner"; // O tu librería de notificaciones preferida
import { NavBar } from "./components/NavBar";

export function Backup() {
    // 1. Hook para listar los backups existentes
    const { fetch: fetchList, data: listaBackups, loading: loadingList } = useQuery(obtenerListaBackups);
    
    // 2. Estado para la generación de nuevo backup
    const [generating, setGenerating] = useState(false);

    // Cargar lista al montar el componente
    useEffect(() => {
        fetchList();
    }, []);

    // 3. Manejador para crear nuevo backup
    const handleGenerateBackup = async () => {
        try {
            setGenerating(true);
            
            // Llamamos al servicio que genera y devuelve el blob
            const blob = await generarNuevoBackup();
            
            // Descarga automática inmediata
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Generamos un nombre temporal para la descarga inmediata, aunque el server ya lo guardó
            link.download = `backup-manual-${new Date().toISOString().split('T')[0]}.dump`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            toast.success("Copia de seguridad generada y descargada correctamente");
            
            // Recargamos la lista para ver el nuevo archivo en la tabla
            fetchList();

        } catch (error) {
            console.error(error);
            toast.error("Error al generar la copia de seguridad");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50/30 dark:bg-neutral-950">
            <NavBar />
            
            <main className="container max-w-5xl mx-auto p-6 space-y-6">
                
                {/* Encabezado */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <DatabaseBackup className="h-6 w-6 text-primary" />
                            Copias de Seguridad
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Gestiona y genera respaldos de la base de datos del sistema.
                        </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            onClick={() => fetchList()} 
                            disabled={loadingList || generating}
                            title="Recargar lista"
                        >
                            <RefreshCw className={`h-4 w-4 ${loadingList ? 'animate-spin' : ''}`} />
                        </Button>
                        
                        <Button 
                            onClick={handleGenerateBackup} 
                            disabled={generating} 
                            className="gap-2 w-full sm:w-auto"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Nuevo Respaldo
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Tabla de Resultados */}
                <TablaBackups 
                    list={listaBackups ?? []} 
                    loading={loadingList} 
                />
            </main>
        </div>
    );
}