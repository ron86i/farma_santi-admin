import { Presentacion } from "@/models/presentacion";
import apiClient, { parseAxiosError } from "./axiosClient";


// Obtener lista de presentaciones
export async function obtenerListaPresentaciones(): Promise<Presentacion[]> {
    try {
        const response = await apiClient.get<Presentacion[]>(`/presentaciones`);
        return response.data;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de presentaciones");
    }
}