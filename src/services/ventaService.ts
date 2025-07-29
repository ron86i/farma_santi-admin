import { MessageDataResponse, MessageResponse, VentaDetail, VentaInfo, VentaRequest, VentaResponse } from "@/models";
import apiClient, { parseAxiosError } from "./axiosClient";

// Obtener lista de ventas
export async function obtenerListaVentas(): Promise<VentaInfo[]> {
    try {
        const response = await apiClient.get('/ventas');
        return response.data as VentaInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al listar ventas");
    }
};

// Obtener venta por id
export async function obtenerVentaById(id:number): Promise<VentaDetail> {
    try {
        const response = await apiClient.get(`/ventas/${id}`);
        return response.data as VentaDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener venta");
    }
};

export async function registrarVenta(request: VentaRequest):Promise<MessageDataResponse<VentaResponse>>{
    try {
        const response = await apiClient.post(`/ventas/registrar`,request);
        return response.data as MessageDataResponse<VentaResponse>;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar venta");
    }
}

export async function anularVenta(id:number):Promise<MessageResponse>{
    try {
        const response = await apiClient.patch(`/ventas/anular/${id}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al anular venta");
    }
}