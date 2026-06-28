# Reporte: Módulo de Notificaciones — Análisis Completo

**Fecha:** 2026-06-27  
**Estado actual:** Infraestructura de BD definida — Sin integración real frontend ↔ backend  
**Prioridad:** Alta (componentes de UI ya existen, solo falta conectar)

---

## 1. Resumen Ejecutivo

El módulo de notificaciones tiene **dos realidades paralelas que no se hablan**:

- **Backend**: Esquema de BD robusto y completo (`notificacion`, `notificacion_entrega`, `preferencia_notificacion`, `tipo_notificacion`), entidades JPA mapeadas, pero **sin repositorios, servicios ni endpoints REST** para notificaciones in-app.
- **Frontend**: Componentes de UI ya construidos (`AdminNavbar`, `NotificacionesPanel`), store Zustand funcional, pero todo alimentado con **datos mock hardcodeados** — no hay ninguna llamada real a la API.

El gap es crítico: la BD puede almacenar notificaciones pero ningún código las escribe ni las lee vía API.

---

## 2. Estado de la Base de Datos

### 2.1 Tablas existentes (V11_notificaciones_y_marketing.sql)

| Tabla                      | Propósito                                        | Estado                      |
| -------------------------- | ------------------------------------------------ | --------------------------- |
| `tipo_notificacion`        | Catálogo de tipos (definido en V2_catalogos.sql) | ✅ Existe + seed            |
| `notificacion`             | Registro de cada notificación generada           | ✅ Existe, sin datos reales |
| `notificacion_entrega`     | Tracking por canal (IN_APP, EMAIL, etc.)         | ✅ Existe, sin datos reales |
| `preferencia_notificacion` | Preferencias por usuario/cliente y tipo          | ✅ Existe, sin datos reales |
| `plantilla_email`          | Plantillas HTML de email                         | ✅ Existe                   |
| `campana_email`            | Campañas masivas de email                        | ✅ Existe                   |
| `envio_email`              | Registro de cada email enviado                   | ✅ Existe                   |

### 2.2 Estructura de `notificacion` (tabla principal)

```sql
notificacion
├── id                      BIGINT (PK, identity)
├── tipo_codigo             TEXT → tipo_notificacion(codigo)
├── destinatario_usuario_id UUID → perfil_usuario(id)   -- admin/cajero
├── destinatario_cliente_id BIGINT → cliente_perfil(id) -- cliente público
├── entidad_tipo            TEXT   -- ej: 'reserva', 'evento'
├── entidad_id              BIGINT -- FK lógica a la entidad
├── titulo                  TEXT
├── mensaje                 TEXT
├── url_accion              TEXT
├── metadata                JSONB
├── leida                   BOOLEAN (default FALSE)
├── leida_at                TIMESTAMPTZ
├── prioridad               TEXT (BAJA|NORMAL|ALTA|CRITICA)
├── expira_at               TIMESTAMPTZ
└── created_at              TIMESTAMPTZ

CONSTRAINT: exactamente uno de destinatario_usuario_id o destinatario_cliente_id
```

**Índices optimizados:**

- `idx_notif_usuario_feed` — feed del admin/cajero (usuario + leida + created_at)
- `idx_notif_cliente_feed` — feed del cliente (cliente + leida + created_at)
- `idx_notif_entidad` — búsqueda por entidad relacionada

---

## 3. Tipos de Notificaciones Catalogados

### 3.1 Clasificación por Destinatario

#### Para ADMIN (panel `/admin`)

| Código                      | Módulo  | Nombre                    | Canales       | Prioridad   |
| --------------------------- | ------- | ------------------------- | ------------- | ----------- |
| `RESERVA_YAPE_PENDIENTE`    | reserva | Yape por validar          | IN_APP        | ALTA        |
| `EVENTO_SOLICITUD`          | evento  | Nueva solicitud de evento | IN_APP, EMAIL | ALTA        |
| `EVENTO_CONTRATO_PENDIENTE` | evento  | Contrato pendiente        | IN_APP, EMAIL | **CRITICA** |
| `EVENTO_SALDO_PENDIENTE`    | evento  | Saldo pendiente           | IN_APP        | ALTA        |
| `CAJA_SIN_CERRAR`           | caja    | Caja sin cerrar           | IN_APP        | ALTA        |
| `AFORO_LIMITE`              | reserva | Aforo cercano al límite   | IN_APP        | NORMAL      |
| `RESENA_PENDIENTE`          | sitio   | Reseña pendiente          | IN_APP        | BAJA        |
| `MENSAJE_NUEVO`             | sitio   | Mensaje nuevo             | IN_APP, EMAIL | NORMAL      |
| `LOGIN_IP_NUEVA`            | sistema | Login desde IP nueva      | EMAIL         | **CRITICA** |

#### Para CAJERO

| Código           | Módulo | Nombre         | Canales | Prioridad |
| ---------------- | ------ | -------------- | ------- | --------- |
| `CAJA_SIN_ABRIR` | caja   | Caja sin abrir | IN_APP  | NORMAL    |

#### Para CLIENTE (portal `/cliente`)

| Código                 | Módulo  | Nombre                 | Canales                 | Prioridad |
| ---------------------- | ------- | ---------------------- | ----------------------- | --------- |
| `RESERVA_CONFIRMADA`   | reserva | Reserva confirmada     | IN_APP, EMAIL           | NORMAL    |
| `RESERVA_RECORDATORIO` | reserva | Recordatorio de visita | EMAIL, WHATSAPP         | NORMAL    |
| `RESERVA_CANCELADA`    | reserva | Reserva cancelada      | IN_APP, EMAIL           | NORMAL    |
| `EVENTO_CONFIRMADO`    | evento  | Evento confirmado      | IN_APP, EMAIL           | NORMAL    |
| `EVENTO_RECORDATORIO`  | evento  | Recordatorio de evento | IN_APP, EMAIL, WHATSAPP | NORMAL    |
| `BIENVENIDA`           | cliente | Bienvenida             | EMAIL                   | NORMAL    |
| `CUMPLEANOS_NINO`      | cliente | Cumpleaños del niño    | EMAIL                   | NORMAL    |

### 3.2 Mapeo: Tipos BD ↔ Tipos Frontend

La BD usa códigos como `RESERVA_CONFIRMADA`; el frontend usa categorías genéricas `'reserva' | 'evento' | 'pago' | 'contrato' | 'sistema'`.

| Tipo frontend | Tipos BD correspondientes                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| `reserva`     | RESERVA_CONFIRMADA, RESERVA_CANCELADA, RESERVA_RECORDATORIO, RESERVA_YAPE_PENDIENTE, AFORO_LIMITE           |
| `evento`      | EVENTO_SOLICITUD, EVENTO_CONFIRMADO, EVENTO_RECORDATORIO, EVENTO_CONTRATO_PENDIENTE, EVENTO_SALDO_PENDIENTE |
| `pago`        | (ninguno definido en BD — solo existe lógica en reserva/Yape)                                               |
| `contrato`    | EVENTO_CONTRATO_PENDIENTE                                                                                   |
| `sistema`     | LOGIN_IP_NUEVA, BIENVENIDA, CUMPLEANOS_NINO                                                                 |
| ❌ sin mapeo  | CAJA_SIN_CERRAR, CAJA_SIN_ABRIR, RESENA_PENDIENTE, MENSAJE_NUEVO                                            |

---

## 4. Estado del Backend

### 4.1 Capa de Dominio — Modelos

Existen los modelos de dominio (sin lógica, solo POJO):

- `Notificacion.java` — ✅ Existe
- `TipoNotificacion.java` — ✅ Existe
- `NotificacionEntrega.java` — ✅ Existe
- `PreferenciaNotificacion.java` — ✅ Existe

### 4.2 Capa de Infraestructura — Entidades JPA

Las entidades están correctamente mapeadas:

- `NotificacionEntity.java` — ✅ Existe, lazy loading correcto
- `TipoNotificacionEntity.java` — ✅ Existe
- `NotificacionEntregaEntity.java` — ✅ Existe
- `PreferenciaNotificacionEntity.java` — ✅ Existe

### 4.3 Lo que FALTA en Backend

| Componente                                  | Estado       | Impacto                      |
| ------------------------------------------- | ------------ | ---------------------------- |
| `NotificacionRepository` (interfaz dominio) | ❌ No existe | Sin acceso a datos           |
| `NotificacionJpaRepository` (Spring Data)   | ❌ No existe | Sin persistencia             |
| `NotificacionPersistenceAdapter`            | ❌ No existe | Sin integración              |
| `NotificacionMapper`                        | ❌ No existe | Sin conversión entity↔domain |
| `NotificacionService` / use cases           | ❌ No existe | Sin lógica de negocio        |
| `NotificacionController` REST               | ❌ No existe | Sin endpoints API            |
| `CrearNotificacionUseCase`                  | ❌ No existe | Sin creación automática      |
| `MarcarLeidaUseCase`                        | ❌ No existe | Sin acciones del usuario     |

### 4.4 Lo que SÍ envía notificaciones (Email)

`CorreoAdapter.java` implementa `EnviarNotificacionEventoPort`:

- `notificarSolicitudRecibida()` — al admin cuando llega solicitud
- `notificarEventoConfirmado()` — al cliente
- `notificarEventoCancelado()` — al cliente
- `notificarAdminNuevaSolicitud()` — al admin

**Problema**: estos solo envían correo. No insertan nada en la tabla `notificacion`. El canal IN_APP está completamente desconectado.

---

## 5. Estado del Frontend

### 5.1 Componentes Existentes

#### AdminNavbar — Menú de Notificaciones

**Archivo**: `src/features/admin/shared/layout/AdminNavbar.tsx`

- Dropdown con icono Bell y badge de count
- Lista estática de 3 notificaciones hardcodeadas
- NO usa el store Zustand
- NO hace fetch a ningún endpoint
- Muestra `tipo` como badge coloreado (reserva/pago/evento)
- Problema: el objeto de notificación tiene `texto` (string plano) en lugar de `titulo` + `mensaje`

#### NotificacionesPanel — Panel Cliente

**Archivo**: `src/features/cliente/shared/components/NotificacionesPanel.tsx`

- Popover con lista de notificaciones
- Usa `useNotificacionesStore` — conectado al store Zustand
- Tiene `TIPO_CONFIG` con iconos y colores por tipo
- Soporta `href` para navegar al detalle
- `formatDistanceToNow` con locale español
- "Marcar todas como leídas" funcional (contra el store)
- Empty state con mensaje

#### NotificationSection — Configuración de preferencias

**Archivo**: `src/components/admin/preferences/NotificationSection.tsx`

- Controles para canales: Push, Email
- Switches para UI: Notificaciones visuales, Sonido, Badges dinámicos
- Conectado a `PreferenciaAdmin` que sí tiene endpoints reales

### 5.2 Store Zustand

**Archivo**: `src/lib/store/notificaciones.store.ts`

```typescript
interface NotificacionesState {
  notificaciones: Notificacion[]
  marcarLeida: (id: string) => void        // ✅ Implementado
  marcarTodasLeidas: () => void             // ✅ Implementado
  agregarNotificacion: (...) => void        // ✅ Implementado
  // ❌ falta: fetchNotificaciones()
  // ❌ falta: marcarLeidaEnServidor(id)
  // ❌ falta: unreadCount derivado
}
```

El store tiene un array de 4 notificaciones mock como seed. No hay ningún `useEffect` o mecanismo para cargar datos del servidor.

### 5.3 Inconsistencia entre AdminNavbar y NotificacionesPanel

| Aspecto         | AdminNavbar                          | NotificacionesPanel                                 |
| --------------- | ------------------------------------ | --------------------------------------------------- |
| Fuente de datos | Constante local (`NOTIFICACIONES`)   | Store Zustand (`useNotificacionesStore`)            |
| Interfaz        | `{ id, tipo, texto, tiempo, leida }` | `{ id, tipo, titulo, mensaje, fecha, leida, href }` |
| Tiempo          | String estático ("Hace 5 min")       | `formatDistanceToNow(fecha)` dinámico               |
| Icono por tipo  | ❌ No tiene                          | ✅ Tiene `TIPO_CONFIG` con iconos                   |
| Marcar leída    | ❌ No funciona                       | ✅ Funciona (en store)                              |
| Marcar todas    | ❌ No tiene                          | ✅ Tiene botón                                      |
| "Ver todas"     | Botón sin ruta                       | —                                                   |

---

## 6. Inconsistencias Detectadas

### 6.1 Tipo `pago` en frontend sin equivalente en BD

El frontend define el tipo `'pago'` con ícono Wallet y color amber, pero en el catálogo `tipo_notificacion` no existe ningún tipo con módulo `pago`. Los pagos están embebidos en `RESERVA_YAPE_PENDIENTE` (para admin) y no hay tipo específico para notificar pagos al cliente.

**Recomendación**: Agregar al seed `PAGO_RECIBIDO` para cliente, o mapear `RESERVA_YAPE_PENDIENTE` al tipo visual `'pago'`.

### 6.2 `CAJA_SIN_ABRIR` destinatario CAJERO sin soporte frontend

No existe panel de notificaciones para el rol CAJERO. El tipo está definido en BD con destinatario `CAJERO` pero no hay ningún componente que lo consuma.

**Recomendación**: Reutilizar `NotificacionesPanel` en el Navbar del cajero, o incluirlo en `AdminNavbar` filtrando por rol.

### 6.3 `AdminNavbar` desconectado del store

`AdminNavbar` usa una constante local en vez del store Zustand, mientras que `NotificacionesPanel` sí usa el store. Cuando el store actualice (futuro fetch), `AdminNavbar` no lo reflejará.

### 6.4 Campo `texto` vs `titulo`+`mensaje`

En `AdminNavbar`: cada notificación tiene `texto` (string plano).  
En el store y `NotificacionesPanel`: tiene `titulo` + `mensaje` separados.  
En la BD: tiene `titulo` + `mensaje` separados.

El `AdminNavbar` usa la estructura más limitada. Debe migrarse a la misma estructura que el store.

### 6.5 Sin expiración en frontend

La BD tiene `expira_at` para auto-expirar notificaciones. El frontend no tiene lógica para filtrar notificaciones expiradas.

### 6.6 `preferencia_notificacion` vs `preferencia_usuario.preferencias_extras`

Hay **dos mecanismos de preferencias** que coexisten:

1. **`preferencia_notificacion`** (tabla dedicada): permite configurar canales por tipo específico, por usuario o cliente. Granularidad alta. **No tiene endpoints**.

2. **`preferencia_usuario.preferencias_extras` (JSONB)**: almacena `sonidoNotificaciones`, `notificacionesPush`, `notificacionesEmail`, etc. Solo para admins. **Tiene endpoints funcionando**.

Para el MVP, el segundo mecanismo es suficiente. La tabla `preferencia_notificacion` es para una versión avanzada donde el usuario controla notificación por notificación.

---

## 7. Propuesta de Arquitectura Frontend

### 7.1 Estructura de archivos propuesta

```
src/
├── services/
│   └── notificaciones.service.ts        # API client (nuevo)
├── lib/
│   └── store/
│       └── notificaciones.store.ts      # Ampliar store existente
├── hooks/
│   └── useNotificaciones.ts             # Hook con polling (nuevo)
├── types/
│   └── notificaciones.types.ts          # Tipos compartidos (nuevo)
└── features/
    ├── admin/
    │   └── shared/
    │       └── layout/
    │           └── AdminNavbar.tsx       # Refactorizar
    └── cliente/
        └── shared/
            └── components/
                └── NotificacionesPanel.tsx  # Ya correcto, mínimos cambios
```

### 7.2 Tipos TypeScript unificados

```typescript
// types/notificaciones.types.ts

export type TipoNotificacionBD =
  | 'RESERVA_CONFIRMADA'
  | 'RESERVA_RECORDATORIO'
  | 'RESERVA_CANCELADA'
  | 'RESERVA_YAPE_PENDIENTE'
  | 'AFORO_LIMITE'
  | 'EVENTO_SOLICITUD'
  | 'EVENTO_CONFIRMADO'
  | 'EVENTO_RECORDATORIO'
  | 'EVENTO_CONTRATO_PENDIENTE'
  | 'EVENTO_SALDO_PENDIENTE'
  | 'CAJA_SIN_CERRAR'
  | 'CAJA_SIN_ABRIR'
  | 'RESENA_PENDIENTE'
  | 'MENSAJE_NUEVO'
  | 'BIENVENIDA'
  | 'CUMPLEANOS_NINO'
  | 'LOGIN_IP_NUEVA'

export type TipoVisual =
  | 'reserva'
  | 'evento'
  | 'pago'
  | 'contrato'
  | 'caja'
  | 'sistema'

export interface NotificacionDTO {
  id: string
  tipoCodigo: TipoNotificacionBD
  titulo: string
  mensaje: string
  urlAccion?: string
  leida: boolean
  prioridad: 'BAJA' | 'NORMAL' | 'ALTA' | 'CRITICA'
  expiraAt?: string
  createdAt: string
}

// Mapa de código BD → tipo visual
export const TIPO_VISUAL_MAP: Record<TipoNotificacionBD, TipoVisual> = {
  RESERVA_CONFIRMADA: 'reserva',
  RESERVA_RECORDATORIO: 'reserva',
  RESERVA_CANCELADA: 'reserva',
  RESERVA_YAPE_PENDIENTE: 'pago',
  AFORO_LIMITE: 'reserva',
  EVENTO_SOLICITUD: 'evento',
  EVENTO_CONFIRMADO: 'evento',
  EVENTO_RECORDATORIO: 'evento',
  EVENTO_CONTRATO_PENDIENTE: 'contrato',
  EVENTO_SALDO_PENDIENTE: 'pago',
  CAJA_SIN_CERRAR: 'caja',
  CAJA_SIN_ABRIR: 'caja',
  RESENA_PENDIENTE: 'sistema',
  MENSAJE_NUEVO: 'sistema',
  BIENVENIDA: 'sistema',
  CUMPLEANOS_NINO: 'sistema',
  LOGIN_IP_NUEVA: 'sistema',
}
```

### 7.3 Servicio API

```typescript
// services/notificaciones.service.ts

export const notificacionesService = {
  getMias: (params?: { soloNoLeidas?: boolean; page?: number }) =>
    apiClient.get<{
      items: NotificacionDTO[]
      total: number
      noLeidas: number
    }>('/notificaciones/mias', { params }),

  marcarLeida: (id: string) => apiClient.patch(`/notificaciones/${id}/leida`),

  marcarTodasLeidas: () =>
    apiClient.post('/notificaciones/marcar-todas-leidas'),

  contarNoLeidas: () =>
    apiClient.get<{ count: number }>('/notificaciones/mias/count'),
}
```

### 7.4 Ampliar el Store

```typescript
// Ampliar notificaciones.store.ts

interface NotificacionesState {
  notificaciones: NotificacionDTO[]
  noLeidas: number
  cargando: boolean
  ultimaActualizacion: Date | null
  // acciones
  fetchNotificaciones: () => Promise<void>
  marcarLeida: (id: string) => Promise<void>
  marcarTodasLeidas: () => Promise<void>
  agregarNotificacion: (n: NotificacionDTO) => void // para SSE/WebSocket futuro
}
```

### 7.5 Hook con Polling

```typescript
// hooks/useNotificaciones.ts
export function useNotificaciones(intervaloMs = 30_000) {
  const { fetchNotificaciones } = useNotificacionesStore()

  useEffect(() => {
    fetchNotificaciones()
    const id = setInterval(fetchNotificaciones, intervaloMs)
    return () => clearInterval(id)
  }, [])
}
```

### 7.6 Refactor AdminNavbar

```typescript
// AdminNavbar.tsx — reemplazar NotificacionesMenu()

function NotificacionesMenu() {
  const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas } =
    useNotificacionesStore()
  // Eliminar NOTIFICACIONES constante hardcodeada
  // Eliminar tipoBadge local
  // Reutilizar TIPO_CONFIG de NotificacionesPanel o crear shared
}
```

---

## 8. Endpoints Backend que Hay que Crear

### 8.1 Para Admin (`/api/v1/notificaciones`)

```
GET    /api/v1/notificaciones/mias              # Feed paginado del usuario autenticado
GET    /api/v1/notificaciones/mias/count        # Solo el conteo de no leídas
PATCH  /api/v1/notificaciones/{id}/leida        # Marcar una como leída
POST   /api/v1/notificaciones/marcar-todas-leidas  # Marcar todas del usuario
```

### 8.2 Para Cliente (`/api/v1/cliente/notificaciones`)

```
GET    /api/v1/cliente/notificaciones           # Feed del cliente autenticado
GET    /api/v1/cliente/notificaciones/count     # Conteo no leídas
PATCH  /api/v1/cliente/notificaciones/{id}/leida
POST   /api/v1/cliente/notificaciones/marcar-todas-leidas
```

### 8.3 Creación interna (sin endpoint público)

La creación de notificaciones debe hacerse **internamente** desde los servicios de negocio, no por endpoint REST. Un `CrearNotificacionUseCase` que inserte en `notificacion` y en `notificacion_entrega`.

---

## 9. Componentes de Backend que Crear

Orden sugerido de implementación:

```
1. NotificacionRepository (interfaz dominio)
   └── métodos: buscarPorUsuario(), buscarPorCliente(), marcarLeida(), contarNoLeidas()

2. NotificacionJpaRepository (Spring Data JPA)
   └── queries con @Query para feeds paginados

3. NotificacionMapper
   └── NotificacionEntity ↔ Notificacion (domain) ↔ NotificacionResponse (DTO)

4. NotificacionPersistenceAdapter (implementa repository)

5. CrearNotificacionUseCase + NotificacionService
   └── método: crear(tipoCodigo, destinatario, entidad, metadata)
   └── Internamente inserta en notificacion + notificacion_entrega

6. ObtenerNotificacionesUseCase
   └── feed paginado, conteo, marcar leída

7. NotificacionController (admin)
   └── GET /mias, GET /mias/count, PATCH /{id}/leida, POST /marcar-todas-leidas

8. ClienteNotificacionController
   └── Mismo patrón pero autenticado como cliente

9. Integrar CrearNotificacionUseCase en servicios existentes:
   └── EventoPrivadoService → EVENTO_SOLICITUD, EVENTO_CONFIRMADO
   └── ReservaService → RESERVA_CONFIRMADA, RESERVA_CANCELADA
   └── CajaService → CAJA_SIN_CERRAR, CAJA_SIN_ABRIR
   └── PagoService → RESERVA_YAPE_PENDIENTE
```

---

## 10. Estrategia de Tiempo Real (Futuro)

El polling (opción más simple) es suficiente para el MVP. Para tiempo real completo:

| Opción                        | Complejidad | Descripción                                                                 |
| ----------------------------- | ----------- | --------------------------------------------------------------------------- |
| **Polling** (recomendado MVP) | Baja        | `setInterval` cada 30s en el hook                                           |
| **SSE** (Server-Sent Events)  | Media       | Spring's `SseEmitter` — unidireccional, funciona sobre HTTP                 |
| **WebSocket**                 | Alta        | STOMP sobre WebSocket, bidireccional, requiere configuración CORS adicional |

Para el MVP: polling. Para producción con >50 admins simultáneos: SSE.

---

## 11. Plan de Implementación Sugerido

### Sprint 1 — Backend Foundation (3-4 días)

- [ ] Crear `NotificacionRepository` (interfaz)
- [ ] Crear `NotificacionJpaRepository`
- [ ] Crear `NotificacionMapper`
- [ ] Crear `NotificacionPersistenceAdapter`
- [ ] Crear `NotificacionService` con use cases básicos
- [ ] Crear `NotificacionController` (admin)
- [ ] Test manual con Postman/HTTP client

### Sprint 2 — Frontend Integration (2-3 días)

- [ ] Crear `notificaciones.types.ts` con tipos unificados y `TIPO_VISUAL_MAP`
- [ ] Crear `notificaciones.service.ts`
- [ ] Ampliar `notificaciones.store.ts` con fetch real
- [ ] Crear `useNotificaciones` hook con polling
- [ ] Refactorizar `AdminNavbar.tsx` para usar store
- [ ] Asegurar que `NotificacionesPanel.tsx` usa store real

### Sprint 3 — Integración de negocio (3-4 días)

- [ ] Integrar `CrearNotificacionUseCase` en `EventoPrivadoService`
- [ ] Integrar en `ReservaService`
- [ ] Integrar en `CajaService`
- [ ] Crear `ClienteNotificacionController`
- [ ] Endpoint `/count` para badge en tiempo real

### Sprint 4 — Pulido (1-2 días)

- [ ] Añadir tipo `'caja'` al frontend con ícono `ShoppingBag`/`CashRegister`
- [ ] Filtrado por expiración en frontend
- [ ] Empty states y skeleton loaders
- [ ] Test E2E básico del flujo completo

---

## 12. Archivos a Modificar / Crear

### Backend (pems/)

| Archivo                                                                               | Acción                                   |
| ------------------------------------------------------------------------------------- | ---------------------------------------- |
| `domain/notificacion/repository/NotificacionRepository.java`                          | ✨ Crear                                 |
| `infrastructure/persistence/notificacion/repository/NotificacionJpaRepository.java`   | ✨ Crear                                 |
| `infrastructure/persistence/notificacion/mapper/NotificacionMapper.java`              | ✨ Crear                                 |
| `infrastructure/persistence/notificacion/adapter/NotificacionPersistenceAdapter.java` | ✨ Crear                                 |
| `application/notificacion/service/NotificacionService.java`                           | ✨ Crear                                 |
| `application/notificacion/usecase/CrearNotificacionUseCase.java`                      | ✨ Crear                                 |
| `application/notificacion/usecase/ObtenerNotificacionesUseCase.java`                  | ✨ Crear                                 |
| `interfaces/rest/notificacion/NotificacionController.java`                            | ✨ Crear                                 |
| `interfaces/rest/notificacion/dto/NotificacionResponse.java`                          | ✨ Crear                                 |
| `application/evento/service/EventoPrivadoService.java`                                | 🔧 Modificar                             |
| `infrastructure/external/correo/CorreoAdapter.java`                                   | 🔧 Modificar (registrar en BD al enviar) |

### Frontend (pems-web/)

| Archivo                                                          | Acción             |
| ---------------------------------------------------------------- | ------------------ |
| `src/types/notificaciones.types.ts`                              | ✨ Crear           |
| `src/services/notificaciones.service.ts`                         | ✨ Crear           |
| `src/hooks/useNotificaciones.ts`                                 | ✨ Crear           |
| `src/lib/store/notificaciones.store.ts`                          | 🔧 Ampliar         |
| `src/features/admin/shared/layout/AdminNavbar.tsx`               | 🔧 Refactorizar    |
| `src/features/cliente/shared/components/NotificacionesPanel.tsx` | 🔧 Mínimos cambios |

---

## 13. Quick Wins (sin tocar el backend)

Mientras el backend se implementa, estos cambios pueden hacerse inmediatamente:

1. **Conectar `AdminNavbar` al store Zustand** — en vez de la constante local. Mejora consistencia de estado.
2. **Unificar la interfaz `Notificacion`** — cambiar `texto` por `titulo` + `mensaje` en el mock del NavBar.
3. **Agregar tipo `'caja'`** al `TIPO_CONFIG` del panel (para cuando lleguen esas notificaciones).
4. **Ruta "Ver todas"** — crear `/admin/notificaciones` como página full con historial.
5. **Badge real basado en store** — el badge del NavBar debería leer `noLeidas` del store.

---

_Reporte generado el 2026-06-27. Próxima revisión: al completar Sprint 1._
