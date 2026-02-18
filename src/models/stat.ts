// Modelo para el Top de Productos
export interface ProductoStat {
    id: number;
    nombreComercial: string;
    fotos: string[];
    cantidad: number;
}

// Modelo auxiliar para el gráfico de tendencias diarias
export interface VentaDiaria {
    fecha: string;
    total: number;
}

// Modelo principal para el Dashboard
export interface DashboardStats {
    totalVentas: number;
    cantidadVentas: number;
    totalCompras: number;
    cantidadCompras: number;
    ventasDiarias: VentaDiaria[];
}