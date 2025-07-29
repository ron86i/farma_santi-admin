
import { deshabilitarUsuarioById, habilitarUsuarioById, modificarUsuario, registrarUsuario, restablecerPasswordById } from "@/services/usuarioService"; // Asegúrate de tener esta función importada
import type { UsuarioRequest } from "@/models"; // Ajusta según tus tipos reales
import { useMutation } from "./generic";

export function useRegistrarUsuario() {
  return useMutation((usuarioRequest: UsuarioRequest) => {
    return registrarUsuario(usuarioRequest)
  })
}

export function useModificarUsuario() {
  return useMutation((usuarioId: number, usuarioRequest: UsuarioRequest) => {
    return modificarUsuario(usuarioId, usuarioRequest)
  })
}

export function useHabilitarUsuarioById() {
  return useMutation((usuarioId: number) => {
    return habilitarUsuarioById(usuarioId)
  })
}

export function useDeshabilitarUsuarioById() {
  return useMutation((usuarioId: number) => {
    return deshabilitarUsuarioById(usuarioId)
  })
}

export function useRestablecerPasswordUsuarioById() {
  return useMutation((usuarioId: number) => {
    return restablecerPasswordById(usuarioId)
  })
}