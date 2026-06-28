# Reporte: Módulo de Configuración — Análisis de Inconsistencias y Mejoras

> Generado: 2026-06-27  
> Alcance: Frontend (`pems-web`), Backend (`pems`), Base de datos (migraciones legacy)

---

## 1. Mapa de módulos analizados

| Módulo                      | Ruta frontend                                 | Tabla BD                   | Endpoint                                          |
| --------------------------- | --------------------------------------------- | -------------------------- | ------------------------------------------------- |
| Configuración global        | `/admin/configuracion`                        | `configuracion_global`     | `PUT /api/v1/configuracion`                       |
| Configuración calendario    | `/admin/configuracion` + `CalendarioAcciones` | `configuracion_calendario` | `PUT /api/v1/calendario/configuracion/sedes/{id}` |
| Datos de sede               | `/admin/configuracion`                        | `sede`                     | `PUT /api/v1/sedes/{id}`                          |
| Configuración pública (CMS) | `/admin/cms/configuracion-publica`            | `configuracion_publica`    | `PUT /api/v1/cms/configuracion`                   |
| Sistema/Mantenimiento       | `/admin/configuracion` (SistemaCard)          | `configuracion_publica`    | `PUT /api/v1/cms/configuracion`                   |
| Fidelización                | Sin pantalla propia                           | `fidelizacion_config`      | `PUT /api/v1/fidelizacion/config/sedes/{id}`      |

---

## 2. Inconsistencias detectadas

### 2.1 ❌ CRÍTICO — SistemaCard en el módulo incorrecto

**Archivo:** [SistemaCard.tsx](../src/components/admin/configuracion/SistemaCard.tsx)

`SistemaCard` vive en `/admin/configuracion` pero:

- Llama a `useConfiguracionAdmin()` → `GET /cms/configuracion`
- Llama a `useActualizarConfiguracionPublica()` → `PUT /cms/configuracion`
- Modifica campos de la tabla `configuracion_publica` (`es_mantenimiento_activo`, `mensaje_mantenimiento`)

Es decir, **edita datos de CMS desde el módulo de configuración del sistema**. El módulo correcto es `/admin/cms/configuracion-publica`. El comment en esa página ya lo reconoce pero va en sentido contrario:

```ts
// Contacto, horarios y mantenimiento están en /admin/configuracion (Sede, Operación, Sistema)
```

**Impacto:** El admin tiene que ir a dos pantallas distintas para configurar el sitio web público. El modo mantenimiento no tiene relación lógica con seguridad, pagos o calendario.

---

### 2.2 ❌ CRÍTICO — Configuración de calendario duplicada en dos lugares

**Archivos afectados:**

- [configuracion/page.tsx](../src/app/admin/configuracion/page.tsx) — cards Operación, Reservas, Eventos
- [CalendarioAcciones.tsx](../src/features/admin/calendario/components/actions/CalendarioAcciones.tsx) — botón "Configurar calendario" → `ConfigurarCalendarioModal`

Ambos editan exactamente la misma entidad `configuracion_calendario` vía el mismo endpoint `PUT /api/v1/calendario/configuracion/sedes/{idSede}`. Un cambio hecho desde el módulo Calendario no se refleja visualmente en las cards de Configuración hasta que el usuario navega allí y viceversa (React Query invalida solo la caché del componente que hizo la mutación).

**Riesgo real:** Un admin edita el aforo desde Calendario, luego abre Configuración y ve el valor anterior porque la caché del módulo de configuración no fue invalidada.

---

### 2.3 ❌ CRÍTICO — Datos de contacto en tres lugares distintos

| Campo     | `sede`      | `configuracion_publica`          | `configuracion_global` |
| --------- | ----------- | -------------------------------- | ---------------------- |
| Teléfono  | `telefono`  | `telefono`, `telefonoSecundario` | —                      |
| WhatsApp  | —           | `whatsapp`                       | `WHATSAPP_NUMERO`      |
| Correo    | `correo`    | `correo`, `correoSecundario`     | —                      |
| Dirección | `direccion` | `direccion`                      | —                      |

El mismo dato puede estar en dos tablas sin que sea obvio cuál es la fuente de verdad:

- El sitio web público ¿muestra el teléfono de `sede` o el de `configuracion_publica`?
- `WHATSAPP_NUMERO` en `configuracion_global` y `whatsapp` en `configuracion_publica` son el mismo dato.

---

### 2.4 ❌ CRÍTICO — Tabla legacy `configuracion_sede` no migrada completamente

La migración `V3_sede_y_configuracion.sql` crea `configuracion_sede` con:

- `dias_operacion INT[]` (array de enteros)
- `porcentaje_adelanto_evento NUMERIC(5,2)` ← **campo que NO existe en `configuracion_calendario`**

La migración `V15_configuracion_calendario.sql` crea `configuracion_calendario` con:

- `dias_operacion VARCHAR(20)` ← tipo diferente (string CSV en lugar de array)
- Sin `porcentaje_adelanto_evento`

**Problemas derivados:**

1. Si hay código legacy que aún lee `configuracion_sede`, obtiene `dias_operacion` en formato INT[] que no es compatible con el nuevo VARCHAR.
2. `porcentaje_adelanto_evento` desapareció sin migración de datos — se perdió el dato.
3. `configuracion_sede` parece ser una tabla huérfana en la BD sin consumidores activos en el nuevo sistema.

---

### 2.5 ⚠️ MODERADO — Valores de negocio duplicados entre `application.yaml` y BD

`application.yaml` tiene hardcoded valores que también están en BD:

```yaml
negocio.aforo-maximo: 60 # duplicado: configuracion_calendario.aforo_maximo
negocio.dias-max-reserva-publica: 14 # duplicado: configuracion_calendario.dias_max_reserva_publica
negocio.visitas-para-entrada-gratis: 6 # duplicado: fidelizacion_config.umbral
```

Si el admin cambia el aforo a 80 desde la pantalla, pero el backend tiene un validador que lee el YAML, el límite real seguirá siendo 60. Hay que verificar qué fuente usa cada validador.

---

### 2.6 ⚠️ MODERADO — Colores en tres contextos sin distinción clara

| Campo                                                                | Contexto                                   | Dónde se edita              |
| -------------------------------------------------------------------- | ------------------------------------------ | --------------------------- |
| `color_primario` / `color_secundario`                                | Colores del **sitio web público**          | CMS → Configuración Pública |
| `colorPrimario` / `colorSecundario` / `colorSidebar` / `colorAcento` | Colores del **panel admin** (preferencias) | Preferencias de usuario     |

Son contextos completamente distintos pero visualmente similares en el UI. Un admin puede cambiar el color primario en CMS pensando que afecta al panel, o viceversa. No hay etiquetas que aclaren el alcance.

---

### 2.7 ⚠️ MODERADO — `ZONA_HORARIA` con fuente de verdad ambigua

- `configuracion_global` tiene `ZONA_HORARIA = 'America/Lima'` (configurable por admin)
- `preferencias_admin` tiene `zonaHoraria` con 7 opciones (por usuario)
- No está documentado cuál prevalece para operaciones del backend (fechas de reservas, timestamps)

Si el backend usa la del YAML o la de `configuracion_global`, pero el frontend muestra fechas con la zona del admin individual, pueden aparecer diferencias horarias.

---

### 2.8 ⚠️ MODERADO — Historial de assets en localStorage (no persistente)

**Archivo:** [configuracion-publica/page.tsx](../src/app/admin/cms/configuracion-publica/page.tsx) líneas 98-123

```ts
// TODO: reemplazar con endpoint backend GET /api/v1/assets/history para persistencia real
const HISTORY_KEY = 'pems_asset_history_v1'
```

El historial de logos y favicons subidos se guarda solo en el navegador local. Si el admin abre desde otro dispositivo o limpia el caché, pierde todo el historial. La URL del asset existe en Storage pero no hay forma de recuperarla.

---

### 2.9 ⚠️ MODERADO — Campos JSONB en BD no expuestos en frontend

La migración `V20__mejoras_sitio_publico.sql` agrega a `configuracion_publica`:

- `metricas_negocio JSONB`
- `reglas_local JSONB`

Estos campos **no aparecen en ningún formulario del frontend** ni en los types de `configuracion-publica.types.ts`. Existen en BD pero son inaccesibles desde el admin. Si contienen datos importantes (reglamento del local, métricas), el admin no tiene forma de verlos ni editarlos.

---

### 2.10 ⚠️ MODERADO — `ConfigController` con lista hardcodeada

```java
// GET /api/v1/config/medios-pago → retorna: EFECTIVO, YAPE, TRANSFERENCIA, TARJETA
```

Los medios de pago están hardcodeados en el controlador. Si el negocio deja de aceptar uno o agrega POS físico, hay que cambiar código. Los catálogos del frontend los listan como referencia pero tampoco son editables.

---

### 2.11 ℹ️ MENOR — Nomenclatura inconsistente entre capas

| Capa            | Campo                                    |
| --------------- | ---------------------------------------- |
| BD (snake_case) | `es_mantenimiento_activo`                |
| Java Entity     | `esMantenimientoActivo`                  |
| Frontend type   | `mantenimientoActivo` (sin prefijo `es`) |
| Zod schema      | `mantenimientoActivo`                    |

La entidad Java usa el prefijo `es` (booleano semántico correcto) pero el DTO/type del frontend lo omite. No causa bugs porque el mapeo JSON es por nombre del campo serializado, pero dificulta la trazabilidad cuando se busca el campo en el código.

---

### 2.12 ℹ️ MENOR — SUNAT_API_URL y SUNAT_API_TOKEN en tabla editable

Las credenciales de la API SUNAT están en `configuracion_global` con `es_secreto=TRUE`, pero la pantalla de Pagos solo muestra/edita `SUNAT_PROVEEDOR`. Las URLs y tokens no son editables desde el UI (correcto por seguridad), pero tampoco está documentado cómo se configuran en producción (¿directamente en BD? ¿variables de entorno?). Hay un campo `SUNAT_API_URL` en el YAML también — potencial duplicado.

---

## 3. Cosas que el admin NO debería configurar

El módulo mezcla configuración **operativa de negocio** (lo que el dueño del local debe poder cambiar) con configuración **técnica de sistema** (que solo debería tocar el equipo de desarrollo).

### 3.1 Catálogos del sistema → Eliminar del módulo de Configuración

`CatalogosTab` / `CatalogosCard` es de **solo lectura** — el admin no puede editar nada. Los catálogos son valores fijos del dominio (estados de reserva, tipos de evento, etc.). Mostrarlos en la pantalla de Configuración confunde: el admin ve 8 cards editables y 1 que solo se puede "ver". Si necesita consultar estos valores, el lugar correcto es documentación o una sección de ayuda, no configuración.

### 3.2 Meta tags SEO y Open Graph → Mover a CMS o eliminar

`metaTitle`, `metaDescription`, `metaKeywords`, `openGraphTitle`, `openGraphDescription`, `openGraphImageUrl` son datos que:

- El dueño de un local de juegos infantil probablemente no entiende ni mantiene.
- Se configuran una vez y raramente cambian.
- Su mantenimiento correcto requiere conocimiento de SEO.

Si el negocio tiene un equipo de marketing que los gestiona, pueden quedarse en CMS. Si no, se pueden preconfigurar con valores razonables y no exponerlos en el admin.

### 3.3 Google Analytics ID y Meta Pixel ID → Solo para integradores técnicos

Son IDs de tracking de terceros. El dueño del local no los conoce. Deberían configurarse durante el onboarding y no ser editables desde el panel diario del admin.

### 3.4 Keywords → Obsoleto

Los meta keywords (`metaKeywords`) fueron relevantes para SEO antes del año 2009. Google los ignora desde hace más de una década. El campo ocupa espacio en el formulario sin utilidad real.

### 3.5 ZONA_HORARIA en Configuración Global → No editable por admin operativo

Si el negocio solo opera en Perú (`America/Lima`), este campo no debería ser editable. Si en el futuro hubiera sedes en otras zonas horarias, sería un campo de sistema que configura DevOps, no el admin del local.

---

## 4. Sugerencias de mejoras de UI

### 4.1 Fusionar cards del calendario en una sola (ALTA PRIORIDAD)

Las cards **Horarios de operación**, **Reservas públicas** y **Eventos privados** editan la misma entidad `configuracion_calendario`. Cada una tiene 2-3 campos y ocupa una card entera. Propuesta:

```
┌─────────────────────────────────────────┐
│ 📅 Configuración operativa              │
│ Horarios, reservas y eventos del local  │
│                                         │
│  Apertura: 10:00  Cierre: 20:00        │
│  Aforo: 60        Reservas: 0-14 días  │
│                                         │
│  [Ver todo]  [Editar]                  │
│                                         │
│  Modal con tabs:                        │
│  ┌──────────┬──────────┬─────────────┐ │
│  │ Horarios │ Reservas │ Eventos     │ │
│  └──────────┴──────────┴─────────────┘ │
└─────────────────────────────────────────┘
```

Resultado: de 3 cards pequeñas → 1 card con modal de tabs. Libera 2 espacios en la grilla.

### 4.2 Fusionar Sede con la card de Horarios

Los datos de sede (nombre, dirección, teléfono, RUC) son el contexto del negocio. Juntar sede + operación en una misma card "Del negocio" tiene sentido porque son los datos que el admin consulta con más frecuencia.

### 4.3 Mover SistemaCard a CMS

El modo mantenimiento afecta al sitio web público → pertenece en CMS. En `/admin/cms/configuracion-publica` agregar una sección al final:

```
┌ Mantenimiento ──────────────────────────────┐
│  ○ Sitio activo  ●──  En mantenimiento      │
│  Mensaje: "Volvemos el lunes..."            │
└─────────────────────────────────────────────┘
```

### 4.4 Eliminar CatalogosCard de Configuración

Mover los catálogos a una sección de Ayuda/Referencia o a la documentación. El admin no puede editarlos, verlos en configuración genera confusión.

### 4.5 Resultado de la grilla después de los cambios

**Estado actual:** 8 cards en grilla 4 columnas  
**Propuesta:** 4 cards más densas y mejor organizadas

| Card propuesta          | Contenido consolidado                                                           | Antes   |
| ----------------------- | ------------------------------------------------------------------------------- | ------- |
| Del negocio & operación | Sede + Horarios + Turnos + Aforo + Reservas + Eventos                           | 4 cards |
| Seguridad de acceso     | Sin cambios                                                                     | 1 card  |
| Pagos y facturación     | Sin cambios                                                                     | 1 card  |
| Sistema avanzado        | Mantenimiento movido a CMS; esta card queda para futuras integraciones técnicas | —       |

### 4.6 Sugerencia para Configuración Pública (CMS)

Agregar una sección **Contacto** que consolide el teléfono, WhatsApp, correo y dirección (unificando los campos de `configuracion_publica` que actualmente no están en el formulario pero sí en la BD):

```
Negocio | Logos | Redes | Contacto | SEO | Visual | Mantenimiento
```

Los campos de contacto de `sede` y `configuracion_publica` deben sincronizarse o elegir una sola fuente de verdad.

### 4.7 Indicador de "configurado / sin configurar" en cards

Las cards actualmente solo muestran el valor actual. Añadir un badge visual:

```
┌──────────────────────────────────┐
│ 💳 Pagos y facturación   [✓ OK] │   ← verde si SUNAT_PROVEEDOR configurado
│ 🔒 Seguridad             [✓ OK] │   ← verde si tiene valores no default
│ 📊 Analytics             [⚠ Pendiente] │  ← si Google Analytics ID vacío
└──────────────────────────────────┘
```

---

## 5. Acciones recomendadas (prioridad)

### Alta prioridad (afectan consistencia de datos)

1. **Decidir fuente de verdad para contacto**: ¿`sede` o `configuracion_publica`? Eliminar duplicados o sincronizar automáticamente.
2. **Mover o eliminar SistemaCard**: Si el mantenimiento se gestiona desde CMS, eliminar la card de `/admin/configuracion` para evitar editar lo mismo desde dos lugares.
3. **Resolver duplicación del calendario**: Elegir un solo punto de entrada (o asegurarse de que ambos invaliden la misma cache de React Query con la misma `queryKey`).
4. **Verificar tabla `configuracion_sede`**: Si está huérfana, agregar migración de DROP o documentar quién la usa. Verificar la pérdida de `porcentaje_adelanto_evento`.

### Media prioridad (UX y organización)

5. **Fusionar cards de Operación + Reservas + Eventos** en una sola con tabs.
6. **Eliminar CatalogosCard** del módulo de configuración.
7. **Eliminar campo `metaKeywords`** (obsoleto en SEO moderno).
8. **Persistir historial de assets en backend** — eliminar el TODO pendiente de `localStorage`.

### Baja prioridad (deuda técnica menor)

9. **Unificar nomenclatura booleana**: decidir si usar prefijo `es` o no, y aplicarlo consistentemente en todos los DTOs.
10. **Documentar `metricas_negocio` y `reglas_local`** JSONB o crear formularios para editarlos si tienen datos relevantes.
11. **Centralizar medios de pago**: Mover la lista hardcodeada de `ConfigController` a la tabla de catálogos o a `configuracion_global`.
12. **Verificar duplicación SUNAT_API_URL** entre YAML y `configuracion_global`.

---

## 6. Resumen visual del estado actual vs propuesto

```
ACTUAL — /admin/configuracion (8 cards, 3 tablas BD distintas):

  [⏰ Horarios]  [📅 Reservas]  [📅 Eventos]  [🔒 Seguridad]
  [💳 Pagos]    [🏢 Sede]      [⚙ Sistema]   [📚 Catálogos]
      ↑               ↑              ↑
  configuracion_calendario  sede  configuracion_publica  ← 3 fuentes distintas

PROPUESTO — /admin/configuracion (4 cards, sin mezcla de contextos):

  [🏢 Negocio & Operación]   [🔒 Seguridad]
  [💳 Pagos y facturación]   [⚙ Sistema avanzado*]

  *Solo para integradores; puede estar oculto para admin básico

PROPUESTO — /admin/cms/configuracion-publica (secciones ampliadas):

  Negocio | Logos | Contacto | Redes | SEO | Visual | Mantenimiento
```

---

---

## 7. Análisis de lógica y reglas de negocio — ¿Está bien como está?

### 7.1 ¿La estructura actual es coherente con las reglas del negocio?

**Parcialmente no.** Hay tres problemas estructurales de fondo:

1. Los datos de la entidad `sede` (nombre, RUC, teléfono) son **datos operativos del negocio** pero también afectan comprobantes fiscales. El RUC en `sede` es el que va en cada boleta/factura. Si el admin cambia el nombre de la sede sin saber eso, los comprobantes generados posterior al cambio pueden llevar un nombre diferente al de los anteriores — inconsistencia contable.

2. La configuración del calendario (`configuracion_calendario`) mezcla **dos tipos de restricciones** que tienen naturaleza distinta:
   - **Restricciones operativas** (aforo, turnos, horarios) → el administrador del local las puede cambiar.
   - **Restricciones de validación de negocio** (edad mínima/máxima para eventos, días de anticipación mínima) → cambiar estos valores retroactivamente afecta reservas ya existentes que no se recalculan.

3. La configuración de seguridad (`INTENTOS_LOGIN_ANTES_BLOQUEO`, `EXPIRACION_SESION_ADMIN_MIN`) debería ser solo del **SUPERADMIN**, no del ADMIN. El seed otorga el permiso `configuracion.editar` al rol ADMIN sin distinción, lo que permite que cualquier administrador pueda bajar los intentos de login a 1 y auto-bloquearse a sí mismo.

---

### 7.2 Módulo muerto descubierto — El refactor está sin terminar

**Este es el hallazgo más crítico de todo el análisis.**

Existe un segundo módulo de configuración completamente refactorizado en:
[/features/admin/configuracion/](../src/features/admin/configuracion/)

Este módulo nuevo tiene:

- `ConfiguracionView.tsx` — vista principal mejorada (5 cards en lugar de 8)
- `SystemHealthPanel.tsx` — panel de alertas proactivas del sistema
- `SistemaSection.tsx` — consolida Mantenimiento + SUNAT en una sola card
- `ReservasEventosSection.tsx` — corrige el bug de `EDAD_MAX_NINO` (ver 7.3)
- Hooks propios con `CONFIGURACION_KEYS` estandarizados

**El problema: `ConfiguracionView` nunca se importa en ninguna página.**

```
grep "ConfiguracionView" → solo aparece en su propio archivo
```

La página real que sirve el admin en `/admin/configuracion` sigue siendo el módulo viejo:
[/app/admin/configuracion/page.tsx](../src/app/admin/configuracion/page.tsx)

El refactor fue escrito pero nunca conectado al router. El código nuevo es código muerto. El admin usa el módulo viejo con todos sus problemas.

---

### 7.3 🐛 BUG CONFIRMADO — EDAD_MAX_NINO no existe en la base de datos

**Archivo afectado:** [ReservasTab.tsx](../src/components/admin/configuracion/ReservasTab.tsx) (líneas 32–52)

El `ReservasTab` (módulo viejo, el que está activo) hace esto:

```ts
const EDAD_MAX_NINO_KEY = 'EDAD_MAX_NINO'
// Lee: sysConfig?.find(c => c.clave === EDAD_MAX_NINO_KEY)?.valor ?? '12'
// Guarda: actualizarSys.mutate({ [EDAD_MAX_NINO_KEY]: String(num) })
```

El seed `V99_seed.sql` inserta estas claves en `configuracion_global`:
`ZONA_HORARIA`, `INTENTOS_LOGIN_ANTES_BLOQUEO`, `DURACION_BLOQUEO_LOGIN_MIN`, `EXPIRACION_SESION_ADMIN_MIN`, `EXPIRACION_SESION_CLIENTE_MIN`, `SUNAT_PROVEEDOR`, `SUNAT_API_URL`, `SUNAT_API_TOKEN`, `DECOLECTA_API_URL`, `DECOLECTA_API_TOKEN`, `CACHE_DNI_DIAS`, `WHATSAPP_NUMERO`, `STORAGE_BUCKET_PUBLICO`, `STORAGE_BUCKET_PRIVADO`, `STORAGE_BUCKET_TEMPORAL`.

**`EDAD_MAX_NINO` no está en el seed.** Tampoco `EDAD_MIN_NINO`.

El servicio backend valida explícitamente:

```java
ConfiguracionGlobal config = configuracionRepository.findByClave(entry.getKey())
    .orElseThrow(() -> new ResourceNotFoundException("Configuracion", "clave", entry.getKey()));
```

**Resultado:** Cuando el admin intenta guardar la edad máxima desde la pantalla de Reservas, el backend responde HTTP 404, la mutación falla, aparece un toast de error, y el valor no se guarda. La pantalla muestra "12" (fallback hardcodeado) pero ese "12" nunca viene de la base de datos — viene del default del código.

El módulo nuevo `ReservasEventosSection.tsx` ya corrigió esto: usa `edadMinCumple`/`edadMaxCumple` de `configuracion_calendario`, que sí existen en BD. Pero ese módulo está muerto.

**Consecuencia adicional:** Existe una tercera ubicación para edad de cumpleaños: `ConfigurarCalendarioModal.tsx` en el módulo Calendario, que también edita `edadMinCumple`/`edadMaxCumple`. Es correcto, pero es otro punto de edición duplicado.

---

### 7.4 Bug silencioso — Validación cruzada ausente en ReservasTab

**Archivo afectado:** [ReservasTab.tsx](../src/components/admin/configuracion/ReservasTab.tsx)

El formulario de Reservas del módulo activo valida cada campo por separado pero **no valida que `diasMinReservaPublica < diasMaxReservaPublica`**.

El módulo nuevo `ReservasEventosSection.tsx` sí lo valida:

```ts
.refine(d => d.diasMinReservaPublica < d.diasMaxReservaPublica, ...)
```

Si el admin configura `diasMin = 7` y `diasMax = 7`, la ventana de reservas es cero — ningún cliente puede reservar nunca. El sistema acepta el guardado sin error, pero el sitio web público queda efectivamente bloqueado para nuevas reservas.

---

### 7.5 Bug silencioso — Turnos pueden solaparse sin validación

**Archivo afectado:** [OperacionTab.tsx](../src/components/admin/configuracion/OperacionTab.tsx)

El formulario permite configurar turnos sin verificar que no se superpongan:

- `turnoT1Fin` puede ser mayor que `turnoT2Inicio`
- No hay validación de que los turnos estén dentro del rango apertura-cierre

Ejemplo posible sin error: `T1: 10:00–18:00` y `T2: 14:00–20:00` → 4 horas de superposición. El sistema acepta esto y dos grupos de clientes podrían ser asignados al mismo slot.

---

## 8. Qué eliminar y qué NO eliminar

### 8.1 Seguro de eliminar (sin riesgo de error)

| Elemento                                           | Razón                                                                                  | Riesgo                                                                          |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `CatalogosCard` / `CatalogosTab`                   | Datos hardcodeados en el frontend, no vienen de BD, no tienen lógica                   | Ninguno                                                                         |
| `WHATSAPP_NUMERO` de `configuracion_global`        | Duplicado con `configuracion_publica.whatsapp`. Ningún código del backend nuevo lo lee | Bajo — verificar que ningún servicio de notificaciones lo lea                   |
| Módulo viejo en `/components/admin/configuracion/` | Una vez que se conecte el módulo nuevo `ConfiguracionView` al router                   | Solo después de conectar el nuevo                                               |
| `metaKeywords` del formulario CMS                  | Los motores de búsqueda lo ignoran desde 2009                                          | Ninguno en SEO; solo eliminar del form, mantener campo en BD por compatibilidad |

### 8.2 NO eliminar — Causa errores inmediatos en backend

| Elemento                                    | Consecuencia si se elimina                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `INTENTOS_LOGIN_ANTES_BLOQUEO`              | El servicio de autenticación no puede leer el límite → puede dejar de bloquear cuentas o crashear      |
| `DURACION_BLOQUEO_LOGIN_MIN`                | Sin duración de bloqueo definida, el comportamiento del login queda indefinido                         |
| `EXPIRACION_SESION_ADMIN_MIN`               | Las sesiones de admin nunca expiran (riesgo de seguridad) o el backend lanza NullPointerException      |
| `SUNAT_PROVEEDOR`                           | La emisión de comprobantes electrónicos no sabe qué proveedor usar → todas las facturas/boletas fallan |
| `SUNAT_API_URL` / `SUNAT_API_TOKEN`         | Sin endpoint ni token, SUNAT rechaza todas las llamadas                                                |
| `DECOLECTA_API_URL` / `DECOLECTA_API_TOKEN` | La búsqueda por DNI falla en toda el sistema                                                           |
| `STORAGE_BUCKET_PUBLICO/PRIVADO/TEMPORAL`   | La subida de imágenes (logos, galería, banners) falla con NullPointerException en el StorageService    |

### 8.3 NO eliminar — Causa errores en reglas de negocio

| Elemento                                   | Consecuencia si se elimina o pone en cero                                                                                                                                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aforoMaximo`                              | Sin límite, el sistema podría aceptar 1000 reservas para el mismo día                                                                                                                                                             |
| `horaApertura` / `horaCierre`              | El calendario público no puede calcular slots disponibles                                                                                                                                                                         |
| `rangoMaxBloqueo`                          | `CalendarioAcciones.tsx` usa este valor para validar bloqueos; sin él cae al default 90 días (puede ocultarse el problema)                                                                                                        |
| `edadMinCumple` / `edadMaxCumple`          | El wizard de celebraciones (`SolicitarEventoWizardView.tsx`) usa estos valores para validar la edad del cumpleañero. Si se borra la fila de `configuracion_calendario`, los formularios de nuevo evento aceptarían cualquier edad |
| `diasMaxReservaPublica`                    | Si se pone muy bajo (ej: 1), los clientes solo pueden reservar con 1 día de anticipación máximo                                                                                                                                   |
| `nombreNegocio` en `configuracion_publica` | El campo tiene `@NotNull` en BD; un PUT con campo vacío rechazado a nivel de validación Java                                                                                                                                      |
| `esMantenimientoActivo`                    | Si se borra la fila singleton de `configuracion_publica`, `ConfiguracionPublicaService.obtenerOAutocrear()` recrea el registro con `nombreNegocio="Mi Negocio"` y `colorTema="#000000"` — se pierden todos los datos de branding  |

### 8.4 Peligroso de modificar sin precaución (no eliminar, pero editar con cuidado)

| Acción del admin                                                                              | Escenario de error                                                                                                           |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Reducir `diasMinReservaPublica` a 0 durante temporada alta                                    | Los clientes pueden reservar para el mismo día, desbordando al staff si no hay flujo de aprobación manual                    |
| Aumentar `diasMaxReservaPublica` a más de 365                                                 | No es un error técnico, pero puede generar reservas muy lejanas que el negocio no puede garantizar (cambio de precios, etc.) |
| Cambiar `SUNAT_PROVEEDOR` durante el día cuando hay comprobantes en estado PENDIENTE          | Las facturas pendientes de envío pueden quedar en limbo si el nuevo proveedor tiene un formato diferente                     |
| Activar modo mantenimiento sin recordar desactivarlo                                          | El sitio público queda inaccesible indefinidamente. No hay temporizador automático de desactivación                          |
| Reducir `INTENTOS_LOGIN_ANTES_BLOQUEO` a 1                                                    | El propio admin que está configurando puede bloquearse en su siguiente intento fallido de login                              |
| Cambiar `horaApertura` a una hora posterior a la de inicio de reservas ya confirmadas del día | Las reservas del día ya confirmadas podrían quedar "fuera de horario" pero no se cancelan automáticamente                    |

---

## 9. Preguntas abiertas para el equipo

Estas preguntas surgieron del análisis y deben resolverse antes de hacer cambios:

1. **¿El módulo `/features/admin/configuracion/` con `ConfiguracionView` es el reemplazo intencional del módulo viejo?** ¿Se dejó sin conectar a propósito o es un trabajo en progreso abandonado? Si es el nuevo, solo falta importarlo en `page.tsx`.

2. **¿`EDAD_MAX_NINO` y `EDAD_MIN_NINO` se eliminaron intencionalmente del seed?** El módulo viejo (`ReservasTab`) los usa, el nuevo (`ReservasEventosSection`) no. Si se migraron a `edadMinCumple`/`edadMaxCumple` de `configuracion_calendario`, hay que eliminar el código que los referencia en el módulo viejo.

3. **¿Qué campo es la fuente de verdad para el teléfono/correo del negocio: `sede` o `configuracion_publica`?** El sitio web público y las notificaciones de email ¿leen de cuál tabla?

4. **¿`configuracion_sede` (la tabla del V3) sigue siendo leída por algún código?** Si es una tabla huérfana, hay que hacer DROP o documentarlo. Si sigue siendo leída, hay que migrar `porcentaje_adelanto_evento` al nuevo esquema.

5. **¿Los campos `metricas_negocio` y `reglas_local` (JSONB en `configuracion_publica`) se usan en el sitio web público?** Si contienen el reglamento del local y el negocio necesita actualizarlo, no hay forma de hacerlo desde el admin actual.

6. **¿El `SUNAT_API_URL` del YAML y el de `configuracion_global` se usan en la misma variable?** ¿Cuál tiene prioridad? ¿Hay lógica que lea primero la BD y luego el YAML como fallback, o viceversa?

7. **¿El permiso `configuracion.editar` debería separarse en `configuracion.operativa.editar` (para ADMIN) y `configuracion.sistema.editar` (solo SUPERADMIN)?** Actualmente el ADMIN puede cambiar claves de seguridad de acceso.

8. **¿Se debe mantener el historial de imágenes en localStorage o se prioriza el endpoint backend que está como TODO?** Si el negocio tiene más de un administrador que sube imágenes desde distintos dispositivos, el historial local no sirve.

---

_Fin del reporte. Actualizado: 2026-06-27. Archivos fuente analizados: 40+ archivos entre frontend, backend y migraciones SQL._
