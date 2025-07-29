import { Categoria, CategoriaRequest, MessageResponse } from "@/models";
import apiClient, { parseAxiosError } from './axiosClient';

// Obtener lista de categorías
export async function obtenerListaCategorias(): Promise<Categoria[]> {
    try {
        const response = await apiClient.get('/categorias');
        return response.data as Categoria[];
    } catch (err) {
        throw parseAxiosError(err, "Error al listar categorías");
    }
};
// Obtener lista de categorías activas
export async function obtenerListaCategoriasDisponibles(): Promise<Categoria[]> {
    try {
        const response = await apiClient.get('/categorias/activos');
        return response.data as Categoria[];
    } catch (err) {
        throw parseAxiosError(err, "Error al listar categorías");
    }
};
// Obtener categoría por id
export async function obtenerCategoriaById(categoriaId: number): Promise<Categoria> {
    try {
        const response = await apiClient.get(`/categorias/${categoriaId}`);
        return response.data as Categoria;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener categoría");
    }
};

// Registrar categoría
export async function registrarCategoria(categoriaRequest: CategoriaRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.post('/categorias', categoriaRequest);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al registrar categoría");
    }
}

// Modificar categoría
export async function modificarCategoria(categoriaId: number, categoriaRequest: CategoriaRequest): Promise<MessageResponse> {
    try {
        const response = await apiClient.put(`/categorias/${categoriaId}`, categoriaRequest);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar categoría");
    }
}

// Habilitar categoría por id
export async function habilitarCategoriaById(categoriaId: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/categorias/estado/habilitar/${categoriaId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al habilitar categoría");
    }
}

// Deshabilitar categoría por id
export async function deshabilitarCategoriaById(categoriaId: number): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/categorias/estado/deshabilitar/${categoriaId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al deshabilitar categoría");
    }
}