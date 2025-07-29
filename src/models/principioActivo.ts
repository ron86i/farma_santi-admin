export interface PrincipioActivo {
    id?: number;
    nombre?: string;
    descripcion?:string
}

export interface PrincipioActivoRequest {
    nombre: string;
    descripcion:string
}

export interface PrincipioActivoInfo {
    id: number;
    nombre: string;
    descripcion:string
}

export interface PrincipioActivoDetalle {
    id: number;
    nombre: string;
    descripcion:string
}
