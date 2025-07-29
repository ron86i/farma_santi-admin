import { LoteProductoRequest } from "@/models";
import { useMutation } from "./generic";
import { modificarLoteProducto, registrarLoteProducto } from "@/services/loteProductoService";

export function useRegistrarLoteProducto() {
    return useMutation((request: LoteProductoRequest) => {
        return registrarLoteProducto(request);
    });
}

export function useModificarLoteProducto() {
    return useMutation((id:number,request: LoteProductoRequest)=>{
        return modificarLoteProducto(id,request)
    });
}