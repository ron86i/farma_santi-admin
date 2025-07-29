import { LoteProductoDetail, LoteProductoInfo, LoteProductoRequest, LoteProductoSimple, MessageResponse } from "@/models";
import apiClient, { parseAxiosError } from "./axiosClient";

// Registrar lote de producto
export async function registrarLoteProducto(request: LoteProductoRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.post('/lotes-productos', request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar lote de producto");
    }
}

// Modificar lote de producto
export async function modificarLoteProducto(id:number,request: LoteProductoRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.put(`/lotes-productos/${id}`, request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar lote de producto");
    }
}

// Obtener lista de lotes de productos
export async function obtenerListaLoteProductos(): Promise<LoteProductoInfo[]> {
    try {
        const response = await apiClient.get('/lotes-productos');
        return response.data as LoteProductoInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de lote de productos");
    }
}

// Obtener lote producto by Id
export async function obtenerLoteProductoById(id: number): Promise<LoteProductoDetail> {
    try {
        const response = await apiClient.get(`/lotes-productos/${id}`);
        return response.data as LoteProductoDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lote del producto");
    }
}

// Obtener lote producto by Id
export async function obtenerLotesByProductoId(id: string): Promise<LoteProductoSimple> {
    try {
        const response = await apiClient.get(`/lotes-productos/byProducto/${id}`);
        return response.data as LoteProductoSimple;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lote del producto");
    }
}
