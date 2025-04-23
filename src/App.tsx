import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { Login, NotFound, Dashboard, Usuarios } from "@/pages";
import { MainLayout } from "@/layouts";
import { ProtectedRoute } from "@/components";
import { i18n } from "dateformat";
// Personalización del idioma (como lo hiciste)
i18n.dayNames = [
    "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb",
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
];

i18n.monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

i18n.timeNames = ["a", "p", "a. m.", "p. m.", "A", "P", "A. M.", "P. M."];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/main" element={<Navigate to="/main/dashboard" replace />} />

        {/* Ruta pública */}
        <Route element={<ProtectedRoute redirectTo="/main/dashboard" valid={true}/>}>
          <Route path="/login" element={<Login />}/>
        </Route>


        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute redirectTo="/login" valid={false}/>}>
          <Route path="/main" element={<MainLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<NotFound />} />
      </Routes>

    </Router>
  );
}

export default App;

