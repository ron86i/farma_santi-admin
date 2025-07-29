import { anularOrdenCompraById, completarCompraById, modificarOrdenCompra, registrarOrdenCompra } from "@/services/compraService";
import { useMutation } from "./generic";
import { CompraRequest } from "@/models/compra";

export function useRegistrarOrdenCompra() {
    return useMutation((request: CompraRequest) => {
        return registrarOrdenCompra(request);
    });
}

export function useModificarOrdenCompra() {
    return useMutation((id: number, request: CompraRequest) => {
        return modificarOrdenCompra(id, request);
    });
}

export function useCompletarCompra() {
    return useMutation((id: number) => {
        return completarCompraById(id);
    });
}

export function useAnularOrdenCompra() {
    return useMutation((id: number) => {
        return anularOrdenCompraById(id);
    });
}