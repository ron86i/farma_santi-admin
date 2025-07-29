import { MessageDataResponse, MessageResponse } from "@/models";
import apiClient, { parseAxiosError } from "./axiosClient";
import { CompraDetail, CompraId, CompraInfo, CompraRequest } from "@/models/compra";

// Registrar orden de compra
export async function registrarOrdenCompra(request: CompraRequest): Promise<MessageDataResponse<CompraId>> {
    try {
        const response = await apiClient.post('/compras', request);
        return response.data as MessageDataResponse<CompraId>;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar orden de compra");
    }
};

// Modificar orden de compra
export async function modificarOrdenCompra(id: number,request: CompraRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.put(`/compras/${id}`, request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar orden de compra");
    }
};

// Listar compras pendiente, anuladas, completadas
export async function obtenerListaCompras(): Promise<CompraInfo[]> {
    try {
        const response = await apiClient.get('/compras');
        return response.data as CompraInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de compras");
    }
}

// Obtener compra por id
export async function obtenerCompraById(id: number): Promise<CompraDetail> {
    try {
        const response = await apiClient.get(`/compras/${id}`);
        return response.data as CompraDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener compra");
    }
}

// Completar compra por id
export async function completarCompraById(id: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/compras/completar/${id}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al completar el registro de compra");
    }
}

// Obtener compra por id
export async function anularOrdenCompraById(id: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/compras/anular/${id}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al anular la orden de compra");
    }
}