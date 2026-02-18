# 💊 Farmacia Santi — Panel de Administración (Frontend)

> Panel de administración web para la gestión integral de **Farmacia Santi**: productos farmacéuticos, inventario, compras, ventas, clientes, usuarios y reportes.

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Estructura de Directorios](#-estructura-de-directorios)
- [Módulos de Páginas](#-módulos-de-páginas)
- [Servicios (API)](#-servicios-api)
- [Hooks Personalizados](#-hooks-personalizados)
- [Modelos de Datos (TypeScript)](#-modelos-de-datos-typescript)
- [Contexts (Estado Global)](#-contexts-estado-global)
- [Componentes](#-componentes)
- [Utilidades](#-utilidades)
- [Sistema de Rutas](#-sistema-de-rutas)
- [Autenticación y Seguridad](#-autenticación-y-seguridad)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Convenciones y Buenas Prácticas](#-convenciones-y-buenas-prácticas)

---

## 📝 Descripción General

**Farmacia Santi Admin** es una aplicación de tipo **SPA (Single Page Application)** que funciona como panel de administración para la cadena de farmacias **Farmacia Santi**. Permite gestionar todas las operaciones del negocio desde una interfaz moderna, responsiva y con soporte para temas claro/oscuro.

### Funcionalidades principales

| Módulo | Descripción |
|---|---|
| **Dashboard** | Vista general con estadísticas y métricas del negocio |
| **Usuarios** | CRUD completo de usuarios con asignación de roles |
| **Roles** | Gestión de roles y permisos del sistema |
| **Productos** | Administración del catálogo de productos farmacéuticos |
| **Categorías** | Clasificación de productos por categorías |
| **Laboratorios** | Gestión de laboratorios proveedores de medicamentos |
| **Principios Activos** | Registro de compuestos farmacéuticos activos |
| **Lotes de Productos** | Control de lotes con fechas de vencimiento |
| **Compras** | Registro y seguimiento de órdenes de compra |
| **Ventas** | Gestión del proceso de ventas |
| **Clientes** | Administración de la base de clientes |
| **Proveedores** | Gestión de proveedores de la farmacia |
| **Movimientos** | Registro de movimientos de inventario |
| **Reportes** | Generación de reportes (ventas, compras, clientes, usuarios, inventario, lotes) |
| **Control de Vencimientos** | Monitoreo de productos próximos a vencer |
| **Backups** | Gestión de copias de seguridad de la base de datos |

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.2.x | Librería de UI |
| **TypeScript** | 5.7.x | Tipado estático |
| **Vite** | 6.2.x | Bundler y servidor de desarrollo |
| **Tailwind CSS** | 4.1.x | Framework de estilos utilitarios |
| **shadcn/ui** | New York | Sistema de componentes UI (basado en Radix UI) |
| **React Router** | 7.4.x | Enrutamiento SPA |
| **Axios** | 1.9.x | Cliente HTTP para la API REST |
| **Zod** | 3.24.x | Validación de esquemas de datos |
| **React Hook Form** | (con `@hookform/resolvers`) | Gestión de formularios |
| **Chart.js + react-chartjs-2** | 4.5.x / 5.3.x | Gráficos y visualizaciones |
| **jsPDF + jspdf-autotable** | 3.x / 5.x | Generación de reportes PDF |
| **date-fns + dateformat** | 4.x / 5.x | Formateo y manipulación de fechas |
| **Lucide React** | 0.487.x | Iconos SVG |
| **Sonner** | 2.x | Notificaciones tipo toast |
| **next-themes** | 0.4.x | Soporte de tema claro/oscuro |
| **Docker + Nginx** | Alpine | Contenerización y servidor estático |

---

## 📦 Requisitos Previos

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (o **pnpm** como alternativa)
- **Docker** (opcional, para despliegue)

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd farma-santi-admin_frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` o `.env.development` en la raíz del proyecto:

```env
# Desarrollo local
VITE_API_URL=http://localhost:8890

# Producción
# VITE_API_URL=https://backend.farmaciasanti.net
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:5173** (accesible desde cualquier IP en la red gracias a `host: "0.0.0.0"`).

---

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend API | `http://localhost:8890` |

> **Nota:** En producción con Docker, la variable se inyecta dinámicamente en tiempo de ejecución mediante el `entrypoint.sh`, que genera un archivo `env-config.js` accesible desde `window.ENV`.

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR (Vite) |
| `npm run build` | Compila TypeScript y genera el bundle de producción en `dist/` |
| `npm run lint` | Ejecuta ESLint para verificar la calidad del código |
| `npm run preview` | Sirve localmente el build de producción para pruebas |

---

## 🏗 Arquitectura del Proyecto

La aplicación sigue una **arquitectura modular por capas** organizada de la siguiente manera:

```
┌──────────────────────────────────────────────────────┐
│                      Páginas                         │
│  (Vistas completas: Dashboard, Usuarios, Ventas...) │
├──────────────────────────────────────────────────────┤
│                    Componentes                       │
│  (UI reutilizable, shadcn/ui, formularios, modales) │
├──────────────────────────────────────────────────────┤
│                Custom Hooks + Context                │
│  (useQuery, useMutation, useAuth, Providers)        │
├──────────────────────────────────────────────────────┤
│                    Servicios                         │
│  (Capa de comunicación API con Axios)               │
├──────────────────────────────────────────────────────┤
│                     Modelos                          │
│  (Interfaces y tipos TypeScript)                    │
├──────────────────────────────────────────────────────┤
│                   Utilidades                         │
│  (PDF, formateo de fechas, búsqueda)                │
└──────────────────────────────────────────────────────┘
```

### Flujo de datos

```
Página → Hook personalizado → Servicio (Axios) → API REST Backend
                ↕
         Context (Estado global)
```

---

## 📂 Estructura de Directorios

```
farma-santi-admin_frontend/
├── public/                      # Archivos estáticos (favicon, logo)
├── src/
│   ├── assets/                  # Recursos estáticos (imágenes, íconos)
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # Componentes shadcn/ui (29 componentes)
│   │   ├── all-providers.tsx    # Composición de todos los Context Providers
│   │   ├── ProtectedRoute.tsx   # Guard de rutas autenticadas
│   │   ├── ProtectedLogin.tsx   # Guard de la ruta de login
│   │   ├── ButtonLink.tsx       # Botón con navegación
│   │   ├── FomField.tsx         # Campo de formulario reutilizable
│   │   ├── Input.tsx            # Input personalizado
│   │   ├── Spinner.tsx          # Indicador de carga animado
│   │   ├── mode-toggle.tsx      # Selector de tema claro/oscuro
│   │   ├── search-input.tsx     # Input de búsqueda con debounce
│   │   ├── theme-provider.tsx   # Proveedor del tema (next-themes)
│   │   └── toast.tsx            # Utilidades de notificación toast
│   ├── context/                 # React Context Providers (estado global)
│   │   ├── categoriaContext.tsx
│   │   ├── clienteContext.tsx
│   │   ├── compraContext.tsx
│   │   ├── laboratorioContext.tsx
│   │   ├── loteProductoLote.tsx
│   │   ├── principioActivoContext.tsx
│   │   ├── productoContext.tsx
│   │   ├── proveedorContext.tsx
│   │   ├── rolesContext.tsx
│   │   ├── usuarioContex.tsx
│   │   ├── usuarioDetailContext.tsx
│   │   └── ventaContext.tsx
│   ├── hooks/                   # Custom React Hooks
│   │   ├── generic.ts           # useQuery y useMutation genéricos
│   │   ├── useAuth.tsx          # Autenticación (login, logout, refresh)
│   │   ├── useDebounce.tsx      # Debounce para búsquedas
│   │   ├── use-mobile.ts        # Detección de dispositivo móvil
│   │   ├── useCategoria.tsx     # Operaciones de categorías
│   │   ├── useCliente.tsx       # Operaciones de clientes
│   │   ├── useCompra.tsx        # Operaciones de compras
│   │   ├── useLaboratorio.tsx   # Operaciones de laboratorios
│   │   ├── useLoteProducto.tsx  # Operaciones de lotes
│   │   ├── usePrincipioActivo.tsx # Operaciones de principios activos
│   │   ├── useProducto.tsx      # Operaciones de productos
│   │   ├── useProveedor.tsx     # Operaciones de proveedores
│   │   ├── useRol.tsx           # Operaciones de roles
│   │   ├── useUsuario.tsx       # Operaciones de usuarios
│   │   └── useVenta.tsx         # Operaciones de ventas
│   ├── layouts/                 # Layouts de la aplicación
│   │   └── MainLayout/          # Layout principal con sidebar + navbar
│   │       ├── MainLayout.tsx   # Componente principal del layout
│   │       ├── components/      # Sidebar, Navbar, Divider
│   │       └── constants/       # Configuración de ítems del sidebar
│   ├── lib/                     # Librerías de utilidad
│   │   └── utils.ts             # Función cn() para clsx + tailwind-merge
│   ├── models/                  # Interfaces y tipos TypeScript
│   │   ├── auth.ts              # UserRequest
│   │   ├── backup.ts            # Interfaces de backup
│   │   ├── categoria.ts         # Categoría de productos
│   │   ├── cliente.ts           # Datos de clientes
│   │   ├── compra.ts            # Órdenes de compra
│   │   ├── laboratorio.ts       # Laboratorios
│   │   ├── loteProducto.ts      # Lotes de productos
│   │   ├── messageResponse.ts   # Respuesta genérica del API
│   │   ├── movimiento.ts        # Movimientos de inventario
│   │   ├── presentacion.ts      # Presentaciones de productos
│   │   ├── principioActivo.ts   # Principios activos
│   │   ├── producto.ts          # Productos farmacéuticos
│   │   ├── proveedor.ts         # Proveedores
│   │   ├── rol.ts               # Roles de usuario
│   │   ├── stat.ts              # Estadísticas del dashboard
│   │   ├── usuario.ts           # Usuarios del sistema
│   │   └── venta.ts             # Ventas
│   ├── pages/                   # Módulos de páginas (19 módulos)
│   │   ├── Backups/
│   │   ├── CategoriasProductos/
│   │   ├── Clientes/
│   │   ├── Compras/
│   │   ├── ControlVencimientos/
│   │   ├── Dashboard/
│   │   ├── Laboratorios/
│   │   ├── Login/
│   │   ├── LotesProductos/
│   │   ├── Movimientos/
│   │   ├── NotFound/
│   │   ├── Nothing/
│   │   ├── PrincipiosActivos/
│   │   ├── Productos/
│   │   ├── Proveedores/
│   │   ├── Reportes/
│   │   ├── Roles/
│   │   ├── Usuarios/
│   │   └── Ventas/
│   ├── services/                # Capa de servicios (comunicación API)
│   │   ├── axiosClient.ts       # Instancia Axios configurada
│   │   ├── authService.ts       # Login, logout, refresh, verify
│   │   ├── categoriaService.ts
│   │   ├── clienteService.ts
│   │   ├── compraService.ts
│   │   ├── laboratorioService.ts
│   │   ├── loteProductoService.ts
│   │   ├── movimientoService.ts
│   │   ├── presentacionService.ts
│   │   ├── principioActivoService.ts
│   │   ├── productoService.ts
│   │   ├── proveedorService.ts
│   │   ├── rolService.ts
│   │   ├── statService.ts
│   │   ├── usuarioService.ts
│   │   └── ventaService.ts
│   ├── utils/                   # Funciones utilitarias
│   │   ├── dateFormatter.ts     # Localización de fechas al español
│   │   ├── pdf.ts               # Generación de PDFs (usuario)
│   │   └── search.ts            # Utilidad de búsqueda/filtrado
│   ├── App.tsx                  # Componente raíz
│   ├── main.tsx                 # Punto de entrada de la aplicación
│   ├── routers.tsx              # Definición de todas las rutas
│   └── index.css                # Estilos globales + Tailwind CSS
├── Dockerfile                   # Imagen Docker (nginx:alpine)
├── nginx.conf                   # Configuración de Nginx para SPA
├── entrypoint.sh                # Script de inyección de variables de entorno
├── components.json              # Configuración de shadcn/ui
├── vite.config.ts               # Configuración de Vite
├── tsconfig.json                # Configuración base de TypeScript
├── tsconfig.app.json            # Configuración TS para la aplicación
├── tsconfig.node.json           # Configuración TS para el entorno de Node
├── eslint.config.js             # Configuración de ESLint
├── package.json                 # Dependencias y scripts
└── .env / .env.development      # Variables de entorno
```

---

## 📄 Módulos de Páginas

Cada módulo de página sigue una estructura interna consistente con componentes propios, formularios y tablas:

| Módulo | Ruta | Componentes internos |
|---|---|---|
| `Dashboard` | `/main/dashboard` | Estadísticas, gráficos |
| `Usuarios` | `/main/usuarios` | Tabla, formulario CRUD, detalle, PDF |
| `Roles` | `/main/roles` | Tabla, formulario CRUD |
| `CategoriasProductos` | `/main/categorias-productos` | Tabla, formulario CRUD |
| `Productos` | `/main/productos` | Tabla, formulario CRUD, detalle |
| `Laboratorios` | `/main/laboratorios` | Tabla, formulario CRUD |
| `PrincipiosActivos` | `/main/principios-activos` | Tabla, formulario CRUD |
| `LotesProductos` | `/main/lotes-productos` | Tabla, control de stock |
| `Compras` | `/main/compras` | Registro de compras |
| `Ventas` | `/main/ventas` | Registro de ventas |
| `Clientes` | `/main/clientes` | Tabla, formulario CRUD |
| `Proveedores` | `/main/proveedores` | Tabla, formulario CRUD |
| `Movimientos` | `/main/movimientos` | Historial de movimientos |
| `Reportes` | `/main/reportes/*` | Ventas, compras, clientes, usuarios, inventario, lotes |
| `ControlVencimientos` | `/main/control-vencimientos` | Productos próximos a vencer |
| `Backups` | `/main/backups` | Gestión de copias de seguridad |
| `Login` | `/login` | Formulario de autenticación |
| `NotFound` | `*` | Página 404 |

---

## 🔌 Servicios (API)

Los servicios se comunican con el backend REST a través del cliente Axios configurado en `axiosClient.ts`.

### Cliente Axios (`axiosClient.ts`)

- **Base URL:** `{VITE_API_URL}/api/v1`
- **Headers:** `Content-Type: application/json`
- **Credenciales:** `withCredentials: true` (cookies HTTP-only)
- **Interceptor de request:** Adjunta automáticamente el token JWT desde `localStorage`
- **Interceptor de response:** Redirige a `/login` en caso de respuesta `401 Unauthorized`
- **Soporte runtime:** Detecta `window.ENV` para inyección dinámica en Docker

### Servicios disponibles

| Servicio | Archivo | Operaciones |
|---|---|---|
| Autenticación | `authService.ts` | `logIn`, `logOut`, `refreshToken`, `verifyToken` |
| Usuarios | `usuarioService.ts` | CRUD + detalle + activar/desactivar |
| Roles | `rolService.ts` | CRUD completo |
| Productos | `productoService.ts` | CRUD + búsqueda + filtros + fotos |
| Categorías | `categoriaService.ts` | CRUD completo |
| Laboratorios | `laboratorioService.ts` | CRUD + búsqueda |
| Principios Activos | `principioActivoService.ts` | CRUD completo |
| Lotes de Productos | `loteProductoService.ts` | CRUD + control de stock |
| Compras | `compraService.ts` | CRUD + líneas de compra |
| Ventas | `ventaService.ts` | Registro + consulta |
| Clientes | `clienteService.ts` | CRUD completo |
| Proveedores | `proveedorService.ts` | CRUD completo |
| Movimientos | `movimientoService.ts` | Consulta de movimientos |
| Presentaciones | `presentacionService.ts` | Consulta de presentaciones |
| Estadísticas | `statService.ts` | Datos del dashboard |
| Backups | `backupService.ts` | Crear/restaurar backups |

---

## 🪝 Hooks Personalizados

### Hooks genéricos (`generic.ts`)

La aplicación implementa dos hooks genéricos que encapsulan toda la lógica de peticiones asíncronas:

```typescript
// Para operaciones de lectura (GET)
useQuery<TData, TParams>(requestFn) → { fetch, data, loading, error }

// Para operaciones de escritura (POST, PUT, DELETE)
useMutation<TData, TParams>(mutationFn) → { mutate, data, loading, error }
```

Ambos hooks gestionan automáticamente:
- ✅ Estado de carga (`loading`)
- ✅ Manejo de errores (`error`)
- ✅ Prevención de llamadas duplicadas
- ✅ Datos de respuesta tipados (`data`)

### Hooks de dominio

Cada entidad del negocio tiene su propio hook que utiliza los genéricos:

| Hook | Funcionalidad |
|---|---|
| `useAuth` | `useLogin`, `useLogOut`, `useAutoRefreshToken`, `useVerifyToken` |
| `useCategoria` | Operaciones CRUD de categorías |
| `useCliente` | Operaciones CRUD de clientes |
| `useCompra` | Operaciones CRUD de compras |
| `useLaboratorio` | Operaciones CRUD de laboratorios |
| `useLoteProducto` | Operaciones de lotes de productos |
| `usePrincipioActivo` | Operaciones de principios activos |
| `useProducto` | Operaciones CRUD de productos |
| `useProveedor` | Operaciones CRUD de proveedores |
| `useRol` | Operaciones CRUD de roles |
| `useUsuario` | Operaciones CRUD de usuarios |
| `useVenta` | Operaciones de ventas |
| `useDebounce` | Debounce genérico para búsquedas |
| `use-mobile` | Detección de viewport móvil |

---

## 📐 Modelos de Datos (TypeScript)

Todos los modelos se definen como interfaces TypeScript en `src/models/`. Ejemplo para `Producto`:

| Interfaz | Descripción |
|---|---|
| `ProductoInfo` | Datos resumidos para listados |
| `ProductoDetail` | Datos completos incluyendo relaciones (categorías, laboratorio, principios activos) |
| `ProductoRequest` | Datos para crear/actualizar un producto |
| `ProductoSimple` | Datos mínimos para selectores y referencias |

### Entidades principales

| Modelo | Descripción |
|---|---|
| `auth.ts` | `UserRequest` — credenciales de autenticación |
| `usuario.ts` | Usuarios del sistema con persona y roles asociados |
| `rol.ts` | Roles con nombre y descripción |
| `producto.ts` | Productos con presentaciones, principios activos, categorías |
| `compra.ts` | Compras con líneas de detalle |
| `venta.ts` | Ventas con productos vendidos |
| `cliente.ts` | Datos de clientes con persona |
| `proveedor.ts` | Datos de proveedores |
| `laboratorio.ts` | Laboratorios farmacéuticos |
| `loteProducto.ts` | Lotes con fechas de vencimiento y stock |
| `movimiento.ts` | Movimientos de inventario |
| `stat.ts` | Estadísticas para el dashboard |
| `messageResponse.ts` | Respuesta genérica `{ status, message }` |

---

## 🧩 Componentes

### Componentes UI (`src/components/ui/`)

29 componentes de **shadcn/ui** (estilo New York) basados en **Radix UI**:

| Componente | Descripción |
|---|---|
| `alert-dialog` | Diálogos de confirmación |
| `button` | Botones con variantes (default, destructive, outline, etc.) |
| `card` | Tarjetas contenedoras |
| `calendar` | Selector de fechas |
| `command` | Menú de comandos (búsqueda) |
| `dialog` | Modales |
| `dropdown-menu` | Menús desplegables |
| `form` | Integración con React Hook Form |
| `input` / `textarea` | Campos de entrada |
| `pagination` | Paginación de tablas |
| `select` | Selector con opciones |
| `sidebar` | Barra lateral colapsable |
| `sheet` | Panel deslizante |
| `skeleton` | Placeholder de carga |
| `table` | Tablas de datos |
| `tabs` | Navegación por pestañas |
| `tooltip` | Información emergente |
| `sonner` | Notificaciones toast (Sonner) |
| Y más... | `avatar`, `badge`, `breadcrumb`, `checkbox`, `label`, `popover`, `scroll-area`, `separator` |

### Componentes de aplicación (`src/components/`)

| Componente | Descripción |
|---|---|
| `ProtectedRoute` | Guard de rutas que verifica el token de sesión mediante `verifyToken()` |
| `ProtectedLogin` | Redirige usuarios autenticados fuera de la página de login |
| `AllProviders` | Composición jerárquica de todos los context providers |
| `theme-provider` | Proveedor del tema claro/oscuro (basado en `next-themes`) |
| `mode-toggle` | Botón para cambiar entre tema claro, oscuro y sistema |
| `search-input` | Campo de búsqueda reutilizable |
| `Spinner` | Animación de carga |
| `ButtonLink` | Botón con capacidad de navegación |
| `toast` | Funciones utilitarias de notificación |

---

## 🔧 Utilidades

### `dateFormatter.ts`
Configura la librería `dateformat` con nombres de días y meses en **español**.

### `pdf.ts`
Genera reportes PDF de usuarios con **jsPDF** y **jspdf-autotable**, incluyendo:
- Información del usuario (username, estado, fecha de registro)
- Datos personales (CI, nombre, apellidos, teléfono, email, dirección)
- Roles asignados
- Pie de página con fecha de generación

### `search.ts`
Función utilitaria para filtrado/búsqueda de registros en listas locales.

### `lib/utils.ts`
Función `cn()` que combina `clsx` con `tailwind-merge` para composición eficiente de clases CSS.

---

## 🛤 Sistema de Rutas

La aplicación utiliza **React Router v7** con la siguiente estructura:

```
/ ──────────────────── → Redirige a /login
/logout ────────────── → Redirige a /login
/login ─────────────── → Página de inicio de sesión (pública, protegida contra re-login)

/main ──────────────── → Layout principal (protegido, requiere autenticación)
  ├── /dashboard
  ├── /usuarios
  ├── /roles
  ├── /categorias-productos
  ├── /productos
  ├── /laboratorios
  ├── /principios-activos
  ├── /lotes-productos
  ├── /compras
  ├── /ventas
  ├── /clientes
  ├── /movimientos
  ├── /reportes
  │     ├── /ventas
  │     ├── /compras
  │     ├── /clientes
  │     ├── /usuarios
  │     ├── /inventario
  │     └── /lotes-productos
  ├── /control-vencimientos
  ├── /backups
  └── /* ─────────────── → Página 404

/* ──────────────────── → Página 404 (global)
```

### Protección de rutas

- **`ProtectedRoute`**: Verifica la sesión del usuario llamando a `verifyToken()`. Si no hay sesión válida, redirige a `/logout`.
- **`ProtectedLogin`**: Impide que usuarios ya autenticados accedan a la página de login.

---

## 🔐 Autenticación y Seguridad

### Flujo de autenticación

```
1. Usuario envía credenciales → POST /api/v1/auth/login
2. Backend responde con JWT en cookies HTTP-only
3. Token se almacena en localStorage (referencia)
4. Cada petición adjunta el token via interceptor de Axios
5. Auto-refresh del token cada 60 segundos (si quedan < 2min de vida)
6. Si token expira → redirección automática a /login (interceptor 401)
```

### Mecanismo de refresh automático (`useAutoRefreshToken`)

- Se ejecuta al montar el `MainLayout`
- Verifica la cookie `exp-access-token` cada **60 segundos**
- Si quedan menos de **2 minutos** de vida, llama a `GET /api/v1/auth/refresh`
- Si la cookie no existe, redirige al usuario al login

---

## 🐳 Despliegue con Docker

### Dockerfile

La imagen se basa en **nginx:alpine** y sirve la aplicación como archivos estáticos:

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

### Pasos de despliegue

```bash
# 1. Compilar la aplicación
npm run build

# 2. Construir la imagen Docker
docker build -t farma-santi-admin .

# 3. Ejecutar el contenedor
docker run -d \
  -p 80:80 \
  -e VITE_API_URL=https://backend.farmaciasanti.net \
  --name farma-admin \
  farma-santi-admin
```

### Configuración de Nginx (`nginx.conf`)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA fallback
    }
}
```

### Inyección de variables en runtime (`entrypoint.sh`)

El script `entrypoint.sh` genera dinámicamente un archivo `env-config.js` con las variables de entorno del contenedor, permitiendo configurar la URL del API sin necesidad de reconstruir la imagen:

```javascript
// Archivo generado: /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_API_URL: "https://backend.example.com",
}
```

---

## 📏 Convenciones y Buenas Prácticas

### Estructura de código

- **Alias de importación:** `@/` → `./src/` configurado en TypeScript y Vite
- **Barrel exports:** Cada directorio tiene un `index.ts` que re-exporta sus módulos
- **Naming:** Archivos de páginas en `PascalCase`, servicios y hooks en `camelCase`
- **TypeScript estricto:** `strict: true`, `noUnusedLocals`, `noUnusedParameters`

### Patrones de diseño

1. **Hooks genéricos** (`useQuery`/`useMutation`): Encapsulan toda la lógica asíncrona y evitan duplicación
2. **Context per entity**: Cada entidad del dominio tiene su propio contexto para estado compartido
3. **Service layer**: La comunicación con la API está completamente desacoplada de los componentes
4. **Protected routes**: Guards de ruta basados en verificación de token del lado del servidor
5. **Runtime env injection**: Variables de entorno inyectadas en tiempo de ejecución para Docker

### Estilo

- **Tailwind CSS v4** como framework de estilos
- **shadcn/ui (New York style)** para componentes de interfaz consistentes
- **Tema claro/oscuro** con persistencia vía `next-themes`
- **Función `cn()`** para composición de clases con resolución de conflictos

---

