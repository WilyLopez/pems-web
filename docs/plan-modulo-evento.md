# Plan de implementación — Módulo de Eventos y Contratos

**Fecha:** 2026-06-23  
**Estado:** Pendiente de aprobación

---

## Fase 1 — Backend: nuevos puertos y refactorización

### Archivos nuevos

| Archivo | Propósito |
|---|---|
| `application/evento/port/in/CompletarEventoUseCase.java` | Puerto `completar(Long idEvento, UUID idUsuario)` |
| `application/evento/port/in/RegistrarSaldoUseCase.java` | Puerto `registrar(RegistrarSaldoCommand)` |
| `application/evento/dto/command/RegistrarSaldoCommand.java` | Campos: `idEvento`, `monto`, `medioPago`, `idUsuario` |
| `interfaces/rest/evento/request/CancelarEventoRequest.java` | `@NotBlank @Size(min=10) String motivo` |
| `interfaces/rest/evento/request/RegistrarSaldoRequest.java` | `@NotNull BigDecimal monto`, `@NotNull @Pattern medioPago` |
| `interfaces/rest/evento/mapper/EventoPrivadoResponseMapper.java` | Extrae `toResponse` del controller |
| `interfaces/rest/contrato/mapper/ContratoResponseMapper.java` | Extrae `toResponse` del controller (con nested docs y actividades) |
| `shared/util/SortUtils.java` | `parsearSort(String sort) → Sort` — elimina código duplicado entre controllers |
| `interfaces/rest/config/ConfigController.java` | `GET /api/v1/config/medios-pago` → lista EFECTIVO, YAPE, TRANSFERENCIA, TARJETA |

### Archivos modificados

**`EventoPrivadoService.java`**
- Añadir `implements CompletarEventoUseCase, RegistrarSaldoUseCase` (los métodos ya existen)

**`EventoPrivadoController.java`**
- Eliminar inyección directa de `EventoPrivadoService` y `ExtraPaqueteRepository`
- Inyectar `CompletarEventoUseCase` y `RegistrarSaldoUseCase`
- `cancelar`: `@RequestParam String motivoCancelacion` → `@RequestBody CancelarEventoRequest`
- `registrarSaldo`: `@RequestParam BigDecimal monto, @RequestParam String medioPago` → `@RequestBody RegistrarSaldoRequest`
- Usar `EventoPrivadoResponseMapper` en lugar de método privado `toResponse`
- Usar `SortUtils.parsearSort` en lugar del bloque manual de split/parse

**`ConfirmarEventoRequest.java`**
- Añadir `@Pattern(regexp = "EFECTIVO|YAPE|TRANSFERENCIA|TARJETA")` en campo `medioPago`

**`ContratoController.java`**
- Usar `ContratoResponseMapper` y `SortUtils`
- Añadir `POST /api/v1/contratos/{id}/reemplazar` (archiva el contrato actual y crea uno nuevo vacío para el mismo evento)

**`ContratoResponse.java`**
- Añadir campo `boolean esEditable` calculado desde el estado al construir la respuesta

**`ContratoService.porId()` y `porEvento()`**
- Validación lazy de VENCIDO: si `estado != FIRMADO && estado != ARCHIVADO && fechaEvento < hoy`, transicionar a VENCIDO, persistir y continuar con el retorno

---

## Fase 2 — Frontend: capa de datos

### Archivos nuevos

```
features/admin/eventos/
  shared/queryKeys.ts
    eventosKeys.all
    eventosKeys.list(params)
    eventosKeys.detail(id)
    eventosKeys.checklist(id)

  types/index.ts
    movido desde types/evento.types.ts sin cambios estructurales

  services/eventos.api.ts
    buscarAdmin()           refactorizado desde eventoService.buscarAdmin
    obtener()
    solicitar()
    confirmar()
    completar()
    registrarSaldo()        body: { monto, medioPago } en lugar de query params
    cancelar()              body: { motivo } en lugar de interpolación manual de URL
    listarChecklist()
    completarTarea()
    descompletarTarea()

  hooks/useEventos.ts
    staleTime: 30_000 en queries de lista y detalle
    refetchInterval: 30_000 en useEventos (polling de lista)
    optimistic update en useCompletarTarea y useDescompletarTarea
    queryKey factory en todos los hooks

features/admin/contratos/
  shared/queryKeys.ts
    contratosKeys.all
    contratosKeys.list(params)
    contratosKeys.detail(id)
    contratosKeys.porEvento(idEvento)

  types/index.ts
    movido desde types/contrato.types.ts
    ELIMINAR: PLANTILLAS, PlantillaId, aplicarPlantilla
    AÑADIR: campo esEditable: boolean en interfaz Contrato

  services/contratos.api.ts
    listar()
    obtener()
    obtenerPorEvento()
    generar()
    actualizar()
    firmar()
    cambiarEstado()
    reemplazar(id)          nuevo — POST /contratos/{id}/reemplazar
    subirDocumento()        POST /contratos/{id}/documentos

  hooks/useContratos.ts
    staleTime: 30_000
    useReemplazarContrato()  nuevo
    eliminar useSubirContratoExterno (reemplazado por useSubirDocumento)

features/admin/config/
  types/index.ts
    MedioPago: { codigo: string; label: string }

  services/config.api.ts
    getMediosPago(): Promise<MedioPago[]>

  hooks/useMediosPago.ts
    staleTime: Infinity (la lista de medios de pago no cambia en runtime)
```

### Re-exports de compatibilidad (se eliminan al final del proyecto)

Los archivos originales quedan como re-exports para no romper imports existentes durante la migración:

```
types/evento.types.ts       → re-export desde features/admin/eventos/types
types/contrato.types.ts     → re-export desde features/admin/contratos/types
hooks/useEventos.ts         → re-export desde features/admin/eventos/hooks
hooks/useContratos.ts       → re-export desde features/admin/contratos/hooks
services/evento.service.ts  → re-export desde features/admin/eventos/services
services/contrato.service.ts→ re-export desde features/admin/contratos/services
```

---

## Fase 3 — Frontend: componentes compartidos

### Archivos nuevos

```
features/admin/eventos/components/ui/EventoEstadoBadge.tsx
  Props: { estado: EstadoEvento; size?: 'sm' | 'default' }
  Reemplaza los dos ESTADO_BADGE Record<string, string> duplicados
  Usa labels legibles: "Solicitada", "Confirmada", "Completada", "Cancelada"

features/admin/eventos/components/ui/EventoAlertasBadges.tsx
  Props: { evento: EventoPrivado }
  Llama a calcularIndicadores una sola vez internamente
  Para tabla: íconos pequeños con Tooltip del sistema de diseño (no atributo title)
  Para detalle: badges con texto completo

features/admin/contratos/components/ui/ReemplazarContratoDialog.tsx
  Props: { open, onOpenChange, contratoId, onSuccess }
  Textarea de motivo con validación mínimo 10 caracteres
  Llama a useReemplazarContrato()
  Reemplaza el Dialog de cancelar contrato

components/common/InfoRow.tsx
  Extrae componente duplicado presente en eventos/[id]/page.tsx y contratos/[id]/page.tsx
  Props: { icon, label, value }
  Retorna null si value está vacío

features/admin/config/components/MediosPagoSelect.tsx
  Props: { value, onValueChange, className? }
  Carga del endpoint via useMediosPago()
  Reutilizable en ConfirmarEventoModal y en el formulario de registrar saldo
```

---

## Fase 4 — Frontend: vistas de lista

### Archivos nuevos

**`features/admin/eventos/components/views/EventosListView.tsx`**

Cambios respecto a `app/admin/eventos/page.tsx`:
- Filas clickeables: `onClick` en la fila navega al detalle (además del botón "Ver")
- Columna "Estado" usa `EventoEstadoBadge` con label legible
- Columna "Alertas" usa `EventoAlertasBadges` con tooltips del sistema de diseño
- Columna renombrada: "Contrato" → "Precio"
- Filtro de fecha con botón X para limpiar (consistente con el filtro de búsqueda)
- Import muerto `useCancelarEvento` eliminado
- Hooks y types importados desde features

**`features/admin/contratos/components/views/ContratosListView.tsx`**

Cambios respecto a `app/admin/contratos/page.tsx`:
- Filas clickeables
- Filtro adicional de fecha de evento (`Input type="date"` con botón X)
- Hooks y types importados desde features

### Archivos modificados

```
app/admin/eventos/page.tsx      → solo renderiza <EventosListView />
app/admin/contratos/page.tsx    → solo renderiza <ContratosListView />
```

---

## Fase 5 — Frontend: vistas de detalle

### Archivos nuevos

**`features/admin/eventos/components/views/EventoDetalleView.tsx`**

Cambios respecto a `app/admin/eventos/[id]/page.tsx`:
- `calcularIndicadores` llamado una sola vez, resultado en variable
- `ESTADO_BADGE` eliminado, usa `EventoEstadoBadge`
- `MEDIOS_PAGO` eliminado, usa `MediosPagoSelect`
- Panel lateral cliente: nombre/correo/teléfono como `<Link href="/admin/clientes/{idCliente}">`
- Validación de monto de saldo: solo permite monto igual a `saldoPendiente` (no pagos parciales)
- Botón "Volver": `router.back()` → `<Link href="/admin/eventos">` explícito
- Tab "Contrato": añade botón "Ver contrato completo" → `/admin/contratos/{idContrato}` si existe
- `InfoRow` importado desde `components/common`

**`features/admin/contratos/components/views/ContratoDetalleView.tsx`**

Cambios respecto a `app/admin/contratos/[id]/page.tsx`:
- `esEditable` tomado de `contrato.esEditable` (viene del backend, no recomputado en frontend)
- Botón "Cancelar" eliminado
- Botón "Reemplazar" → abre `ReemplazarContratoDialog`
- Sidebar: añade botón "Ver evento" → `/admin/eventos/{idEventoPrivado}`
- Sección de documentos visible siempre: si `documentos.length === 0`, muestra dropzone de carga
- Botón "Volver": `router.back()` → `<Link href="/admin/contratos">` explícito
- `InfoRow` importado desde `components/common`

### Archivos modificados

**`components/admin/contratos/ContratoEventoTab.tsx`**
- Eliminar selector de plantilla del estado "sin contrato": el editor arranca en blanco
- `handleCrear` → llama a `generar.mutate` con `contenidoTexto: ''` directamente
- Botón "Cancelar contrato" eliminado
- Botón "Reemplazar" → abre `ReemplazarContratoDialog`
- `PLANTILLAS`, `PlantillaId`, `aplicarPlantilla` eliminados de imports

**`components/admin/contratos/ContratoEditor.tsx`**
- Eliminar imports de `PLANTILLAS`, `PlantillaId`, `aplicarPlantilla`
- Eliminar el `Select` de plantillas del bloque `!readOnly`
- Mantener intacto el toggle editor / split / preview

### Archivos actualizados (app pages)

```
app/admin/eventos/[id]/page.tsx
  Parsear id con validación: isNaN(idNum) → <ErrorState>
  Renderiza <EventoDetalleView id={idNum} />

app/admin/contratos/[id]/page.tsx
  Parsear id con validación: isNaN(idNum) → <ErrorState>
  Renderiza <ContratoDetalleView id={idNum} />
```

---

## Fase 6 — Frontend: flujo nuevo evento (admin)

### Archivos nuevos

**`features/admin/eventos/schema/nuevoEvento.schema.ts`**

Schema Zod con:
- `fecha: z.string()` (validación que sea futura y dentro del rango configurado)
- `turno: z.string()` (codigo del turno, no literal T1/T2)
- `tipoEvento: z.string().min(1)`
- `nombreNino: z.string().optional()`
- `edadCumple: z.number().min(0).max(18).optional()`
- `aforoDeclarado: z.number().min(1).max(60).optional()`
- `observaciones: z.string().max(2000).optional()`
- `idPaquete: z.number().optional()`

**`features/admin/eventos/components/views/NuevoEventoView.tsx`**

Refactorización de `app/admin/eventos/nuevo/page.tsx`:
- `idSede ?? 1` → si `idSede` es null, retorna `<ErrorState message="No tienes sede asignada" />`
- Tipo de turno: usa `turno.codigo` del endpoint de turnos en lugar del literal `'T1' | 'T2'`
- Skeleton mientras carga la disponibilidad (no solo deshabilitar botones)
- Fallbacks de horario eliminados: solo muestra los turnos si `config` cargó

**`features/admin/eventos/components/forms/NuevoEventoForm.tsx`**

Formulario completo del paso 2 (actualmente no existe `/formulario/page.tsx`):
- `react-hook-form` + `zodResolver(nuevoEventoSchema)`
- Campos: tipo de evento, nombre del niño, edad, aforo, paquete, extras, observaciones
- Validación inline con mensajes de error
- Al submit: llama a `eventoService.solicitar()` y redirige a `/admin/eventos/{id}`

### Archivos actualizados

```
app/admin/eventos/nuevo/page.tsx         → renderiza <NuevoEventoView />
app/admin/eventos/nuevo/formulario/      → nueva ruta, renderiza <NuevoEventoForm />
```

---

## Resumen

| Fase | Nuevos | Modificados |
|---|---|---|
| 1 — Backend | 9 | 5 |
| 2 — Data layer | 9 | 6 (re-exports) |
| 3 — Componentes compartidos | 5 | 0 |
| 4 — Vistas de lista | 2 | 2 |
| 5 — Vistas de detalle | 2 | 4 |
| 6 — Nuevo evento | 3 | 2 |
| **Total** | **30** | **19** |

## Orden de ejecución

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
```

Cada fase es desplegable de forma independiente sin romper lo anterior gracias a los re-exports de compatibilidad de la Fase 2.
