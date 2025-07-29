import { ClienteRequest } from "@/models";
import { useMutation } from "./generic";
import { deshabilitarClienteById, habilitarClienteById, modificarCliente, registrarCliente } from "@/services";

export function useRegistrarCliente(){
    return useMutation((request: ClienteRequest) => {
        return registrarCliente(request)
    })
}
export function useModificarCliente(){
    return useMutation((id: number,request: ClienteRequest) => {
        return modificarCliente(id,request)
    })
}

export function useHabilitarClienteById(){
    return useMutation((id:number)=>{
        return habilitarClienteById(id)
    })
}

export function useDeshabilitarClienteById(){
    return useMutation((id:number)=>{
        return deshabilitarClienteById(id)
    })
}