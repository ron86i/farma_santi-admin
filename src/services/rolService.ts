import { Rol, RolRequest } from "@/models/rol";
import { fullHostName } from ".";
import { Message } from "@/models";

export async function obtenerListaRoles(): Promise<Rol[]> {
    try {
        const response = await fetch(`${fullHostName}/roles`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");
        }

        return data as Rol[];

    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
};
export async function obtenerRolById(rolId: number): Promise<Rol> {
    try {
        const response = await fetch(`${fullHostName}/roles/${rolId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");
        }
        return data as Rol;
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
};

export async function modificarEstadoRolById(rolId: number): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/roles/status/${rolId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");
        }
        return data as Message;
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
}

export async function registrarRol(rolRequest:RolRequest): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/roles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body:JSON.stringify(rolRequest)
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");
        }
        return data as Message;
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
}

export async function modificarRol(rolId:number,rolRequest: RolRequest): Promise<Message> {
    try {
        const response = await fetch(`${fullHostName}/roles/${rolId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(rolRequest),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error en el servidor");
        }

        return data as Message;
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Error desconocido");
    }
}
