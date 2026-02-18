export interface Laboratorio {
    id: number;
    nombre: string;
    direccion: string;
    representante: string;
    telefono?: number;
    celular?: number;
    email?: string;
    estado: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
// 
export interface LaboratorioInfo {
    id: number;
    nombre: string;
    estado: string;
    direccion: string;
    createdAt: Date;
    deletedAt: Date | null;
}
export interface LaboratorioRequest {
    nombre: string;
    direccion: string
    representante: string;
    telefono?: number;
    celular?: number;
    email?: string;
}

export interface LaboratorioSimple {
    // Define aquí las propiedades del laboratorio, por ejemplo:
    id: number;
    nombre: string;
}
export interface LaboratorioDetail extends Laboratorio { }