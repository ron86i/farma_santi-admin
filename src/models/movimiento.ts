import { UsuarioSimple } from "./usuario";

export interface MovimientoInfo {
    id: number;
    codigo: string;
    tipo:string;
    estado: string;
    fecha:Date;
    usuario: UsuarioSimple;
}