# Plan de implementación — Auditoría del sistema

> Estado: **COMPLETADO — Todas las fases implementadas**
> Fecha: 2026-06-27

---

## Contexto y diagnóstico

El módulo de auditoría existe estructuralmente (tabla, entidad JPA, servicio, controller, frontend) pero está **completamente hueco**: `RegistrarLogUseCase` nunca se inyecta en ningún otro servicio. La tabla `auditoria_log` está vacía. Además hay varios bugs que impiden que funcione correctamente incluso si se integrara hoy.

### Bugs bloqueantes confirmados

| #   | Capa     | Problema                                                                                             | Impacto                                                             |
| --- | -------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| B1  | Backend  | `RegistrarLogUseCase.Command` no tiene `nivel` ni `resultado`                                        | Todos los logs se graban como INFO/EXITOSO siempre                  |
| B2  | Backend  | `AuditoriaPersistenceAdapter.toDomain()` llama `perfilUsuarioRepository.buscarPorId()` por cada fila | N+1: 20 queries extra por página                                    |
| B3  | Backend  | `LogAuditoriaJpaRepository` usa `LocalDateTime` pero la entidad tiene `OffsetDateTime`               | Riesgo de resultados incorrectos por zona horaria                   |
| B4  | Backend  | `AuditoriaController` inyecta `LogAuditoriaRepository` directamente                                  | Viola arquitectura hexagonal                                        |
| B5  | Backend  | No valida `desde <= hasta` ni pone cap a `tamano`                                                    | Permite rangos inválidos y queries sin límite                       |
| B6  | Frontend | `NivelAuditoria` define `'CRITICO'` pero BD envía `'CRITICAL'`                                       | NivelBadge siempre gris para nivel crítico                          |
| B7  | Frontend | `ResultadoAuditoria` define `'DENEGADO'` pero BD tiene `'PARCIAL'`                                   | Tipo incorrecto, aunque el fallback en UI lo disimula               |
| B8  | Frontend | `idUsuario?: number` en AuditoriaFiltros                                                             | Backend espera UUID string                                          |
| B9  | Frontend | Parámetro `tamaño` con ñ en useAuditoria                                                             | URL encoding inconsistente con el parámetro `tamano` del controller |

---

## Reglas del plan

- Nada de cambios en BD (la tabla ya existe y está bien estructurada)
- Respetar arquitectura hexagonal: los servicios inyectan el puerto `RegistrarLogUseCase`, no el repositorio directamente
- El registro de auditoría es siempre `@Async` — nunca bloquea la operación principal
- Si falla el registro de auditoría, la operación principal no debe fallar (try/catch en el servicio)
- Los valores `valorAnterior` y `valorNuevo` se serializan a JSON usando `ObjectMapper` en `AuditoriaService` (ya implementado)
- Frontend migrado a `features/admin/auditoria/` siguiendo la arquitectura del resto del proyecto
- Dark mode obligatorio en todos los componentes nuevos
- Uso de `useParams` para rutas dinámicas, TanStack Query para estado del servidor

---

## Constantes de dominio

### Módulos (valor exacto a usar en el campo `modulo` de cada log)

```
ACCESOS         → AuthService (login, logout, bloqueo)
USUARIOS        → StaffService
CONTRATOS       → ContratoService
VENTAS          → VentaService, VentaMostradorService
FACTURACION     → FacturacionService
CAJA            → CajaService
FINANZAS        → EgresoService, IngresoService
EVENTOS         → EventoPrivadoService
RESERVAS        → ReservaAdminService, ReservaPublicaService
PROMOCIONES     → PromocionService
CONFIGURACION   → ConfiguracionGlobalService, ConfiguracionPublicaService, SedeService
COMERCIAL       → PaqueteService, TipoEventoService, ActividadService, ZonaService
CMS             → BannerService
CALENDARIO      → ConfiguracionCalendarioService, TarifaService
MENSAJES        → MensajeContactoService
```

### Acciones estándar

```
CREAR       ACTUALIZAR      ELIMINAR
LOGIN       LOGOUT          LOGIN_FALLIDO       BLOQUEO_CUENTA
CONFIRMAR   CANCELAR        REPROGRAMAR         FIRMAR
ABRIR       CERRAR          ARQUEO
EMITIR      ANULAR
ACTIVAR     DESACTIVAR
RESPONDER   MARCAR_SPAM
```

### Niveles

```
INFO       → operación normal exitosa
WARNING    → operación completada con advertencias (ej: reprogramación en límite)
ERROR      → operación fallida (ej: login fallido)
CRITICAL   → operación de alto riesgo completada (ej: eliminar usuario, anular factura)
```

### Resultados

```
EXITOSO    → operación completada sin errores
FALLIDO    → operación no completada por error o validación
PARCIAL    → operación completada parcialmente (ej: envío de correo fallido post-venta)
```

---

## ✓ Fase 1 — Correcciones de base en backend

**Objetivo:** Que el motor de auditoría funcione correctamente antes de conectarlo a los módulos.

### 1A — Extender `RegistrarLogUseCase.Command`

**Archivo:** `application/auditoria/port/in/RegistrarLogUseCase.java`

Agregar campos al record:

```java
record Command(
    UUID   idUsuarioAdmin,
    String accion,
    String modulo,
    String entidadAfectada,
    Long   idEntidad,
    Object valorAnterior,
    Object valorNuevo,
    String descripcion,
    String ipOrigen,
    String userAgent,
    String nivel,       // nuevo — default "INFO"
    String resultado    // nuevo — default "EXITOSO"
) {
    public Command {
        if (nivel    == null) nivel    = "INFO";
        if (resultado== null) resultado= "EXITOSO";
    }
}
```

### 1B — Propagar `nivel` y `resultado` en `AuditoriaService`

**Archivo:** `application/auditoria/service/AuditoriaService.java`

Añadir al builder de `LogAuditoria`:

```java
.nivel(command.nivel())
.resultado(command.resultado())
```

### 1C — Crear `AuditoriaConstants`

**Archivo nuevo:** `application/auditoria/AuditoriaConstants.java`

Clase con constantes `static final String` para todos los módulos y acciones listados arriba. La usan todos los servicios que registran auditoría.

### 1D — Resolver N+1 en `AuditoriaPersistenceAdapter`

**Archivo:** `infrastructure/persistence/auditoria/adapter/AuditoriaPersistenceAdapter.java`

Reemplazar la llamada `perfilUsuarioRepository.buscarPorId()` por fila por un JOIN en la query JPQL:

```java
// En LogAuditoriaJpaRepository — nueva query con JOIN
@Query("""
    SELECT l, p.nombreCompleto
    FROM LogAuditoriaEntity l
    LEFT JOIN PerfilUsuarioEntity p ON p.id = l.usuarioId
    WHERE ...
""")
```

O alternativamente: agregar campo `nombreUsuario` a la entidad `auditoria_log` como columna virtual calculada por trigger en BD — pero dado que la BD ya está en producción, el JOIN en JPQL es el camino sin cambiar el schema.

### 1E — Corregir tipo de fecha en `LogAuditoriaJpaRepository`

**Archivo:** `infrastructure/persistence/auditoria/jpa/LogAuditoriaJpaRepository.java`

Cambiar todos los parámetros de `LocalDateTime` a `OffsetDateTime` en los métodos:

- `findByFechaLogBetweenOrderByFechaLogDesc`
- `findByFiltros`

Ajustar `AuditoriaPersistenceAdapter` para pasar `OffsetDateTime` correctamente desde el controller (que recibe `LocalDateTime` del request).

### 1F — Crear `ObtenerAuditoriaUseCase`

**Archivo nuevo:** `application/auditoria/port/in/ObtenerAuditoriaUseCase.java`

Puerto de lectura con los métodos actualmente en el repository llamados desde el controller:

```java
public interface ObtenerAuditoriaUseCase {
    PagedResult<LogAuditoria> listarPorFiltros(FiltrosQuery filtros);
    LogAuditoria obtenerPorId(Long id);
    PagedResult<LogAuditoria> listarPorUsuario(UUID idUsuario, int pagina, int tamano);

    record FiltrosQuery(
        OffsetDateTime desde, OffsetDateTime hasta,
        UUID idUsuario, String modulo, String accion,
        String nivel, String resultado,
        int pagina, int tamano
    ) {}
}
```

**Archivo nuevo:** `application/auditoria/service/ObtenerAuditoriaService.java` — implementa el puerto.

### 1G — Refactorizar `AuditoriaController`

**Archivo:** `interfaces/rest/auditoria/AuditoriaController.java`

- Eliminar inyección directa de `LogAuditoriaRepository`
- Inyectar `ObtenerAuditoriaUseCase`
- Agregar `@RequestParam(required = false) String nivel` y `String resultado` como filtros
- Validar `desde <= hasta` con 400 Bad Request si no se cumple
- Cap de `tamano` a máximo 100 (`Math.min(tamano, 100)`)
- Cambiar parámetro `desde`/`hasta` de `LocalDateTime` a `OffsetDateTime` con `ISO.DATE_TIME`

---

## ✓ Fase 2 — Integración en módulos CRÍTICOS (COMPLETADA)

**Objetivo:** Auditar las operaciones de mayor riesgo: accesos, usuarios, contratos, ventas, caja y facturación.

Patrón de integración en todos los servicios:

```java
@RequiredArgsConstructor
public class XxxService {
    // campos existentes...
    private final RegistrarLogUseCase auditoria;

    public Resultado ejecutarOperacion(Command cmd) {
        // lógica de negocio...
        Resultado resultado = ...;

        auditoria.ejecutar(new RegistrarLogUseCase.Command(
            cmd.getIdUsuario(),
            AuditoriaConstants.ACCION_CREAR,
            AuditoriaConstants.MODULO_XXX,
            "NombreEntidad",
            resultado.getId(),
            valorAnterior,   // null en CREAR, objeto previo en ACTUALIZAR
            resultado,       // objeto nuevo
            "Descripción legible",
            cmd.getIpOrigen(),
            cmd.getUserAgent(),
            "INFO",          // nivel según impacto
            "EXITOSO"
        ));

        return resultado;
    }
}
```

### 2A — `AuthService` (módulo: ACCESOS)

| Acción         | Nivel    | Resultado | Trigger                     |
| -------------- | -------- | --------- | --------------------------- |
| LOGIN          | INFO     | EXITOSO   | Login correcto              |
| LOGIN_FALLIDO  | WARNING  | FALLIDO   | Credenciales incorrectas    |
| BLOQUEO_CUENTA | CRITICAL | EXITOSO   | Al superar intentos máximos |
| LOGOUT         | INFO     | EXITOSO   | Cierre de sesión            |

valorAnterior/Nuevo: `{ email, intentosFallidos, bloqueadoHasta }` para bloqueos; null para login/logout.

### 2B — `StaffService` (módulo: USUARIOS)

| Acción     | Nivel    | valorAnterior   | valorNuevo                |
| ---------- | -------- | --------------- | ------------------------- |
| CREAR      | INFO     | null            | objeto Staff sin password |
| ACTUALIZAR | INFO     | estado previo   | estado nuevo              |
| ELIMINAR   | CRITICAL | objeto completo | null                      |

### 2C — `ContratoService` (módulo: CONTRATOS)

| Acción     | Nivel    |
| ---------- | -------- |
| CREAR      | INFO     |
| ACTUALIZAR | INFO     |
| FIRMAR     | CRITICAL |
| CANCELAR   | CRITICAL |

### 2D — `VentaService` + `VentaMostradorService` (módulo: VENTAS)

| Acción | Nivel    |
| ------ | -------- |
| CREAR  | INFO     |
| ANULAR | CRITICAL |

### 2E — `FacturacionService` (módulo: FACTURACION)

| Acción | Nivel    |
| ------ | -------- |
| EMITIR | INFO     |
| ANULAR | CRITICAL |

### 2F — `CajaService` (módulo: CAJA)

| Acción | Nivel |
| ------ | ----- |
| ABRIR  | INFO  |
| CERRAR | INFO  |
| ARQUEO | INFO  |

### 2G — `EgresoService` + `IngresoService` (módulo: FINANZAS)

| Acción   | Nivel    |
| -------- | -------- |
| CREAR    | INFO     |
| ELIMINAR | CRITICAL |

---

## ✓ Fase 3 — Integración en módulos ALTOS (negocio) (COMPLETADA)

### 3A — `EventoPrivadoService` (módulo: EVENTOS)

| Acción     | Nivel    |
| ---------- | -------- |
| CREAR      | INFO     |
| ACTUALIZAR | INFO     |
| CONFIRMAR  | INFO     |
| CANCELAR   | CRITICAL |

valorAnterior/Nuevo: snapshot del objeto con campos relevantes (fechaEvento, estado, montoPagado).

### 3B — `ReservaAdminService` (módulo: RESERVAS)

| Acción      | Nivel    |
| ----------- | -------- |
| CREAR       | INFO     |
| REPROGRAMAR | WARNING  |
| CANCELAR    | CRITICAL |

### 3C — `ReservaPublicaService` (módulo: RESERVAS)

| Acción      | Nivel   |
| ----------- | ------- |
| REPROGRAMAR | WARNING |

### 3D — `PromocionService` (módulo: PROMOCIONES)

| Acción     | Nivel    |
| ---------- | -------- |
| CREAR      | INFO     |
| ACTUALIZAR | INFO     |
| ELIMINAR   | CRITICAL |
| ACTIVAR    | INFO     |
| DESACTIVAR | INFO     |

### 3E — `ConfiguracionGlobalService` (módulo: CONFIGURACION)

| Acción     | Nivel   | valorAnterior             | valorNuevo             |
| ---------- | ------- | ------------------------- | ---------------------- |
| ACTUALIZAR | WARNING | mapa clave-valor anterior | mapa clave-valor nuevo |

### 3F — `ConfiguracionPublicaService` (módulo: CONFIGURACION)

| Acción     | Nivel   |
| ---------- | ------- |
| ACTUALIZAR | WARNING |

valorAnterior/Nuevo: snapshot sin campos de imágenes (solo texto y config crítica).

### 3G — `SedeService` (módulo: CONFIGURACION)

| Acción     | Nivel   |
| ---------- | ------- |
| ACTUALIZAR | WARNING |

---

## ✓ Fase 4 — Integración en módulos MEDIOS (catálogos y CMS) (COMPLETADA)

### 4A — `PaqueteService` + `TipoEventoService` + `ActividadService` + `ZonaService` (módulo: COMERCIAL)

Acciones: CREAR, ACTUALIZAR, ELIMINAR. Nivel INFO para crear/actualizar, CRITICAL para eliminar.

### 4B — `BannerService` (módulo: CMS)

| Acción     | Nivel    |
| ---------- | -------- |
| CREAR      | INFO     |
| ACTUALIZAR | INFO     |
| ELIMINAR   | CRITICAL |
| ACTIVAR    | INFO     |
| DESACTIVAR | INFO     |

### 4C — `ConfiguracionCalendarioService` + `TarifaService` (módulo: CALENDARIO)

| Acción     | Nivel   |
| ---------- | ------- |
| ACTUALIZAR | WARNING |

### 4D — `MensajeContactoService` (módulo: MENSAJES)

| Acción      | Nivel   |
| ----------- | ------- |
| RESPONDER   | INFO    |
| MARCAR_SPAM | WARNING |

---

## ✓ Fase 5 — Frontend: correcciones, migración y mejoras UX (COMPLETADA)

### 5A — Corregir bugs de tipos

**Archivo:** `src/types/auditoria.types.ts`

```ts
// Antes
type NivelAuditoria    = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICO'
type ResultadoAuditoria = 'EXITOSO' | 'FALLIDO' | 'DENEGADO'
idUsuario?: number

// Después
type NivelAuditoria    = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
type ResultadoAuditoria = 'EXITOSO' | 'FALLIDO' | 'PARCIAL'
idUsuario?: string  // UUID
```

**Archivo:** `src/hooks/useAuditoria.ts`

- `tamaño: 20` → `tamano: size` (variable)
- Añadir `nivel` y `resultado` a los parámetros del query

### 5B — Migración a `features/admin/auditoria/`

Estructura final:

```
features/admin/auditoria/
├── types/
│   └── index.ts                     ← tipos, constantes MODULOS, ACCIONES, NIVELES, RESULTADOS
├── hooks/
│   ├── useAuditoriaFiltros.ts       ← estado de filtros con useParams / searchParams
│   ├── useAuditoriaLista.ts         ← TanStack Query, paginación, tamaño configurable
│   └── useLogDetalle.ts             ← query por id
├── components/
│   ├── FiltrosPanel.tsx             ← filtros: fechas, módulo, acción, nivel, resultado, entidad
│   ├── FiltrosAvanzados.tsx         ← colapsable: idUsuario, userAgent, IP
│   ├── AuditoriaTable.tsx           ← tabla con columnas, badges, acciones
│   ├── LogDetalleModal.tsx          ← modal detalle con diff visual y botón "Ver cambio"
│   ├── AccionBadge.tsx              ← dark mode
│   ├── NivelBadge.tsx               ← dark mode, CRITICAL corregido
│   └── ResultadoBadge.tsx           ← extraído del inline actual, dark mode
└── views/
    └── AuditoriaView.tsx            ← componente orquestador
```

**Archivos a eliminar:** `src/components/admin/auditoria/` (4 archivos), `src/hooks/useAuditoria.ts`

### 5C — Nuevos filtros

Añadir a `FiltrosPanel`:

- Select `nivel`: Todos / INFO / WARNING / ERROR / CRITICAL
- Select `resultado`: Todos / EXITOSO / FALLIDO / PARCIAL
- Select `módulo`: lista de los 15 módulos definidos en constantes (no hardcoded libre)
- Select `acción`: lista de las acciones estándar
- Input `entidad`: texto libre
- Los filtros se aplican automáticamente con 400ms debounce (eliminar botón "Consultar")

Añadir a `FiltrosAvanzados` (colapsable):

- Input UUID `idUsuario`
- Select tamaño de página: 10 / 20 / 50

### 5D — Dark mode en todos los componentes

Todos los `bg-white` → `bg-card`, `border-gray-100` → `border-border`, `bg-gray-50` → `bg-muted/40`, `text-gray-500` → `text-muted-foreground`.

Badges en `NivelBadge` con variantes `dark:`:

```ts
CRITICAL: 'bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300 font-semibold'
ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
WARNING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
INFO: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
```

### 5E — Botón "Ver cambio" en `LogDetalleModal`

Resolver ruta por `modulo` + `entidadAfectada` + `idEntidad`:

```ts
function resolverRuta(
  modulo: string,
  entidad: string,
  idEntidad?: number
): string | null {
  const rutas: Record<string, string> = {
    EVENTOS: `/admin/eventos/${idEntidad}`,
    RESERVAS: `/admin/eventos/reservas/${idEntidad}`,
    CONTRATOS: `/admin/eventos/${idEntidad}`, // tab contratos
    VENTAS: `/admin/ventas/${idEntidad}`,
    USUARIOS: `/admin/usuarios`,
    ACCESOS: null, // no navegable
    CAJA: `/admin/finanzas/caja`,
    FINANZAS: `/admin/finanzas`,
    CONFIGURACION: `/admin/configuracion`,
    CMS: `/admin/cms`,
    COMERCIAL: `/admin/comercial`,
    PROMOCIONES: `/admin/promociones`,
    CALENDARIO: `/admin/configuracion/calendario`,
  }
  return idEntidad ? (rutas[modulo] ?? null) : null
}
```

Botón con `router.push(ruta)` que cierra el modal y navega. Solo visible cuando `ruta !== null`.

### 5F — Page.tsx como server component con Suspense

**Archivo:** `src/app/admin/auditoria/page.tsx`

```tsx
// server component (sin 'use client')
import { Suspense } from 'react'
import { AuditoriaView } from '@/features/admin/auditoria/views/AuditoriaView'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AuditoriaPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AuditoriaView />
    </Suspense>
  )
}
```

---

## Orden de ejecución

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
```

Las fases 1 y 5A pueden ejecutarse en paralelo (una es backend, la otra es frontend puro de corrección de tipos).
Las fases 2, 3 y 4 son secuenciales entre sí solo en términos de prioridad, no de dependencia técnica.
La fase 5 completa (B-F) requiere que al menos la Fase 1 esté terminada para poder probar con datos reales.

## Resumen de archivos afectados

### Archivos nuevos — Backend

- `application/auditoria/AuditoriaConstants.java`
- `application/auditoria/port/in/ObtenerAuditoriaUseCase.java`
- `application/auditoria/service/ObtenerAuditoriaService.java`

### Archivos modificados — Backend

- `application/auditoria/port/in/RegistrarLogUseCase.java` — añadir nivel/resultado al Command
- `application/auditoria/service/AuditoriaService.java` — propagar nivel/resultado
- `infrastructure/persistence/auditoria/jpa/LogAuditoriaJpaRepository.java` — OffsetDateTime + JOIN + filtros nivel/resultado
- `infrastructure/persistence/auditoria/adapter/AuditoriaPersistenceAdapter.java` — resolver N+1
- `interfaces/rest/auditoria/AuditoriaController.java` — usar ObtenerAuditoriaUseCase, validaciones, filtros nivel/resultado
- 22 servicios de aplicación (fases 2, 3 y 4)

### Archivos nuevos — Frontend

- `features/admin/auditoria/` — 11 archivos (types, hooks, components, views)

### Archivos eliminados — Frontend

- `components/admin/auditoria/` (4 archivos)
- `hooks/useAuditoria.ts`

### Archivos modificados — Frontend

- `types/auditoria.types.ts` — enums corregidos
- `app/admin/auditoria/page.tsx` — server component + Suspense
