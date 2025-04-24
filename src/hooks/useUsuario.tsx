
import { modificarEstadoUsuarioById, modificarUsuario, obtenerListaUsuarios, obtenerUsuarioById, registrarUsuario } from "@/services/usuarioService"; // Asegúrate de tener esta función importada
import type { UsuarioRequest, Message, UsuarioDetail, UsuarioInfo } from "@/models"; // Ajusta según tus tipos reales
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

export function useObtenerListaUsuarios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([])
  const fetchObtenerUsuarios = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await obtenerListaUsuarios()
      setUsuarios(data)
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

  return { fetchObtenerUsuarios,usuarios, message, loading, error };
}

export function useModificarEstadoUsuario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>();

  const fetchModificarEstado = async (usuarioId: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await modificarEstadoUsuarioById(usuarioId);
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

  return { fetchModificarEstado, message, loading, error };
}
