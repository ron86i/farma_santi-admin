import { Rol } from "@/models/rol";
import { fullHostName } from ".";

export async function obtenerListaroles(): Promise<Rol[]> {
    try {
        const response = await fetch(`${fullHostName}/roles`, {
            method: "GET",                
            headers: { "Content-Type": "application/json" },
            credentials: "include",          // Importante para enviar cookies
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        return data as Rol[];  // Aseguramos que el tipo de retorno sea Message

    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
};