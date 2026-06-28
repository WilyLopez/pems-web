# Plan de refactorización — Módulo de Configuración

> Estado: **✓ COMPLETADO — Fase 6 completada**  
> Fecha: 2026-06-27  
> Referencia: [reporte-modulo-configuracion.md](./reporte-modulo-configuracion.md)

---

## Resumen de problemas que resuelve este plan

| #              | Problema                                                        | Fase que lo resuelve |
| -------------- | --------------------------------------------------------------- | -------------------- |
| Bug activo     | `EDAD_MAX_NINO` no existe en BD, guarda con error 404           | 1                    |
| Bug activo     | `AuthService` lee seguridad del YAML, no de BD — UI miente      | 2                    |
| Bug activo     | `ReservaPublicaPersistenceAdapter` lee aforo del YAML, no de BD | 2                    |
| Bug silencioso | Turnos pueden solaparse sin validación                          | 1                    |
| Bug silencioso | `diasMin >= diasMax` pasa sin error                             | 1                    |
| Deuda          | `ConfiguracionView` escrito pero nunca conectado al router      | 1                    |
| Deuda          | 8 cards antiguas en módulo muerto                               | 1                    |
| Deuda          | Routing con query params en lugar de `useParams`                | 3                    |
| Deuda          | Valores de negocio hardcodeados en YAML                         | 2                    |
| Deuda          | Contacto del negocio en tres tablas distintas                   | 5                    |
| Deuda          | Email de admin hardcodeado en YAML                              | 6                    |
| Deuda          | Dark mode no soportado en ningún componente de configuración    | 4                    |
| Diseño         | Tabla `configuracion_sede` huérfana (legacy V3)                 | 6                    |

---

## Reglas que aplican a todo el plan

- Cambios en BD: script SQL colocado en `pems/src/main/resources/db/migration_legacy/` para ejecución manual en Supabase
- Sin comentarios en código
- Sin valores hardcodeados en YAML ni en frontend (datos de negocio siempre desde BD)
- Zona horaria fija `America/Lima` permanece como constante técnica de infraestructura (no es dato de negocio configurable)
- Sin acoplamiento entre capas; arquitectura hexagonal en backend
- Componentes grandes descompuestos en sub-componentes por responsabilidad
- `useParams` obligatorio para secciones con URL propia
- Soporte dark/light mode en todos los componentes nuevos o modificados
- Sin modificar módulos fuera del scope de cada fase

---

## Fase 1 — Activar módulo refactorizado y corregir bugs críticos ✓ COMPLETADA

**Sin cambios de BD. Solo frontend.**

### Problema

El módulo activo en `/admin/configuracion` es el viejo (`/components/admin/configuracion/`). El refactor completo existe en `/features/admin/configuracion/` pero nunca se conectó al router. El módulo viejo tiene el bug de `EDAD_MAX_NINO`, sin validación cruzada de turnos, y 8 cards.

### Alcance backend

Ninguno.

### Alcance frontend

**Modificar:**

| Archivo                                                                 | Cambio                                                                                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `app/admin/configuracion/page.tsx`                                      | Reemplazar todo el contenido por `<ConfiguracionView />` importado desde `features/admin/configuracion`                         |
| `features/admin/configuracion/components/sections/OperacionSection.tsx` | Agregar refines al schema Zod: `T1.fin <= T2.inicio`, `T1.inicio >= horaApertura`, `T2.fin <= horaCierre`, `T2.inicio > T1.fin` |

**Eliminar (módulo viejo — ya no tiene referencias después del cambio en page.tsx):**

```
src/components/admin/configuracion/OperacionTab.tsx
src/components/admin/configuracion/ReservasTab.tsx
src/components/admin/configuracion/EventosTab.tsx
src/components/admin/configuracion/SeguridadTab.tsx
src/components/admin/configuracion/PagosTab.tsx
src/components/admin/configuracion/SedeTab.tsx
src/components/admin/configuracion/SistemaCard.tsx
src/components/admin/configuracion/CatalogosTab.tsx
```

### Resultado

- El admin ve 5 cards en lugar de 8
- `SystemHealthPanel` con alertas proactivas
- La configuración de edad usa `edadMinCumple`/`edadMaxCumple` de `configuracion_calendario` (correcto)
- Los turnos se validan sin solapamiento
- `diasMin < diasMax` validado (ya está en `ReservasEventosSection`)
- `CatalogosCard` eliminada

### No se toca

CMS, Calendario, POS, ni ningún otro módulo.

---

## Fase 2 — Desacoplar backend del YAML (datos de negocio a BD) ✓ COMPLETADA

**Cambios en backend. Posible script de verificación de BD.**

### Problema

`AuthService` lee `INTENTOS_LOGIN_ANTES_BLOQUEO` y `DURACION_BLOQUEO_LOGIN_MIN` del YAML via `@Value`. El admin edita esos valores en la pantalla de Seguridad, se guardan en `configuracion_global`, pero el sistema sigue usando los del YAML. La pantalla de Seguridad no tiene efecto real.

Lo mismo ocurre con `aforo-maximo`: el admin lo configura en Horarios de Operación (`configuracion_calendario`), pero `ReservaPublicaPersistenceAdapter` lee el aforo del YAML para validar capacidad.

### BD (script legacy — ejecución manual en Supabase)

Verificar que existen en `configuracion_global` (el seed V99 ya los incluye, pero confirmar):

```
Nombre archivo: V_verificacion_claves_seguridad.sql
Contenido: SELECT clave FROM configuracion_global
           WHERE clave IN (
             'INTENTOS_LOGIN_ANTES_BLOQUEO',
             'DURACION_BLOQUEO_LOGIN_MIN',
             'EXPIRACION_SESION_ADMIN_MIN',
             'EXPIRACION_SESION_CLIENTE_MIN'
           );
```

Si faltan, el script las inserta. No se modifican las que ya existen.

Agregar clave faltante para reprogramaciones (actualmente solo en YAML):

```sql
INSERT INTO configuracion_global (clave, valor, tipo_dato, descripcion, es_secreto)
VALUES ('MAX_REPROGRAMACIONES', '1', 'NUMERO',
        'Máximo de veces que una reserva puede reprogramarse', FALSE)
ON CONFLICT (clave) DO NOTHING;
```

### Alcance backend

**Modificar:**

| Archivo                                                                           | Cambio                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `application/usuario/service/AuthService.java`                                    | Inyectar `ConfiguracionGlobalRepository` vía puerto de salida; leer `INTENTOS_LOGIN_ANTES_BLOQUEO` y `DURACION_BLOQUEO_LOGIN_MIN` de BD en tiempo de ejecución, con fallback defensivo a 5 y 15 si la clave no existe                                                    |
| `infrastructure/persistence/evento/adapter/ReservaPublicaPersistenceAdapter.java` | Inyectar `ConfiguracionCalendarioRepository`; leer `aforo_maximo` de `configuracion_calendario` en tiempo de ejecución                                                                                                                                                   |
| `application/evento/service/ReservaPublicaService.java`                           | Inyectar puerto de lectura de `configuracion_global` para `MAX_REPROGRAMACIONES` en lugar de `@Value`                                                                                                                                                                    |
| `application.yaml`                                                                | Eliminar sección completa `playzone.negocio` (aforo-maximo, anticipacion-min-horas, anticipacion-min-evento-dias, dias-max-reserva-publica, visitas-para-entrada-gratis, max-reprogramaciones) y sección `playzone.seguridad` (max-intentos-login, duracion-bloqueo-min) |
| `application-dev.yml`                                                             | Eliminar `playzone.zona-horaria`                                                                                                                                                                                                                                         |

**No modificar:** Las claves en la BD ni los formularios del frontend — ya están correctos. Solo el backend deja de ignorar lo que el admin guarda.

### Resultado

- La pantalla de Seguridad tiene efecto real en el sistema
- El aforo configurado en Horarios de Operación controla realmente la disponibilidad
- El YAML queda solo con configuración técnica de infraestructura (SMTP, SUNAT, Storage, CORS)

### No se toca

Frontend, CMS, ni módulos fuera de los archivos listados.

---

## Fase 3 — Routing dinámico con useParams ✓ COMPLETADA

**Solo frontend. Sin cambios de BD ni backend.**

### Problema

`useConfiguracionNav` ya usa `useSearchParams` para `?s=operacion&m=edit`. La sección debería ser un segmento de ruta (`useParams`) para que las URLs sean navegables, la historia del browser funcione correctamente y los breadcrumbs sean semánticos.

Mismo problema en CMS configuracion-publica: la sección activa es estado local (`useState`), no URL.

### Alcance frontend

**Crear:**

| Archivo                                                  | Contenido                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `app/admin/configuracion/[seccion]/page.tsx`             | Renderiza `ConfiguracionView`; `seccion` viene de `useParams`                               |
| `app/admin/cms/configuracion-publica/[seccion]/page.tsx` | Renderiza `ConfiguracionPublicaView` (componente a extraer); `seccion` viene de `useParams` |

**Modificar:**

| Archivo                                                               | Cambio                                                                                                                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/admin/configuracion/hooks/useConfiguracionNav.ts`           | Reemplazar `searchParams.get('s')` por `useParams<{ seccion: SeccionConfig }>()` para la sección; conservar `searchParams` solo para `m` (estado del modal, que es transitorio) |
| `features/admin/configuracion/components/views/ConfiguracionView.tsx` | Recibir `seccion` desde hook en lugar de query param; ajustar breadcrumbs                                                                                                       |
| `app/admin/cms/configuracion-publica/page.tsx`                        | Extraer lógica a `ConfiguracionPublicaView` en `features/admin/cms/configuracion-publica/`; el `page.tsx` solo monta el componente                                              |

**Extraer (descomposición):**

`ConfiguracionPublicaView` — actualmente todo está en el `page.tsx` de CMS (648 líneas). Descomponer en:

```
features/admin/cms/configuracion-publica/
  components/
    sections/
      NegocioSection.tsx         (ya existe inline, extraer)
      LogosSection.tsx           (ya existe inline, extraer)
      RedesSection.tsx           (ya existe inline, extraer)
      SeoSection.tsx             (ya existe inline, extraer)
      VisualSection.tsx          (ya existe inline, extraer)
    shared/
      ImageUploadField.tsx       (ya existe inline, extraer)
      SectionTitle.tsx           (ya existe inline, extraer)
      FormField.tsx              (ya existe inline, extraer)
  hooks/
    useConfiguracionPublicaForm.ts   (lógica de reset/submit)
  views/
    ConfiguracionPublicaView.tsx
```

### URLs resultantes

```
/admin/configuracion                    → grid de 5 cards
/admin/configuracion/operacion          → card operacion abierta
/admin/configuracion/reservas-eventos   → card reservas/eventos abierta
/admin/configuracion/sede               → card sede abierta
/admin/configuracion/seguridad          → card seguridad abierta
/admin/configuracion/sistema            → card sistema abierta

/admin/cms/configuracion-publica                → sección negocio (default)
/admin/cms/configuracion-publica/negocio
/admin/cms/configuracion-publica/logos
/admin/cms/configuracion-publica/redes
/admin/cms/configuracion-publica/seo
/admin/cms/configuracion-publica/visual
```

### Resultado

- URLs compartibles y con historia del browser
- Back button funciona correctamente entre secciones
- Breadcrumbs reflejan la URL real

---

## Fase 4 — Dark mode en módulos de configuración ✓ COMPLETADA

**Solo frontend. Sin cambios de BD ni backend.**

### Problema

Todos los componentes de configuración usan colores hardcodeados Tailwind (`bg-white`, `text-gray-900`, `border-gray-100`, `bg-blue-50`, etc.) que no responden al tema oscuro. El sistema tiene soporte de tema (vía `useThemeConfig`) pero los componentes de configuración no lo aprovechan.

### Regla de conversión

| Clase hardcodeada                            | Reemplazar por                                                 |
| -------------------------------------------- | -------------------------------------------------------------- |
| `bg-white`                                   | `bg-card`                                                      |
| `text-gray-900`                              | `text-card-foreground`                                         |
| `text-gray-500`, `text-gray-600`             | `text-muted-foreground`                                        |
| `border-gray-100`, `border-gray-200`         | `border-border`                                                |
| `bg-gray-50`, `bg-gray-50/50`                | `bg-muted/40`                                                  |
| `bg-gray-100`                                | `bg-muted`                                                     |
| `text-gray-800`                              | `text-foreground`                                              |
| `bg-blue-50 text-blue-600` (iconos de color) | conservar — son colores semánticos de acento, no de superficie |
| `bg-amber-50 border-amber-200` (alertas)     | conservar — son colores semánticos de estado                   |

### Alcance frontend

**Modificar (todos los archivos de):**

```
features/admin/configuracion/
  components/sections/OperacionSection.tsx
  components/sections/ReservasEventosSection.tsx
  components/sections/SedeSection.tsx
  components/sections/SeguridadSection.tsx
  components/sections/SistemaSection.tsx
  components/shared/ModuleCard.tsx
  components/shared/ReadOnlyList.tsx
  components/shared/SystemHealthPanel.tsx
  components/views/ConfiguracionView.tsx

features/admin/cms/configuracion-publica/   (componentes extraídos en Fase 3)
  components/sections/*.tsx
  components/shared/*.tsx
  views/ConfiguracionPublicaView.tsx
```

### No se toca

Colores de estado (amber, red, green, blue) en indicadores y badges — son semánticos y correctos en ambos temas.

---

## Fase 5 — Fuente de verdad única para datos de contacto ✓ COMPLETADA

**Cambios en BD, backend y frontend.**

### Problema

Teléfono, correo y dirección del negocio existen en `sede`, en `configuracion_publica` y WhatsApp también en `configuracion_global`. Ningún código del sistema tiene claro cuál es la fuente autoritativa para emails transaccionales ni para el sitio web.

### Decisión de diseño

`configuracion_publica` es la fuente de verdad para todos los datos de contacto que se muestran al público. `sede` conserva solo datos registrales/legales y geográficos: `nombre`, `ruc`, `ciudad`, `departamento`, `latitud`, `longitud`.

### BD (script legacy — ejecución manual en Supabase)

```
Nombre archivo: V_contacto_fuente_unica.sql
```

1. Migrar datos actuales de `sede` → `configuracion_publica` si el campo de destino está vacío
2. Eliminar columnas `telefono`, `correo`, `direccion` de la tabla `sede`
3. Eliminar fila `WHATSAPP_NUMERO` de `configuracion_global`

El script debe ser idempotente (ON CONFLICT DO NOTHING / IF EXISTS).

### Alcance backend

**Modificar:**

| Archivo                                                   | Cambio                                                                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `domain/sede/model/Sede.java`                             | Eliminar campos `telefono`, `correo`, `direccion`                                                                          |
| `infrastructure/persistence/sede/entity/SedeEntity.java`  | Eliminar columnas correspondientes                                                                                         |
| `interfaces/rest/sede/request/ActualizarSedeRequest.java` | Eliminar campos `telefono`, `correo`, `direccion`                                                                          |
| `interfaces/rest/sede/response/SedeResponse.java`         | Eliminar campos correspondientes                                                                                           |
| `interfaces/rest/cms/ConfiguracionPublicaController.java` | Verificar que `ActualizarConfiguracionRequest` ya incluye telefono, whatsapp, correo, direccion (actualmente sí los tiene) |

**Verificar (no modificar si ya es correcto):**

El `ConfiguracionGlobalService` no debe tener lógica especial para `WHATSAPP_NUMERO` una vez que la fila se elimina de BD — la clave simplemente dejará de existir y no se devuelve en el listado. Confirmar que ningún código tiene un `findByClave("WHATSAPP_NUMERO")` con lógica de negocio sobre el resultado.

### Alcance frontend

**Modificar:**

| Archivo                                                            | Cambio                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `features/admin/configuracion/components/sections/SedeSection.tsx` | Eliminar campos `telefono`, `correo`, `direccion` del formulario y vista |
| `features/admin/configuracion/types/index.ts`                      | Eliminar `telefono`, `correo`, `direccion` del tipo `Sede`               |

**Crear:**

`features/admin/cms/configuracion-publica/components/sections/ContactoSection.tsx`

Campos: `telefono`, `telefonoSecundario`, `whatsapp`, `correo`, `correoSecundario`, `direccion`, `googleMapsUrl`, `horarioSemana`, `horarioFinSemana`

Esta sección se agrega a la navegación de `ConfiguracionPublicaView` entre Redes y SEO.

### Resultado

- Un solo lugar para editar el contacto del negocio
- El sitio web público y los emails leen de `configuracion_publica`
- `SedeSection` queda limpia con solo datos registrales

---

## ✓ Fase 6 — Eliminar email hardcodeado y tabla huérfana

**Cambios en BD, backend.**

### Problema

`CorreoAdapter` y `MensajeContactoService` leen el correo del admin y el nombre del negocio del YAML:

- `playzone.negocio.correo-admin: admin@kikiylala.com`
- `playzone.correo.nombre-remitente: ${MAIL_SENDER_NAME:Kiki y Lala}`

Esos valores deben venir de `configuracion_publica.correo` y `configuracion_publica.nombreNegocio`.

La tabla `configuracion_sede` (V3) existe en BD pero no tiene lectores activos en el backend nuevo. Es un riesgo de confusión a futuro.

### BD (script legacy — ejecución manual en Supabase)

```
Nombre archivo: V_drop_configuracion_sede.sql
```

```sql
DROP TABLE IF EXISTS public.configuracion_sede;
```

Antes de ejecutar: verificar con `SELECT COUNT(*) FROM configuracion_sede` que no hay datos que preservar.

### Alcance backend

**Modificar:**

| Archivo                                               | Cambio                                                                                                                                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `infrastructure/external/correo/CorreoAdapter.java`   | Inyectar `ConfiguracionPublicaRepository` vía puerto de salida; leer `nombreNegocio` y `correo` de `configuracion_publica` en tiempo de ejecución en lugar de `@Value` |
| `application/cms/service/MensajeContactoService.java` | Mismo cambio: leer correo destino de `configuracion_publica.correo`                                                                                                    |
| `application.yaml`                                    | Eliminar `playzone.negocio.correo-admin` y `playzone.correo.nombre-remitente`                                                                                          |

**No crear** una nueva dependencia directa desde infraestructura al repositorio CMS — usar el puerto existente `GestionarConfiguracionPublicaUseCase.obtener()` para no romper la arquitectura hexagonal.

### Alcance frontend

Ninguno.

### Resultado

- El nombre del negocio y el correo en los emails refleja lo que el admin configuró en CMS
- La tabla huérfana `configuracion_sede` ya no existe

---

## Orden de ejecución sugerido

```
Fase 1  →  Fase 2  →  Fase 3  →  Fase 4  →  Fase 5  →  Fase 6
```

Fases 1 y 2 son independientes entre sí en código (una es frontend, la otra es backend) y pueden ejecutarse en paralelo si hay dos personas trabajando. Las demás son secuenciales porque Fase 3 depende de Fase 1 (necesita que `ConfiguracionView` esté activo), y Fase 5 depende de que la arquitectura esté estable.

---

## Scripts de BD a crear (resumen)

| Fase | Nombre del archivo                    | Tipo                                      |
| ---- | ------------------------------------- | ----------------------------------------- |
| 2    | `V_verificacion_claves_seguridad.sql` | INSERT ON CONFLICT DO NOTHING             |
| 5    | `V_contacto_fuente_unica.sql`         | UPDATE + ALTER TABLE DROP COLUMN + DELETE |
| 6    | `V_drop_configuracion_sede.sql`       | DROP TABLE IF EXISTS                      |

Todos van en: `pems/src/main/resources/db/migration_legacy/`

---

## Archivos a eliminar (resumen)

```
pems-web/src/components/admin/configuracion/CatalogosTab.tsx
pems-web/src/components/admin/configuracion/EventosTab.tsx
pems-web/src/components/admin/configuracion/OperacionTab.tsx
pems-web/src/components/admin/configuracion/PagosTab.tsx
pems-web/src/components/admin/configuracion/ReservasTab.tsx
pems-web/src/components/admin/configuracion/SeguridadTab.tsx
pems-web/src/components/admin/configuracion/SedeTab.tsx
pems-web/src/components/admin/configuracion/SistemaCard.tsx
```

---

_Esperando aprobación para iniciar implementación._
