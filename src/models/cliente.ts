

export enum TipoCliente {
  NIT = "NIT",
  CI = "CI",
}

export interface ClienteInfo {
  id: number;
  nitCi?: number;
  complemento?: string;
  tipo: TipoCliente;
  estado: string;
  razonSocial: string;
}

export interface ClienteDetail {
  id: number;
  nitCi?: number;
  complemento?: string;
  tipo: TipoCliente;
  razonSocial: string;
  email: string;
  telefono?: number;
  estado: string;
  createdAt: Date;
  deletedAt?: Date;
}

export interface ClienteRequest {
  nitCi?: number;
  complemento?: string;
  tipo: TipoCliente;
  razonSocial: string;
  email?: string;
  telefono?: number;
}

export interface ClienteSimple {
  id: number;
  nitCi: number | null;
  complemento: string | null;
  razonSocial: string;
}

export interface ClienteId {
  id: number;
}