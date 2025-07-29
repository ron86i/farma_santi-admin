import { CategoriaSimple } from "./categoria";
import { LaboratorioSimple } from "./laboratorio";

export interface ProductoInfo {
  id: string;
  nombreComercial: string;
  formaFarmaceutica: string;
  laboratorio: string;
  precioCompra: number;
  precioVenta: number;
  stockMin: number;
  stock: number;
  estado: string;
  urlFoto: string;
  deletedAt: Date | null;
}

export interface PrincipioActivoProductoRequest {
  principioActivoId: number;
  concentracion: number;
  unidadMedidaId: number;
}

export interface ProductoRequest {
  nombreComercial: string;
  formaFarmaceuticaId: number;
  precioVenta: number;
  stockMin: number;
  categorias: number[];
  laboratorioId: number;
  principiosActivos: PrincipioActivoProductoRequest[]
}

export interface FormaFarmacetica {
  id: number;
  nombre: string;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura?: string;
}

export interface PrincipioActivoInfo {
  id: number;
  nombre: string;
}

export interface ProductoPrincipioActivo {
  concentracion: number;
  unidadMedida: UnidadMedida;
  principioActivo: PrincipioActivoInfo;
}

export interface ProductoDetail {
  id: string;
  nombreComercial: string;
  formaFarmaceutica: FormaFarmacetica;
  laboratorio: LaboratorioSimple;
  precioCompra: number;
  precioVenta: number;
  stockMin: number;
  stock: number;
  urlFotos: string[];
  estado: string;
  categorias: CategoriaSimple[]
  createdAt: Date;
  deletedAt: Date | null;
  principiosActivos: ProductoPrincipioActivo[];
}

export interface ProductoSimple {
  id: string;
  nombreComercial: string;
  formaFarmaceutica?:string
  laboratorio?: string;
}