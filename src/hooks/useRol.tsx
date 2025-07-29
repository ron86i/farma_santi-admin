import { RolRequest } from "@/models";
import { deshabilitarRolById, habilitarRolById, modificarRol, registrarRol } from "@/services";
import { useMutation } from "./generic";


export function useHabilitarRolById() {
  return useMutation((rolId: number)=>{
    return habilitarRolById(rolId)
  })
}

export function useDeshabilitarRolById() {
  return useMutation((rolId: number)=>{
    return deshabilitarRolById(rolId)
  })
}

export function useRegistrarRol() {
  return useMutation((request: RolRequest)=>{
    return registrarRol(request)
  })
}

export function useModificarRol() {
  return useMutation((rolId: number,request: RolRequest)=>{
    return modificarRol(rolId,request)
  })
}