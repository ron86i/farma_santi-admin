import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedLogin, ProtectedRoute } from "@/components";
import { MainLayout } from "@/layouts";
import { CategoriasProductos, Clientes, Compras, Dashboard, Laboratorios, Login, LotesProductos, Movimientos, NotFound, PrincipiosActivos, Productos, Proveedores, Reportes, Roles, Usuarios, Ventas } from "@/pages";
import { VisualizadorReporte } from "./pages/Reportes/components/VisualizadorReporte";

export function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/logout" element={<Navigate to="/login" replace />} />
                <Route path="/main" element={<Navigate to="/main/dashboard" replace />} />

                {/* Ruta pública */}
                <Route element={<ProtectedLogin />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* Rutas protegidas */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/main" element={<MainLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="usuarios" element={<Usuarios />} />
                        <Route path="roles" element={<Roles />} />
                        <Route path="categorias-productos" element={<CategoriasProductos />} />
                        <Route path="proveedores" element={<Proveedores />} />
                        <Route path="lotes-productos" element={<LotesProductos />} />
                        <Route path="principios-activos" element={<PrincipiosActivos />} />
                        <Route path="productos" element={<Productos />} />
                        <Route path="laboratorios" element={<Laboratorios />} />
                        <Route path="compras" element={<Compras />} />
                        <Route path="clientes" element={<Clientes />} />
                        <Route path="ventas" element={<Ventas />} />
                        <Route path="movimientos" element={<Movimientos />} />
                        <Route path="reportes" element={<Reportes />} />
                        <Route path="reportes/:tipo" element={<VisualizadorReporte />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Route>

                {/* Ruta por defecto */}
                <Route path="*" element={<NotFound />} />
            </Routes>

        </BrowserRouter>
    )
}