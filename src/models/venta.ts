import { ClienteSimple, ProductoSimple, UsuarioSimple } from ".";

export interface VentaRequest {
  usuarioId?: number; // se asigna automáticamente si la sesión del usuario ya la envía el backend
  clienteId: number;
  descuento?: number; // hacerlo opcional por si no hay descuento (0)
  tipoPago?: "Efectivo" | "Tarjeta" | "Transferencia"; // usar union type en lugar de string libre
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
  descuento: number;
  tipoPago: string;
  total: number | 0;
  url: string;
}

export interface VentaDetail extends VentaInfo {
  detalles: DetalleVentaDetail[];
}

export interface DetalleVentaDetail {
  id: number;
  producto: ProductoSimple;
  lotes: VentaLote[];
  cantidad: number;
  precio: number;
  total: number;
  url: string;
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