# Reporte Integral: Módulo de Eventos Privados

**Fecha:** 2026-06-23
**Sistema:** PEMS — Gestión de Eventos Infantiles (PlayZone)
**Alcance:** Formulario de creación, detalle de evento, panel cliente, tablas DB no aprovechadas, módulo de rentabilidad

---

## 1. CORRECCIONES EN `NuevoEventoForm`

### 1.1 Búsqueda de cliente → opción de crear nuevo

**Problema actual:** Si el cliente no existe en el sistema, el formulario no da salida. El admin queda bloqueado.

**Solución:** Al no encontrar resultados en la búsqueda (búsqueda con ≥ 2 caracteres sin resultados), mostrar un botón "Crear cliente" que abra `NuevoClienteModal`:

```
src/features/admin/clientes/components/forms/NuevoClienteModal.tsx
```

`NuevoClienteModal` ya recibe `{ open, onOpenChange }` y maneja el submit internamente con `useMutacionesCliente`. Lo que falta es:
- Pasar un callback `onSuccess: (cliente: Cliente) => void` para que al crear el cliente nuevo, se auto-seleccione en el formulario de evento.

**Pendiente backend:** `NuevoClienteModal` llama a `clientesApi.registrarAdmin()` → `/clientes/admin`. Este endpoint ya existe.

---

### 1.2 Tipo de evento → selector desde BD (no input libre)

**Problema actual:** `tipoEvento` es un campo de texto libre (`Input`). La BD tiene la tabla `tipo_evento` con una FK obligatoria (`tipo_evento_codigo NOT NULL`) en la tabla `evento`.

**Solución:** Usar `useTiposEventoPublico()` de:
```
src/features/admin/comercial/tipos-evento/hooks/useTiposEvento.ts
```

Cambiar el campo a un `Select` que muestre los tipos activos. El payload debe enviar el `codigo` del tipo (string), no el nombre.

**Implicación backend:** El endpoint `POST /eventos-privados/clientes/:id/sedes/:id` actualmente recibe `tipoEvento: string`. Si el backend lo interpreta como texto libre, hay que alinearlo para que acepte el `codigo` de `tipo_evento` y haga la FK correcta. Si ya lo maneja como código, solo ajustar el formulario.

---

### 1.3 Nombre del niño es obligatorio

**Cambio en schema Zod:**
```ts
// Antes
nombreNino: z.string().max(80).optional().or(z.literal(''))

// Después
nombreNino: z.string().min(1, 'El nombre del niño es obligatorio').max(80)
```

---

### 1.4 Rango de edad configurable (no hardcodeado 0–18)

**Problema actual:** El schema tiene `edadCumple: z.number().int().min(0).max(18)` hardcodeado. El sistema es de eventos infantiles, la edad máxima debería venir de `useConfiguracionCalendario(idSede)`.

**Solución:**
- `ConfiguracionCalendario` probablemente ya tiene (o debería tener) un campo `edadMaxNino` o similar.
- Si no existe, agregar al endpoint de configuración.
- En el form, leer ese valor y usarlo en la validación dinámica con `.superRefine()` en lugar de `.max()` estático.

---

### 1.5 Paquetes filtrados por tipo de evento

**Problema actual:** `usePaquetesPublico()` trae todos los paquetes activos. No existe filtro por tipo de evento.

**Base de datos:** La tabla `paquete` tiene `tipo_evento_codigo` (FK a `tipo_evento`). El backend debe exponer este campo.

**Solución:**
1. Cuando el usuario seleccione un `tipoEvento`, filtrar los paquetes cuyo `tipoEventoCodigo === tipoEventoSeleccionado`.
2. Si `usePaquetesPublico()` no retorna `tipoEventoCodigo` en los ítems, agregarla al DTO del backend.
3. El filtrado puede hacerse en el frontend: `paquetes?.filter(p => p.tipoEventoCodigo === tipoSeleccionado)`.

---

### 1.6 Resumen del evento al crear

**Propuesta:** Después del `mutate` exitoso (en `onSuccess`), en lugar de navegar inmediatamente a `/admin/eventos/{id}`, mostrar un `Dialog` de resumen con:
- Fecha y turno
- Nombre del cliente
- Tipo de evento
- Nombre del niño
- Paquete seleccionado
- Botones: "Ver detalle completo" → `/admin/eventos/{id}` y "Contactar cliente" → WhatsApp/correo

Esto permite al admin revisar que todo esté correcto antes de navegar.

---

## 2. CORRECCIONES EN `EventoDetalleView`

### 2.1 Contrato: solo "Subir contrato" (no generar desde el detalle)

**Problema actual:** `ContratoEventoTab` muestra botón "Crear contrato" que genera un borrador vacío desde el detalle. Según el flujo, el contrato se debe gestionar desde `ConfirmarEventoModal` (que ya tiene la opción de generar por plantilla o subir externo).

**Cambio:** En `ContratoEventoTab`, cuando no hay contrato asociado, mostrar solo la opción de "Subir documento" (file input + `useSubirDocumento`), sin el botón "Crear contrato". El contrato generado por plantilla siempre parte del flujo de confirmación.

---

### 2.2 Registrar 2 pagos (adelanto dividido o al contado) — con porcentaje o soles

**Problema actual:** `ConfirmarEventoModal` paso 2 solo permite un adelanto monolítico. La base de datos tiene `venta_pago` que permite múltiples medios de pago para un mismo pago.

**Nuevo flujo de pago en confirmación:**

```
Precio total: S/ 1,200

¿Cómo paga el adelanto?
  ○ Al contado (un solo pago)
  ○ Dividido en 2 medios de pago

Si dividido:
  Monto en efectivo:  S/ [___]   Medio: [Efectivo ▼]
  Monto en Yape:      S/ [___]   Medio: [Yape     ▼]
  — o bien —
  Porcentaje 1:       [50]%      Medio: [Efectivo ▼]   → calculado: S/ 600
  Porcentaje 2:       [50]%      Medio: [Yape     ▼]   → calculado: S/ 600

Toggle: "Ingresar en soles / en porcentaje"
```

**Backend:** El endpoint de confirmación actualmente recibe `{ precioTotal, montoAdelanto, medioPago }`. Para soportar pago dividido necesita recibir:
```json
{
  "precioTotal": 1200,
  "montoAdelanto": 600,
  "pagos": [
    { "medioPago": "EFECTIVO", "monto": 300 },
    { "medioPago": "YAPE", "monto": 300 }
  ]
}
```
Y el backend debe crear los registros en `venta_pago` correctamente.

---

### 2.3 Detalle completo de lo que incluye el evento (servicios)

**Problema actual:** La tabla `evento_servicio` de la BD **está completamente sin usar** en el frontend. Esta tabla almacena cada servicio acordado para el evento (DJ, torta, decoración, animador, etc.) con precio individual.

**Tabla DB:**
```sql
CREATE TABLE evento_servicio (
    evento_id               BIGINT,
    servicio_cotizacion_id  BIGINT,  -- servicio del catálogo, o null si es libre
    nombre_libre            TEXT,    -- nombre personalizado
    descripcion             TEXT,
    precio_acordado         NUMERIC(10,2),
    incluido                BOOLEAN  -- si está incluido en el precio o es extra
);
```

**Lo que falta:**
1. **Backend:** Endpoint para listar/crear/eliminar `evento_servicio` por evento.
2. **Frontend:** Tab "Servicios" en `EventoDetalleView` donde el admin pueda:
   - Ver los servicios del catálogo (`servicio_cotizacion`) y agregarlos al evento
   - Agregar servicios libres (nombre + precio)
   - Marcar si están incluidos en el precio o son adicionales
   - Ver el total de servicios vs. el precio del contrato

Esto responde directamente a "detallar todo lo que va a tener el evento, qué servicios van a incluir".

---

### 2.4 Contacto con el cliente — opción notoria

**Propuesta:** En la sidebar derecha del `EventoDetalleView`, el card de "Cliente" debe incluir botones prominentes:

```
┌─────────────────────────────────┐
│ 👤 María López                  │
│ maria@gmail.com                 │
│ 987 654 321                     │
│                                 │
│ [💬 WhatsApp] [📧 Correo]       │
│      → botones grandes, verdes  │
└─────────────────────────────────┘
```

Los botones deben generar el link con mensaje pre-cargado (igual al `ConfirmarEventoModal` paso 1, que ya lo hace bien). Moverlo al sidebar visible todo el tiempo, sin necesidad de abrir un modal.

---

### 2.5 `ConfirmDialog` global

**Problema:** `ConfirmDialog` se instancia en múltiples vistas (eventos, contratos, etc.) como componente individual repetido.

**Propuesta:** Crear un provider global:
```
src/components/common/ConfirmDialog/ConfirmDialogProvider.tsx
```

Con un hook `useConfirmDialog()`:
```ts
const { confirm } = useConfirmDialog()

await confirm({
  title: 'Cancelar evento',
  description: 'Esta acción no puede revertirse.',
  confirmLabel: 'Cancelar evento',
  destructive: true,
})
```

Se monta una sola instancia en el layout admin. Reduce 100+ líneas de JSX repartidas.

---

## 3. PANEL DEL CLIENTE — VER EVENTO CONFIRMADO

### 3.1 Flujo actual vs. esperado

**Actual:** `src/features/cliente/reservas/components/dialogs/ReservaDetalleDialog.tsx` es para reservas de entrada (parque), no para eventos privados.

**Esperado:** Cuando el admin confirma un evento privado del cliente, el cliente debe ver en su panel (`/cliente/mis-eventos`) un detalle completo con:

| Sección | Contenido |
|---|---|
| Estado | Badge "Confirmado" |
| Fecha y turno | Fecha, hora inicio–fin |
| Lo que incluye | Lista de servicios/paquete acordado |
| Niño | Nombre y edad |
| Pagos | Total, adelanto pagado, saldo pendiente y fecha límite de pago |
| Contrato | Link para descargar/ver el contrato |
| Contacto PlayZone | Teléfono/WhatsApp de la sede |

**Componente a crear:**
```
src/features/cliente/eventos/components/EventoPrivadoDetalleDialog.tsx
```

Necesita un endpoint en el backend: `GET /clientes/me/eventos-privados/{id}` que retorne todos los campos visibles para el cliente (sin datos internos como `notas_internas`, `estado_operativo`, etc.).

---

## 4. TABLAS BD NO APROVECHADAS

### 4.1 `evento_servicio` — Servicios acordados por evento

**Estado:** Tabla creada en V8, cero cobertura en el backend ni frontend.

**Valor:** Es el detalle contractual de qué servicios incluye el evento. Sin esto el sistema no documenta formalmente los acuerdos.

**Plan:** 
- Backend: `GET/POST/DELETE /eventos-privados/{id}/servicios`
- Frontend: Tab "Servicios" en `EventoDetalleView` (ver sección 2.3)

---

### 4.2 `estado_operativo` en `evento`

**Estado:** La columna existe en BD (`PENDIENTE_LOGISTICA, EN_PREPARACION, LISTO, EN_CURSO, FINALIZADO`), se puede setear pero **no se muestra ni se puede cambiar en el frontend**.

**Valor:** Permite al equipo operativo saber en qué fase logística está el evento sin cambiar el estado comercial.

**Plan:** Agregar en el sidebar del `EventoDetalleView` un selector de estado operativo (solo visible para STAFF). Los estados tienen un orden lógico: se avanza, no se retrocede.

---

### 4.3 `notas_internas` en `evento`

**Estado:** Campo en BD, **no expuesto** en el DTO del backend ni en el frontend.

**Valor:** El admin puede registrar notas privadas del evento (ej. "cliente pidió sorpresa especial", "madre del niño es alérgica"). No visibles para el cliente.

**Plan:** Agregar en `EventoDetalleView` un campo de texto editable (inline, con auto-save o botón guardar) en el sidebar admin.

---

### 4.4 `hora_inicio_real` / `hora_fin_real` en `evento`

**Estado:** Columnas en BD, no usadas.

**Valor:** Permite registrar la hora real de inicio y fin para medir puntualidad y calcular duración real del evento.

**Plan:** En el paso "COMPLETAR EVENTO", agregar campos para ingresar la hora real de inicio y fin. Mostrar en el historial del evento.

---

### 4.5 `venta_pago` — Pagos múltiples por venta

**Estado:** La tabla soporta múltiples medios de pago por `venta`, pero el frontend solo registra un medio. 

**Valor:** Permitir al admin registrar "pagó S/ 300 en efectivo + S/ 300 en Yape" para el adelanto o el saldo.

**Plan:** Ver sección 2.2.

---

### 4.6 `evento_extra` — Extras con cantidad y notas

**Estado:** Parcialmente usado (se muestran extras en detalle), pero `cantidad` y `notas` no están expuestos.

**Plan:** En la tab "Resumen" del evento, mostrar extras con cantidad (ej. "2x Torta de cumpleaños") y sus notas.

---

## 5. MÓDULO DE RENTABILIDAD POR EVENTO (NUEVO — SOLO ADMIN)

### 5.1 Descripción

Cuando el evento está en estado `CONFIRMADA`, mostrar un botón en `EventoDetalleView`:

```
[📊 Ver rentabilidad del evento]
```

Navega a: `/admin/eventos/{id}/rentabilidad`

### 5.2 Estructura de la página

```
┌──────────────────────────────────────────────────────┐
│  Rentabilidad — Cumpleaños de Sofía (15 Feb 2026)    │
├──────────────────────────────────────────────────────┤
│  INGRESOS                                            │
│  Precio contrato:            S/ 1,200.00             │
│  ─────────────────────────────────────────────────── │
│  EGRESOS REGISTRADOS                                 │
│  + Agregar gasto                                     │
│  [Torta personalizada]  [Proveedor externo]  S/ 180  │
│  [Decoración]           [Proveedor externo]  S/  90  │
│  [Animador]             [Personal interno]   S/ 150  │
│  ─────────────────────────────────────────────────── │
│  Total egresos:                              S/ 420  │
│  ─────────────────────────────────────────────────── │
│  GANANCIA NETA:                              S/ 780  │
│  Margen:                                      65.0%  │
└──────────────────────────────────────────────────────┘
```

### 5.3 Relación con BD

Usar la tabla `egreso` existente (ver módulo finance) filtrado por `evento_id`. Si el módulo finance ya tiene `GastosEventoPanel` para este propósito, ampliar esa vista con:
- Filtro por categoría de egreso
- Comparativa ingreso vs. egreso en gráfica de dona o barra
- Export a PDF/CSV del resumen de rentabilidad

### 5.4 Archivos involucrados

| Archivo | Acción |
|---|---|
| `app/admin/eventos/[id]/rentabilidad/page.tsx` | Nueva ruta (crear) |
| `features/admin/eventos/components/views/EventoRentabilidadView.tsx` | Vista principal (crear) |
| `features/admin/finance/components/GastosEventoPanel.tsx` | Reutilizar/ampliar |
| `EventoDetalleView.tsx` | Agregar botón cuando estado = CONFIRMADA/COMPLETADA |

---

## 6. OTRAS MEJORAS RECOMENDADAS PARA UN SISTEMA PROFESIONAL

### 6.1 Timeline/historial de actividad del evento

La tabla `contrato_actividad` existe para contratos. Falta un equivalente para eventos: cada cambio de estado, pago registrado, nota agregada, debería quedar en un log visible en la vista de detalle.

**Tabla sugerida en BD:**
```sql
CREATE TABLE evento_actividad (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    evento_id   BIGINT NOT NULL REFERENCES evento(id),
    accion      TEXT NOT NULL,
    descripcion TEXT,
    usuario_id  UUID REFERENCES perfil_usuario(id),
    accion_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 6.2 Recordatorios automáticos al cliente

Cuando el evento esté a N días de la fecha (configurable: 30, 15, 7, 1 día), enviar notificación automática al cliente recordando:
- Fecha y hora del evento
- Saldo pendiente de pago
- Documentos que debe llevar

Se puede implementar con un job en Spring (`@Scheduled`) + email o integración WhatsApp Business API.

### 6.3 Sistema de archivos del evento

Actualmente `contrato_documento` guarda documentos del contrato. Falta un lugar para guardar documentos generales del evento (boucher de pago del cliente, autorizaciones, etc.).

**Propuesta:** Tab "Documentos" en `EventoDetalleView` donde el admin pueda subir archivos asociados al evento (PDFs, imágenes).

### 6.4 Confirmación de asistencia (RSVP) del cliente

Una vez confirmado el evento, generar un link único que el cliente comparte con sus invitados para que confirmen asistencia. Los datos alimentan `aforo_declarado` automáticamente y el admin puede verlo en tiempo real.

### 6.5 Vista de calendario unificada para el admin

La vista actual de calendario muestra disponibilidad por fecha. Falta una vista de "agenda del mes" donde el admin vea todos los eventos confirmados dispuestos en un calendario visual (tipo Google Calendar), con color por estado (SOLICITADA=amarillo, CONFIRMADA=verde, COMPLETADA=gris).

### 6.6 Integración de reseñas post-evento

La tabla `resena` tiene FK a `evento_id`. Después de que el evento pase a `COMPLETADA`, enviar automáticamente al cliente un link para dejar su reseña en el sistema. El admin puede ver las reseñas vinculadas al evento en el detalle.

### 6.7 Métricas de conversión

Dashboard interno que muestre:
- % de eventos SOLICITADOS que llegan a CONFIRMADOS (tasa de conversión)
- Tiempo promedio entre solicitud y confirmación
- Ingresos por tipo de evento
- Tipo de evento más solicitado por mes

---

## 7. PRIORIZACIÓN SUGERIDA

| Prioridad | Tarea | Impacto | Esfuerzo |
|---|---|---|---|
| 🔴 Alta | 1.2 Tipo de evento desde BD | Integridad de datos | Bajo |
| 🔴 Alta | 1.3 Nombre niño obligatorio | Validación | Muy bajo |
| 🔴 Alta | 2.3 Tab servicios (evento_servicio) | Funcionalidad core | Alto |
| 🔴 Alta | 2.4 Botones WhatsApp/correo notorios | UX | Bajo |
| 🟡 Media | 1.1 Crear cliente desde formulario | UX | Medio |
| 🟡 Media | 1.4 Edad configurable | Flexibilidad | Bajo |
| 🟡 Media | 1.5 Paquetes por tipo de evento | UX | Bajo |
| 🟡 Media | 2.2 Pago dividido en 2 medios | Operativo | Alto |
| 🟡 Media | 4.2 Estado operativo | Operativo | Medio |
| 🟡 Media | 4.3 Notas internas | Calidad | Bajo |
| 🟡 Media | 5. Módulo rentabilidad | Gestión | Alto |
| 🟡 Media | 3.1 Panel cliente - evento confirmado | UX cliente | Alto |
| 🟢 Baja | 2.5 ConfirmDialog global | Deuda técnica | Medio |
| 🟢 Baja | 6.1 Timeline evento | Trazabilidad | Medio |
| 🟢 Baja | 6.5 Calendario agenda | UX admin | Alto |
| 🟢 Baja | 6.2 Recordatorios automáticos | Diferenciador | Alto |

---

## 8. ESTADO ACTUAL DE IMPLEMENTACIÓN

| Módulo | Estado |
|---|---|
| `EventosListView` con filtros + paginación | ✅ Completo |
| `EventoDetalleView` tabs + checklist + pagos básicos | ✅ Completo |
| `NuevoEventoView` (picker fecha/turno dinámico) | ✅ Completo |
| `NuevoEventoForm` (estructura base) | ✅ Completo — pendiente mejoras §1 |
| `ContratoDetalleView` + `ContratosListView` | ✅ Completo |
| Fix `[id]/page.tsx` → `useParams()` (Next.js 16) | ✅ Aplicado |
| Botón "Nuevo evento" en lista | ✅ Aplicado |
| `evento_servicio` en frontend | ❌ Sin implementar |
| Pago dividido en 2 medios | ❌ Sin implementar |
| Panel cliente — evento privado confirmado | ❌ Sin implementar |
| Módulo de rentabilidad | ❌ Sin implementar |
| Estado operativo del evento | ❌ Sin implementar |
| Notas internas del evento | ❌ Sin implementar |
| Timeline/historial de actividad | ❌ Sin implementar |
