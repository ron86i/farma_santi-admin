import { UserRequest } from "@/models";
import { Message } from "@/models/message";

export const fullHostName = "http://localhost:8890/api/v1";


export async function logIn(userRequest: UserRequest): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/auth/login`, {
            method: "POST",                // Usamos DELETE para el logout
            headers: { "Content-Type": "application/json" },
            body:JSON.stringify(userRequest),
            credentials:"include"
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        // Si el logout es exitoso, se puede devolver el mensaje de éxito
        return data as Message;  // Aseguramos que el tipo de retorno sea Message

    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
};

export async function logOut(): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/auth/logout`, {
            method: "GET",                // Usamos DELETE para el logout
            headers: { "Content-Type": "application/json" },
            credentials: "include",          // Importante para enviar cookies
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        // Si el logout es exitoso, se puede devolver el mensaje de éxito
        return data as Message;  // Aseguramos que el tipo de retorno sea Message

    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
};

export async function refreshToken(): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/auth/refresh`, {
            method: "GET",                // Usamos DELETE para el logout
            headers: { "Content-Type": "application/json" },
            credentials: "include",          // Importante para enviar cookies
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        // Si el logout es exitoso, se puede devolver el mensaje de éxito
        return data as Message;  // Aseguramos que el tipo de retorno sea Message

    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
};

export async function verifyToken(): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/auth/verify`, {
            method: "GET",                // Usamos GET para el logout
            headers: { "Content-Type": "application/json" },
            credentials: "include",          // Importante para enviar cookies
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");  // Error en caso de respuesta no OK
        }

        // Si el logout es exitoso, se puede devolver el mensaje de éxito
        return data as Message;  // Aseguramos que el tipo de retorno sea Message

    } catch (err) {
        // Si hay un error, lo lanzamos para manejarlo en el lugar que llame a esta función
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
}