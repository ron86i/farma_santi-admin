import { ProveedorRequest } from "@/models";
import { deshabilitarProveedorById, habilitarProveedorById, modificarProveedor, registrarProveedor } from "@/services";
import { useMutation } from "./generic";


export function useRegistrarProveedor() {
    return useMutation((request: ProveedorRequest)=>{
      return registrarProveedor(request)
    })
}

export function useModificarProveedor() {
  return useMutation((id: number, request: ProveedorRequest)=>{
    return modificarProveedor(id,request)
  })
}

export function useHabilitarProveedorById() {
  return useMutation((id: number)=>{
    return habilitarProveedorById(id)
  })
}

export function useDeshabilitarProveedorById() {
  return useMutation((id: number)=>{
    return deshabilitarProveedorById(id)
  })
}