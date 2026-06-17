# Inventario Exhaustivo: Tipos TypeScript vs Contratos Backend

> Generado: 2026-06-14. Solo lectura — no se modificó ningún archivo.

---

## A. RESERVAS

**Frontend:** `src/types/reserva.types.ts` → `Reserva`  
**Backend:** `ReservaPublicaResponse.java`

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| idCliente | number | idCliente | Long | OK |
| nombreCliente | string? | nombreCliente | String | OK |
| correoCliente | string? | correoCliente | String | OK |
| idSede | number | idSede | Long | OK |
| nombreSede | string? | nombreSede | String | OK |
| estado | EstadoReserva | estado | String | OK |
| canalReserva | string | canalReserva | String | OK |
| tipoDia | string | tipoDia | String | OK |
| fechaEvento | string | fechaEvento | LocalDate | OK |
| numeroTicket | string | numeroTicket | String | OK |
| precioHistorico | number | precioHistorico | BigDecimal | OK |
| descuentoAplicado | number | descuentoAplicado | BigDecimal | OK |
| totalPagado | number | totalPagado | BigDecimal | OK |
| nombreNino | string | nombreNino | String | OK |
| edadNino | number | edadNino | int | OK |
| nombreAcompanante | string | nombreAcompanante | String | OK |
| dniAcompanante | string? | dniAcompanante | String | OK |
| firmoConsentimiento | boolean | firmoConsentimiento | boolean | OK |
| esReprogramacion | boolean | esReprogramacion | boolean | OK |
| vecesReprogramada | number | vecesReprogramada | int | OK |
| ingresado | boolean | ingresado | boolean | OK |
| fechaIngreso | string? | fechaIngreso | OffsetDateTime | OK |
| codigoQr | string? | codigoQr | String | OK |
| medioPago | MedioPago\|string? | medioPago | String | OK |
| fechaCreacion | string | fechaCreacion | OffsetDateTime | OK |
| **motivoCancelacion** | string? | — | — | **OBSOLETO** |
| **turno** | 'T1'\|'T2'? | — | — | **OBSOLETO** |
| **referenciaPago** | string? | — | — | **OBSOLETO** |

---

## B. EVENTOS PRIVADOS

**Frontend:** `src/types/evento.types.ts` → `EventoPrivado`  
**Backend:** `EventoPrivadoResponse.java`

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| idCliente | number | idCliente | Long | OK |
| nombreCliente | string | nombreCliente | String | OK |
| correoCliente | string? | correoCliente | String | OK |
| telefonoCliente | string? | telefonoCliente | String | OK |
| idSede | number | idSede | Long | OK |
| estado | EstadoEvento | estado | String | OK |
| idTurno | number | idTurno | Long | OK |
| turno | string | turno | String | OK |
| horaInicio | string | horaInicio | String | OK |
| horaFin | string | horaFin | String | OK |
| fechaEvento | string | fechaEvento | LocalDate | OK |
| tipoEvento | string | tipoEvento | String | OK |
| contactoAdicional | string? | contactoAdicional | String | OK |
| aforoDeclarado | number? | aforoDeclarado | Integer | OK |
| precioTotalContrato | number? | precioTotalContrato | BigDecimal | OK |
| montoAdelanto | number? | montoAdelanto | BigDecimal | OK |
| montoSaldo | number? | montoSaldo | BigDecimal | OK |
| observaciones | string? | observaciones | String | OK |
| nombreNino | string? | nombreNino | String | OK |
| edadCumple | number? | edadCumple | Integer | OK |
| idPaquete | number? | idPaquete | Long | OK |
| usuarioGestor | string? | usuarioGestor | String | OK |
| estadoOperativo | string? | estadoOperativo | String | OK |
| checklistCompleto | boolean | checklistCompleto | boolean | OK |
| horaInicioReal | string? | horaInicioReal | OffsetDateTime | OK* |
| horaFinReal | string? | horaFinReal | OffsetDateTime | OK* |
| extras | EventoExtra[]? | extras | List\<EventoExtraQuery\> | OK |
| fechaCreacion | string | fechaCreacion | OffsetDateTime | OK |
| **medioPagoAdelanto** | string? | — | — | **OBSOLETO** |
| **notasInternas** | string? | — | — | **OBSOLETO** |
| checklist | ChecklistItem[]? | — | — | No en response (endpoint propio) |
| — | — | **descripcionPersonalizada** | String | **FALTA** |
| — | — | **presupuestoEstimado** | BigDecimal | **FALTA** |
| — | — | **esCotizacionPersonalizada** | boolean | **FALTA** |
| — | — | **medioPago** | String | **FALTA** |

> \* `horaInicioReal` / `horaFinReal`: el backend devuelve `OffsetDateTime` (ISO-8601 con timezone), mientras que `horaInicio` / `horaFin` son `String` simples ("HH:mm"). El tipo `string` del frontend es compatible pero el formato es diferente.

---

## C. CLIENTES

**Frontend:** `src/types/cliente.types.ts` → `Cliente`  
**Backend:** `ClientePerfilResponse.java`

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| tipoDocumentoCodigo | string | tipoDocumentoCodigo | String | OK |
| numeroDocumento | string | numeroDocumento | String | OK |
| nombres | string | nombres | String | OK |
| apellidoPaterno | string? | apellidoPaterno | String | OK |
| apellidoMaterno | string? | apellidoMaterno | String | OK |
| nombreCompleto | string | nombreCompleto | String | OK |
| correo | string? | correo | String | OK |
| telefono | string? | telefono | String | OK |
| esVip | boolean | esVip | boolean | OK |
| descuentoVip | number? | descuentoVip | BigDecimal | OK |
| contadorVisitas | number | contadorVisitas | int | OK |
| ultimaVisitaAt | string? | ultimaVisitaAt | OffsetDateTime | OK |
| totalGastado | number | totalGastado | BigDecimal | OK |
| segmentoCodigo | SegmentoCliente | segmentoCodigo | String | OK |
| origen | OrigenCliente | origen | String | OK |
| aceptaComunicaciones | boolean | aceptaComunicaciones | boolean | OK |
| creadoEn | string | creadoEn | OffsetDateTime | OK |

Sin inconsistencias.

---

## D. VENTA PRESENCIAL (POS)

**Frontend:** `src/types/ventaPresencial.types.ts`  
**Backend:** `VentaMostradorResponse.java`, `TicketDetalleResponse.java`

### D1. VentaMostradorResponse

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| ventaId | number | ventaId | Long | OK |
| sedeId | number | sedeId | Long | OK |
| fechaVisita | string | fechaVisita | LocalDate | OK |
| subtotal | number | subtotal | BigDecimal | OK |
| descuento | number | descuento | BigDecimal | OK |
| total | number | total | BigDecimal | OK |
| efectivoRecibido | number | efectivoRecibido | BigDecimal | OK |
| vuelto | number | vuelto | BigDecimal | OK |
| createdAt | string | createdAt | OffsetDateTime | OK |
| tickets | TicketResumen[] | tickets | List\<TicketResponse\> | OK |
| pagos | PagoResumen[] | pagos | List\<PagoResponse\> | OK |

### D2. TicketResumen (inner)

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| reservaId | number | reservaId | Long | OK |
| numeroTicket | string | numeroTicket | String | OK |
| nombreNino | string | nombreNino | String | OK |
| edadNino | number | edadNino | int | OK |
| codigoQr | string? | codigoQr | String | OK |

### D3. TicketDetalle

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| idReserva | number | idReserva | Long | OK |
| numeroTicket | string | numeroTicket | String | OK |
| estado | string | estado | String | OK |
| yaIngreso | boolean | yaIngreso | boolean | OK |
| fechaIngreso | string? | fechaIngreso | OffsetDateTime | OK |
| fechaVisita | string | fechaVisita | LocalDate | OK |
| esHoy | boolean | esHoy | boolean | OK |
| nombreNino | string | nombreNino | String | OK |
| edadNino | number | edadNino | int | OK |
| nombreAcompanante | string | nombreAcompanante | String | OK |
| dniAcompanante | string | dniAcompanante | String | OK |
| montoPagado | number | montoPagado | BigDecimal | OK |
| estadoPago | string | estadoPago | String | OK |
| codigoQr | string? | codigoQr | String | OK |

Sin inconsistencias en POS.

---

## E. FINANZAS

**Frontend:** `src/types/finanzas.types.ts`  
**Backend:** `AperturaCajaResponse.java`, `MovimientoCajaResponse.java`, `PresupuestoEventoResponse.java`, `ResumenEventoFinancieroResponse.java`, etc.

### E1. AperturaCaja

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| idSede | number | idSede | Long | OK |
| fecha | string | fecha | LocalDate | OK |
| saldoInicial | number | saldoInicial | BigDecimal | OK |
| saldoFinal | number? | saldoFinal | BigDecimal | OK |
| totalIngresos | number | totalIngresos | BigDecimal | OK |
| totalEgresos | number | totalEgresos | BigDecimal | OK |
| estado | EstadoCaja | estado | EstadoCaja | OK |
| **idUsuarioApertura** | **number** | **idUsuarioApertura** | **UUID** | **CRITICO** |
| **idUsuarioCierre** | **number?** | **idUsuarioCierre** | **UUID** | **CRITICO** |
| fechaApertura | string | fechaApertura | OffsetDateTime | OK |
| fechaCierre | string? | fechaCierre | OffsetDateTime | OK |
| observaciones | string? | observaciones | String | OK |
| **fechaCreacion** | string | — | — | **OBSOLETO** |

### E2. MovimientoCaja

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| idAperturaCaja | number | idAperturaCaja | Long | OK |
| tipo | TipoMovimientoCaja | tipo | TipoMovimientoCaja | OK |
| concepto | string | concepto | String | OK |
| monto | number | monto | BigDecimal | OK |
| medioPago | string? | medioPago | String | OK |
| idRegistroIngreso | number? | idRegistroIngreso | Long | OK |
| idRegistroEgreso | number? | idRegistroEgreso | Long | OK |
| **idReservaPublica** | **number?** | — | — | **OBSOLETO** |
| **idUsuarioRegistra** | **number** | — | — | **OBSOLETO** |
| esManual | boolean | esManual | boolean | OK |
| fechaCreacion | string | fechaCreacion | OffsetDateTime | OK |
| — | — | **idVenta** | **Long** | **FALTA** |

### E3. PresupuestoEvento

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| idEventoPrivado | number | idEventoPrivado | Long | OK |
| concepto | string | concepto | String | OK |
| categoria | string | categoria | String | OK |
| montoEstimado | number | montoEstimado | BigDecimal | OK |
| montoReal | number? | montoReal | BigDecimal | OK |
| estado | EstadoPresupuesto | estado | EstadoPresupuesto | OK |
| **idUsuarioRegistra** | **number** | — | — | **OBSOLETO** |
| fechaCreacion | string | fechaCreacion | OffsetDateTime | OK |
| fechaActualizacion | string? | fechaActualizacion | OffsetDateTime | OK |

### E4. ResumenEventoFinanciero

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| idEvento | number | idEvento | Long | OK |
| tipoEvento | string | tipoEvento | String | OK |
| nombreCliente | string | nombreCliente | String | OK |
| fechaEvento | string | fechaEvento | LocalDate | OK |
| ingresoContrato | number | ingresoContrato | BigDecimal | OK |
| montoAdelanto | number | montoAdelanto | BigDecimal | OK |
| **totalGastosProveedores** | **number** | — | — | **OBSOLETO** |
| totalGastosAdicionales | number | totalGastosAdicionales | BigDecimal | OK |
| totalGastos | number | totalGastos | BigDecimal | OK |
| utilidadBruta | number | utilidadBruta | BigDecimal | OK |

### E5. ResumenFinanciero, ResumenDiario, ResumenRango, MetricasReservas, DashboardFinanciero

Sin inconsistencias. Todos los campos numéricos son `BigDecimal` → `number` y las fechas `OffsetDateTime`/`LocalDate` → `string`, compatibles en runtime.

---

## F. MARKETING

**Frontend:** `src/types/marketing.types.ts`  
**Backend:** `CampanaEmailQuery.java`, `PlantillaEmailQuery.java`, `TipoEmailQuery.java`, `EnvioEmailQuery.java`

### F1. CampanaEmail

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| nombre | string | nombre | String | OK |
| descripcion | string? | descripcion | String | OK |
| idPlantillaEmail | number | idPlantillaEmail | Long | OK |
| plantillaNombre | string | plantillaNombre | String | OK |
| estado | EstadoCampana | estado | String | OK |
| fechaProgramada | string? | fechaProgramada | Instant | OK |
| totalDestinatarios | number | totalDestinatarios | int | OK |
| totalEnviados | number | totalEnviados | int | OK |
| totalFallidos | number | totalFallidos | int | OK |
| **idUsuarioCreador** | **number\|null?** | **createdBy** | **UUID** | **CRITICO** (nombre Y tipo) |
| fechaCreacion | string | fechaCreacion | Instant | OK |

### F2. TipoEmail, PlantillaEmail, EnvioEmail

Sin inconsistencias.

---

## G. CMS

**Frontend:** `src/types/cms.types.ts`  
**Backend:** `SeccionWebQuery.java`, `ContenidoWebResponse.java`

### G1. SeccionWeb

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| **id** | **number** | — | — | **CRITICO** — no existe en backend |
| codigo | string | codigo | String | OK |
| nombre | string | nombre | String | OK |
| descripcion | string? | descripcion | String | OK |
| **ordenVisualizacion** | number | **orden** | int | **NOMBRE INCORRECTO** |
| **visible** | boolean | — | — | **OBSOLETO** — backend tiene `activo` |
| — | — | **activo** | boolean | **FALTA** |
| — | — | **esSistema** | boolean | **FALTA** |

### G2. ContenidoWeb

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| **idSeccion** | **number** | **seccionCodigo** | **String** | **CRITICO** (nombre Y tipo) |
| **idTipoContenido** | **number?** | **tipoContenidoCodigo** | **String** | **CRITICO** (nombre Y tipo) |
| clave | string | clave | String | OK |
| valorEs | string | valorEs | String | OK |
| valorEn | string? | valorEn | String | OK |
| imagenUrl | string? | imagenUrl | String | OK |
| descripcion | string? | descripcion | String | OK |
| ordenVisualizacion | number | ordenVisualizacion | int | OK |
| visible | boolean | visible | boolean | OK |
| version | number | version | int | OK |
| metadatos | string? | metadatos | String | OK |
| activo | boolean | activo | boolean | OK |
| fechaActualizacion | string | fechaActualizacion | OffsetDateTime | OK |

---

## H. BANNERS

**Frontend:** `src/types/banner.types.ts` → `Banner`  
**Backend:** `BannerQuery.java`

Todos los campos coinciden. Sin inconsistencias.

---

## I. COMERCIAL

**Frontend:** `src/types/comercial.types.ts` — `PaqueteEvento`, `ZonaJuego`, `ActividadLocal`, `NovedadLocal`

Sin inconsistencias con sus respectivos `Response.java`. Los arrays `imagenes: string[]` y `videos: string[]` de `ZonaJuego` se mapean correctamente a `List<String>` en el backend.

---

### I1. Promocion

**Frontend:** `src/services/promocion.service.ts` → `Promocion`  
**Backend:** `PromocionResponse.java`

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| tipoPromocion | string | tipoPromocion | String | OK |
| idSede | number? | idSede | Long | OK |
| nombre | string | nombre | String | OK |
| descripcion | string? | descripcion | String | OK |
| valorDescuento | number | valorDescuento | BigDecimal | OK |
| minimoPersonas | number? | minimoPersonas | Integer | OK |
| soloTipoDia | string? | soloTipoDia | String | OK |
| fechaInicio | string | fechaInicio | LocalDate | OK |
| fechaFin | string? | fechaFin | LocalDate | OK |
| activo | boolean | activo | boolean | OK |
| esAutomatica | boolean | esAutomatica | boolean | OK |
| fechaCreacion | string | fechaCreacion | OffsetDateTime | OK |
| prioridad | number | prioridad | int | OK |
| limiteUsos | number? | limiteUsos | Integer | OK |
| limitePorCliente | number? | limitePorCliente | Integer | OK |
| montoMinimo | number? | montoMinimo | BigDecimal | OK |
| imagenUrl | string? | imagenUrl | String | OK |
| bannerUrl | string? | bannerUrl | String | OK |
| colorDestacado | string? | colorDestacado | String | OK |
| textoPublicitario | string? | textoPublicitario | String | OK |
| textoBoton | string? | textoBoton | String | OK |
| urlBoton | string? | urlBoton | String | OK |
| mostrarEnInicio | boolean | mostrarEnInicio | boolean | OK |
| mostrarEnCarrusel | boolean | mostrarEnCarrusel | boolean | OK |
| mostrarEnPaginaPromociones | boolean | mostrarEnPaginaPromociones | boolean | OK |
| mostrarEnCheckout | boolean | mostrarEnCheckout | boolean | OK |
| soloMovil | boolean | soloMovil | boolean | OK |
| vecesUsado | number | vecesUsado | int | OK |
| montoAhorrado | number | montoAhorrado | BigDecimal | OK |
| clientesAtraidos | number | clientesAtraidos | int | OK |
| **condicion** | string? | — | — | **OBSOLETO** |
| **minimoAsistentes** | number? | — | — | **OBSOLETO** (backend usa `minimoPersonas`) |
| **mostrarDestacado** | boolean | — | — | **OBSOLETO** |

---

## J. CONTRATO

**Frontend:** `src/types/contrato.types.ts` → `Contrato`  
**Backend:** `ContratoResponse.java`

Todos los campos coinciden. Sub-tipos `DocumentoContrato` y `ActividadContrato` también coinciden.

**Inconsistencia interna frontend:**

`EstadoContrato` en `src/types/enums.ts`:
```
enum EstadoContrato { BORRADOR = 'BORRADOR', FIRMADO = 'FIRMADO' }
```
Solo 2 valores — **INCOMPLETO**. El tipo correcto completo está en `contrato.types.ts`:
```
'BORRADOR' | 'ENVIADO' | 'PENDIENTE_FIRMA' | 'FIRMADO' | 'VENCIDO' | 'CANCELADO' | 'ARCHIVADO'
```

---

## K. DASHBOARD ADMIN

**Frontend:** `src/types/dashboard.types.ts` → `DashboardAdmin`  
**Backend:** `DashboardAdminResponse.java`

Todos los campos coinciden incluyendo sub-tipos `AgendaReserva` (con `edadNino`), `AgendaEvento`, `ReservasDia`, `DisponibilidadDia`.

---

## L. CALENDARIO

**Frontend:** `src/types/calendario.types.ts` → `ResumenDia`  
**Backend:** `ResumenDiaResponse.java`

Todos los campos coinciden. Sub-tipos `ResumenTurno`, `ResumenReserva`, `ResumenEvento`, `AlertaDia` también coinciden.

---

## M. CMS ADICIONAL

### M1. Reseñas

**Frontend:** `src/types/resena.types.ts` → `Resena`  
**Backend:** `ResenaResponse.java`

Todos los campos coinciden.

### M2. Contenido Legal

**Frontend:** `src/types/legal.types.ts` → `ContenidoLegal`  
**Backend:** `ContenidoLegalQuery.java`

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| tipo | string | tipo | String | OK |
| titulo | string | titulo | String | OK |
| contenido | string | contenido | String | OK |
| version | number | version | int | OK |
| activo | boolean | activo | boolean | OK |
| **idUsuarioEditor** | **number?** | — | — | **OBSOLETO** |
| **nombreEditor** | **string?** | — | — | **OBSOLETO** |
| fechaActualizacion | string? | fechaActualizacion | OffsetDateTime | OK |

### M3. FAQs

**Frontend:** `src/types/faq.types.ts` → `Faq`  
**Backend:** `FaqQuery.java`

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| pregunta | string | pregunta | String | OK |
| respuesta | string | respuesta | String | OK |
| ordenVisualizacion | number | ordenVisualizacion | int | OK |
| visible | boolean | visible | boolean | OK |
| **idUsuarioEditor** | **number?** | — | — | **OBSOLETO** |
| fechaActualizacion | string? | fechaActualizacion | OffsetDateTime | OK |

### M4. Configuracion Publica

**Frontend:** `src/types/configuracion-publica.types.ts` → `ConfiguracionPublica`  
**Backend:** `ConfiguracionPublicaQuery.java`

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| **id** | **number** | — | — | **CRITICO** — singleton, no tiene id |
| nombreNegocio | string | nombreNegocio | String | OK |
| slogan | string? | slogan | String | OK |
| **logoUrl** | string? | **logoPath** | String | **NOMBRE INCORRECTO** |
| **faviconUrl** | string? | **faviconPath** | String | **NOMBRE INCORRECTO** |
| telefono | string? | telefono | String | OK |
| telefonoSecundario | string? | telefonoSecundario | String | OK |
| whatsapp | string? | whatsapp | String | OK |
| correo | string? | correo | String | OK |
| correoSecundario | string? | correoSecundario | String | OK |
| direccion | string? | direccion | String | OK |
| googleMapsUrl | string? | googleMapsUrl | String | OK |
| horarioSemana | string? | horarioSemana | String | OK |
| **horarioFinDeSemana** | string? | **horarioFinSemana** | String | **NOMBRE INCORRECTO** |
| facebookUrl | string? | facebookUrl | String | OK |
| instagramUrl | string? | instagramUrl | String | OK |
| tiktokUrl | string? | tiktokUrl | String | OK |
| youtubeUrl | string? | youtubeUrl | String | OK |
| metaTitle | string? | metaTitle | String | OK |
| metaDescription | string? | metaDescription | String | OK |
| metaKeywords | string? | metaKeywords | String | OK |
| openGraphTitle | string? | openGraphTitle | String | OK |
| openGraphDescription | string? | openGraphDescription | String | OK |
| **openGraphImageUrl** | string? | **openGraphImagePath** | String | **NOMBRE INCORRECTO** |
| googleAnalyticsId | string? | googleAnalyticsId | String | OK |
| metaPixelId | string? | metaPixelId | String | OK |
| **mantenimientoActivo** | boolean | **esMantenimientoActivo** | boolean | **NOMBRE INCORRECTO** |
| mensajeMantenimiento | string? | mensajeMantenimiento | String | OK |
| colorTema | string? | colorTema | String | OK |
| colorSecundario | string? | colorSecundario | String | OK |
| copyrightTexto | string? | copyrightTexto | String | OK |
| — | — | **updatedAt** | OffsetDateTime | **FALTA** |

---

## N. PAGOS

**Frontend:** `src/types/pago.types.ts` → `Pago`  
**Backend:** `PagoResponse.java`

Todos los campos coinciden.

---

## O. AUDITORIA

**Frontend:** `src/types/auditoria.types.ts` → `LogAuditoria`  
**Backend:** `LogAuditoriaResponse.java`

| Campo frontend | Tipo TS | Campo backend | Tipo Java | Estado |
|---|---|---|---|---|
| id | number | id | Long | OK |
| **idUsuarioAdmin** | **number?** | **idUsuarioAdmin** | **UUID** | **CRITICO** |
| nombreUsuario | string? | nombreUsuario | String | OK |
| accion | string | accion | String | OK |
| modulo | string | modulo | String | OK |
| entidadAfectada | string | entidadAfectada | String | OK |
| idEntidad | number? | idEntidad | Long | OK |
| descripcion | string? | descripcion | String | OK |
| ipOrigen | string? | ipOrigen | String | OK |
| userAgent | string? | userAgent | String | OK |
| valorAnterior | string? | valorAnterior | String | OK |
| valorNuevo | string? | valorNuevo | String | OK |
| nivel | NivelAuditoria | nivel | String | OK |
| resultado | ResultadoAuditoria | resultado | String | OK |
| fechaLog | string | fechaLog | OffsetDateTime | OK |

---

## Resumen Consolidado de Inconsistencias

### CRITICO — Tipo incompatible, rompe en runtime

| # | Archivo | Campo | Tipo TS | Tipo Java | Impacto |
|---|---|---|---|---|---|
| 1 | `finanzas.types.ts` | `AperturaCaja.idUsuarioApertura` | `number` | `UUID` | Caja falla al tratar el UUID como numero |
| 2 | `finanzas.types.ts` | `AperturaCaja.idUsuarioCierre` | `number?` | `UUID` | Idem |
| 3 | `marketing.types.ts` | `CampanaEmail.idUsuarioCreador` | `number\|null?` | `createdBy: UUID` | Nombre de campo Y tipo incorrectos |
| 4 | `cms.types.ts` | `ContenidoWeb.idSeccion` | `number` | `seccionCodigo: String` | Nombre y tipo incorrectos — filtros y joins rotos |
| 5 | `cms.types.ts` | `ContenidoWeb.idTipoContenido` | `number?` | `tipoContenidoCodigo: String` | Nombre y tipo incorrectos |
| 6 | `cms.types.ts` | `SeccionWeb.id` | `number` | — (no existe) | `SeccionWeb` usa `codigo: string` como PK |
| 7 | `auditoria.types.ts` | `LogAuditoria.idUsuarioAdmin` | `number?` | `UUID` | Filtros de auditoria por usuario rompen |
| 8 | `configuracion-publica.types.ts` | `ConfiguracionPublica.id` | `number` | — (no existe) | Singleton sin id |

### NOMBRE INCORRECTO — El backend no responde al campo esperado

| # | Archivo | Campo frontend | Campo backend |
|---|---|---|---|
| 1 | `cms.types.ts` | `SeccionWeb.ordenVisualizacion` | `orden` |
| 2 | `cms.types.ts` | `SeccionWeb.visible` | `activo` |
| 3 | `configuracion-publica.types.ts` | `ConfiguracionPublica.logoUrl` | `logoPath` |
| 4 | `configuracion-publica.types.ts` | `ConfiguracionPublica.faviconUrl` | `faviconPath` |
| 5 | `configuracion-publica.types.ts` | `ConfiguracionPublica.openGraphImageUrl` | `openGraphImagePath` |
| 6 | `configuracion-publica.types.ts` | `ConfiguracionPublica.horarioFinDeSemana` | `horarioFinSemana` |
| 7 | `configuracion-publica.types.ts` | `ConfiguracionPublica.mantenimientoActivo` | `esMantenimientoActivo` |

### OBSOLETO — Campo en frontend que el backend ya no envia

| # | Archivo | Campo |
|---|---|---|
| 1 | `evento.types.ts` | `EventoPrivado.medioPagoAdelanto` — renombrado a `medioPago` |
| 2 | `evento.types.ts` | `EventoPrivado.notasInternas` — eliminado |
| 3 | `finanzas.types.ts` | `MovimientoCaja.idReservaPublica` — reemplazado por `idVenta` |
| 4 | `finanzas.types.ts` | `MovimientoCaja.idUsuarioRegistra` — eliminado |
| 5 | `finanzas.types.ts` | `ResumenEventoFinanciero.totalGastosProveedores` — eliminado |
| 6 | `finanzas.types.ts` | `AperturaCaja.fechaCreacion` — no existe en `AperturaCajaResponse` |
| 7 | `finanzas.types.ts` | `PresupuestoEvento.idUsuarioRegistra` — no existe en `PresupuestoEventoResponse` |
| 8 | `reserva.types.ts` | `Reserva.motivoCancelacion` — no en response |
| 9 | `reserva.types.ts` | `Reserva.turno` — no en response |
| 10 | `reserva.types.ts` | `Reserva.referenciaPago` — no en response |
| 11 | `legal.types.ts` | `ContenidoLegal.idUsuarioEditor` — no en backend query |
| 12 | `legal.types.ts` | `ContenidoLegal.nombreEditor` — no en backend query |
| 13 | `faq.types.ts` | `Faq.idUsuarioEditor` — no en backend query |
| 14 | `cms.types.ts` | `SeccionWeb.visible` — backend tiene `activo` |
| 15 | `promocion.service.ts` | `Promocion.condicion` — no en backend |
| 16 | `promocion.service.ts` | `Promocion.minimoAsistentes` — backend usa `minimoPersonas` |
| 17 | `promocion.service.ts` | `Promocion.mostrarDestacado` — no en backend |

### FALTA — Campo del backend sin tipo en el frontend

| # | Archivo a corregir | Campo backend | Tipo Java |
|---|---|---|---|
| 1 | `evento.types.ts` | `EventoPrivado.descripcionPersonalizada` | String |
| 2 | `evento.types.ts` | `EventoPrivado.presupuestoEstimado` | BigDecimal |
| 3 | `evento.types.ts` | `EventoPrivado.esCotizacionPersonalizada` | boolean |
| 4 | `evento.types.ts` | `EventoPrivado.medioPago` | String |
| 5 | `finanzas.types.ts` | `MovimientoCaja.idVenta` | Long |
| 6 | `cms.types.ts` | `SeccionWeb.esSistema` | boolean |
| 7 | `cms.types.ts` | `SeccionWeb.activo` | boolean |
| 8 | `configuracion-publica.types.ts` | `ConfiguracionPublica.updatedAt` | OffsetDateTime |

### INCONSISTENCIA INTERNA FRONTEND

| # | Archivo | Problema |
|---|---|---|
| 1 | `src/types/enums.ts` | `EstadoContrato` solo tiene `BORRADOR` y `FIRMADO`. El tipo correcto con 7 valores esta en `contrato.types.ts`. El enum de `enums.ts` esta incompleto y no se deberia usar para contratos. |
