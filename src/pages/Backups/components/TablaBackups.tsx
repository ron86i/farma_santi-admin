import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BackupInfo } from "@/models/backup";
import { Download, FileArchive, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { descargarBackupPorNombre } from "@/services/backupService";

interface TablaBackupsProps {
    list: BackupInfo[];
    loading: boolean;
}

export function TablaBackups({ list, loading }: TablaBackupsProps) {
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

    // Función auxiliar para formatear bytes
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handleDownload = async (filename: string) => {
        try {
            setDownloadingFile(filename);
            const blob = await descargarBackupPorNombre(filename);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error al descargar:", error);
        } finally {
            setDownloadingFile(null);
        }
    };

    return (
        <div className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden">
            <Table>
                <TableHeader className="bg-neutral-50 dark:bg-neutral-900">
                    <TableRow>
                        <TableHead className="w-[50px] text-center">#</TableHead>
                        <TableHead>Nombre del Archivo</TableHead>
                        <TableHead>Fecha de Creación</TableHead>
                        <TableHead>Tamaño</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex items-center justify-center gap-2 text-neutral-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Cargando respaldos...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : list.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-neutral-500">
                                No hay copias de seguridad disponibles.
                            </TableCell>
                        </TableRow>
                    ) : (
                        list.map((backup, index) => (
                            <TableRow key={backup.name} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                                <TableCell className="text-center font-mono text-xs text-neutral-400">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <FileArchive className="h-4 w-4 text-blue-500" />
                                    {backup.name}
                                </TableCell>
                                <TableCell className="text-neutral-600 dark:text-neutral-300">
                                    {format(new Date(backup.date), "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                    {formatBytes(backup.size)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload(backup.name)}
                                        disabled={downloadingFile === backup.name}
                                        className="h-8 gap-2"
                                    >
                                        {downloadingFile === backup.name ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Download className="h-3.5 w-3.5" />
                                        )}
                                        Descargar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}