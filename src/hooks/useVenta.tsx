import { VentaRequest } from "@/models"
import { useMutation } from "."
import { anularVenta, registrarVenta } from "@/services/ventaService"

export function useRegistrarVenta() {
  return useMutation((request: VentaRequest) => {
    return registrarVenta(request)
  })
}

export function useAnularVenta() {
  return useMutation((id:number) => {
    return anularVenta(id)
  })
}