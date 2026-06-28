# Reporte: Módulo de Caja (Panel Cajero + Admin Finanzas)

> Generado: 2026-06-27. Documenta el estado real de implementación por fases.

---

## Contexto

El módulo de Caja cubre el ciclo completo de apertura, movimientos, arqueos y cierre de caja para las sedes de "Kiki y Lala". Incluye:

- **Backend (Spring Boot)**: arquitectura hexagonal completa — domain → persistence → service → controller
- **Frontend cajero** (`features/cajero`): componentes reutilizables para la vista del cajero
- **Frontend admin** (`app/admin/finanzas/caja`): página de administración con historial y resúmenes

---

## FASE 1 — Backend (COMPLETADA)

### 1.1 Migración SQL

**Archivo:** `pems/src/main/resources/db/migration_legacy/V27__caja_mejoras.sql`

- `ALTER TABLE apertura_caja` → columnas `saldo_esperado NUMERIC(10,2)` y `diferencia NUMERIC(10,2)`
- `CREATE TABLE arqueo_caja` → tabla completa con índice sobre `apertura_caja_id`

> **Acción requerida del usuario**: ejecutar manualmente en Supabase.

---

### 1.2 Domain Model

| Archivo | Estado | Cambio |
|---|---|---|
| `AperturaCaja.java` | Modificado | Campos `saldoEsperado`, `diferencia` |
| `ArqueoCaja.java` | Nuevo | Domain model completo con `@Builder` |

### 1.3 Repositorios (interfaces domain)

| Archivo | Estado | Cambio |
|---|---|---|
| `AperturaCajaRepository.java` | Modificado | +`findAbiertaBySede`, `incrementarIngresos`, `incrementarEgresos` |
| `ArqueoCajaRepository.java` | Nuevo | `save` + `findByApertura` |

### 1.4 JPA / Persistence

| Archivo | Estado | Cambio |
|---|---|---|
| `AperturaCajaEntity.java` | Modificado | Campos `saldoEsperado`, `diferencia` |
| `MovimientoCajaEntity.java` | Modificado | Fix crítico: `venta_id` pasó de `insertable=false` a solo `updatable=false` |
| `AperturaCajaJpaRepository.java` | Modificado | `findBySede_IdAndEstadoAndFecha` (con fecha) + dos `@Modifying` JPQL atómicos |
| `ArqueoCajaEntity.java` | Nuevo | Entidad JPA para `arqueo_caja` |
| `ArqueoCajaJpaRepository.java` | Nuevo | `findByAperturaCaja_IdOrderByFechaCreacionAsc` |
| `AperturaCajaPersistenceAdapter.java` | Reescrito | Diferencia `findActivaBySede` (hoy + ABIERTA) vs `findAbiertaBySede` (cualquier fecha + ABIERTA) |
| `ArqueoCajaPersistenceAdapter.java` | Nuevo | Implementa `ArqueoCajaRepository` |
| `MovimientoCajaPersistenceAdapter.java` | Modificado | Fix: `ventaId` se persiste correctamente en `save()` |

### 1.5 Application Layer (Commands, Queries, Use Cases)

| Archivo | Estado | Cambio |
|---|---|---|
| `RegistrarArqueoCommand.java` | Nuevo | `idAperturaCaja`, `saldoContado`, `observaciones`, `realizadoPor` |
| `ArqueoCajaQuery.java` | Nuevo | Todos los campos del arqueo como DTO de salida |
| `ResumenCajaQuery.java` | Nuevo | Agrega `movimientos` y `arqueos` a los campos de apertura |
| `AperturaCajaQuery.java` | Modificado | +`saldoEsperado`, `diferencia` |
| `GestionarCajaUseCase.java` | Modificado | +`obtenerHoy`, `registrarArqueo`, `listarArqueos`, `generarResumen` |

### 1.6 Service

**Archivo:** `CajaService.java` — Reescrito completo.

| Método | Descripción |
|---|---|
| `abrir()` | Valida caja sin cerrar via `findAbiertaBySede`. Usa `OffsetDateTime.now(LIMA)` |
| `cerrar()` | Calcula `saldoEsperado = inicial + ingresos - egresos`; `diferencia = saldoFinal - saldoEsperado` |
| `registrarMovimiento()` | Guarda el movimiento, luego llama `incrementarIngresos` o `incrementarEgresos` atómicamente |
| `obtenerHoy()` | `findBySedeAndFecha(idSede, LocalDate.now(LIMA))` |
| `registrarArqueo()` | Valida caja abierta, calcula `saldoEsperado` y `diferencia`, guarda `ArqueoCaja` |
| `listarArqueos()` | Delega a `arqueoCajaRepository.findByApertura` |
| `generarResumen()` | Carga apertura + todos los movimientos + todos los arqueos → `ResumenCajaQuery` |

**Archivo:** `VentaMostradorService.java` — Reescrito. Fix crítico: ahora crea un `MovimientoCaja` por cada pago de venta presencial y llama `incrementarIngresos` atómicamente.

### 1.7 REST Controller

**Archivo:** `CajaController.java` — Reescrito.

| Endpoint | Auth | Descripción |
|---|---|---|
| `GET /sedes/{idSede}/hoy` | `caja.ver_historial` ó `caja.abrir` | Caja activa de hoy para la sede |
| `GET /{idApertura}/resumen` | `caja.ver_historial` ó `caja.cerrar` | Resumen completo con movimientos y arqueos |
| `GET /{idApertura}/arqueos` | `caja.ver_historial` | Lista de arqueos del período |
| `POST /{idApertura}/arqueos` | `caja.cerrar` ó `caja.movimiento` | Registrar un arqueo parcial |

### 1.8 DTOs REST

| Archivo | Estado |
|---|---|
| `AperturaCajaResponse.java` | Modificado: +`saldoEsperado`, `diferencia` |
| `ArqueoCajaResponse.java` | Nuevo |
| `ResumenCajaResponse.java` | Nuevo: incluye listas `movimientos` y `arqueos` |
| `RegistrarArqueoRequest.java` | Nuevo: `saldoContado`, `observaciones` |

### 1.9 Template Thymeleaf

**Archivo:** `pems/src/main/resources/templates/resumen-cierre-caja.html`

Template de impresión/email con:
- Header: nombre negocio + sede + título
- Grid de metadatos: fecha, estado, horas apertura/cierre
- Cuadro de totales con diferencia coloreada (verde/rojo)
- Tabla de movimientos con badge por tipo
- Sección de arqueos en cards
- Pie con observaciones

---

### Bugs Críticos Corregidos en Fase 1

| Bug | Descripción | Fix |
|---|---|---|
| `findActivaBySede` sin filtro de fecha | Devolvía cualquier caja ABIERTA sin importar el día. Ventas de hoy podían ir a caja de ayer si no se cerró | `findBySede_IdAndEstadoAndFecha` con `LocalDate.now(LIMA)` |
| `totalIngresos`/`totalEgresos` nunca se actualizaban | `registrarMovimiento()` guardaba el movimiento pero nunca sumaba los acumulados | `@Modifying` JPQL atómico `incrementarIngresos` / `incrementarEgresos` |
| `venta_id` con `insertable = false` | El campo nunca se persistía en `movimiento_caja` | Eliminado `insertable = false`, solo `updatable = false` |
| `VentaMostradorService` no creaba movimientos | Validaba que hubiera caja abierta pero descartaba el resultado y no registraba nada | Guardado del resultado + loop de `MovimientoCaja` por cada pago |

---

## FASE 2 — Frontend `features/cajero` (COMPLETADA)

### 2.1 Tipos y API (`features/admin/finance/`)

| Archivo | Cambio |
|---|---|
| `types/index.ts` | `AperturaCaja` +`saldoEsperado?`, `diferencia?`; nuevas interfaces `ArqueoCaja`, `ResumenCaja`, `RegistrarArqueoPayload` |
| `services/finance.api.ts` | +`obtenerCajaHoy`, `generarResumenCaja`, `listarArqueosCaja`, `registrarArqueo` |
| `hooks/useFinanceData.ts` | +`useCajaHoy`, `useResumenCaja`, `useArqueosCaja`, `useArqueoMutations` con invalidación en cascada |
| `schemas/finance.schemas.ts` | +`arqueoSchema`: `saldoContado ≥ 0`, `observaciones` opcional |

### 2.2 Componentes (`features/cajero/components/`)

| Componente | Estado | Descripción |
|---|---|---|
| `CajaStatusCard.tsx` | Nuevo | 4 métricas (saldo inicial, ingresos, egresos, saldo esperado), badge ABIERTA/CERRADA, horas, diferencia al cierre |
| `AbrirCajaPanel.tsx` | Nuevo | Panel inline (no modal): saldo inicial + observaciones. Usa `abrirCajaSchema` + `useCajaMutations().abrir` |
| `CerrarCajaPanel.tsx` | Nuevo | Desglose saldo esperado + saldo contado con **diferencia en tiempo real** (`useWatch`). Botones: "Arqueo parcial" y "Cerrar caja" |
| `RegistrarArqueoModal.tsx` | Nuevo | Dialog shadcn: muestra saldo esperado + input saldo contado con **diferencia en tiempo real** (`useWatch`) |
| `MovimientosTable.tsx` | Nuevo | Tabla con hora, badge tipo (Ingreso/Egreso), badge origen (Manual ámbar/Automático gris), monto coloreado. `<tfoot>` con balance neto |
| `ArqueosPanel.tsx` | Nuevo | Lista de arqueos: hora, observaciones, esperado vs contado, diferencia coloreada |

**Barrel:** `features/cajero/index.ts` exporta los 6 componentes.

---

## FASE 3 — Página `admin/finanzas/caja` (PENDIENTE)

Actualizar la página existente para usar los nuevos endpoints y componentes.

### Cambios requeridos

| Cambio | Descripción |
|---|---|
| Usar `useCajaHoy(idSede)` | En vez de `useAperturaCaja` — endpoint `/sedes/{id}/hoy` con `staleTime: 30s`, `refetchInterval: 60s` |
| Integrar `CajaStatusCard` | Reemplazar el bloque de estado actual |
| Integrar `MovimientosTable` | En la sección de movimientos |
| Integrar `ArqueosPanel` + `RegistrarArqueoModal` | Sección de arqueos con botón para registrar |
| Integrar `CerrarCajaPanel` | Con live diferencia y botón de arqueo parcial |
| Usar `useResumenCaja(idApertura)` | Para mostrar el resumen de cierre post-cierre |
| Mostrar `saldoEsperado` y `diferencia` | En el encabezado de la apertura activa |

---

## FASE 4+ — Módulos pendientes (NO INICIADOS)

Los siguientes módulos fueron aprobados como fases posteriores pero aún no tienen implementación:

| Módulo | Descripción |
|---|---|
| Devoluciones | Reversar un movimiento de caja existente |
| Venta anticipada | Registrar venta sin caja abierta (pre-pago) |
| Cambio de fecha | Reasignar una venta a otra fecha |
| Corrección de venta | Ajustar monto o medio de pago post-registro |
| Retiro categorizado | Egresos categorizados (proveedores, servicios, etc.) con comprobante |

---

## Plan paralelo activo: Gastos en Egresos + Fix comprobante

> Plan en `C:\Users\Lenovo\.claude\plans\floofy-sauteeing-avalanche.md`

Este plan aborda problemas en el módulo de Finanzas existente (egresos, ingresos), independiente de las fases de Caja:

### Fase A — Fix `comprobanteUrl` (PENDIENTE, solo frontend)

Eliminar validación `.url()` en `finance.schemas.ts` (campos `gastoOperativoSchema` y `egresoSchema`). Actualizar label/placeholder en `GastosOperativosDia.tsx` y `GastosEventoPanel.tsx`.

### Fase B — Backend: endpoint gastos de evento por rango (PENDIENTE)

9 archivos backend. Nueva query JPQL con JOIN a `EventoPrivado` para obtener gastos de evento filtrados por sede y rango de fechas. Nuevo endpoint `GET /api/v1/gastos-evento/sedes/{idSede}/rango`.

### Fase C — Frontend: sub-tabs en Egresos + Sheet detalle (PENDIENTE)

8 archivos frontend. Tres sub-tabs en `/finanzas/egresos` ("Egresos registrados", "Gastos operativos", "Gastos de evento") con selector de período. Sheet lateral de detalle en tablas de ingresos y egresos.

---

## Resumen de Estado

| Fase | Alcance | Estado |
|---|---|---|
| **1 — Backend Caja** | 20+ archivos Java, migración SQL, template Thymeleaf | **COMPLETADA** |
| **2 — Frontend `features/cajero`** | 6 componentes + tipos/API/hooks/schemas | **COMPLETADA** |
| **3 — Página `admin/finanzas/caja`** | Integración componentes cajero en la página admin | **PENDIENTE** |
| **4+ — Módulos adicionales** | Devoluciones, venta anticipada, cambio fecha, corrección, retiro | **PENDIENTE** |
| **A — Fix comprobanteUrl** | 3 archivos frontend | **PENDIENTE** |
| **B — Backend gastos evento** | 9 archivos Java | **PENDIENTE** |
| **C — Frontend gastos en egresos** | 8 archivos frontend | **PENDIENTE** |

---

## Acción manual requerida

```sql
-- Ejecutar en Supabase antes de iniciar el backend
-- Archivo: pems/src/main/resources/db/migration_legacy/V27__caja_mejoras.sql

ALTER TABLE apertura_caja
  ADD COLUMN IF NOT EXISTS saldo_esperado NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS diferencia     NUMERIC(10,2);

CREATE TABLE IF NOT EXISTS arqueo_caja (
  id               BIGSERIAL     PRIMARY KEY,
  apertura_caja_id BIGINT        NOT NULL REFERENCES apertura_caja(id),
  saldo_esperado   NUMERIC(10,2) NOT NULL,
  saldo_contado    NUMERIC(10,2) NOT NULL,
  diferencia       NUMERIC(10,2) NOT NULL,
  observaciones    TEXT,
  realizado_por    UUID          NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_arqueo_caja_apertura ON arqueo_caja(apertura_caja_id);
```
