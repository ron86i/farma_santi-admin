export interface CategoriaRequest {
    nombre: string;
}

export interface Categoria {
    id: number;
    nombre: string;
    estado: string;
    createdAt: Date;
    deletedAt: Date | null
}

export interface CategoriaSimple {
    id: number;
    nombre: string;
}