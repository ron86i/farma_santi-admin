import { useState } from "react";
import { Message, Rol, RolRequest } from "@/models";
import { modificarEstadoRolById, modificarRol, obtenerListaRoles, obtenerRolById, registrarRol } from "@/services";

export function useObtenerRoles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);

  const fetchRoles = async () => {
    setLoading(true);
    setError("Error de conexión al servidor");

    try {
      const data = await obtenerListaRoles(); // usa tu servicio directamente
      setRoles(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchRoles, roles, loading, error };
}

export function useModificarEstadoRol() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>();

  const fetch = async (rolId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await modificarEstadoRolById(rolId);
      setMessage(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetch, message, loading, error };
}

export function useRegistrarRol() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>();

  const fetchRegistrar = async (rolRequest: RolRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await registrarRol(rolRequest);
      setMessage(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchRegistrar, message, loading, error };
}

export function useModificarRol() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>();

  const fetchModificar = async (rolId: number, rolRequest: RolRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await modificarRol(rolId, rolRequest);
      setMessage(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchModificar, message, loading, error };
}

export function useObtenerRolById(){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<Message | null>(null);
    const [rol, setRol] = useState<Rol | null>(null)
    const fetchObtener = async (rolId: number) => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const data = await obtenerRolById(rolId);
        setRol(data)
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        setError(msg);
        setMessage({ message: "Hubo un problema al obtener el usuario. Intenta de nuevo." });
        throw err;
      } finally {
        setLoading(false);
      }
    };
  
    return { fetchObtener,rol, message, loading, error };
}