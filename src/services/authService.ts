import { UserRequest } from "@/models";
import { MessageResponse } from "@/models/messageResponse";
import apiClient, { parseAxiosError } from './axiosClient';

export async function logIn(userRequest: UserRequest): Promise<MessageResponse> {
  try {
    const response = await apiClient.post('/auth/login', userRequest);
    return response.data as MessageResponse;
  } catch (err) {
    throw parseAxiosError(err, "Error al iniciar sesión");
  }
}


// Logout
export async function logOut(): Promise<MessageResponse> {
  try {
    const response = await apiClient.get('/auth/logout');
    return response.data as MessageResponse;
  } catch (err: any) {
    throw parseAxiosError(err, "Error al cerrar sesión");
  }
};

// Refresh Token
export async function refreshToken(): Promise<MessageResponse> {
  try {
    const response = await apiClient.get('/auth/refresh');
    return response.data as MessageResponse;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Error desconocido");
  }
};

// Verify Token
export async function verifyToken(): Promise<MessageResponse> {
  try {
    const response = await apiClient.get('/auth/verify');
    return response.data as MessageResponse;
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Error desconocido");
  }
}
