import { deshabilitarLaboratorioById, habilitarLaboratorioById, modificarLaboratorio, registrarLaboratorio } from "@/services";
import { useMutation } from "./generic";
import { LaboratorioRequest } from "@/models/laboratorio";


export function useHabilitarLaboratorioById(){
        return useMutation((laboratorioId: number) => {
        return habilitarLaboratorioById(laboratorioId)
    })
}

export function useDeshabilitarLaboratorioById(){
        return useMutation((laboratorioId: number) => {
        return deshabilitarLaboratorioById(laboratorioId)
    })
}

export function useRegistrarLaboratorio() {
    return useMutation((laboratorioRequest: LaboratorioRequest) => {
        return registrarLaboratorio(laboratorioRequest);
    });
}

export function useModificarLaboratorio() {
    return useMutation((laboratorioId: number, laboratorioRequest: LaboratorioRequest) =>{
        return modificarLaboratorio(laboratorioId,laboratorioRequest)
    });
}
