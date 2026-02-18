import { LaboratorioSimple, LoteProductoInfo, UsuarioSimple } from ".";

export interface DetalleCompraRequest {
  cantidad: number;
  precioCompra: number;
  precioVenta:number
  loteProductoId: number;
}

export interface CompraRequest {
  comentario?: string;
  laboratorioId: number;
  usuarioId?: number;
  detalles: DetalleCompraRequest[];
}


export interface CompraInfo {
  codigo: string;
  id: number;
  comentario: string;
  estado: string;
  total: number;
  fecha: Date;
  laboratorio: LaboratorioSimple;
  usuario: UsuarioSimple;
}

export interface DetalleCompraDAO {
  id: number;
  cantidad: number;
  precio: number;
  loteProductoId: number;
  productoId: number;
}

export interface CompraDAO {
  id: number;
  comentario: string;
  estado: string;
  total: number;
  laboratorioId: number;
  usuarioId: number;
  detalles: DetalleCompraDAO[];
}

export interface DetalleCompraDetail {
  id: number;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  loteProducto: LoteProductoInfo;
}

export interface CompraDetail {
  id: number;
  codigo: string;
  comentario: string;
  estado: string;
  total: number;
  fecha: Date;
  deletedAt?: Date;
  laboratorio: LaboratorioSimple;
  usuario: UsuarioSimple;
  detalles: DetalleCompraDetail[];
}

export interface CompraId {
  id: number;
}