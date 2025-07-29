import { CategoriaRequest } from "@/models";
import { deshabilitarCategoriaById, habilitarCategoriaById, modificarCategoria, registrarCategoria } from "@/services";
import { useMutation } from "./generic";


export function useHabilitarCategoriaById() {
    return useMutation((categoriaId: number) => {
        return habilitarCategoriaById(categoriaId)
    })
}

export function useDeshabilitarCategoriaById() {
    return useMutation((categoriaId: number) => {
        return deshabilitarCategoriaById(categoriaId)
    })
}

export function useRegistrarCategoria() {
    return useMutation((categoriaRequest: CategoriaRequest) => {
        return registrarCategoria(categoriaRequest);
    });
}

export function useModificarCategoria() {
    return useMutation((categoriaId: number, categoriaRequest: CategoriaRequest) => {
        return modificarCategoria(categoriaId, categoriaRequest)
    });
}
