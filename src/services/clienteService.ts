import { ClienteDetail, ClienteId, ClienteInfo, ClienteRequest, MessageDataResponse, MessageResponse } from "@/models";
import apiClient, { parseAxiosError } from "./axiosClient";

// Listar clientes registrado
export async function obtenerListaClientes(): Promise<ClienteInfo[]> {
    try {
        const response = await apiClient.get('/clientes');
        return response.data as ClienteInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de clientes");
    }
}

export async function registrarCliente(request: ClienteRequest): Promise<MessageDataResponse<ClienteId>> {
    try {
        const response = await apiClient.post('/clientes', request);
        return response.data as MessageDataResponse<ClienteId>;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar cliente");
    }
}

export async function modificarCliente(id: number, request: ClienteRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.put(`/clientes/${id}`, request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar cliente");
    }
}

export async function obtenerClienteById(id: number): Promise<ClienteDetail> {
    try {
        const response = await apiClient.get(`/clientes/${id}`);
        return response.data as ClienteDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de clientes");
    }
}

export async function habilitarClienteById(id: number):Promise<MessageResponse> {
        try {
        const response = await apiClient.patch(`/clientes/estado/habilitar/${id}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al habilitar cliente");
    }
}

export async function deshabilitarClienteById(id: number):Promise<MessageResponse> {
        try {
        const response = await apiClient.patch(`/clientes/estado/deshabilitar/${id}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al deshabilitar cliente");
    }
}
