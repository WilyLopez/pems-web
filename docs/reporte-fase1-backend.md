# Reporte Fase 1 — Backend: nuevos puertos y refactorización

**Fecha:** 2026-06-23  
**Estado:** Completada

---

## Archivos creados

### Nuevos puertos (use cases)

| Archivo | Descripción |
|---|---|
| `application/evento/port/in/CompletarEventoUseCase.java` | Puerto `completar(Long idEvento, UUID idUsuarioGestor)` |
| `application/evento/port/in/RegistrarSaldoUseCase.java` | Puerto `registrarSaldo(RegistrarSaldoCommand)` |
| `application/contrato/port/in/ReemplazarContratoUseCase.java` | Puerto `reemplazar(Long idContratoActual, UUID idUsuarioAdmin)` |

### Nuevos commands

| Archivo | Descripción |
|---|---|
| `application/evento/dto/command/RegistrarSaldoCommand.java` | `idEvento`, `monto`, `medioPago`, `idUsuario` |

### Nuevos requests

| Archivo | Descripción |
|---|---|
| `interfaces/rest/evento/request/CancelarEventoRequest.java` | `@NotBlank @Size(min=10) String motivo` |
| `interfaces/rest/evento/request/RegistrarSaldoRequest.java` | `@NotNull BigDecimal monto`, `@NotBlank @Pattern medioPago` |

### Nuevos mappers

| Archivo | Descripción |
|---|---|
| `interfaces/rest/evento/mapper/EventoPrivadoResponseMapper.java` | Extrae la conversión `EventoPrivadoQuery → EventoPrivadoResponse` del controller |
| `interfaces/rest/contrato/mapper/ContratoResponseMapper.java` | Extrae la conversión `ContratoQuery → ContratoResponse` con `esEditable` |

### Nuevas utilidades y controllers

| Archivo | Descripción |
|---|---|
| `shared/util/SortUtils.java` | `parsearSort(String sort) → Sort` — elimina el bloque split/parse duplicado |
| `interfaces/rest/config/ConfigController.java` | `GET /api/v1/config/medios-pago` → `[{codigo, label}]` para EFECTIVO, YAPE, TRANSFERENCIA, TARJETA |

---

## Archivos modificados

### `EventoPrivadoService.java`
- Añadido `implements CompletarEventoUseCase, RegistrarSaldoUseCase`
- `completar()` y `registrarSaldo()` ahora tienen `@Override`
- Añadido overload `registrarSaldo(RegistrarSaldoCommand)` que delega al método existente
- Imports de los nuevos puertos añadidos

### `EventoPrivadoController.java` (reescrito)
- Eliminada inyección directa de `EventoPrivadoService` y `ExtraPaqueteRepository`
- Inyecta: `CompletarEventoUseCase`, `RegistrarSaldoUseCase`, `EventoPrivadoResponseMapper`
- `cancelar`: `@RequestParam String motivoCancelacion` → `@Valid @RequestBody CancelarEventoRequest`
- `registrarSaldo`: `@RequestParam` → `@Valid @RequestBody RegistrarSaldoRequest`
- Usa `mapper::toResponse` en lugar del método privado `toResponse`
- Usa `SortUtils.parsearSort` en lugar del bloque manual
- Extrae `usuarioActual()` como método privado reutilizable
- Elimina imports no utilizados (`Map`, `BigDecimal`, `ExtraPaquete`, etc.)

### `ConfirmarEventoRequest.java`
- Campo `medioPago`: añadido `@NotBlank` + `@Pattern(regexp = "EFECTIVO|YAPE|TRANSFERENCIA|TARJETA")`

### `ContratoController.java` (reescrito)
- Inyecta `ContratoResponseMapper`, `ReemplazarContratoUseCase`, `SortUtils`
- Usa `mapper::toResponse` en lugar del método privado `toResponse` con 40 líneas
- Usa `SortUtils.parsearSort` para parsear el parámetro `sort`
- Endpoint `generar`: `@RequestBody(required = false)` — el body es opcional (el admin puede crear un contrato vacío)
- Nuevo endpoint: `POST /api/v1/contratos/{idContrato}/reemplazar`
- Extrae `usuarioActual()` como método privado

### `ContratoService.java`
- Añadido `implements ReemplazarContratoUseCase`
- `porId()` y `porEvento()`: cambiados de `readOnly = true` a `@Transactional` y aplican lazy VENCIDO
- Nuevo método privado `aplicarVencimientoSiCorresponde(Contrato)`: si el contrato no es terminal, no está vencido, y la fecha del evento ya pasó → lo persiste como VENCIDO
- Nuevo método público `reemplazar(Long, UUID)`: archiva el contrato actual + crea BORRADOR vacío para el mismo evento
- `toQuery()`: añade `.esEditable(c.getEstado().esEditable())`
- `ejecutar(GenerarContratoCommand)`: descripción de actividad adaptada para plantilla nula

### `GenerarContratoCommand.java`
- Eliminadas anotaciones `@NotBlank` de `contenidoTexto` y `plantilla` (ambos son opcionales ahora que las plantillas se eliminaron)

### `GenerarContratoRequest.java`
- Eliminadas anotaciones `@NotBlank` de ambos campos
- Eliminado import de `jakarta.validation.constraints.NotBlank`

### `ContratoQuery.java`
- Añadido campo `boolean esEditable`

### `ContratoResponse.java`
- Añadido campo `boolean esEditable` (posicionado después de `estado`)

### `ContratoJpaRepository.java`
- `findByEventoPrivado_Id` → `findFirstByEventoPrivado_IdOrderByIdDesc`: necesario para soportar múltiples contratos por evento (el `reemplazar` archiva el actual y crea uno nuevo para el mismo `idEventoPrivado`)

### `ContratoPersistenceAdapter.java`
- `findByEventoPrivado`: actualizado para llamar a `findFirstByEventoPrivado_IdOrderByIdDesc`

---

## Endpoints nuevos

| Método | Ruta | Autorización | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/config/medios-pago` | pública | Lista de medios de pago disponibles |
| `POST` | `/api/v1/contratos/{id}/reemplazar` | `evento.contrato` | Archiva el contrato actual y crea uno nuevo en BORRADOR para el mismo evento |

## Endpoints modificados

| Método | Ruta | Cambio |
|---|---|---|
| `POST` | `/api/v1/eventos-privados/{id}/cancelar` | Body: `{ "motivo": "..." }` (antes era `?motivoCancelacion=`) |
| `POST` | `/api/v1/eventos-privados/{id}/registrar-saldo` | Body: `{ "monto": ..., "medioPago": "..." }` (antes era query params) |
| `POST` | `/api/v1/contratos/eventos/{idEvento}` | Body opcional; `plantilla` ya no es requerido |

---

## Decisiones técnicas tomadas

1. **`findFirstByEventoPrivado_IdOrderByIdDesc`**: Spring Data JPA lanzaría `IncorrectResultSizeDataAccessException` si dos contratos apuntan al mismo evento. Al ordenar por `id DESC` y tomar el primero, el endpoint `GET /contratos/eventos/{idEvento}` siempre devuelve el contrato más reciente (el nuevo BORRADOR post-reemplazar).

2. **`reemplazar` crea directamente via `contratoRepository.save()`**: se evita pasar por `GenerarContratoUseCase.ejecutar()` que tiene el guard `existsByEventoPrivado`. Esto permite crear el nuevo contrato sin conflicto, ya que la validación original no aplica al reemplazo.

3. **`@Transactional` en `porId` y `porEvento`**: necesario para que el flush del estado VENCIDO ocurra dentro de la misma transacción que la lectura.

4. **`medioPago` en `ConfirmarEventoRequest` y `RegistrarSaldoRequest` como `@Pattern`**: la validación queda en la capa de entrada (request), no en el servicio, consistente con el patrón del proyecto.

---

## Próximo paso

Fase 2: capa de datos del frontend (`features/admin/eventos` y `features/admin/contratos`).
Requiere aprobación antes de continuar.
