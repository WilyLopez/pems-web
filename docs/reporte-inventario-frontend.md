# Reporte de Inventario Frontend — Proyecto PEMS (Kiki y Lala)

**Fecha:** 2026-06-13  
**Auditor:** Claude Sonnet 4.6  
**Propósito:** Inventario exhaustivo del estado del frontend antes de refactorizar y alinear con el backend migrado a Supabase (Fases 0–5).  
**Instrucción:** Solo lectura. Ningún archivo fue modificado.

---

## 1. Estructura General del Proyecto

### Ubicación
`d:\Aplicaciones\gestion-eventos\pems-web`

### Identificación del Proyecto
- **Nombre:** `Kiki y Lala-pems-web`
- **Next.js:** `^16.2.4`
- **React:** `18.3.1`
- **TypeScript:** `5.9.2` (strict mode habilitado)
- **Patrón de enrutamiento:** **App Router** (`src/app/`) — NO Pages Router

### Estadísticas
| Métrica | Valor |
|---------|-------|
| Total archivos `.tsx` + `.ts` | **359** |
| Componentes React | **152** |
| Archivos de servicio | **28** |
| Hooks personalizados | **34** |
| Archivos de tipos | **28** |
| Líneas de código (aprox.) | **~46 664** |

### Estructura de Carpetas — Primer y Segundo Nivel

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── (public)/          # Grupo de rutas públicas
│   ├── (wizard)/          # Grupo de rutas wizard
│   ├── admin/             # Rutas admin (protegidas)
│   ├── auth/              # Autenticación
│   ├── cliente/           # Rutas cliente (protegidas)
│   ├── api/               # API routes de Next.js
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── error.tsx
│   └── loading.tsx
├── components/            # 152 archivos .tsx
│   ├── admin/             # Subdividido en 18 subcarpetas
│   ├── brand/
│   ├── celebraciones/
│   ├── cliente/
│   ├── cms/
│   ├── common/
│   ├── dashboard/
│   ├── layout/
│   ├── public/
│   ├── sesion/
│   └── ui/                # shadcn/ui base
├── config/                # Configuraciones de app
│   ├── env.ts
│   ├── navigation.ts
│   ├── permissions.ts
│   ├── routes.ts
│   └── site.ts
├── features/              # Feature modules (vacíos — ver §11)
│   ├── audit/ | auth/ | cms/ | contracts/
│   ├── events/ | reservations/ | sales/
│   └── settings/ | users/
├── hooks/                 # 34 hooks personalizados
├── lib/
│   ├── auth.config.ts
│   ├── axios.ts           # Instancia Axios con interceptores
│   ├── query-client.ts
│   ├── store/             # 8 Zustand stores
│   ├── validations/       # Zod schemas
│   └── utils.ts
├── middleware.ts          # Protección de rutas (raíz de src/)
├── providers/             # Context providers
├── services/              # 28 archivos de servicio
├── types/                 # 28 archivos de tipos TypeScript
└── utils/
```

### Carpeta `public/`
- `logo-principal.png` (129.9 KB)
- `logo-secundario.png` (96.7 KB)

---

## 2. Arquitectura de Rutas y Páginas

### Layouts Compartidos
| Layout | Ruta | Descripción |
|--------|------|-------------|
| `src/app/layout.tsx` | Raíz | Root layout con providers |
| `src/app/(public)/layout.tsx` | Públicas | Navbar público + footer |
| `src/app/admin/layout.tsx` | Admin | Sidebar + navbar admin + verificación sesión |
| `src/app/cliente/layout.tsx` | Cliente | Sidebar + navbar cliente |
| `src/app/(wizard)/layout.tsx` | Wizard | Layout minimalista para flujo solicitud |
| `src/app/admin/finanzas/layout.tsx` | Admin > Finanzas | Sub-layout finanzas |

### Middleware de Autenticación
**Archivo:** `src/middleware.ts`  
**Matcher:** `/admin/:path*`, `/cliente/:path*`

```typescript
if (pathname.startsWith('/admin') && token?.rol !== 'ADMIN')
  → redirect('/auth/login?error=unauthorized')

if (pathname.startsWith('/cliente') && token?.rol !== 'CLIENTE')
  → redirect('/auth/login?error=unauthorized')
```

Además, `src/app/admin/layout.tsx` hace verificación server-side con `getServerSession()` como segunda capa.

---

### Rutas Públicas — `src/app/(public)/`

| Ruta | Página | Clasificación |
|------|--------|---------------|
| `/` | `(public)/page.tsx` | Pública |
| `/zona-de-juegos` | `zona-de-juegos/page.tsx` | Pública |
| `/eventos` | `eventos/page.tsx` | Pública |
| `/reservar` | `reservar/page.tsx` (**848 líneas**) | Pública |
| `/reservar/[fecha]` | `reservar/[fecha]/page.tsx` | Pública |
| `/promociones` | `promociones/page.tsx` | Pública |
| `/celebraciones` | `celebraciones/page.tsx` | Pública |
| `/eventos-privados` | `eventos-privados/page.tsx` | Pública |
| `/faq` | `faq/page.tsx` | Pública |
| `/nosotros` | `nosotros/page.tsx` | Pública |
| `/legal/[tipo]` | `legal/[tipo]/page.tsx` | Pública |

---

### Rutas de Autenticación — `src/app/auth/`

| Ruta | Página | Líneas |
|------|--------|--------|
| `/auth/login` | `login/page.tsx` | — |
| `/auth/registro` | `registro/page.tsx` | **526** |
| `/auth/cambiar-contrasena` | `cambiar-contrasena/page.tsx` | — |

**API route:** `src/app/api/auth/[...nextauth]/route.ts`

---

### Rutas Wizard — `src/app/(wizard)/`

| Ruta | Página | Líneas |
|------|--------|--------|
| `/celebraciones/solicitar` | `celebraciones/solicitar/page.tsx` | **930** |

---

### Rutas Cliente — `src/app/cliente/` (requiere `rol=CLIENTE`)

| Ruta | Página | Líneas |
|------|--------|--------|
| `/cliente` | `page.tsx` (redirect) | — |
| `/cliente/mi-cuenta` | `mi-cuenta/page.tsx` | **1 170** |
| `/cliente/mis-reservas` | `mis-reservas/page.tsx` | — |
| `/cliente/mis-eventos` | `mis-eventos/page.tsx` | — |
| `/cliente/mis-eventos/[id]` | `mis-eventos/[id]/page.tsx` | — |
| `/cliente/mis-entradas` | `mis-entradas/page.tsx` | — |

---

### Rutas Admin — `src/app/admin/` (requiere `rol=ADMIN`)

**Dashboard y Operación:**
| Ruta | Líneas |
|------|--------|
| `/admin/dashboard` | — |
| `/admin/calendario` | — |
| `/admin/accesos/entradas` | **907** |
| `/admin/auditoria` | — |

**Reservas y Eventos:**
| Ruta | Líneas |
|------|--------|
| `/admin/reservas` | **524** |
| `/admin/eventos` | — |
| `/admin/eventos/nuevo` | — |
| `/admin/eventos/[id]` | **547** |

**Clientes:**
`/admin/clientes`, `/admin/clientes/nuevo`, `/admin/clientes/[id]`

**Ventas y Pagos:**
`/admin/ventas`, `/admin/ventas/nueva`, `/admin/pagos`, `/admin/comprobante`

**Contratos:**
`/admin/contratos`, `/admin/contratos/[id]`

**Comercial:**
`/admin/comercial`, `/admin/comercial/paquetes`, `/admin/comercial/zonas`, `/admin/comercial/actividades`, `/admin/comercial/novedades`

**Finanzas:**
| Ruta | Notas |
|------|-------|
| `/admin/finanzas` | Sub-layout propio |
| `/admin/finanzas/reportes` | — |
| `/admin/finanzas/caja` | — |
| `/admin/finanzas/caja/movimientos` | — |
| `/admin/finanzas/ingresos` | — |
| `/admin/finanzas/ingresos/tipos` | — |
| `/admin/finanzas/egresos` | — |
| `/admin/finanzas/tipos-egreso` | — |

**Promociones:** `/admin/promociones` (**1 013 líneas**)

**Usuarios:** `/admin/usuarios`

**Proveedores:** `/admin/proveedores`

**CMS:**
| Ruta | Líneas |
|------|--------|
| `/admin/cms/banners` | — |
| `/admin/cms/galeria` | — |
| `/admin/cms/faq` | — |
| `/admin/cms/resenas` | **473** |
| `/admin/cms/legal` | — |
| `/admin/cms/contenido` | **455** |
| `/admin/cms/configuracion-publica` | **646** |

**Marketing:**
`/admin/marketing`, `/admin/marketing/campanas`, `/admin/marketing/campanas/[id]`, `/admin/marketing/plantillas`, `/admin/marketing/tipos`

**Administración:**
`/admin/perfil`, `/admin/configuracion`, `/admin/preferencias`

---

## 3. Componentes — Inventario y Estado

### Total: 152 archivos `.tsx`

#### 3.1 Componentes Admin (organizados por subdirectorio)

**`admin/auditoria/`**
- `AccionBadge.tsx`, `AuditoriaFiltros.tsx`, `LogDetalleModal.tsx`, `NivelBadge.tsx`

**`admin/banners/`**
- `BannerEstadoBadge.tsx`, `BannerFormDrawer.tsx`, `BannerPreview.tsx`, `BannerTipoSelector.tsx`

**`admin/calendario/`** ← Componentes complejos
- `CalendarioAcciones.tsx`, `CalendarioCelda.tsx`, `CalendarioDayDrawer.tsx` (**515 líneas**), `CalendarioDia.tsx`, `CalendarioLeyenda.tsx`, `CalendarioSemana.tsx`, `ConfigurarCalendarioModal.tsx`

**`admin/clientes/`**
- `ClienteAvatar.tsx`, `ClienteBadges.tsx`, `ClienteDrawer.tsx`, `ClienteFiltros.tsx`, `NuevoClienteModal.tsx`

**`admin/cms/`**
- `BannerFormDialog.tsx`, `ActividadPreview.tsx`, `NovedadPreview.tsx`, `PaquetePreview.tsx`, `QuickToggle.tsx`, `ZonaPreview.tsx`

**`admin/configuracion/`** (tabs de configuración)
- `CatalogosTab.tsx`, `EventosTab.tsx`, `OperacionTab.tsx`, `PagosTab.tsx`, `ReservasTab.tsx`, `SedeTab.tsx`, `SeguridadTab.tsx`, `SistemaCard.tsx`

**`admin/contratos/`**
- `ContratoBadgeEstado.tsx`, `ContratoDocumentos.tsx`, `ContratoEditor.tsx`, `ContratoEventoTab.tsx`, `ContratoFinanzas.tsx`, `ContratoTimeline.tsx`

**`admin/dashboard/`**
- `AccionesPendientes.tsx`, `AgendaDelDia.tsx`, `DashboardSkeleton.tsx`, `DisponibilidadSemana.tsx`, `KpisDelDia.tsx`, `TendenciaReservas.tsx`

**`admin/eventos/`** ← Componente grande
- `BotonTurno.tsx`, `ConfirmarEventoModal.tsx` (**579 líneas**), `DesgloseTiposEgreso.tsx`, `GastosEventoPanel.tsx`, `GastosOperativosDia.tsx`, `GraficaLineaDiaria.tsx`, `MetricasReservasSection.tsx`, `PresupuestoEventoSection.tsx`, `RegistrarEgresoModal.tsx`, `ResumenMensualCards.tsx`, `TiposEgresoManager.tsx`

**`admin/legal/`**
- `LegalFormatToolbar.tsx`, `LegalNuevoDocumentoModal.tsx`, `LegalPreviewPanel.tsx`

**`admin/marketing/`**
- `CrearCampanaDialog.tsx`, `CrearPlantillaDialog.tsx`, `EnviarCampanaDialog.tsx`, `EstadoCampanaBadge.tsx`, `PlantillaPreviewCard.tsx`, `TiposEmailManager.tsx`, `TiposEmailModal.tsx`

**`admin/perfil/`**
- `ActividadReciente.tsx`, `CambiarContrasenaForm.tsx`, `InfoPersonalForm.tsx`, `PerfilHeader.tsx`, `SeguridadInfo.tsx`

**`admin/preferences/`** (secciones de preferencias)
- `AnimationsSection.tsx`, `AppearanceSection.tsx`, `BehaviorSection.tsx`, `DashboardSection.tsx`, `LayoutSection.tsx`, `LocalizationSection.tsx`, `NotificationSection.tsx`, `PreviewPanel.tsx`, `TypographySection.tsx`

**`admin/reservas/`**
- `ReservaDrawer.tsx`

**`admin/usuarios/`**
- `CrearUsuarioModal.tsx`, `EstadoBadge.tsx`, `RolBadge.tsx`, `UsuariosTable.tsx`

#### 3.2 Otros Grupos de Componentes

**`brand/`:** `Logo.tsx`

**`celebraciones/`:** `BannerWhatsApp.tsx`, `ModalAnticipacionEvento.tsx`, `PaqueteCard.tsx`, `PaqueteDetalleModal.tsx`, `ResumenEnVivo.tsx`, `ResumenMovilExpandible.tsx`, `WizardHeader.tsx`

**`cliente/`:** `ClienteBottomNav.tsx`, `ClienteSidebar.tsx`, `ClienteTopBar.tsx`, `EmptyReservas.tsx`, `EstadoBadge.tsx`, `NotificacionesPanel.tsx`, `ReservaCard.tsx`, `ReservaDetalleModal.tsx`

**`cms/`:** `PromocionesDestacadas.tsx`, `NovedadesHome.tsx`

**`common/`:** `Breadcrumbs.tsx`, `ConfirmDialog.tsx`, `DataTable.tsx`, `DataTableColumnHeader.tsx`, `DataTablePagination.tsx`, `DataTableToolbar.tsx`, `Emptystate.tsx`, `Errorstate.tsx`, `MediaUploader.tsx`, `MediaUploaderMulti.tsx`, `PageHeader.tsx`, `Statusbadge.tsx`

**`dashboard/`:** `KpiCard.tsx`

**`layout/`:** `AdminNavbar.tsx`, `AdminSidebar.tsx`, `AdminThemeRoot.tsx`, `ClienteNavbar.tsx`, `PublicNavbar.tsx`

**`public/`:** `DynamicFooter.tsx`, `FaqAccordion.tsx`, `HeroBanner.tsx`, `SeccionNovedades.tsx`, `SeccionPaquetes.tsx`, `SeccionZonas.tsx`

**`sesion/`:** `AvisoExpiracion.tsx`, `ModalSesionExpirada.tsx`, `SesionGuard.tsx`

**`ui/`** (shadcn/ui base, 20+ componentes): `Accordion`, `AlertDialog`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `Dialog`, `DropdownMenu`, `Input`, `Label`, `Popover`, `ScrollArea`, `Select`, `Separator`, `Skeleton`, `Switch`, `Table`, `Tabs`, `Textarea`, `Tooltip`

---

### 3.3 Componentes con Posible Duplicación

| Grupo | Archivos | Veredicto |
|-------|---------|-----------|
| `EstadoBadge.tsx` | `admin/usuarios/` y `cliente/` | Diferenciados por contexto — OK |
| `MediaUploader.tsx` + `MediaUploaderMulti.tsx` | `common/` | Distinción single/multi — OK |

No se detectaron duplicados reales a eliminar.

---

### 3.4 Componentes Candidatos a Descomposición (>500 líneas)

| Archivo | Líneas | Razón |
|---------|--------|-------|
| `src/app/cliente/mi-cuenta/page.tsx` | **1 170** | Múltiples tabs + secciones independientes |
| `src/app/admin/promociones/page.tsx` | **1 013** | Listado + creación + edición inline + stats |
| `src/app/(wizard)/celebraciones/solicitar/page.tsx` | **930** | Wizard multi-paso con mucha lógica acoplada |
| `src/app/admin/accesos/entradas/page.tsx` | **907** | Tabla + QR scanner + acciones |
| `src/app/(public)/reservar/page.tsx` | **848** | Formulario complejo |
| `src/app/admin/cms/configuracion-publica/page.tsx` | **646** | Formulario multi-sección |
| `src/app/admin/eventos/[id]/page.tsx` | **547** | Formulario + estado + extras |
| `src/components/admin/eventos/ConfirmarEventoModal.tsx` | **579** | Modal con múltiples sub-formularios |
| `src/components/admin/calendario/CalendarioDayDrawer.tsx` | **515** | Drawer con lógica compleja |

---

## 4. Servicios, API Calls y Fetching

### 4.1 Cliente HTTP

**Tecnología:** Axios v1.12.2 — instancia centralizada  
**Archivo:** `src/lib/axios.ts`  
**Base URL:** `process.env.NEXT_PUBLIC_API_URL` (sin fallback hardcodeado en prod)

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})
```

**Interceptores configurados:**
- **Request:** Inyecta `Authorization: Bearer {token}` de sesión NextAuth
- **Response 401:**
  - Mutex pattern para evitar múltiples refresh simultáneos
  - Queue de peticiones pendientes durante el refresh
  - Reintenta automáticamente con nuevo token
  - Si refresh falla: activa modal "Sesión expirada"

### 4.2 Capa de Servicios (28 archivos en `src/services/`)

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `api.ts` | ✓ | Re-export de instancia axios |
| `auth.service.ts` | ✓ | Registro cliente y verificación email |
| `banner.service.ts` | ✓ | CRUD banners |
| `calendario.service.ts` | ✓ | Disponibilidad y turnos |
| `cliente.service.ts` | ✓ | CRUD clientes |
| `comercial.service.ts` | ✓ | Paquetes, actividades, zonas, novedades |
| `comprobante.service.ts` | ✓ | Comprobantes |
| `configuracion-publica.service.ts` | ✓ | Config pública del sitio |
| `contrato.service.ts` | ✓ | Contratos de eventos |
| `dashboard.service.ts` | ✓ | Métricas KPI |
| `evento.service.ts` | ✓ | Eventos privados (CRUD + flujo) |
| `faq.service.ts` | ✓ | FAQ |
| `finanzas.service.ts` | ✓ | Ingresos, egresos, caja, reportes |
| `galeria.service.ts` | ✓ | Galería de imágenes |
| `legal.service.ts` | ✓ | Documentos legales |
| `marketing.service.ts` | ✓ | Campañas email y plantillas |
| `media.service.ts` | ✓ | Upload de archivos |
| `pago.service.ts` | ✓ | Pagos |
| `preferencias.service.ts` | ✓ | Preferencias de usuario |
| `promocion.service.ts` | ✓ | Promociones |
| `proveedor.service.ts` | ✓ | Proveedores |
| `resena.service.ts` | ✓ | Reseñas |
| `reserva.service.ts` | ✓ | Reservas (admin + cliente) |
| `seccion-web.service.ts` | ✓ | Secciones del sitio web |
| `venta.service.ts` | ✓ | Ventas |
| `ventaPresencial.service.ts` | ✓ | Ventas presenciales |
| **`auditoria.service.ts`** | **VACÍO** | Sin implementar |
| **`usuario-admin.service.ts`** | **VACÍO** | Sin implementar |

### 4.3 Muestra de Endpoints Consumidos

**Reservas:**
```
GET  /reservas/admin
GET  /reservas/admin/metricas
POST /reservas/clientes/{idCliente}/sedes/{idSede}
POST /reservas/{id}/reprogramar
POST /reservas/{id}/cancelar
POST /reservas/{id}/ingreso
POST /reservas/{id}/confirmar-pago
```

**Eventos privados:**
```
GET  /eventos-privados/admin
POST /eventos-privados/clientes/{idCliente}/sedes/{idSede}
POST /eventos-privados/{id}/confirmar
POST /eventos-privados/{id}/completar
POST /eventos-privados/{id}/cancelar
GET  /eventos-privados/{id}/checklist
POST /eventos-privados/{id}/checklist/{idChecklist}/completar
```

**Clientes:**
```
GET  /clientes
POST /clientes
PUT  /clientes/{id}
POST /clientes/registro
GET  /clientes/verificar
```

**Finanzas:**
```
GET  /tipos-egreso
POST /tipos-egreso
GET  /egresos/sedes/{idSede}
POST /egresos
GET  /ingresos
POST /caja/apertura
POST /caja/cierre
```

### 4.4 Manejo de Errores

**Formato esperado desde el backend (definido en `axios.ts`):**
```typescript
type ApiError = {
  status: number
  error: string
  codigoError: string
  message: string
  path: string
  timestamp: string
}
```

**Cobertura:** El manejo de errores HTTP es centralizado para 401. Los demás errores se manejan por mutación (toast en `onError` de React Query).

---

## 5. Autenticación en el Frontend

### 5.1 Sistema

**Tecnología:** NextAuth.js v4.24.11 + CredentialsProvider + JWT  
**NO usa** Supabase Auth client  
**NO usa** `@supabase/supabase-js`

### 5.2 Flujo Completo

```
Usuario → Credenciales → NextAuth CredentialsProvider
                               ↓
                    POST /auth/cliente/login  o  POST /auth/admin/login
                               ↓
                    { accessToken, refreshToken, accessExpiresIn }
                               ↓
                    JWT callback guarda en sesión
                               ↓
                    Axios interceptor inyecta Bearer token
```

### 5.3 Estructura del Token / Sesión

```typescript
interface AuthUser {
  id: number
  nombre: string
  correo: string
  rol: 'ADMIN' | 'CLIENTE'
  idSede?: number
  token: string
}

// Session extendida (next-auth.d.ts)
interface Session {
  user: {
    id: string; name: string; email: string
    token: string; refreshToken: string
    rol: 'ADMIN' | 'CLIENTE'
    idSede?: number
  }
  error?: 'RefreshTokenExpired'
}
```

### 5.4 Renovación de Token

- JWT callback compara tiempo actual con `accessExpires`
- Si queda <60 segundos: `POST /auth/refresh` con `{ refreshToken }`
- Respuesta: `{ accessToken, refreshToken, accessExpiresIn }`
- Si falla: `error = 'RefreshTokenExpired'` → modal sesión expirada

### 5.5 Protección de Rutas

| Mecanismo | Archivo | Cobertura |
|-----------|---------|-----------|
| Middleware Next.js | `src/middleware.ts` | `/admin/*`, `/cliente/*` |
| Server-side session | `src/app/admin/layout.tsx` | Segunda capa admin |
| Hook `useAuth()` | `src/hooks/useAuth.ts` | Componentes cliente |

### 5.6 Providers de Autenticación

- `src/providers/auth-provider.tsx` — SessionProvider de NextAuth
- `src/providers/app-provider.tsx` — Wrapper de todos los providers
- `src/hooks/useAuth.ts` — Hook de acceso a sesión

**`useAuth` exporta:** `user`, `token`, `rol`, `isAdmin`, `isCliente`, `isAuthenticated`, `isLoading`, `logout`

### 5.7 Nota Crítica — Desalineación con Backend Supabase

> **El frontend usa NextAuth + JWT propio del backend Spring Boot.**  
> Si el backend migró a **Supabase Auth** en la Fase 4, este es el mayor cambio pendiente.  
> Implica reemplazar NextAuth completamente por `@supabase/supabase-js` y el flujo de sesión de Supabase.  
> **Verificar:** ¿el backend Spring Boot sigue emitiendo JWT propio? ¿O ahora valida tokens de Supabase?

---

## 6. Estado Global y Context

### 6.1 Zustand Stores (8 archivos en `src/lib/store/`)

| Store | Responsabilidad |
|-------|----------------|
| `auth.store.ts` | Sede seleccionada (`idSede`) |
| `admin-preferences.store.ts` | Tema, layout, idioma, tipografía |
| `borrador.store.ts` | Estado temporal del wizard de eventos |
| `cart.store.ts` | Carrito de venta presencial |
| `notificaciones.store.ts` | Sistema de notificaciones UI |
| `sesion.store.ts` | Estado del modal sesión expirada |
| `sidebar.store.ts` | Estado abierto/cerrado del sidebar |
| `theme.store.ts` | Tema claro/oscuro |

**Cart Store (ejemplo de estructura):**
```typescript
interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cantidad'>) => void
  removeItem: (idProducto: number) => void
  updateCantidad: (idProducto: number, cantidad: number) => void
  clear: () => void
  total: () => number
}
```

### 6.2 React Query (TanStack Query v5)

**Configuración:** `src/lib/query-client.ts`  
**Patrón de uso uniforme en todos los hooks:**

```typescript
// Lectura (GET)
useQuery({ queryKey: [KEY, params], queryFn: () => service.method(params) })

// Mutación (POST/PUT/DELETE) con invalidación automática
useMutation({
  mutationFn: (payload) => service.create(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [KEY] })
    toast.success('Creado correctamente.')
  },
  onError: (err) => toast.error(err?.message ?? 'Error')
})
```

### 6.3 Context API

Uso mínimo — sin contexts personalizados detectados.  
La arquitectura prioriza Zustand + React Query sobre Context.

---

## 7. Tipos TypeScript y Contratos con el Backend

### 7.1 Archivos de Tipos (28 archivos en `src/types/`)

| Archivo | Líneas aprox. |
|---------|---------------|
| `enums.ts` | ~90 |
| `evento.types.ts` | ~150 |
| `finanzas.types.ts` | ~200 |
| `contrato.types.ts` | ~150 |
| `calendario.types.ts` | ~120 |
| `cliente.types.ts` | ~90 |
| `reserva.types.ts` | ~80 |
| `comercial.types.ts` | ~80 |
| `preferencias.types.ts` | ~60 |
| `legal.types.ts` | ~60 |
| `marketing.types.ts` | ~60 |
| `ventaPresencial.types.ts` | ~60 |
| `contrato.types.ts` | ~150 |
| *(resto)* | <50 c/u |

### 7.2 Tipos Principales

**Cliente:**
```typescript
interface Cliente {
  id: number
  nombre: string; correo: string; telefono?: string | null
  dni?: string | null; ruc?: string | null; razonSocial?: string | null
  fotoPerfil?: string | null
  tipoCliente?: 'PERSONA' | 'EMPRESA' | null
  esVip: boolean; descuentoVip?: number | null
  contadorVisitas: number; correoVerificado: boolean; activo: boolean
  origenRegistro: 'WEB' | 'PRESENCIAL' | 'ADMIN'
  tieneAccesoWeb: boolean; aceptaComunicaciones: boolean
  segmentoCliente: 'NUEVO' | 'FRECUENTE' | 'VIP' | 'CORPORATIVO' | 'INACTIVO'
  fechaCreacion: string   // ISO string — verificar si es OffsetDateTime del backend
}
```

**Reserva:**
```typescript
interface Reserva {
  id: number
  idCliente: number; nombreCliente?: string
  idSede: number; estado: EstadoReserva
  tipoDia: 'SEMANA' | 'FIN_SEMANA_FERIADO'
  fechaEvento: string; numeroTicket: string
  precioHistorico: number; descuentoAplicado: number; totalPagado: number
  nombreNino: string; edadNino: number
  nombreAcompanante: string; dniAcompanante?: string
  firmoConsentimiento: boolean; esReprogramacion: boolean
  vecesReprogramada: number
  medioPago?: 'YAPE' | 'CAJA' | string
  referenciaPago?: string; fechaCreacion: string
}
```

**Evento Privado:**
```typescript
interface EventoPrivado {
  id: number; idCliente: number; nombreCliente: string
  idSede: number; estado: EstadoEvento
  idTurno: number; turno: string
  horaInicio: string; horaFin: string; fechaEvento: string
  tipoEvento: string; aforoDeclarado?: number
  precioTotalContrato?: number; montoAdelanto?: number; montoSaldo?: number
  medioPagoAdelanto?: string
  checklistCompleto: boolean
  checklist?: ChecklistItem[]; extras?: EventoExtra[]
  fechaCreacion: string
}
```

### 7.3 Enums Centrales (`src/types/enums.ts`)

- `EstadoReserva`: PENDIENTE, CONFIRMADA, REPROGRAMADA, COMPLETADA, CANCELADA
- `EstadoEvento`: SOLICITADA, CONFIRMADA, COMPLETADA, CANCELADA
- `EstadoContrato`: BORRADOR, FIRMADO
- `MedioPago`: YAPE, EFECTIVO, TRANSFERENCIA, TARJETA
- `CanalReserva`: ONLINE, PRESENCIAL
- `TipoDia`: SEMANA, FIN_SEMANA_FERIADO

### 7.4 Métricas de Calidad de Tipos

| Métrica | Resultado |
|---------|-----------|
| Uso de `: any` | **0** |
| Uso de `as any` | **0** |
| Tipos centralizados | **Sí** (`src/types/`) |
| Tipos dispersos en componentes | No detectados |

### 7.5 Advertencia — Campos `fechaCreacion` Post-Migración

El backend migró a `OffsetDateTime` en la Fase 4G-1. Los tipos del frontend usan `string` para fechas, lo cual es técnicamente correcto (ISO 8601 string), pero debe verificarse que el frontend parsee correctamente el offset (`+05:00`) con `date-fns`.

---

## 8. Estilos y UI

### 8.1 Stack de Estilos

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Tailwind CSS | 3.4.17 | Framework principal |
| shadcn/ui | 4.7.0 | Componentes base |
| Radix UI | Múltiples | Primitivas accesibles |
| Lucide React | 0.542.0 | Iconografía |
| class-variance-authority | 0.7.1 | Variantes de componentes |
| tailwind-merge | 3.5.0 | Fusión de clases |
| tailwindcss-animate | 1.0.7 | Animaciones |
| tw-animate-css | 1.4.0 | Animaciones adicionales |

### 8.2 Componentes shadcn/ui Instalados (20+)

`Accordion`, `AlertDialog`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `Dialog`, `DropdownMenu`, `Input`, `Label`, `Popover`, `ScrollArea`, `Select`, `Separator`, `Skeleton`, `Switch`, `Table`, `Tabs`, `Textarea`, `Tooltip`

### 8.3 Arquitectura de Estilos

- **No hay** archivos `.css` o `.scss` adicionales (solo `globals.css`)
- **No hay** estilos inline detectados
- **Patrón uniforme:** Tailwind + `cn()` utility para combinar clases
- **Dark mode:** class-based (`dark:` prefix Tailwind), controlado por Zustand `theme.store.ts`
- **Sistema de color:** Variables CSS en `globals.css` → `--primary`, `--secondary`, `--destructive`, `--muted`, `--accent`, `--card`, `--border`

### 8.4 Evaluación de Consistencia

**Muy consistente:** Todo el proyecto usa el mismo sistema. No se detectó mezcla de paradigmas.

---

## 9. Dependencias del Proyecto

### 9.1 `package.json` Completo

```json
{
  "name": "Kiki y Lala-pems-web",
  "version": "0.1.0",
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.90.5",
    "@tanstack/react-table": "^8.21.3",
    "axios": "^1.12.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "jsqr": "^1.4.0",
    "lucide-react": "^0.542.0",
    "next": "^16.2.4",
    "next-auth": "^4.24.11",
    "radix-ui": "^1.4.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.62.0",
    "recharts": "^3.8.1",
    "shadcn": "^4.7.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.1.5",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@types/node": "^24.3.0",
    "@types/react": "^19.1.12",
    "@types/react-dom": "^19.1.9",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.34.0",
    "eslint-config-next": "^16.2.4",
    "postcss": "^8.5.6",
    "prettier": "^3.8.3",
    "prettier-plugin-tailwindcss": "^0.8.0",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.9.2"
  }
}
```

### 9.2 Análisis de Dependencias

| Hallazgo | Detalle |
|----------|---------|
| **Supabase ausente** | `@supabase/supabase-js` NO instalado. Si el backend usa Supabase Auth, hay que instalarlo. |
| `radix-ui` (paquete global) + paquetes individuales `@radix-ui/*` | Posible redundancia — verificar si `radix-ui` v1 es el bundle o un alias |
| `tw-animate-css` + `tailwindcss-animate` | Dos librerías de animación similares — revisar si ambas se usan |
| `clsx` + `tailwind-merge` | Ambas necesarias — `cn()` las combina internamente |
| Sin framework de testing | No hay `jest`, `vitest`, `@testing-library` |
| Sin Supabase `@supabase/ssr` | Necesario si se migra auth a Supabase |

---

## 10. Variables de Entorno

### 10.1 Variables Actuales

**`.env.local` (actual):**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cambia_este_secreto_en_produccion_min_32_chars
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=PlayZone PEMS
```

**`.env.example` (plantilla):**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cambia_este_secreto_en_produccion_min_32_chars
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=Kiki y Lala PEMS
NEXT_PUBLIC_APP_URL=http://localhost:3000
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX
```

### 10.2 Observaciones

| Observación | Detalle |
|------------|---------|
| `NEXT_PUBLIC_APP_NAME` diferente en `.env.local` | `.env.local` dice "PlayZone PEMS", `.env.example` dice "Kiki y Lala PEMS" — inconsistente |
| `NEXT_PUBLIC_API_URL` apunta a `localhost:8080` | Correcto para desarrollo local con Spring Boot |
| Falta `NEXT_PUBLIC_SUPABASE_URL` | Si backend usa Supabase, hay que añadir |
| Falta `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ídem |
| Fallback en código: `?? 'http://localhost:8080/api/v1'` | Riesgo: si env var no existe en prod, usará localhost |
| `NEXTAUTH_SECRET` con texto default | **No cambiar esto en commits. Sí en producción.** |

---

## 11. Calidad de Código

### 11.1 Métricas de Limpieza

| Indicador | Cantidad | Evaluación |
|-----------|---------|------------|
| `console.log/error/warn` | **0** | Excelente |
| `TODO / FIXME / HACK` | **0** | Excelente |
| `: any` / `as any` | **0** | Excelente |
| Código comentado extenso | No detectado | Excelente |

### 11.2 Top 12 Archivos más Grandes

| Archivo | Líneas | Candidato a dividir |
|---------|--------|---------------------|
| `src/app/cliente/mi-cuenta/page.tsx` | **1 170** | Sí — múltiples tabs |
| `src/app/admin/promociones/page.tsx` | **1 013** | Sí — listado + CRUD inline |
| `src/app/(wizard)/celebraciones/solicitar/page.tsx` | **930** | Sí — wizard multi-paso |
| `src/app/admin/accesos/entradas/page.tsx` | **907** | Sí — tabla + QR + acciones |
| `src/app/(public)/reservar/page.tsx` | **848** | Sí — formulario complejo |
| `src/app/admin/cms/configuracion-publica/page.tsx` | **646** | Sí — formulario multi-sección |
| `src/components/admin/eventos/ConfirmarEventoModal.tsx` | **579** | Sí — modal con sub-formularios |
| `src/app/admin/eventos/[id]/page.tsx` | **547** | Posible |
| `src/app/admin/reservas/page.tsx` | **524** | Posible |
| `src/app/auth/registro/page.tsx` | **526** | Posible |
| `src/components/admin/calendario/CalendarioDayDrawer.tsx` | **515** | Posible |
| `src/app/admin/cms/resenas/page.tsx` | **473** | Aceptable |

### 11.3 Implementaciones Vacías (código muerto potencial)

| Archivo | Estado |
|---------|--------|
| `src/services/auditoria.service.ts` | **VACÍO** |
| `src/services/usuario-admin.service.ts` | **VACÍO** |
| `src/hooks/useComprobantes.ts` | Posiblemente vacío |
| `src/hooks/useConfirm.ts` | Posiblemente vacío |
| `src/features/*/index.ts` (8 archivos) | Solo stubs vacíos |

### 11.4 Lógica Duplicada en Hooks

En `src/hooks/useReservas.ts` hay dos pares de hooks paralelos:
- `useReprogramarReserva()` (admin) vs `useReprogramarReservaCliente()` (cliente)
- `useCancelarReserva()` (admin) vs `useCancelarReservaCliente()` (cliente)

La diferencia es la query key de invalidación. El código es casi idéntico — candidato a refactorización con parámetro genérico.

---

## 12. Resumen Ejecutivo

### A. Arquitectura Actual

El frontend PEMS es un proyecto Next.js 16 con App Router, escrito en TypeScript strict, que sigue una arquitectura profesional con separación clara de capas: `services/` para API calls via Axios, `hooks/` para lógica de datos con React Query, `types/` para contratos TypeScript, `components/` organizados por dominio, y `lib/store/` para estado con Zustand. El código está limpio (0 console.logs, 0 TODOs, 0 `any`), bien organizado y sigue patrones consistentes en toda la base de código.

---

### B. Problemas Principales (Ordenados por Impacto)

| # | Problema | Impacto | Prioridad |
|---|---------|---------|-----------|
| 1 | **Auth no alineada con Supabase** — Frontend usa NextAuth+JWT propio; si el backend migró a Supabase Auth, todo el flujo de autenticación debe reemplazarse con `@supabase/supabase-js` | **CRÍTICO** — bloquea sesiones | Alta |
| 2 | **Servicios vacíos** — `auditoria.service.ts` y `usuario-admin.service.ts` están sin implementar | **ALTO** — funcionalidades rotas | Alta |
| 3 | **Páginas monolíticas** — 5 archivos >800 líneas (máximo: 1170) que combinan lógica de UI, fetching, estado y validación | **ALTO** — mantenibilidad | Media |
| 4 | **`NEXT_PUBLIC_APP_NAME` inconsistente** — "PlayZone PEMS" en `.env.local` vs "Kiki y Lala PEMS" en `.env.example` | **MEDIO** — branding incorrecto en dev | Alta (quick fix) |
| 5 | **Tipos de fechas** — Backend usa `OffsetDateTime` post-Fase 4G-1; verificar que `date-fns` parsee correctamente el offset `+05:00` en los campos `fechaCreacion`, `fechaEvento` | **MEDIO** — bugs de hora silenciosos | Media |
| 6 | **Features directory vacío** — `src/features/` creado con 8 subdirectorios pero todos son stubs vacíos | **BAJO** — confunde la estructura | Baja |
| 7 | **Lógica duplicada en hooks** — Pares `useReprogramar/useCancelar` admin+cliente con código casi idéntico | **BAJO** — mantenibilidad | Baja |
| 8 | **Fallback hardcodeado de API URL** — `?? 'http://localhost:8080/api/v1'` en `auth.config.ts` puede apuntar a localhost en producción | **MEDIO** — bug de configuración | Alta (quick fix) |
| 9 | **Sin suite de testing** | **BAJO** — riesgo a largo plazo | Baja |
| 10 | **Dependencias duplicadas de animación** — `tw-animate-css` + `tailwindcss-animate` | **BAJO** — bundle size | Baja |

---

### C. Archivos Candidatos a Eliminación (Código Muerto)

```
src/services/auditoria.service.ts        # VACÍO — implementar o eliminar
src/services/usuario-admin.service.ts    # VACÍO — implementar o eliminar
src/features/audit/index.ts              # stub vacío
src/features/auth/index.ts              # stub vacío
src/features/cms/index.ts               # stub vacío
src/features/contracts/index.ts         # stub vacío
src/features/events/index.ts            # stub vacío
src/features/reservations/index.ts      # stub vacío
src/features/sales/index.ts             # stub vacío
src/features/settings/index.ts          # stub vacío
src/features/users/index.ts             # stub vacío
```

---

### D. Componentes Candidatos a Descomposición

| Archivo | Líneas | Sugerencia de Descomposición |
|---------|--------|------------------------------|
| `src/app/cliente/mi-cuenta/page.tsx` | 1 170 | Extraer: `PersonalInfoTab`, `FiscalInfoTab`, `ActividadRecienteSection`, `CambiarContrasenaSection` |
| `src/app/admin/promociones/page.tsx` | 1 013 | Extraer: `PromocionesTable`, `PromocionFormDrawer`, `PromocionStatsCard` |
| `src/app/(wizard)/celebraciones/solicitar/page.tsx` | 930 | Extraer: `PasoSeleccionPaquete`, `PasoFechaHora`, `PasoExtras`, `PasoResumen`, `PasoConfirmacion` |
| `src/app/admin/accesos/entradas/page.tsx` | 907 | Extraer: `EntradasTable`, `QrScannerModal`, `EntradaAccionesMenu` |
| `src/app/(public)/reservar/page.tsx` | 848 | Extraer: `CalendarioDisponibilidad`, `FormularioNino`, `FormularioAcompanante`, `ResumenPago` |
| `src/components/admin/eventos/ConfirmarEventoModal.tsx` | 579 | Extraer: `FinancialSection`, `ChecklistSection`, `ExtrasSection` |
| `src/components/admin/calendario/CalendarioDayDrawer.tsx` | 515 | Extraer: `ReservasList`, `EventosList`, `AccionesDia` |

---

### E. Duplicados a Unificar

| Grupo | Archivos | Acción |
|-------|---------|--------|
| Hooks reprogramar | `useReprogramarReserva()` + `useReprogramarReservaCliente()` (mismo archivo) | Refactorizar: `useReprogramarReserva(queryKey)` genérico |
| Hooks cancelar | `useCancelarReserva()` + `useCancelarReservaCliente()` (mismo archivo) | Igual: `useCancelarReserva(queryKey)` genérico |
| `EstadoBadge.tsx` | `admin/usuarios/EstadoBadge.tsx` y `cliente/EstadoBadge.tsx` | Revisar si son idénticos → unificar en `common/` |

---

### F. Desalineación con el Backend Nuevo

| Área | Frontend Actual | Backend Post-Fase 4 | Acción |
|------|----------------|---------------------|--------|
| **Autenticación** | NextAuth v4 + JWT Spring Boot | Supabase Auth (si migró) | Reemplazar NextAuth por `@supabase/ssr` o `@supabase/supabase-js` |
| **Fechas** | Strings ISO simple | `OffsetDateTime` con `+05:00` | Verificar parsing con `date-fns` |
| **Catálogos** | Campos `id` (número) | `codigo` (string) post-Fase 3 | Auditar cada tipo donde se consume `id` vs `codigo` en catálogos |
| **`NEXT_PUBLIC_API_URL`** | `http://localhost:8080/api/v1` | Podría ser endpoint Supabase | Actualizar si backend cambió base URL |
| **Refresh token** | `POST /auth/refresh` custom | Si usa Supabase: Supabase maneja refresh automáticamente | Eliminar lógica de refresh manual si se migra |
| **Error format** | `{ status, error, codigoError, message, path, timestamp }` | Verificar que Spring Boot siga retornando este formato | Auditar handlers de error en servicios |

---

### G. Recomendación de Orden de Trabajo

#### Semana 1 — Alineación Crítica
1. **Verificar estado de la auth del backend:** ¿Spring Boot sigue con JWT propio o migró a Supabase Auth?
   - Si JWT propio: el frontend funciona como está. Solo limpiar nombre de app.
   - Si Supabase Auth: instalar `@supabase/ssr`, reemplazar NextAuth, reemplazar axios interceptor.
2. **Fix rápido:** Corregir `NEXT_PUBLIC_APP_NAME` en `.env.local` a "Kiki y Lala PEMS".
3. **Fix rápido:** Eliminar fallback hardcodeado `?? 'http://localhost:8080/api/v1'` en `auth.config.ts`.
4. **Verificar parsing de fechas** con `OffsetDateTime` — probar en UI que horas se muestren correctamente.

#### Semana 2 — Implementar Funcionalidades Faltantes
5. Implementar `src/services/auditoria.service.ts`
6. Implementar `src/services/usuario-admin.service.ts`
7. Decidir si `src/features/` se usa o se elimina — no dejar stubs vacíos.

#### Semana 3–4 — Refactorización de Páginas Grandes
8. Dividir `mi-cuenta/page.tsx` (1170 líneas) en sub-componentes de tab.
9. Dividir `solicitar/page.tsx` (930 líneas) en componentes por paso del wizard.
10. Dividir `accesos/entradas/page.tsx` (907 líneas).

#### Semana 5 — Calidad y Estándares
11. Unificar hooks duplicados (`reprogramar`, `cancelar`).
12. Evaluar y eliminar duplicados de animación (`tw-animate-css` vs `tailwindcss-animate`).
13. Añadir `staleTime` apropiados en queries de React Query.
14. Configurar Vitest + Testing Library.

---

## Apéndice — Archivos Clave de Referencia

| Archivo | Rol |
|---------|-----|
| `src/lib/auth.config.ts` | Configuración NextAuth + endpoints de login |
| `src/lib/axios.ts` | Instancia HTTP + interceptores + refresh token |
| `src/middleware.ts` | Protección de rutas a nivel Edge |
| `src/app/admin/layout.tsx` | Verificación server-side de sesión admin |
| `src/providers/app-provider.tsx` | Árbol de providers de la app |
| `src/config/routes.ts` | Constantes de rutas |
| `src/config/permissions.ts` | Matriz de permisos por rol |
| `src/config/navigation.ts` | Menús de navegación |
| `src/types/enums.ts` | Enumeraciones compartidas |
| `src/lib/store/cart.store.ts` | Carrito de venta presencial |
| `src/lib/store/sesion.store.ts` | Estado modal sesión expirada |
| `tailwind.config.ts` | Configuración Tailwind + tema |
| `tsconfig.json` | Config TypeScript strict + paths |

---

*Reporte generado el 2026-06-13. Solo lectura — ningún archivo fue modificado.*
