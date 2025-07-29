import { ClienteSimple, ProductoSimple, UsuarioSimple } from ".";

export interface VentaRequest {
  usuarioId?: number;
  clienteId: number;
  detalles: DetalleVentaRequest[];
}

export interface DetalleVentaRequest {
  productoId: string;
  cantidad: number;
}

export interface VentaInfo {
  id: number;
  codigo: string;
  usuario: UsuarioSimple;
  cliente: ClienteSimple;
  fecha: Date;
  estado: string;
  deletedAt: Date | null;
  total:number | 0;
}

export interface VentaDetail extends VentaInfo{
  detalles: DetalleVentaDetail[];
}

export interface DetalleVentaDetail {
  id: number;
  producto: ProductoSimple;
  lotes: VentaLote[];
  cantidad: number;
  precio: number;
  total: number;
}

export interface VentaLoteProducto {
  id: number;
  cantidad: number;
  productoId: string;
}

export interface VentaLote {
  id: number;
  lote: string;
  cantidad: number;
  fechaVencimiento: Date;
}

export interface VentaLoteProductoDAO {
  id: number;
  stock: number;
  precioVenta: number;
}

export interface VentaResponse {
    ventaId: number;
}