import { LoteProductoInfo, ProveedorSimple, UsuarioSimple } from ".";

export interface DetalleCompraRequest {
  cantidad: number;
  precio: number;
  loteProductoId: number;
}

export interface CompraRequest {
  comentario?: string;
  proveedorId: number;
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
  proveedor: ProveedorSimple;
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
  proveedorId: number;
  usuarioId: number;
  detalles: DetalleCompraDAO[];
}

export interface DetalleCompraDetail {
  id: number;
  cantidad: number;
  precio: number;
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
  proveedor: ProveedorSimple;
  usuario: UsuarioSimple;
  detalles: DetalleCompraDetail[];
}

export interface CompraId {
  id: number;
}