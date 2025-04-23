import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export function Dashboard() {
  return (
    <div className=" bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg">
      <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Tarjetas de estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Total Ventas</CardTitle>
            <CardDescription>2,150 💰</CardDescription>
          </CardHeader>
          
        </Card>
        {/* <Card title="Usuarios Activos" value="320" icon="👥" />
        <Card title="Productos Disponibles" value="75" icon="📦" />
        <Card title="Pedidos Completados" value="1,120" icon="✅" /> */}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
          Últimas Actividades
        </h2>
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 shadow-md">
          <ul>
            <li className="text-neutral-700 dark:text-neutral-300 mb-2">
              🛒 Pedido #11234 completado por Juan Pérez
            </li>
            <li className="text-neutral-700 dark:text-neutral-300 mb-2">
              👤 Nuevo usuario registrado: Maria López
            </li>
            <li className="text-neutral-700 dark:text-neutral-300 mb-2">
              🛍️ Producto "Aspirina" agotado
            </li>
            <li className="text-neutral-700 dark:text-neutral-300 mb-2">
              📝 Informe de ventas del mes generado
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
