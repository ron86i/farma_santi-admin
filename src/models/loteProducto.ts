import { ProductoInfo, ProductoSimple } from "./producto";

export interface LoteProductoRequest {
    lote: string;
    fechaVencimiento: Date;
    productoId: string
}

export interface LoteProductoInfo {
    id: number
    lote: string;
    stock: number;
    fechaVencimiento: Date;
    estado: string;
    producto: ProductoSimple
}

export interface LoteProductoDetail {
    id: number
    lote: string;
    stock: number;
    estado: string;
    fechaVencimiento: Date;
    producto: ProductoInfo
}

export interface LoteProductoSimple {
    id: number
    lote: string;
    fechaVencimiento: Date;
}