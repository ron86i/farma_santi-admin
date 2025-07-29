import { Rol, RolRequest } from "@/models/rol";
import { MessageResponse } from "@/models";
import apiClient, { parseAxiosError } from './axiosClient';

// Obtener lista de roles
export async function obtenerListaRoles(): Promise<Rol[]> {
  try {
    const response = await apiClient.get('/roles');
    return response.data as Rol[];
  } catch (err) {
    throw parseAxiosError(err, "Error al obtener la lista de roles");
  }
}

// Obtener rol por id
export async function obtenerRolById(rolId: number): Promise<Rol> {
  try {
    const response = await apiClient.get(`/roles/${rolId}`);
    return response.data as Rol;
  } catch (err) {
    throw parseAxiosError(err, "Error al obtener el rol");
  }
}

// Habilitar rol por id
export async function habilitarRolById(rolId: number): Promise<MessageResponse> {
  try {
    const response = await apiClient.patch(`/roles/estado/habilitar/${rolId}`);
    return response.data as MessageResponse;
  } catch (err) {
    throw parseAxiosError(err, "Error al habilitar el rol");
  }
}

// Deshabilitar rol por id
export async function deshabilitarRolById(rolId: number): Promise<MessageResponse> {
  try {
    const response = await apiClient.patch(`/roles/estado/deshabilitar/${rolId}`);
    return response.data as MessageResponse;
  } catch (err) {
    throw parseAxiosError(err, "Error al deshabilitar el rol");
  }
}

// Registrar rol
export async function registrarRol(data: RolRequest): Promise<MessageResponse> {
  try {
    const response = await apiClient.post("/roles", data);
    return response.data;
  } catch (err) {
    throw parseAxiosError(err, "Error al registrar rol");
  }
}

// Modificar rol
export async function modificarRol(rolId: number, rolRequest: RolRequest): Promise<MessageResponse> {
  try {
    const response = await apiClient.put(`/roles/${rolId}`, rolRequest);
    return response.data as MessageResponse;
  } catch (err) {
    throw parseAxiosError(err, "Error al modificar rol");
  }
}
