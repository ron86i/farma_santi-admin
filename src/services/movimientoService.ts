import { MovimientoInfo, MovimientoKardex } from "@/models";
import apiClient, { parseAxiosError } from "./axiosClient";

export async function obtenerListaMovimientos(filtro?: string): Promise<MovimientoInfo[]> {
    const query = filtro ? `?${filtro}` : "";
    try {
        const response = await apiClient.get(`/movimientos${query}`);
        return response.data as MovimientoInfo[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista movimientos");
    }
};

export async function obtenerMovimientosKardex(filtro?: string): Promise<MovimientoKardex[]> {
    const query = filtro ? `?${filtro}` : "";
    try {
        const response = await apiClient.get(`/movimientos/kardex${query}`);
        return response.data as MovimientoKardex[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista movimientos");
    }
};
