import { DashboardStats, ProductoStat } from "@/models/stat";
import apiClient, { parseAxiosError } from "./axiosClient";

export async function obtenerTopProductos(): Promise<ProductoStat[]> {
  try {
    const response = await apiClient.get('/stats/top10Productos');
    return response.data as ProductoStat[];
  } catch (err) {
    throw parseAxiosError(err, "Error al obtener la lista de roles");
  }
}

export async function obtenerEstadisticasDashboard(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get('/stats/dashboard');
    return response.data as DashboardStats;
  } catch (err) {
    throw parseAxiosError(err, "Error al obtener estadísticas del dashboard");
  }
}