
import { modificarPrincipioActivo, registrarPrincipioActivo } from "@/services";
import { useMutation } from ".";
import { PrincipioActivoRequest } from "@/models/principioActivo";

export function useRegistrarPrincipioActivo() {
    return useMutation((request: PrincipioActivoRequest) => {
        return registrarPrincipioActivo(request);
    });
}

export function useModificarPrincipioActivo() {
    return useMutation((id: number, request: PrincipioActivoRequest) => {
        return modificarPrincipioActivo(id, request);
    });
}