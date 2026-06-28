# Reporte: Tipos de Notificaciones Completos + Estrategia de Retención

**Fecha:** 2026-06-27  
**Alcance:** Catálogo completo por rol, tipos sugeridos, política de limpieza de BD

---

## 1. Principio base: todas las notificaciones son del sistema

Ninguna notificación es creada manualmente por el admin. Todas las dispara el sistema automáticamente en respuesta a eventos de negocio (una reserva confirmada, un evento aprobado, una caja sin cerrar). El admin solo puede:

- Ver sus notificaciones IN_APP
- Marcarlas como leídas
- Configurar qué canales quiere (push, email) por tipo
- No recibe notificaciones de otro rol (un admin no ve las del cliente ni del cajero)

---

## 2. Notificaciones actuales (ya en seed)

| #   | Código                    | Destinatario | Prioridad | Canales                 | Disparador                          |
| --- | ------------------------- | ------------ | --------- | ----------------------- | ----------------------------------- |
| 1   | RESERVA_CONFIRMADA        | CLIENTE      | NORMAL    | IN_APP, EMAIL           | Sistema confirma reserva pública    |
| 2   | RESERVA_RECORDATORIO      | CLIENTE      | NORMAL    | EMAIL, WHATSAPP         | Job 24h antes de la visita          |
| 3   | RESERVA_CANCELADA         | CLIENTE      | NORMAL    | IN_APP, EMAIL           | Cliente o admin cancela             |
| 4   | RESERVA_YAPE_PENDIENTE    | ADMIN        | ALTA      | IN_APP                  | Cliente sube comprobante Yape       |
| 5   | EVENTO_SOLICITUD          | ADMIN        | ALTA      | IN_APP, EMAIL           | Cliente solicita evento privado     |
| 6   | EVENTO_CONTRATO_PENDIENTE | ADMIN        | CRITICA   | IN_APP, EMAIL           | Job: evento próximo sin contrato    |
| 7   | EVENTO_SALDO_PENDIENTE    | ADMIN        | ALTA      | IN_APP                  | Job: evento próximo con saldo       |
| 8   | EVENTO_CONFIRMADO         | CLIENTE      | NORMAL    | IN_APP, EMAIL           | Admin confirma el evento            |
| 9   | EVENTO_RECORDATORIO       | CLIENTE      | NORMAL    | IN_APP, EMAIL, WHATSAPP | Job: X días antes del evento        |
| 10  | CAJA_SIN_CERRAR           | ADMIN        | ALTA      | IN_APP                  | Job nocturno si caja sigue abierta  |
| 11  | CAJA_SIN_ABRIR            | CAJERO       | NORMAL    | IN_APP                  | Job matutino si caja no abrió       |
| 12  | AFORO_LIMITE              | ADMIN        | NORMAL    | IN_APP                  | Aforo >90% en fecha próxima         |
| 13  | RESENA_PENDIENTE          | ADMIN        | BAJA      | IN_APP                  | Nueva reseña del sitio público      |
| 14  | MENSAJE_NUEVO             | ADMIN        | NORMAL    | IN_APP, EMAIL           | Formulario de contacto enviado      |
| 15  | BIENVENIDA                | CLIENTE      | NORMAL    | EMAIL                   | Cliente crea cuenta                 |
| 16  | CUMPLEANOS_NINO           | CLIENTE      | NORMAL    | EMAIL                   | Job: cumpleaños del niño registrado |
| 17  | LOGIN_IP_NUEVA            | ADMIN        | CRITICA   | EMAIL                   | Login desde IP no reconocida        |

---

## 3. Notificaciones recomendadas para ADMIN

### 3.1 Módulo Reservas

| Código (nuevo)              | Nombre                        | Prioridad | Canales | Disparador                           |
| --------------------------- | ----------------------------- | --------- | ------- | ------------------------------------ |
| `RESERVA_NUEVA`             | Nueva reserva online          | NORMAL    | IN_APP  | Cliente hace una reserva pública     |
| `RESERVA_CANCELADA_CLIENTE` | Reserva cancelada por cliente | NORMAL    | IN_APP  | Cliente cancela desde su portal      |
| `RESERVA_PAGO_VERIFICADO`   | Pago Yape verificado          | NORMAL    | IN_APP  | Admin aprueba el comprobante Yape    |
| `RESERVA_PAGO_RECHAZADO`    | Pago Yape rechazado           | NORMAL    | IN_APP  | Admin rechaza el comprobante Yape    |
| `AFORO_AGOTADO`             | Aforo agotado                 | ALTA      | IN_APP  | Última reserva llena el cupo del día |

> Actualmente `RESERVA_YAPE_PENDIENTE` existe, pero no hay notificación cuando llega una reserva normal (sin Yape). El admin no sabe que llegó una reserva nueva a menos que refresque la pantalla.

### 3.2 Módulo Eventos Privados

| Código (nuevo)                  | Nombre                        | Prioridad | Canales       | Disparador                                      |
| ------------------------------- | ----------------------------- | --------- | ------------- | ----------------------------------------------- |
| `EVENTO_PRESUPUESTO_SOLICITADO` | Cotización solicitada         | ALTA      | IN_APP, EMAIL | Cliente pide cotización desde el sitio          |
| `EVENTO_ADELANTO_RECIBIDO`      | Adelanto recibido             | NORMAL    | IN_APP        | Se registra pago de adelanto del evento         |
| `EVENTO_SALDO_RECIBIDO`         | Saldo final recibido          | NORMAL    | IN_APP        | Se registra pago del saldo del evento           |
| `EVENTO_CANCELADO_CLIENTE`      | Evento cancelado por cliente  | ALTA      | IN_APP, EMAIL | Cliente solicita cancelación                    |
| `EVENTO_CHECKLIST_INCOMPLETO`   | Checklist incompleto          | ALTA      | IN_APP        | Job: evento en <48h con checklist sin completar |
| `CONTRATO_FIRMADO`              | Contrato firmado              | NORMAL    | IN_APP        | Cliente firma contrato digital                  |
| `CONTRATO_VENCIDO_SIN_FIRMA`    | Contrato sin firmar (vencido) | CRITICA   | IN_APP, EMAIL | Job: contrato enviado hace >5 días sin firma    |
| `GASTO_EVENTO_REGISTRADO`       | Gasto de evento registrado    | BAJA      | IN_APP        | Se registra un gasto operativo del evento       |

### 3.3 Módulo Caja y Ventas

| Código (nuevo)             | Nombre                         | Prioridad | Canales       | Disparador                                    |
| -------------------------- | ------------------------------ | --------- | ------------- | --------------------------------------------- |
| `CAJA_CIERRE_DISCREPANCIA` | Discrepancia en cierre de caja | ALTA      | IN_APP, EMAIL | Diferencia entre monto esperado y contado     |
| `VENTA_MONTO_ALTO`         | Venta de monto elevado         | NORMAL    | IN_APP        | Venta en mostrador supera umbral configurable |
| `EGRESO_MONTO_ALTO`        | Egreso elevado registrado      | NORMAL    | IN_APP        | Egreso supera umbral configurable             |
| `RESUMEN_DIARIO_CAJA`      | Resumen diario de caja         | BAJA      | IN_APP, EMAIL | Job 22:00 con totales del día                 |

### 3.4 Módulo CMS / Marketing

| Código (nuevo)              | Nombre                       | Prioridad | Canales | Disparador                          |
| --------------------------- | ---------------------------- | --------- | ------- | ----------------------------------- |
| `NOVEDAD_PUBLICADA`         | Novedad publicada            | BAJA      | IN_APP  | Admin publica una novedad/blog      |
| `BANNER_EXPIRADO`           | Banner vencido               | BAJA      | IN_APP  | Job: banner llegó a su fecha de fin |
| `PROMOCION_NUEVA_ACTIVA`    | Promoción activada           | BAJA      | IN_APP  | Promoción entra en vigencia hoy     |
| `REPORTE_EXPORTACION_LISTA` | Exportación de reporte lista | BAJA      | IN_APP  | Reporte pesado terminó de generarse |

### 3.5 Módulo Clientes / Fidelización

| Código (nuevo)             | Nombre                   | Prioridad | Canales | Disparador                            |
| -------------------------- | ------------------------ | --------- | ------- | ------------------------------------- |
| `CLIENTE_NUEVO_REGISTRADO` | Nuevo cliente registrado | BAJA      | IN_APP  | Cliente crea cuenta en el portal      |
| `CLIENTE_SIN_ACTIVIDAD`    | Cliente sin actividad    | BAJA      | IN_APP  | Job: cliente sin reservas en >90 días |

### 3.6 Seguridad / Sistema

| Código (nuevo)           | Nombre                    | Prioridad | Canales       | Disparador                                      |
| ------------------------ | ------------------------- | --------- | ------------- | ----------------------------------------------- |
| `ADMIN_CUENTA_BLOQUEADA` | Cuenta de admin bloqueada | CRITICA   | IN_APP, EMAIL | Demasiados intentos de login fallidos           |
| `BACKUP_FALLIDO`         | Error en backup           | CRITICA   | EMAIL         | Job de backup no completó                       |
| `ERROR_ENVIO_EMAIL`      | Fallo en envío de email   | ALTA      | IN_APP        | Email de campaña o transaccional falló >3 veces |

---

## 4. Notificaciones recomendadas para CAJERO

| Código (nuevo)                  | Nombre                          | Prioridad | Canales | Disparador                                       |
| ------------------------------- | ------------------------------- | --------- | ------- | ------------------------------------------------ |
| `CAJA_SIN_ABRIR` _(ya existe)_  | Caja sin abrir                  | NORMAL    | IN_APP  | Job matutino                                     |
| `RESERVA_EN_CAJA_HOY`           | Reservas pendientes en caja hoy | BAJA      | IN_APP  | Job matutino: reservas con pago presencial       |
| `VENTA_ANULADA`                 | Venta anulada                   | NORMAL    | IN_APP  | Admin anula una venta del cajero                 |
| `DESCUENTO_REQUIERE_APROBACION` | Descuento requiere aprobación   | ALTA      | IN_APP  | Descuento solicitado supera límite del cajero    |
| `TURNO_POR_INICIAR`             | Turno por iniciar               | BAJA      | IN_APP  | Job: 30 min antes del inicio de turno del cajero |

---

## 5. Notificaciones recomendadas para CLIENTE

### 5.1 Reservas

| Código (nuevo)                       | Nombre              | Prioridad | Canales         | Disparador                                    |
| ------------------------------------ | ------------------- | --------- | --------------- | --------------------------------------------- |
| `RESERVA_CONFIRMADA` _(ya existe)_   | Reserva confirmada  | NORMAL    | IN_APP, EMAIL   | —                                             |
| `RESERVA_RECORDATORIO` _(ya existe)_ | Recordatorio visita | NORMAL    | EMAIL, WHATSAPP | —                                             |
| `RESERVA_CANCELADA` _(ya existe)_    | Reserva cancelada   | NORMAL    | IN_APP, EMAIL   | —                                             |
| `RESERVA_MODIFICADA`                 | Reserva modificada  | NORMAL    | IN_APP, EMAIL   | Admin modifica fecha/hora de la reserva       |
| `PAGO_CONFIRMADO`                    | Pago confirmado     | NORMAL    | IN_APP, EMAIL   | Admin aprueba Yape del cliente                |
| `PAGO_RECHAZADO`                     | Pago rechazado      | ALTA      | IN_APP, EMAIL   | Admin rechaza Yape — debe pagar de otra forma |
| `TICKET_DISPONIBLE`                  | Tickets disponibles | NORMAL    | IN_APP, EMAIL   | Ticket de entrada generado y listo            |

### 5.2 Eventos Privados

| Código (nuevo)                      | Nombre                         | Prioridad | Canales                 | Disparador                           |
| ----------------------------------- | ------------------------------ | --------- | ----------------------- | ------------------------------------ |
| `EVENTO_CONFIRMADO` _(ya existe)_   | Evento confirmado              | NORMAL    | IN_APP, EMAIL           | —                                    |
| `EVENTO_RECORDATORIO` _(ya existe)_ | Recordatorio evento            | NORMAL    | IN_APP, EMAIL, WHATSAPP | —                                    |
| `EVENTO_CONTRATO_LISTO`             | Contrato listo para firmar     | ALTA      | IN_APP, EMAIL           | Admin sube el contrato al sistema    |
| `EVENTO_PRESUPUESTO_ENVIADO`        | Presupuesto/cotización enviado | NORMAL    | IN_APP, EMAIL           | Admin envía la cotización al cliente |
| `EVENTO_CANCELADO_ADMIN`            | Evento cancelado por el local  | ALTA      | IN_APP, EMAIL           | Admin cancela el evento del cliente  |
| `EVENTO_RECORDATORIO_3DIAS`         | Recordatorio 3 días antes      | NORMAL    | IN_APP, EMAIL           | Job: 3 días antes del evento         |
| `PAGO_ADELANTO_CONFIRMADO`          | Adelanto confirmado            | NORMAL    | IN_APP, EMAIL           | Admin registra el adelanto recibido  |

### 5.3 Documentos y Comprobantes

| Código (nuevo)    | Nombre                 | Prioridad | Canales       | Disparador                             |
| ----------------- | ---------------------- | --------- | ------------- | -------------------------------------- |
| `DOCUMENTO_LISTO` | Comprobante disponible | BAJA      | IN_APP, EMAIL | Factura o boleta generada y disponible |

### 5.4 Fidelización y Marketing

| Código (nuevo)                  | Nombre                     | Prioridad | Canales       | Disparador                                |
| ------------------------------- | -------------------------- | --------- | ------------- | ----------------------------------------- |
| `PUNTOS_ACUMULADOS`             | Puntos acumulados          | BAJA      | IN_APP        | Después de cada compra/reserva con puntos |
| `PUNTOS_POR_VENCER`             | Puntos por vencer          | NORMAL    | IN_APP, EMAIL | Job: puntos expiran en <30 días           |
| `PROMOCION_EXCLUSIVA`           | Promoción especial para ti | BAJA      | IN_APP, EMAIL | Marketing segmentado activa una promo     |
| `CUMPLEANOS_NINO` _(ya existe)_ | Cumpleaños del niño        | NORMAL    | EMAIL         | —                                         |

### 5.5 Cuenta y Seguridad

| Código (nuevo)             | Nombre                       | Prioridad | Canales       | Disparador                            |
| -------------------------- | ---------------------------- | --------- | ------------- | ------------------------------------- |
| `BIENVENIDA` _(ya existe)_ | Bienvenida                   | NORMAL    | EMAIL         | —                                     |
| `PASSWORD_CAMBIADO`        | Contraseña cambiada          | CRITICA   | EMAIL         | El cliente cambió su contraseña       |
| `RESENA_RESPONDIDA`        | El local respondió tu reseña | BAJA      | IN_APP, EMAIL | Admin responde una reseña del cliente |

---

## 6. Catálogo completo con orden sugerido en BD

Este es el INSERT final para `V99_seed.sql` (incluye existentes + nuevos):

```sql
-- ADMIN: Reservas
('RESERVA_NUEVA',                'reserva', 'Nueva reserva online',          'Reserva pública recibida',                    'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 13),
('RESERVA_CANCELADA_CLIENTE',    'reserva', 'Reserva cancelada por cliente', 'Cliente canceló desde su portal',             'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 14),
('RESERVA_PAGO_VERIFICADO',      'reserva', 'Pago Yape verificado',          'Comprobante aprobado',                        'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 15),
('RESERVA_PAGO_RECHAZADO',       'reserva', 'Pago Yape rechazado',           'Comprobante inválido',                        'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 16),
('AFORO_AGOTADO',                'reserva', 'Aforo agotado',                 'Sin cupos disponibles para la fecha',         'ADMIN',   ARRAY['IN_APP'],             'ALTA',    TRUE, 17),

-- ADMIN: Eventos
('EVENTO_PRESUPUESTO_SOLICITADO','evento',  'Cotización solicitada',         'Cliente pidió cotización de evento',          'ADMIN',   ARRAY['IN_APP','EMAIL'],     'ALTA',    TRUE, 25),
('EVENTO_ADELANTO_RECIBIDO',     'evento',  'Adelanto recibido',             'Pago de adelanto registrado',                 'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 26),
('EVENTO_SALDO_RECIBIDO',        'evento',  'Saldo final recibido',          'Pago de saldo registrado',                    'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 27),
('EVENTO_CANCELADO_CLIENTE',     'evento',  'Evento cancelado por cliente',  'Cliente solicitó cancelación',                'ADMIN',   ARRAY['IN_APP','EMAIL'],     'ALTA',    TRUE, 28),
('EVENTO_CHECKLIST_INCOMPLETO',  'evento',  'Checklist incompleto',          'Evento próximo con checklist sin completar',  'ADMIN',   ARRAY['IN_APP'],             'ALTA',    TRUE, 29),
('CONTRATO_FIRMADO',             'evento',  'Contrato firmado',              'Cliente firmó el contrato digital',           'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 30),
('CONTRATO_VENCIDO_SIN_FIRMA',   'evento',  'Contrato sin firma vencido',    'Sin firma luego de 5 días de enviado',        'ADMIN',   ARRAY['IN_APP','EMAIL'],     'CRITICA', TRUE, 31),

-- ADMIN: Caja y ventas
('CAJA_CIERRE_DISCREPANCIA',     'caja',    'Discrepancia en cierre',        'Diferencia entre monto esperado y contado',   'ADMIN',   ARRAY['IN_APP','EMAIL'],     'ALTA',    TRUE, 35),
('VENTA_MONTO_ALTO',             'caja',    'Venta de monto elevado',        'Venta en mostrador supera umbral',            'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 36),
('EGRESO_MONTO_ALTO',            'caja',    'Egreso elevado',                'Egreso supera umbral configurable',           'ADMIN',   ARRAY['IN_APP'],             'NORMAL',  TRUE, 37),
('RESUMEN_DIARIO_CAJA',          'caja',    'Resumen diario',                'Totales del día al cierre',                   'ADMIN',   ARRAY['IN_APP','EMAIL'],     'BAJA',    TRUE, 38),

-- ADMIN: CMS / Marketing
('NOVEDAD_PUBLICADA',            'cms',     'Novedad publicada',             'Novedad publicada en el sitio',               'ADMIN',   ARRAY['IN_APP'],             'BAJA',    TRUE, 55),
('BANNER_EXPIRADO',              'cms',     'Banner vencido',                'Banner llegó a su fecha de fin',              'ADMIN',   ARRAY['IN_APP'],             'BAJA',    TRUE, 56),
('PROMOCION_NUEVA_ACTIVA',       'marketing','Promoción activada',           'Promoción entró en vigencia hoy',             'ADMIN',   ARRAY['IN_APP'],             'BAJA',    TRUE, 57),
('REPORTE_EXPORTACION_LISTA',    'sistema', 'Exportación lista',             'Reporte disponible para descargar',           'ADMIN',   ARRAY['IN_APP'],             'BAJA',    TRUE, 58),

-- ADMIN: Clientes
('CLIENTE_NUEVO_REGISTRADO',     'cliente', 'Nuevo cliente',                 'Nuevo cliente registrado en el portal',       'ADMIN',   ARRAY['IN_APP'],             'BAJA',    TRUE, 62),
('CLIENTE_SIN_ACTIVIDAD',        'cliente', 'Cliente inactivo',              'Sin reservas en más de 90 días',              'ADMIN',   ARRAY['IN_APP'],             'BAJA',    TRUE, 63),

-- ADMIN: Seguridad
('ADMIN_CUENTA_BLOQUEADA',       'sistema', 'Cuenta bloqueada',              'Demasiados intentos fallidos de login',       'ADMIN',   ARRAY['IN_APP','EMAIL'],     'CRITICA', TRUE, 72),
('ERROR_ENVIO_EMAIL',            'sistema', 'Fallo en envío de email',       'Email no pudo enviarse tras 3 intentos',      'ADMIN',   ARRAY['IN_APP'],             'ALTA',    TRUE, 73),

-- CAJERO
('RESERVA_EN_CAJA_HOY',          'caja',    'Reservas en caja hoy',          'Reservas con pago presencial pendiente',      'CAJERO',  ARRAY['IN_APP'],             'BAJA',    TRUE, 80),
('VENTA_ANULADA',                'caja',    'Venta anulada',                  'Una venta fue anulada',                      'CAJERO',  ARRAY['IN_APP'],             'NORMAL',  TRUE, 81),
('DESCUENTO_REQUIERE_APROBACION','caja',    'Descuento requiere aprobación', 'Descuento supera límite del cajero',          'CAJERO',  ARRAY['IN_APP'],             'ALTA',    TRUE, 82),
('TURNO_POR_INICIAR',            'caja',    'Turno por iniciar',             '30 min antes del inicio de turno',            'CAJERO',  ARRAY['IN_APP'],             'BAJA',    TRUE, 83),

-- CLIENTE: Reservas
('RESERVA_MODIFICADA',           'reserva', 'Reserva modificada',           'Admin modificó tu reserva',                   'CLIENTE', ARRAY['IN_APP','EMAIL'],     'NORMAL',  TRUE, 100),
('PAGO_CONFIRMADO',              'reserva', 'Pago confirmado',               'Tu Yape fue aprobado',                        'CLIENTE', ARRAY['IN_APP','EMAIL'],     'NORMAL',  TRUE, 101),
('PAGO_RECHAZADO',               'reserva', 'Pago rechazado',                'Comprobante inválido — intenta de nuevo',     'CLIENTE', ARRAY['IN_APP','EMAIL'],     'ALTA',    TRUE, 102),
('TICKET_DISPONIBLE',            'reserva', 'Tickets disponibles',           'Tus entradas están listas',                   'CLIENTE', ARRAY['IN_APP','EMAIL'],     'NORMAL',  TRUE, 103),

-- CLIENTE: Eventos
('EVENTO_CONTRATO_LISTO',        'evento',  'Contrato listo',                'Contrato disponible para firmar',             'CLIENTE', ARRAY['IN_APP','EMAIL'],     'ALTA',    TRUE, 110),
('EVENTO_PRESUPUESTO_ENVIADO',   'evento',  'Cotización recibida',           'Tu cotización de evento está lista',          'CLIENTE', ARRAY['IN_APP','EMAIL'],     'NORMAL',  TRUE, 111),
('EVENTO_CANCELADO_ADMIN',       'evento',  'Evento cancelado por el local', 'Tu evento fue cancelado',                     'CLIENTE', ARRAY['IN_APP','EMAIL'],     'ALTA',    TRUE, 112),
('EVENTO_RECORDATORIO_3DIAS',    'evento',  'Tu evento es en 3 días',        'Recordatorio anticipado del evento',          'CLIENTE', ARRAY['IN_APP','EMAIL'],     'NORMAL',  TRUE, 113),
('PAGO_ADELANTO_CONFIRMADO',     'evento',  'Adelanto confirmado',           'Tu adelanto fue registrado correctamente',    'CLIENTE', ARRAY['IN_APP','EMAIL'],     'NORMAL',  TRUE, 114),

-- CLIENTE: Documentos
('DOCUMENTO_LISTO',              'venta',   'Comprobante disponible',        'Tu factura o boleta está disponible',         'CLIENTE', ARRAY['IN_APP','EMAIL'],     'BAJA',    TRUE, 120),

-- CLIENTE: Fidelización
('PUNTOS_ACUMULADOS',            'cliente', 'Puntos acumulados',             'Acumulaste puntos en tu compra',              'CLIENTE', ARRAY['IN_APP'],             'BAJA',    TRUE, 130),
('PUNTOS_POR_VENCER',            'cliente', 'Puntos por vencer',             'Tus puntos vencen en menos de 30 días',       'CLIENTE', ARRAY['IN_APP','EMAIL'],     'NORMAL',  TRUE, 131),
('PROMOCION_EXCLUSIVA',          'marketing','Promoción especial',           'Tenemos una oferta para ti',                  'CLIENTE', ARRAY['IN_APP','EMAIL'],     'BAJA',    TRUE, 132),

-- CLIENTE: Cuenta y seguridad
('PASSWORD_CAMBIADO',            'sistema', 'Contraseña cambiada',           'Tu contraseña fue actualizada',               'CLIENTE', ARRAY['EMAIL'],              'CRITICA', TRUE, 140),
('RESENA_RESPONDIDA',            'sitio',   'El local respondió tu reseña',  'Hay una respuesta a tu comentario',           'CLIENTE', ARRAY['IN_APP','EMAIL'],     'BAJA',    TRUE, 141);
```

---

## 7. Resumen por destinatario

| Rol       | Actuales | Nuevas sugeridas | Total  |
| --------- | -------- | ---------------- | ------ |
| ADMIN     | 9        | 18               | **27** |
| CAJERO    | 1        | 4                | **5**  |
| CLIENTE   | 7        | 16               | **23** |
| **Total** | **17**   | **38**           | **55** |

---

## 8. El problema del crecimiento de la BD

Si el sistema tiene 500 clientes activos y envía 5 notificaciones promedio por semana por persona:

```
500 clientes × 5 notif/semana × 52 semanas = 130,000 filas/año
+ Admins y cajeros × operaciones = +20,000 filas/año
Total estimado: ~150,000 filas/año
```

Sin limpieza, en 3 años la tabla tiene 450,000+ filas. Cada fila con JSONB de metadata. Esto es manejable en PostgreSQL, **pero innecesario** — el usuario no necesita una notificación de hace 6 meses.

---

## 9. Estrategia de retención y limpieza

### 9.1 La columna `expira_at` ya existe — úsala

La tabla `notificacion` ya tiene `expira_at TIMESTAMPTZ`. La estrategia es simple: **al crear cada notificación, establecer `expira_at` según el tipo**.

Tabla de retención por prioridad:

| Prioridad | Retención IN_APP | Retención EMAIL tracking |
| --------- | ---------------- | ------------------------ |
| BAJA      | 7 días           | 30 días                  |
| NORMAL    | 30 días          | 90 días                  |
| ALTA      | 60 días          | 180 días                 |
| CRITICA   | 90 días          | 365 días (compliance)    |

### 9.2 Job de limpieza nocturna (Spring Scheduler)

Crear `NotificacionLimpiezaJob.java`:

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificacionLimpiezaJob {

    private final NotificacionJpaRepository notificacionRepo;
    private final NotificacionEntregaJpaRepository entregaRepo;

    // Cada noche a las 03:30 Lima
    @Scheduled(cron = "0 30 3 * * *", zone = "America/Lima")
    @Transactional
    public void limpiarExpiradas() {
        OffsetDateTime ahora = OffsetDateTime.now();

        // 1. Eliminar notificaciones expiradas que ya fueron leídas
        int eliminadasLeidas = notificacionRepo.deleteByExpiraAtBeforeAndLeidaTrue(ahora);

        // 2. Eliminar notificaciones expiradas con más de 7 días adicionales (aunque no leídas)
        OffsetDateTime margenNoLeidas = ahora.minusDays(7);
        int eliminadasNoLeidas = notificacionRepo.deleteByExpiraAtBefore(margenNoLeidas);

        // 3. Limpiar entregas huérfanas (notificacion_entrega sin notificacion padre)
        int entregasHuerfanas = entregaRepo.deleteHuerfanas();

        log.info("[NotificacionLimpiezaJob] Eliminadas: {} leídas, {} no leídas, {} entregas huérfanas",
                eliminadasLeidas, eliminadasNoLeidas, entregasHuerfanas);
    }

    // Cada domingo a las 04:00 — limpieza profunda semanal
    @Scheduled(cron = "0 0 4 * * SUN", zone = "America/Lima")
    @Transactional
    public void limpiezaProfunda() {
        // Notificaciones de prioridad BAJA leídas con más de 3 días
        OffsetDateTime limite = OffsetDateTime.now().minusDays(3);
        int eliminadas = notificacionRepo.deleteBajaLeidaBefore(limite);
        log.info("[NotificacionLimpiezaJob] Limpieza semanal: {} BAJA+leídas eliminadas", eliminadas);
    }
}
```

### 9.3 Queries necesarios en `NotificacionJpaRepository`

```java
// Eliminar expiradas ya leídas
@Modifying
@Query("DELETE FROM NotificacionEntity n WHERE n.fechaExpiracion < :ahora AND n.leida = true")
int deleteByExpiraAtBeforeAndLeidaTrue(@Param("ahora") OffsetDateTime ahora);

// Eliminar expiradas (con margen, incluso no leídas)
@Modifying
@Query("DELETE FROM NotificacionEntity n WHERE n.fechaExpiracion < :limite")
int deleteByExpiraAtBefore(@Param("limite") OffsetDateTime limite);

// Limpieza BAJA+leídas
@Modifying
@Query("""
    DELETE FROM NotificacionEntity n
    WHERE n.prioridad = 'BAJA'
      AND n.leida = true
      AND n.fechaCreacion < :limite
    """)
int deleteBajaLeidaBefore(@Param("limite") OffsetDateTime limite);
```

### 9.4 Calcular `expira_at` al crear notificaciones

En `CrearNotificacionUseCase` o en el servicio, derivar la expiración del tipo:

```java
private OffsetDateTime calcularExpiracion(String prioridad) {
    return switch (prioridad) {
        case "BAJA"    -> OffsetDateTime.now().plusDays(7);
        case "NORMAL"  -> OffsetDateTime.now().plusDays(30);
        case "ALTA"    -> OffsetDateTime.now().plusDays(60);
        case "CRITICA" -> OffsetDateTime.now().plusDays(90);
        default        -> OffsetDateTime.now().plusDays(30);
    };
}
```

### 9.5 Estimación de tamaño con limpieza activa

Con la política anterior, el volumen en estado estable sería:

```
BAJA   → máx 7 días  × 5/día  = ~35 filas activas por usuario
NORMAL → máx 30 días × 3/día  = ~90 filas activas por usuario
ALTA   → máx 60 días × 1/día  = ~60 filas activas por usuario
CRITICA→ máx 90 días × 0.1/día = ~9 filas activas por usuario
```

En estado estable con 500 usuarios activos: **~100,000 filas totales** — no crecerá indefinidamente.

---

## 10. Preferencias de notificación por rol

### 10.1 Situación actual

El sistema tiene **dos mecanismos de preferencias** activos:

| Mecanismo              | Tabla                                           | Para quién             | Estado                        | Granularidad                                 |
| ---------------------- | ----------------------------------------------- | ---------------------- | ----------------------------- | -------------------------------------------- |
| Preferencias generales | `preferencia_usuario.preferencias_extras` JSONB | ADMIN/CAJERO           | ✅ Implementado con endpoints | Por canal global (push ON/OFF, email ON/OFF) |
| Preferencias por tipo  | `preferencia_notificacion`                      | ADMIN, CAJERO, CLIENTE | ❌ Sin endpoints              | Por tipo específico + canal                  |

### 10.2 Qué debería ver cada rol en "Preferencias de Notificaciones"

#### Panel Admin (`/admin/preferencias`)

Ya existe `NotificationSection.tsx`. Actualmente solo tiene toggles globales. Debería expandirse para mostrar los tipos específicos de ADMIN:

```
Canales globales:
  [✅] Notificaciones IN_APP    [✅] Email    [❌] WhatsApp (futuro)

Por categoría:
  RESERVAS
    [✅] Nueva reserva online          [email] [in_app]
    [✅] Yape por validar              [in_app]
    [✅] Aforo cercano al límite       [in_app]

  EVENTOS PRIVADOS
    [✅] Nueva solicitud de evento     [email] [in_app]
    [✅] Contrato sin firma vencido    [email] [in_app]
    [✅] Saldo pendiente               [in_app]

  CAJA
    [✅] Caja sin cerrar               [in_app]
    [❌] Resumen diario                [email]

  SEGURIDAD
    [✅] Login desde IP nueva          [email]   ← no desactivable
    [✅] Cuenta bloqueada              [email]   ← no desactivable
```

Las de seguridad (`LOGIN_IP_NUEVA`, `ADMIN_CUENTA_BLOQUEADA`, `PASSWORD_CAMBIADO`) **no deberían poder desactivarse** — son críticas.

#### Panel Cajero (si tiene su propia página de preferencias)

Solo ve tipos destinatario=CAJERO:

- Caja sin abrir
- Reservas en caja hoy
- Venta anulada
- Turno por iniciar

#### Portal Cliente (`/cliente/mi-cuenta/preferencias`)

Ya existe `PreferenciasForm.tsx` con un solo toggle "Recibir comunicaciones". Debería expandirse:

```
Notificaciones de reservas:
  [✅] Confirmación de reserva
  [✅] Recordatorio de visita (24h antes)
  [✅] Cancelación

Notificaciones de eventos:
  [✅] Confirmación de evento
  [✅] Recordatorio de evento
  [✅] Contrato listo para firmar
  [❌] Recordatorio 3 días antes

Notificaciones de pagos:
  [✅] Pago confirmado / rechazado     ← no desactivables

Marketing:
  [❌] Promociones exclusivas
  [❌] Novedades del local

Seguridad:
  [✅] Cambio de contraseña            ← no desactivable
```

### 10.3 Implementación recomendada de preferencias

Para el MVP usar el mecanismo ya implementado (JSONB en `preferencia_usuario`):

- Agregar campos booleanos por categoría: `notif_reservas`, `notif_eventos`, `notif_caja`, `notif_marketing`
- Seguir usando los endpoints existentes (`PATCH /preferencias/admin/me`)

Para la versión completa usar `preferencia_notificacion` (tabla ya creada):

- Permite granularidad por tipo y canal
- El sistema al crear una notificación consulta esta tabla para saber si enviar o no
- Hay que crear endpoints: `GET/PUT /preferencias/notificaciones`

---

## 11. Reglas para los tipos de notificación críticos

Algunos tipos **nunca deben desactivarse**, independientemente de las preferencias del usuario:

| Código                       | Por qué no se puede desactivar                       |
| ---------------------------- | ---------------------------------------------------- |
| `LOGIN_IP_NUEVA`             | Seguridad — el usuario debe saber si alguien accedió |
| `ADMIN_CUENTA_BLOQUEADA`     | Seguridad operacional                                |
| `PASSWORD_CAMBIADO`          | Seguridad — alerta si otra persona cambió su clave   |
| `PAGO_RECHAZADO`             | El cliente debe saber que su pago no fue aceptado    |
| `EVENTO_CANCELADO_ADMIN`     | El cliente necesita saberlo para reorganizarse       |
| `CONTRATO_VENCIDO_SIN_FIRMA` | Operativo crítico para el negocio                    |

Implementar en `tipo_notificacion`: agregar columna `es_obligatoria BOOLEAN DEFAULT FALSE` y al evaluar preferencias, saltear el filtro si `es_obligatoria = TRUE`.

---

## 12. Plan de acción priorizado

### Inmediato (sin tocar backend)

1. Agregar los nuevos tipos al seed (`V99`) — solo SQL
2. Expandir `preferencia_notificacion` con columna `es_obligatoria`

### Corto plazo (backend)

3. Crear `NotificacionJpaRepository` con queries de limpieza
4. Crear `NotificacionLimpiezaJob` con los 2 schedules
5. Crear `CrearNotificacionUseCase` con cálculo de `expira_at`
6. Integrar en los servicios de negocio (EventoPrivadoService ya llama al puerto — solo agregar BD)

### Mediano plazo (frontend)

7. Expandir `NotificationSection.tsx` con preferencias por categoría
8. Expandir `PreferenciasForm.tsx` del cliente con toggles por tipo
9. Agregar página `/admin/notificaciones` con historial completo y filtros

---

_Reporte generado el 2026-06-27._
