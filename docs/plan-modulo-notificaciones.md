# Plan de Implementación — Módulo de Notificaciones

**Fecha:** 2026-06-27
**Estado:** Pendiente de aprobación
**Arquitectura:** Hexagonal (ports & adapters), igual al resto del proyecto

---

## Estado actual del módulo

| Capa | Archivos existentes | Faltante |
|------|--------------------|-|
| Dominio | `Notificacion`, `TipoNotificacion`, `NotificacionEntrega`, `PreferenciaNotificacion` (solo POJOs) | repositorios, excepciones |
| Infraestructura | 4 entities JPA mapeadas | mapper, JpaRepository, adapter |
| Aplicación | ninguno | use cases, service, DTOs |
| Interfaces REST | ninguno | controllers, requests, responses |
| Scheduler | `EnvioEmailScheduler` (email campañas, no toca notificaciones) | job de limpieza |
| Frontend | store Zustand con mocks, `NotificacionesPanel` (cliente), `AdminNavbar` desconectado | service API, hook, refactor navbar |

El módulo de email (`CorreoAdapter`, `EnvioEmailScheduler`) ya funciona de forma independiente y no se modifica.

---

## Fase 1 — Scripts SQL para Supabase

Scripts en `pems/src/main/resources/db/migration_legacy/`. Ejecución manual en Supabase.

### Sub-fase 1.1 — Nuevos tipos de notificación

**Archivo:** `V29__notificaciones_nuevos_tipos.sql`

Agrega columna `es_obligatoria BOOLEAN NOT NULL DEFAULT FALSE` a `tipo_notificacion` e inserta los 38 nuevos tipos. Los marcados como obligatorios no pueden desactivarse por el usuario en preferencias.

Tipos obligatorios: `LOGIN_IP_NUEVA`, `ADMIN_CUENTA_BLOQUEADA`, `PASSWORD_CAMBIADO`, `PAGO_RECHAZADO`, `EVENTO_CANCELADO_ADMIN`, `CONTRATO_VENCIDO_SIN_FIRMA`.

Nuevos tipos para ADMIN:

| Codigo | Modulo | Prioridad | Canales |
|--------|--------|-----------|---------|
| RESERVA_NUEVA | reserva | NORMAL | IN_APP |
| RESERVA_CANCELADA_CLIENTE | reserva | NORMAL | IN_APP |
| RESERVA_PAGO_VERIFICADO | reserva | NORMAL | IN_APP |
| RESERVA_PAGO_RECHAZADO | reserva | NORMAL | IN_APP |
| AFORO_AGOTADO | reserva | ALTA | IN_APP |
| EVENTO_PRESUPUESTO_SOLICITADO | evento | ALTA | IN_APP, EMAIL |
| EVENTO_ADELANTO_RECIBIDO | evento | NORMAL | IN_APP |
| EVENTO_SALDO_RECIBIDO | evento | NORMAL | IN_APP |
| EVENTO_CANCELADO_CLIENTE | evento | ALTA | IN_APP, EMAIL |
| EVENTO_CHECKLIST_INCOMPLETO | evento | ALTA | IN_APP |
| CONTRATO_FIRMADO | evento | NORMAL | IN_APP |
| CONTRATO_VENCIDO_SIN_FIRMA | evento | CRITICA | IN_APP, EMAIL |
| CAJA_CIERRE_DISCREPANCIA | caja | ALTA | IN_APP, EMAIL |
| VENTA_MONTO_ALTO | caja | NORMAL | IN_APP |
| EGRESO_MONTO_ALTO | caja | NORMAL | IN_APP |
| RESUMEN_DIARIO_CAJA | caja | BAJA | IN_APP, EMAIL |
| NOVEDAD_PUBLICADA | cms | BAJA | IN_APP |
| BANNER_EXPIRADO | cms | BAJA | IN_APP |
| PROMOCION_NUEVA_ACTIVA | marketing | BAJA | IN_APP |
| REPORTE_EXPORTACION_LISTA | sistema | BAJA | IN_APP |
| CLIENTE_NUEVO_REGISTRADO | cliente | BAJA | IN_APP |
| CLIENTE_SIN_ACTIVIDAD | cliente | BAJA | IN_APP |
| ADMIN_CUENTA_BLOQUEADA | sistema | CRITICA | IN_APP, EMAIL |
| ERROR_ENVIO_EMAIL | sistema | ALTA | IN_APP |

Nuevos tipos para CAJERO:

| Codigo | Modulo | Prioridad | Canales |
|--------|--------|-----------|---------|
| RESERVA_EN_CAJA_HOY | caja | BAJA | IN_APP |
| VENTA_ANULADA | caja | NORMAL | IN_APP |
| DESCUENTO_REQUIERE_APROBACION | caja | ALTA | IN_APP |
| TURNO_POR_INICIAR | caja | BAJA | IN_APP |

Nuevos tipos para CLIENTE:

| Codigo | Modulo | Prioridad | Canales |
|--------|--------|-----------|---------|
| RESERVA_MODIFICADA | reserva | NORMAL | IN_APP, EMAIL |
| PAGO_CONFIRMADO | reserva | NORMAL | IN_APP, EMAIL |
| PAGO_RECHAZADO | reserva | ALTA | IN_APP, EMAIL |
| TICKET_DISPONIBLE | reserva | NORMAL | IN_APP, EMAIL |
| EVENTO_CONTRATO_LISTO | evento | ALTA | IN_APP, EMAIL |
| EVENTO_PRESUPUESTO_ENVIADO | evento | NORMAL | IN_APP, EMAIL |
| EVENTO_CANCELADO_ADMIN | evento | ALTA | IN_APP, EMAIL |
| EVENTO_RECORDATORIO_3DIAS | evento | NORMAL | IN_APP, EMAIL |
| PAGO_ADELANTO_CONFIRMADO | evento | NORMAL | IN_APP, EMAIL |
| DOCUMENTO_LISTO | venta | BAJA | IN_APP, EMAIL |
| PUNTOS_ACUMULADOS | cliente | BAJA | IN_APP |
| PUNTOS_POR_VENCER | cliente | NORMAL | IN_APP, EMAIL |
| PROMOCION_EXCLUSIVA | marketing | BAJA | IN_APP, EMAIL |
| PASSWORD_CAMBIADO | sistema | CRITICA | EMAIL |
| RESENA_RESPONDIDA | sitio | BAJA | IN_APP, EMAIL |

### Sub-fase 1.2 — Funcion de limpieza en PostgreSQL

**Archivo:** `V30__notificaciones_limpieza_function.sql`

Crea la funcion `app.limpiar_notificaciones_expiradas()` que retorna `INTEGER` con el total eliminado. El job de Spring la invoca via JDBC nativo, lo que permite que Supabase tambien la ejecute con `pg_cron` si se necesita.

La funcion elimina en dos pasadas dentro de una transaccion:
1. Notificaciones con `expira_at < NOW()` y `leida = TRUE`
2. Notificaciones con `expira_at < NOW() - INTERVAL '7 days'` (incluso no leidas, margen de seguridad)

Retorna el total de filas eliminadas en ambas pasadas.

### Sub-fase 1.3 — Vista materializada para conteo de no leidas

**Archivo:** `V31__notificaciones_unread_view.sql`

Crea la vista materializada `v_notif_no_leidas` con columnas `(destinatario_usuario_id, destinatario_cliente_id, count_no_leidas)`. Evita ejecutar `COUNT(*)` en cada request del badge del navbar.

Se refresca mediante un trigger `AFTER INSERT OR UPDATE OF leida ON notificacion` que llama a `REFRESH MATERIALIZED VIEW CONCURRENTLY`. Requiere un indice unico en la vista para el refresh concurrente.

---

## Fase 2 — Capa de Dominio

Patron de referencia: `domain/evento/repository/EventoPrivadoRepository.java`.

Sin anotaciones Spring. Interfaces puras de dominio. Los tipos de retorno son modelos de dominio, nunca entities.

### Sub-fase 2.1 — NotificacionRepository

**Archivo:** `domain/notificacion/repository/NotificacionRepository.java`

```
buscarFeedUsuario(UUID usuarioId, boolean soloNoLeidas, Pageable)  -> Page<Notificacion>
buscarFeedCliente(Long clienteId, boolean soloNoLeidas, Pageable)  -> Page<Notificacion>
contarNoLeidasUsuario(UUID usuarioId)                              -> long
contarNoLeidasCliente(Long clienteId)                              -> long
marcarLeida(Long id, UUID usuarioId)                               -> void
marcarLeida(Long id, Long clienteId)                               -> void
marcarTodasLeidasUsuario(UUID usuarioId)                           -> void
marcarTodasLeidasCliente(Long clienteId)                           -> void
guardar(Notificacion)                                              -> Notificacion
guardarTodas(List<Notificacion>)                                   -> List<Notificacion>
```

### Sub-fase 2.2 — NotificacionEntregaRepository

**Archivo:** `domain/notificacion/repository/NotificacionEntregaRepository.java`

```
guardar(NotificacionEntrega)                -> NotificacionEntrega
guardarTodas(List<NotificacionEntrega>)     -> List<NotificacionEntrega>
```

### Sub-fase 2.3 — Excepcion de dominio

**Archivo:** `domain/notificacion/exception/NotificacionNotFoundException.java`

Extiende `ResourceNotFoundException`. Constructor recibe el id de la notificacion.

---

## Fase 3 — Capa de Infraestructura

Patron de referencia: `infrastructure/persistence/evento/`.

### Sub-fase 3.1 — NotificacionEntityMapper

**Archivo:** `infrastructure/persistence/notificacion/mapper/NotificacionEntityMapper.java`

`@Component`. Metodos `toDomain(NotificacionEntity)` y `toEntity(Notificacion, TipoNotificacionEntity)`.

El campo `tipo` en entity es `@ManyToOne LAZY`. El mapper no carga la relacion completa: para `toDomain` extrae solo `entity.getTipo().getCodigo()` sin forzar el fetch. Para `toEntity` recibe la entity del tipo como parametro (resuelta por el adapter antes de llamar al mapper).

### Sub-fase 3.2 — NotificacionEntregaEntityMapper

**Archivo:** `infrastructure/persistence/notificacion/mapper/NotificacionEntregaEntityMapper.java`

`@Component`. Metodos `toDomain(NotificacionEntregaEntity)` y `toEntity(NotificacionEntrega, NotificacionEntity)`.

### Sub-fase 3.3 — JPA Repositories

**Archivo:** `infrastructure/persistence/notificacion/jpa/NotificacionJpaRepository.java`

Extiende `JpaRepository<NotificacionEntity, Long>`.

Queries con `@Query` JPQL:

```
findFeedUsuario(UUID usuarioId, Boolean soloNoLeidas, Pageable) -> Page<NotificacionEntity>
findFeedCliente(Long clienteId, Boolean soloNoLeidas, Pageable) -> Page<NotificacionEntity>
countNoLeidasUsuario(UUID usuarioId)                           -> long
countNoLeidasCliente(Long clienteId)                           -> long

@Modifying marcarLeidaUsuario(Long id, UUID usuarioId)         -> void
@Modifying marcarLeidaCliente(Long id, Long clienteId)         -> void
@Modifying marcarTodasLeidasUsuario(UUID usuarioId)            -> void
@Modifying marcarTodasLeidasCliente(Long clienteId)            -> void
@Modifying eliminarExpiradas(OffsetDateTime limite)            -> int
@Modifying eliminarExpiiradasLeidas(OffsetDateTime ahora)      -> int
```

Las queries de feed usan `WHERE (:soloNoLeidas = FALSE OR n.leida = FALSE)` para el filtro opcional sin duplicar queries.

**Archivo:** `infrastructure/persistence/notificacion/jpa/NotificacionEntregaJpaRepository.java`

Extiende `JpaRepository<NotificacionEntregaEntity, Long>`. Sin queries custom por ahora.

**Archivo:** `infrastructure/persistence/notificacion/jpa/TipoNotificacionJpaRepository.java`

Extiende `JpaRepository<TipoNotificacionEntity, String>`. Solo necesita el `findById` heredado para resolver el tipo al crear una notificacion.

### Sub-fase 3.4 — NotificacionPersistenceAdapter

**Archivo:** `infrastructure/persistence/notificacion/adapter/NotificacionPersistenceAdapter.java`

`@Component @RequiredArgsConstructor @Transactional`. Implementa `NotificacionRepository`.

El metodo `guardarTodas` usa `jpaRepo.saveAll(entities)` para inserts en lote, no `save` en loop.

El metodo `contarNoLeidasUsuario` consulta la vista materializada `v_notif_no_leidas` via `@Query` nativa. Si la vista no existe (entorno sin las migraciones de fase 1), hace fallback a `COUNT` JPQL.

---

## Fase 4 — Capa de Aplicacion (Use Cases + Service)

Patron de referencia: `application/evento/service/EventoPrivadoService.java`.

### Sub-fase 4.1 — DTOs

**Archivos:**

```
application/notificacion/dto/command/CrearNotificacionCommand.java
application/notificacion/dto/query/NotificacionQuery.java
application/notificacion/dto/query/NotificacionFeedQuery.java
```

`CrearNotificacionCommand` campos: `tipoCodigo`, `destinatarioUsuarioId` (UUID, nullable), `destinatarioClienteId` (Long, nullable), `entidadTipo` (String, nullable), `entidadId` (Long, nullable), `datosExtra` (Map<String, String>, para interpolacion de plantilla). Sin `titulo`/`mensaje` — se derivan de `TipoNotificacion.plantillaTitulo` / `plantillaMensaje`.

`NotificacionQuery` es el DTO de salida del service hacia el controller.

`NotificacionFeedQuery` envuelve `Page<NotificacionQuery>` mas el campo `noLeidas` (long, total del usuario sin paginar).

### Sub-fase 4.2 — Ports de entrada (Use Cases)

**Archivos:**

```
application/notificacion/port/in/CrearNotificacionUseCase.java
application/notificacion/port/in/ObtenerNotificacionesUseCase.java
application/notificacion/port/in/MarcarNotificacionLeidaUseCase.java
```

`CrearNotificacionUseCase` tiene un solo metodo `crear(CrearNotificacionCommand)`.

### Sub-fase 4.3 — Port de salida (para otros modulos)

**Archivo:** `application/notificacion/port/out/CrearNotificacionPort.java`

Puerto que implementa `NotificacionService` y que inyectan los demas servicios de negocio (EventoPrivadoService, VentaService, etc.). Mismo patron que `EnviarNotificacionEventoPort`.

```java
void notificar(CrearNotificacionCommand command);
```

### Sub-fase 4.4 — NotificacionService

**Archivo:** `application/notificacion/service/NotificacionService.java`

`@Service @RequiredArgsConstructor @Slf4j @Transactional`. Implementa `CrearNotificacionUseCase`, `ObtenerNotificacionesUseCase`, `MarcarNotificacionLeidaUseCase` y `CrearNotificacionPort`.

Logica del metodo `notificar(CrearNotificacionCommand)`:

1. Carga `TipoNotificacion` por `tipoCodigo`. Lanza `BusinessException` si no existe o no esta activo.
2. Interpola `plantilla_titulo` y `plantilla_mensaje` con `datosExtra` del command usando `String.replace` simple (sin motor de plantillas externo).
3. Calcula `expiraAt` segun prioridad: BAJA=7d, NORMAL=30d, ALTA=60d, CRITICA=90d.
4. Persiste `Notificacion` via `NotificacionRepository.guardar`.
5. Persiste `NotificacionEntrega` para canal `IN_APP` con estado `ENVIADO` (inmediato).
6. Si el tipo tiene `EMAIL` en `canalesDefault`, persiste una `NotificacionEntrega` con canal `EMAIL` y estado `PENDIENTE` para que el `EnvioEmailScheduler` existente la procese.

El metodo esta anotado con `@Async("asyncExecutor")` en la implementacion del puerto `CrearNotificacionPort`, de modo que los servicios de negocio que lo llaman no quedan bloqueados esperando la escritura.

---

## Fase 5 — Capa REST

Patron de referencia: `interfaces/rest/evento/EventoPrivadoController.java`.

### Sub-fase 5.1 — DTOs de respuesta y mapper

**Archivos:**

```
interfaces/rest/notificacion/response/NotificacionResponse.java
interfaces/rest/notificacion/response/NotificacionFeedResponse.java
interfaces/rest/notificacion/mapper/NotificacionResponseMapper.java
```

`NotificacionResponse` campos: `id`, `tipoCodigo`, `tipoVisual`, `titulo`, `mensaje`, `urlAccion`, `prioridad`, `leida`, `createdAt`, `expiraAt`.

`tipoVisual` es un string derivado en el mapper (`reserva`, `evento`, `pago`, `contrato`, `caja`, `sistema`) para que el frontend no necesite el mapeo.

`NotificacionFeedResponse` envuelve `List<NotificacionResponse>`, `noLeidas` (long), `totalElementos` (long), `paginaActual` (int), `totalPaginas` (int).

### Sub-fase 5.2 — NotificacionAdminController

**Archivo:** `interfaces/rest/notificacion/NotificacionAdminController.java`

`@RestController @RequestMapping("/api/v1/notificaciones") @RequiredArgsConstructor`.

Acceso restringido a roles ADMIN y CAJERO via `SupabaseAuthFacade`.

```
GET  /mias              ?soloNoLeidas=false&page=0&size=20  -> ResponseEntity<ApiResponse<NotificacionFeedResponse>>
GET  /mias/count                                            -> ResponseEntity<ApiResponse<Long>>
PATCH /{id}/leida                                           -> ResponseEntity<ApiResponse<Void>>
POST  /marcar-todas-leidas                                  -> ResponseEntity<ApiResponse<Void>>
```

El `GET /mias/count` es el endpoint que llama el navbar cada 30s. Payload minimo: un solo `Long`.

### Sub-fase 5.3 — NotificacionClienteController

**Archivo:** `interfaces/rest/notificacion/NotificacionClienteController.java`

`@RestController @RequestMapping("/api/v1/cliente/notificaciones") @RequiredArgsConstructor`.

Mismo conjunto de 4 endpoints. Usa `authFacade.clientePerfilId()` para obtener el `Long clienteId`. Lanza `UnauthorizedException` si el cliente no esta autenticado.

---

## Fase 6 — Scheduler de Limpieza e Integracion con Servicios

### Sub-fase 6.1 — NotificacionLimpiezaJob

**Archivo:** `interfaces/scheduler/NotificacionLimpiezaJob.java`

`@Component @RequiredArgsConstructor @Slf4j`. Sin `@Transactional` propio — delega a metodos del service.

Dos schedules (zona America/Lima, igual que los schedulers existentes):

```
@Scheduled(cron = "0 30 3 * * *")   limpiezaNocturna()    -> llama funcion SQL via JDBC
@Scheduled(cron = "0 0 4 * * SUN")  limpiezaSemanal()     -> elimina BAJA+leidas con >3 dias
```

`limpiezaNocturna` ejecuta `SELECT app.limpiar_notificaciones_expiradas()` via `JdbcTemplate.queryForObject`. Loguea el total eliminado.

`limpiezaSemanal` usa el metodo `@Modifying` del JPA repository directamente.

### Sub-fase 6.2 — Integracion en servicios de negocio

Inyectar `CrearNotificacionPort` en cada servicio. Las llamadas no estan en el camino critico de la transaccion (el metodo del puerto es `@Async`).

Orden de integracion:

| Servicio | Tipo de notificacion | Punto de disparo |
|----------|---------------------|-----------------|
| `EventoPrivadoService` | EVENTO_SOLICITUD | despues de persistir la solicitud |
| `EventoPrivadoService` | EVENTO_CONFIRMADO | despues de confirmar |
| `EventoPrivadoService` | EVENTO_CANCELADO_ADMIN | despues de cancelar |
| `EventoPrivadoService` | EVENTO_ADELANTO_RECIBIDO | al registrar pago de adelanto |
| `EventoPrivadoService` | EVENTO_SALDO_RECIBIDO | al registrar saldo |
| `ReservaPublicaService` | RESERVA_NUEVA | despues de persistir la reserva |
| `ReservaPublicaService` | RESERVA_CONFIRMADA | al confirmar |
| `ReservaPublicaService` | RESERVA_CANCELADA | al cancelar |
| `VentaService` | PAGO_CONFIRMADO | al aprobar Yape |
| `VentaService` | PAGO_RECHAZADO | al rechazar Yape |
| `ContratoService` | CONTRATO_FIRMADO | al registrar firma |
| `ContratoService` | EVENTO_CONTRATO_LISTO | al subir el contrato |
| `ClientePerfilService` | BIENVENIDA | al crear cuenta |
| `ClientePerfilService` | CLIENTE_NUEVO_REGISTRADO | al crear cuenta (admin) |
| `CajaService` | CAJA_SIN_CERRAR | desde el scheduler nocturno |

`EventoPrivadoService` ya tiene `EnviarNotificacionEventoPort` para email. Se inyecta el nuevo `CrearNotificacionPort` en paralelo — ambos se llaman, uno persiste en BD y el otro envia email. No se elimina el puerto existente.

---

## Fase 7 — Frontend

Patron de referencia: `NotificacionesPanel.tsx` (ya correcto, minimos cambios).

### Sub-fase 7.1 — Tipos unificados

**Archivo:** `pems-web/src/types/notificaciones.types.ts`

Define:
- `TipoNotificacionBD`: union literal con los 55 codigos del catalogo
- `TipoVisual`: `'reserva' | 'evento' | 'pago' | 'contrato' | 'caja' | 'sistema'`
- `NotificacionDTO`: mapeo exacto del JSON del API (campos snake_case → camelCase)
- `NotificacionFeedDTO`: envuelve `items`, `noLeidas`, `totalElementos`, `paginaActual`, `totalPaginas`
- `TIPO_VISUAL_MAP`: `Record<TipoNotificacionBD, TipoVisual>` con los 55 mapeos

### Sub-fase 7.2 — Service API

**Archivo:** `pems-web/src/services/notificaciones.service.ts`

Usa el cliente HTTP existente del proyecto.

```typescript
getMias(params?: { soloNoLeidas?: boolean; page?: number; size?: number }) -> Promise<NotificacionFeedDTO>
getMiasCount()                                                              -> Promise<number>
marcarLeida(id: string)                                                     -> Promise<void>
marcarTodasLeidas()                                                         -> Promise<void>
```

Para el cliente usa rutas bajo `/api/v1/cliente/notificaciones`. Para admin/cajero usa `/api/v1/notificaciones`. El service detecta el contexto por el modulo que lo importa, o se crean dos instancias con base URL distinta.

### Sub-fase 7.3 — Ampliar Store

**Archivo:** `pems-web/src/lib/store/notificaciones.store.ts`

Reemplaza el seed mock. Agrega:
- `noLeidas: number`
- `cargando: boolean`
- `fetchNotificaciones(): Promise<void>` — llama `getMias`
- `fetchCount(): Promise<void>` — llama `getMiasCount`, actualiza solo `noLeidas`

`marcarLeida` hace optimistic update: actualiza el store antes de llamar la API. Si la API falla, revierte al estado anterior.

### Sub-fase 7.4 — Hook useNotificaciones

**Archivo:** `pems-web/src/hooks/useNotificaciones.ts`

```typescript
export function useNotificaciones(intervaloMs = 30_000) {
  const { fetchCount } = useNotificacionesStore()

  useEffect(() => {
    fetchCount()

    const tick = () => {
      if (document.visibilityState === 'visible') fetchCount()
    }

    const id = setInterval(tick, intervaloMs)
    document.addEventListener('visibilitychange', tick)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [intervaloMs])
}
```

El hook llama `fetchCount` (payload minimo) en el intervalo. Solo cuando el usuario abre el panel se llama `fetchNotificaciones` (payload completo). La ventana pausada no consume requests.

### Sub-fase 7.5 — Refactor AdminNavbar

**Archivo:** `pems-web/src/features/admin/shared/layout/AdminNavbar.tsx`

Cambios en `NotificacionesMenu`:
- Eliminar la constante `NOTIFICACIONES` hardcodeada
- Eliminar `tipoBadge` local
- Importar `useNotificacionesStore` y `TIPO_CONFIG` compartido
- Unificar la interfaz a `titulo` + `mensaje` (igual que `NotificacionesPanel`)
- Agregar `onClick` en cada item que llame `marcarLeida(n.id)`
- Agregar `onClick` en "Ver todas" que navegue a `/admin/notificaciones`
- El componente `NotificacionesMenu` pasa a ser `React.memo` para evitar re-renders cuando el resto del navbar cambia

El hook `useNotificaciones` se monta en el layout del admin, no dentro del componente del dropdown, para que el polling no se interrumpa al abrir/cerrar el menu.

### Sub-fase 7.6 — Ajustes NotificacionesPanel

**Archivo:** `pems-web/src/features/cliente/shared/components/NotificacionesPanel.tsx`

Cambios minimos:
- Agregar tipo `'caja'` a `TIPO_CONFIG` con icono `ShoppingBag` y color `text-orange-600`
- Al abrir el popover, llamar `fetchNotificaciones()` si los datos tienen mas de 60s de antiguedad
- `onMarcarLeida` ya funciona, solo asegurarse de que llame tambien al service API

---

## Mejoras de rendimiento

### Base de datos

**Vista materializada para conteo** (Fase 1.3): elimina `COUNT(*)` en cada request del navbar. El badge pasa de ser una query sobre millones de filas a una lectura de una fila indexada.

**Indice parcial existente optimo**: `idx_notif_usuario_feed (destinatario_usuario_id, leida, created_at DESC) WHERE destinatario_usuario_id IS NOT NULL` ya cubre el caso de uso mas frecuente. No agregar indices redundantes.

**Limpieza como DELETE con condicion de indice**: el job usa `expira_at` que tiene su propio indice parcial (`idx_notif_expira WHERE expira_at IS NOT NULL`). PostgreSQL escanea solo las filas con expiracion, sin table scan.

**`saveAll` para inserts en lote**: cuando una notificacion se genera para todos los admins de una sede, usar `guardarTodas(List)` en vez de iterar con `guardar`. Reduce round-trips de N a 1.

### Backend

**Cachear `TipoNotificacion`**: el catalogo se lee en cada llamada a `CrearNotificacionPort.notificar`. Agregar `@Cacheable("tipo-notificacion")` en el metodo que lo resuelve. Spring Boot con Caffeine (incluido por defecto) mantiene el catalogo en memoria. Invalidar con `@CacheEvict` si se actualiza un tipo.

**`@Async` en el puerto de creacion**: la escritura de notificaciones no bloquea la transaccion principal de negocio. Usa el `asyncExecutor` bean ya configurado en `TaskSchedulerConfig`. Si la escritura falla, se loguea el error pero la operacion principal (confirmar evento, registrar venta) no se revierte.

**No cargar relaciones LAZY innecesarias**: el mapper de `NotificacionEntity` extrae `tipo.getCodigo()` sin navegar al objeto completo. Evita queries N+1 en el feed paginado.

### Frontend

**Polling minimo**: el navbar llama `GET /mias/count` cada 30s. Payload de respuesta: `{"success":true,"data":2}`. Al abrir el panel llama `GET /mias` con el feed completo. Separar los dos endpoints evita transferir la lista completa en cada tick.

**Optimistic update**: `marcarLeida` actualiza el store antes de confirmar con el servidor. El usuario ve el cambio inmediatamente. Si el servidor falla, el store revierte. Patron ya descrito en la sub-fase 7.3.

**Pausa en ventana oculta**: el hook `useNotificaciones` escucha `visibilitychange` y omite el tick si la pestana no tiene foco. Un usuario con 10 pestanas abiertas no genera 10 polls paralelos.

**`React.memo` en `NotificacionesMenu`**: el componente solo re-renderiza cuando cambia `noLeidas` o la lista de notificaciones, no cuando cambia cualquier otro estado del navbar (usuario, sidebar, etc.).

---

## Archivos a crear

### SQL (migration_legacy)

```
V29__notificaciones_nuevos_tipos.sql
V30__notificaciones_limpieza_function.sql
V31__notificaciones_unread_view.sql
```

### Backend (pems)

```
domain/notificacion/repository/NotificacionRepository.java
domain/notificacion/repository/NotificacionEntregaRepository.java
domain/notificacion/exception/NotificacionNotFoundException.java

infrastructure/persistence/notificacion/mapper/NotificacionEntityMapper.java
infrastructure/persistence/notificacion/mapper/NotificacionEntregaEntityMapper.java
infrastructure/persistence/notificacion/jpa/NotificacionJpaRepository.java
infrastructure/persistence/notificacion/jpa/NotificacionEntregaJpaRepository.java
infrastructure/persistence/notificacion/jpa/TipoNotificacionJpaRepository.java
infrastructure/persistence/notificacion/adapter/NotificacionPersistenceAdapter.java

application/notificacion/dto/command/CrearNotificacionCommand.java
application/notificacion/dto/query/NotificacionQuery.java
application/notificacion/dto/query/NotificacionFeedQuery.java
application/notificacion/port/in/CrearNotificacionUseCase.java
application/notificacion/port/in/ObtenerNotificacionesUseCase.java
application/notificacion/port/in/MarcarNotificacionLeidaUseCase.java
application/notificacion/port/out/CrearNotificacionPort.java
application/notificacion/service/NotificacionService.java

interfaces/rest/notificacion/NotificacionAdminController.java
interfaces/rest/notificacion/NotificacionClienteController.java
interfaces/rest/notificacion/response/NotificacionResponse.java
interfaces/rest/notificacion/response/NotificacionFeedResponse.java
interfaces/rest/notificacion/mapper/NotificacionResponseMapper.java

interfaces/scheduler/NotificacionLimpiezaJob.java
```

### Frontend (pems-web)

```
src/types/notificaciones.types.ts
src/services/notificaciones.service.ts
src/hooks/useNotificaciones.ts
```

### Archivos a modificar

```
src/lib/store/notificaciones.store.ts
src/features/admin/shared/layout/AdminNavbar.tsx
src/features/cliente/shared/components/NotificacionesPanel.tsx

pems/src/main/java/.../application/evento/service/EventoPrivadoService.java
pems/src/main/java/.../application/venta/service/VentaService.java
pems/src/main/java/.../application/venta/service/ReservaPublicaService.java
pems/src/main/java/.../application/contrato/service/ContratoService.java
pems/src/main/java/.../application/cms/service/ClientePerfilService.java
pems/src/main/java/.../application/caja/service/CajaService.java
```

---

## Orden de ejecucion y dependencias

```
Fase 1 (SQL)
    dependencia de: nada — puede ejecutarse ya en Supabase

Fase 2 (Dominio)
    dependencia de: Fase 1 (los codigos de tipo deben existir en BD antes de los tests)
    prerequisito de: Fase 3, 4, 5

Fase 3 (Infraestructura)
    dependencia de: Fase 2
    prerequisito de: Fase 4

Fase 4 (Aplicacion)
    dependencia de: Fase 3
    prerequisito de: Fase 5, 6B

Fase 5 (REST)           -- paralelo con Fase 6
    dependencia de: Fase 4

Fase 6A (LimpiezaJob)   -- paralelo con Fase 5
    dependencia de: Fase 3

Fase 6B (Integracion servicios)
    dependencia de: Fase 4
    nota: EventoPrivadoService se modifica en esta fase, no antes

Fase 7 (Frontend)
    dependencia de: Fase 5 deployado o al menos el contrato del API definido
```
