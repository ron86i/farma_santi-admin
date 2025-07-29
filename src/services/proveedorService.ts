import { MessageResponse, ProveedorDetail, ProveedorInfo, ProveedorRequest } from "@/models";
import apiClient, { parseAxiosError } from './axiosClient';

// Obtener lista de proveedores
export async function obtenerListaProveedores(): Promise<ProveedorInfo[]> {
    try {
        const response = await apiClient.get('/proveedores');
        return response.data as ProveedorInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de proveedores");
    }
};

// Obtener proveedor por id
export async function obtenerProveedorById(proveedorId: number): Promise<ProveedorDetail> {
    try {
        const response = await apiClient.get(`/proveedores/${proveedorId}`);
        return response.data as ProveedorDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener proveedor");
    }
};


// Registrar proveedor
export async function registrarProveedor(request: ProveedorRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.post('/proveedores', request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar proveedor");
    }
}

// Modificar proveedor
export async function modificarProveedor(proveedorId: number, request: ProveedorRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.put(`/proveedores/${proveedorId}`, request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar proveedor");
    }
}

// Habilitar proveedor por id
export async function habilitarProveedorById(proveedorId: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/proveedores/estado/habilitar/${proveedorId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al habilitar proveedor");
    }
}

// Deshabilitar proveedor por id
export async function deshabilitarProveedorById(proveedorId: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/proveedores/estado/deshabilitar/${proveedorId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al deshabilitar proveedor");
    }
}