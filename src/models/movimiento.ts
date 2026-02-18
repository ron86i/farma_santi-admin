import { UsuarioSimple } from "./usuario";

export interface MovimientoInfo {
    id: number;
    codigo: string;
    tipo:string;
    estado: string;
    fecha:Date;
    usuario: UsuarioSimple;
    total: number
}
export interface MovimientoKardex {
    idFila: number;
    productoId: string;
    loteId: number;
    codigoLote: string;
    fechaVencimiento: string;
    tipoMovimiento: 'ENTRADA' | 'SALIDA';
    fechaMovimiento: string; // ISO string
    documento: string;
    concepto: string;
    usuario: string;
    cantidadEntrada: number;
    cantidadSalida: number;
    costoUnitario: number;
    totalMoneda: number;
}