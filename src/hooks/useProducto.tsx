import { ProductoRequest } from "@/models/producto";
import { useMutation } from "./generic";
import { deshabilitarProductoById, habilitarProductoById, modificarProducto, registrarProducto } from "@/services/productoService";

export function useRegistrarProducto() {
    return useMutation((request: ProductoRequest, files: File[]) => {
        return registrarProducto(request, files);
    });
}

export function useModificarProducto() {
    return useMutation((productoId: string, request: ProductoRequest, files: File[]) => {
        return modificarProducto(productoId, request, files);
    });
}

export function useHabilitarProducto() {
    return useMutation((productoId: string) => {
        return habilitarProductoById(productoId);
    });
}

export function useDeshabilitarProducto() {
    return useMutation((productoId: string) => {
        return deshabilitarProductoById(productoId);
    });
}
