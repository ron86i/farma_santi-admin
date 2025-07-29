export interface Proveedor {
  id: number;
  nit: number;
  razonSocial: string;
  representante: string;
  direccion: string | null;
  telefono: number | null;
  email: string | null;
  celular: number | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface ProveedorDetail extends Proveedor { }

export interface ProveedorRequest {
  nit: number;
  razonSocial: string;
  representante: string;
  direccion: string;
  telefono?: number | null;
  email?: string | null;
  celular?: number | null;
}

export interface ProveedorInfo {
  id: number;
  nit: number;
  razonSocial: string;
  estado: string;
  representante: string;
  direccion: string;
  createdAt: Date;
  deletedAt?: Date | null;
}

export interface ProveedorSimple {
  id: number;
  nit: number;
  razonSocial: string;
}