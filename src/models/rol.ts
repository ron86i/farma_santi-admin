export interface Rol {
    id:number;
    nombre: string;
    createdAt: Date;
    deletedAt?: Date | null;
}
// 
export interface RolInfo {
    id:number;
    nombre: string;
}
export interface RolRequest {
    nombre: string;
}