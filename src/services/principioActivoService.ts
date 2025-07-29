import { PrincipioActivo, PrincipioActivoDetalle, PrincipioActivoInfo, PrincipioActivoRequest } from "@/models/principioActivo";
import apiClient, { parseAxiosError } from "./axiosClient";
import { MessageDataResponse, MessageResponse } from "@/models";

// Obtener lista de principios activos
export async function obtenerListaPrincipiosActivos(): Promise<PrincipioActivoInfo[]> {
    try {
        const response = await apiClient.get('/principios-activos');
        return response.data as PrincipioActivoInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de principios activos");
    }
};

// Obtener principio activo por Id
export async function obtenerPrincipioActivoById(id:number): Promise<PrincipioActivoDetalle> {
    try {
        const response = await apiClient.get(`/principios-activos/${id}`);
        return response.data as PrincipioActivoDetalle;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener principio activo");
    }
};

// Regsitrar principio activo
export async function registrarPrincipioActivo(request: PrincipioActivoRequest): Promise<MessageDataResponse<PrincipioActivo>> {
    try {
        const response = await apiClient.post(`/principios-activos`,request);
        return response.data as MessageDataResponse<PrincipioActivo>;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar principio activo");
    }
};

// Modificar principio activo
export async function modificarPrincipioActivo(id:number,request: PrincipioActivoRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.put(`/principios-activos/${id}`,request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar principio activo");
    }
};