import { Message, UsuarioDetail, UsuarioInfo, UsuarioRequest } from "@/models";
import { fullHostName } from ".";

export async function obtenerListaUsuarios(): Promise<UsuarioInfo[]> {
    try {
        const response = await fetch(`${fullHostName}/usuarios`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",          // Importante para enviar cookies
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        return data as UsuarioInfo[];  // Aseguramos que el tipo de retorno sea Message

    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
};


export async function registrarUsuario(usuarioRequest: UsuarioRequest): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(usuarioRequest),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        return data as Message;  // Aseguramos que el tipo de retorno sea Message
    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
}

export async function modificarUsuario(usuarioId:number,usuarioRequest: UsuarioRequest): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/usuarios/${usuarioId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(usuarioRequest),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        return data as Message;  // Aseguramos que el tipo de retorno sea Message
    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
}

export async function obtenerUsuarioById(usuarioId:number): Promise<UsuarioDetail> {
    try {
        const response = await fetch(`${fullHostName}/usuarios/${usuarioId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        return data as UsuarioDetail;  // Aseguramos que el tipo de retorno sea UsuarioDetail
    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
}

export async function modificarEstadoUsuarioById(usuarioId:number): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/usuarios/status/${usuarioId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        return data as Message;  // Aseguramos que el tipo de retorno sea UsuarioDetail
    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
}