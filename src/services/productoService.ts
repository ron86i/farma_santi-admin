import { FormaFarmacetica, ProductoDetail, ProductoInfo, ProductoRequest, UnidadMedida } from "@/models/producto";
import apiClient, { parseAxiosError } from "./axiosClient";
import { MessageResponse } from "@/models";

// Obtener lista de productos
export async function obtenerListaProductos(filtro?: string): Promise<ProductoInfo[]> {
    const query = filtro ? `?${filtro}` : "";

    try {
        const response = await apiClient.get<ProductoInfo[]>(`/productos${query}`);
        return response.data;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de productos");
    }
}


// Registrar producto
export async function registrarProducto(request: ProductoRequest, images: File[]): Promise<MessageResponse> {
    const formData = new FormData();
    formData.append('body', JSON.stringify(request));
    console.log(JSON.stringify(request));
    
    // Agregar múltiples imágenes
    if (images && images.length > 0) {
        images.forEach((image) => {
            formData.append('images', image);
        });
    }
    try {
        const response = await apiClient.post('/productos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
        );
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al regitrar producto");
    }
};

// Obtener formas farmaceuticas
export async function obtenerListaFormasFarmaceuticas(): Promise<FormaFarmacetica[]> {
    try {
        const response = await apiClient.get('/productos/formas-farmaceuticas');
        return response.data as FormaFarmacetica[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de formas farmaceuticas");
    }
};

// Obtener unidades de medidas
export async function obtenerListaUnidadesMedidas(): Promise<UnidadMedida[]> {
    try {
        const response = await apiClient.get('/productos/unidades-medida');
        return response.data as UnidadMedida[];
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener lista de unidades de medida");
    }
};

// Obtener proveedor por id
export async function obtenerProductoById(productoId: string): Promise<ProductoDetail> {
    try {
        const response = await apiClient.get(`/productos/${productoId}`);
        return response.data as ProductoDetail;
    } catch (err) {
        throw parseAxiosError(err, "Error al obtener producto");
    }
};

// Habilitar producto
export async function habilitarProductoById(productoId: string): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/productos/estado/habilitar/${productoId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al habilitar producto");
    }
} 

// Deshabilitar producto
export async function deshabilitarProductoById(productoId: string): Promise<MessageResponse> {
    try {
        const response = await apiClient.patch(`/productos/estado/deshabilitar/${productoId}`);
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al deshabilitar producto");
    }
}

// Modificar producto
export async function modificarProducto(productoId:string,request: ProductoRequest, images: File[]): Promise<MessageResponse> {
    const formData = new FormData();
    formData.append('body', JSON.stringify(request));
    
    // Agregar múltiples imágenesSS
    if (images && images.length > 0) {
        images.forEach((image) => {
            formData.append('images', image);
        });
    }
    try {
        const response = await apiClient.put(`/productos/${productoId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
        );
        return response.data as MessageResponse;
    } catch (err) {
        throw parseAxiosError(err, "Error al modificar producto");
    }
};
