import { MovimientoInfo } from "@/models";
import apiClient, { parseAxiosError } from "./axiosClient";

export async function obtenerListaMovimientos(): Promise<MovimientoInfo[]> {
    try {
        const response = await apiClient.get('/movimientos');
        return response.data as MovimientoInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista movimientos");
    }
};
