
import { modificarEstatusUsuarioById, modificarUsuario, obtenerUsuarioById, registrarUsuario } from "@/services/usuarioService"; // Asegúrate de tener esta función importada
import type { UsuarioRequest, Message, UsuarioDetail } from "@/models"; // Ajusta según tus tipos reales
import { useState } from "react";

export function useRegistrarUsuario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>();

  const fetchRegistrar = async (usuarioRequest: UsuarioRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await registrarUsuario(usuarioRequest);
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

export function useModificarUsuario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>();

  const fetchModificar = async (usuarioId: number, usuarioRequest: UsuarioRequest) => {
    setLoading(true);
    setError(null);

    try {
      const data = await modificarUsuario(usuarioId, usuarioRequest);
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

export function useObtenerUsuarioById() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [usuario, setUsuario] = useState<UsuarioDetail | null>(null)
  const fetchObtenerUsuario = async (usuarioId: number) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    setUsuario(null);
    try {
      const data = await obtenerUsuarioById(usuarioId);
      setUsuario(data)
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

  return { fetchObtenerUsuario,usuario, message, loading, error };
}


export function useModificareStatusUsuario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>();

  const fetchModificarStatus = async (usuarioId: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await modificarEstatusUsuarioById(usuarioId);
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

  return { fetchModificar: fetchModificarStatus, message, loading, error };
}