import { BackupInfo } from "@/models/backup";
import apiClient, { parseAxiosError } from './axiosClient';

// Obtener lista de backups disponibles en el servidor
export async function obtenerListaBackups(): Promise<BackupInfo[]> {
    try {
        const response = await apiClient.get('/backups');
        return response.data as BackupInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al listar los backups");
    }
};

// Generar un nuevo backup en caliente y obtener el archivo (Blob)
export async function generarNuevoBackup(): Promise<Blob> {
    try {
        const response = await apiClient.get('/backups/generate', {
            responseType: 'blob',
            timeout: 60000,
        });
        return response.data;
    } catch (err) {
        throw parseAxiosError(err, "Error al generar el nuevo backup");
    }
};

// Descargar un backup específico existente por su nombre
export async function descargarBackupPorNombre(filename: string): Promise<Blob> {
    try {
        const response = await apiClient.get(`/backups/download/${filename}`, {
            responseType: 'blob',
            timeout: 60000,
        });
        return response.data;
    } catch (err) {
        throw parseAxiosError(err, "Error al descargar el archivo de backup");
    }
};