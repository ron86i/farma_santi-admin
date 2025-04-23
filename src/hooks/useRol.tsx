import { useState } from "react";
import { Rol } from "@/models";
import { obtenerListaroles } from "@/services";

export function useRoles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);

  const fetchRoles = async () => {
    setLoading(true);
    setError("Error de conexión al servidor");

    try {
      const data = await obtenerListaroles(); // usa tu servicio directamente
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
