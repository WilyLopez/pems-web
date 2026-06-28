# Kiki y Lala PEMS — Frontend

Aplicación web del sistema de gestión de eventos para Kiki y Lala. Construida con Next.js 16 / React 18 / TypeScript, desplegada en Vercel.

**Producción:** https://kikiylala.vercel.app  
**API Backend:** https://app-kikiylala.up.railway.app/api/v1

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2 | Framework React (App Router) |
| React | 18.3 | UI |
| TypeScript | 5.9 | Tipado estático |
| TailwindCSS | 3.4 | Estilos |
| shadcn/ui + Radix UI | — | Componentes de UI |
| Framer Motion | 12 | Animaciones |
| Supabase JS | 2.108 | Autenticación (SSR) |
| TanStack Query | 5 | Server state y caché |
| TanStack Table | 8 | Tablas con paginación y filtros |
| Axios | 1.12 | HTTP client con interceptores JWT |
| Zustand | 5 | Estado global del cliente |
| React Hook Form | 7.62 | Formularios |
| Zod | 4 | Validación de esquemas |
| Recharts | 3 | Gráficos y dashboards |
| Mapbox GL | 3.25 | Mapas interactivos |
| jsQR | 1.4 | Escaneo de QR (POS presencial) |
| Sonner | 2 | Notificaciones toast |
| date-fns | 4 | Manejo de fechas |

## Arquitectura

```
src/
├── app/                    # Rutas Next.js (App Router)
│   ├── (public)/           # Páginas públicas: landing, eventos, FAQ, nosotros
│   ├── auth/               # Login, registro, recuperación y cambio de contraseña
│   ├── admin/              # Panel administrativo (rol STAFF / ADMIN)
│   ├── cliente/            # Panel del cliente (rol CLIENTE)
│   └── api/                # API routes internas de Next.js
│
├── features/               # Lógica de negocio por módulo
│   ├── admin/
│   │   ├── calendario/     # Disponibilidad, bloqueos, configuración
│   │   ├── eventos/        # Gestión de eventos y reservas
│   │   ├── usuarios/       # Gestión de usuarios y roles
│   │   ├── caja/           # Punto de venta presencial (POS)
│   │   ├── cms/            # Banners, galería, contenido
│   │   ├── configuracion/  # Sedes, tarifas, configuración global
│   │   ├── reportes/       # Reportes y estadísticas
│   │   └── marketing/      # Campañas de email
│   ├── auth/               # Flujo de autenticación Supabase
│   ├── cliente/            # Reservas, mis eventos, mi cuenta, beneficios
│   └── public/             # Landing, reservar online, nosotros
│
├── components/             # Componentes reutilizables
│   ├── ui/                 # Primitivos shadcn/ui (Button, Input, Dialog…)
│   ├── common/             # DataTable, PageHeader, StatusBadge, Pagination
│   └── layout/             # Sidebar, Navbar, Header, MobileMenu
│
├── services/               # Llamadas al API REST del backend (22+ servicios)
├── hooks/                  # Custom hooks con TanStack Query por módulo
├── lib/
│   ├── axios.ts            # HTTP client configurado con interceptores JWT
│   ├── supabase/           # Clientes Supabase (browser, server, middleware)
│   └── store/              # Zustand stores (auth, sesión, sidebar, tema)
├── types/                  # TypeScript interfaces, enums y tipos de API
├── config/                 # Rutas, navegación, permisos por rol, env vars
└── providers/              # QueryClientProvider y providers globales React
```

## Roles y acceso

| Rol | Ruta base | Descripción |
|---|---|---|
| Público | `/` `/eventos` `/celebraciones` `/nosotros` `/faq` | Sin autenticación requerida |
| `CLIENTE` | `/cliente/**` | Reservas, mis eventos, mi cuenta, beneficios |
| `STAFF` | `/admin/**` | Panel completo: calendario, eventos, caja, CMS |
| `ADMIN` | `/admin/**` | Igual que STAFF + usuarios y configuración global |

El middleware `src/proxy.ts` protege las rutas y redirige al login si la sesión no es válida o el rol no corresponde.

## Requisitos locales

- Node.js 20+
- npm 10+
- Variables de entorno configuradas (ver `.env.example`)

## Configuración local

```bash
cp .env.example .env.local
```

Variables requeridas en `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=Kiki y Lala
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox-token>
```

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (http://localhost:3000)
npm run build        # Build de producción
npm run start        # Servidor de producción (requiere build previo)
npm run lint         # Análisis ESLint
npm run format       # Formatear con Prettier
```

## Autenticación

Gestionada íntegramente por **Supabase Auth**:

- Login con email y contraseña
- Recuperación de contraseña por correo electrónico
- Cambio de contraseña forzado en el primer login (usuarios staff)
- Sesión persistida en cookies via `@supabase/ssr` (compatible con SSR de Next.js)
- El JWT de Supabase se adjunta automáticamente en cada petición al backend via interceptor de Axios

## Despliegue en Vercel

1. Conectar el repositorio en Vercel (root directory: `pems-web/` si es monorepo).
2. Framework detectado automáticamente: **Next.js**.
3. Configurar variables de entorno en Vercel → Settings → Environment Variables.
4. Deploy automático en cada push a `main`.

Ver `vercel.json` para configuración de headers de seguridad HTTP.

## Variables de entorno en producción (Vercel)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública del backend Railway + `/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token público de Mapbox GL |

> Todas las variables `NEXT_PUBLIC_*` son accesibles desde el navegador. No colocar secretos en ellas.
