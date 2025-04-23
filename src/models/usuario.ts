import { RolInfo } from "./rol";

export interface UsuarioInfo {
  id: number;
  username: string;
  persona: Persona;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Persona {
  id: number;
  ci: number;
  complemento?: string | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: string;
}

export interface UsuarioRequest {
  username: string;
  persona: PersonaRequest
  roles: number[]
}
export interface PersonaRequest {
  ci: number;
  complemento?: string | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: string;
}

export interface UsuarioDetail {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  persona: Persona
  roles: RolInfo[]
}