import { MessageResponse } from "@/models";
import apiClient, { parseAxiosError } from './axiosClient';
import { LaboratorioDetail, LaboratorioInfo, LaboratorioRequest } from "@/models/laboratorio";

// Obtener lista de laboratorios
export async function obtenerListaLaboratorios(): Promise<LaboratorioInfo[]> {
    try {
        const response = await apiClient.get('/laboratorios');
        return response.data as LaboratorioInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de laboratorios");
    }
};

// Obtener lista de laboratorios activas
export async function obtenerListaLaboratoriosDisponibles(): Promise<LaboratorioInfo[]> {
    try {
        const response = await apiClient.get('/laboratorios/activos');
        return response.data as LaboratorioInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de laboratorios");
    }
};

// Obtener laboratorio por id
export async function obtenerLaboratorioById(laboratorioId: number): Promise<LaboratorioDetail> {
    try {
        const response = await apiClient.get(`/laboratorios/${laboratorioId}`);
        return response.data as LaboratorioDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener laboratorio");
    }
};


// Registrar laboratorio
export async function registrarLaboratorio(request: LaboratorioRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.post('/laboratorios', request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar laboratorio");
    }
}

// Modificar laboratorio
export async function modificarLaboratorio(laboratorioId: number, request: LaboratorioRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.put(`/laboratorios/${laboratorioId}`, request);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar laboratorio");
    }
}

// Habilitar laboratorio por id
export async function habilitarLaboratorioById(laboratorioId: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/laboratorios/estado/habilitar/${laboratorioId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al habilitar laboratorio");
    }
}

// Deshabilitar laboratorio por id
export async function deshabilitarLaboratorioById(laboratorioId: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/laboratorios/estado/deshabilitar/${laboratorioId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al deshabilitar laboratorio");
    }
}