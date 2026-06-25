import { Contrato } from '@/features/admin/contratos/types'
export * from '@/features/admin/contratos/types'

export type PlantillaId =
  | 'CUMPLEANOS_BASICO'
  | 'CUMPLEANOS_PREMIUM'
  | 'EVENTO_CORPORATIVO'
  | 'ALQUILER_PRIVADO'

export const PLANTILLAS: Record<PlantillaId, { label: string; plantilla: string }> = {
  CUMPLEANOS_BASICO: {
    label: 'Cumpleanos Basico',
    plantilla: `CONTRATO DE SERVICIO DE EVENTO PRIVADO

Cliente: {{nombreCliente}}
Tipo de evento: {{tipoEvento}}
Fecha del evento: {{fechaEvento}}
Turno: {{turno}}
Aforo contratado: {{aforoDeclarado}} personas

MONTO TOTAL: S/ {{precioTotalContrato}}
ADELANTO PAGADO: S/ {{montoAdelanto}}
SALDO PENDIENTE: S/ {{saldoPendiente}}

CLAUSULAS:
1. El cliente se compromete a respetar el horario pactado.
2. El adelanto no es reembolsable en caso de cancelacion con menos de 48 horas de anticipacion.
3. El local no se responsabiliza por objetos de valor dejados en las instalaciones.
4. Cualquier daño causado al local sera responsabilidad del contratante.

FIRMA DEL CLIENTE: ____________________  FECHA: __________
FIRMA EMPRESA:     ____________________  FECHA: __________`,
  },
  CUMPLEANOS_PREMIUM: {
    label: 'Cumpleaños Premium',
    plantilla: `CONTRATO PREMIUM DE EVENTO PRIVADO

El presente contrato es celebrado entre KIKI Y LALA y el cliente {{nombreCliente}}.

DATOS DEL EVENTO:
- Tipo: {{tipoEvento}}
- Fecha: {{fechaEvento}}
- Turno: {{turno}}
- Capacidad: {{aforoDeclarado}} personas

CONDICIONES ECONOMICAS:
- Precio total: S/ {{precioTotalContrato}}
- Adelanto recibido: S/ {{montoAdelanto}}
- Saldo a pagar el dia del evento: S/ {{saldoPendiente}}

El paquete Premium incluye: decoracion tematica, torta, catering y animacion.

FIRMA DEL CLIENTE: ____________________  FECHA: __________
FIRMA EMPRESA:     ____________________  FECHA: __________`,
  },
  EVENTO_CORPORATIVO: {
    label: 'Evento Corporativo',
    plantilla: `CONTRATO DE EVENTO CORPORATIVO

CLIENTE: {{nombreCliente}}
FECHA DEL EVENTO: {{fechaEvento}}
TURNO: {{turno}}
AFORO: {{aforoDeclarado}} personas

SERVICIOS CONTRATADOS:
- Uso exclusivo del local
- Coordinador de eventos dedicado
- Equipamiento audiovisual basico

MONTO TOTAL: S/ {{precioTotalContrato}}
ADELANTO: S/ {{montoAdelanto}}
SALDO: S/ {{saldoPendiente}}

FIRMA DEL CLIENTE: ____________________  FECHA: __________
FIRMA EMPRESA:     ____________________  FECHA: __________`,
  },
  ALQUILER_PRIVADO: {
    label: 'Alquiler Privado',
    plantilla: `CONTRATO DE ALQUILER PRIVADO

El presente contrato regula el alquiler del espacio de KIKI Y LALA.

ARRENDATARIO: {{nombreCliente}}
FECHA DE USO: {{fechaEvento}}
HORARIO: {{turno}}
AFORO MAXIMO: {{aforoDeclarado}} personas

CONDICIONES:
1. El local se entrega limpio y en perfectas condiciones.
2. Se realizara un inventario al inicio y al final del evento.
3. El arrendatario es responsable de cualquier dano causado.

PRECIO TOTAL: S/ {{precioTotalContrato}}
ADELANTO: S/ {{montoAdelanto}}
SALDO: S/ {{saldoPendiente}}

FIRMA DEL CLIENTE: ____________________  FECHA: __________
FIRMA EMPRESA:     ____________________  FECHA: __________`,
  },
}

export function aplicarPlantilla(
  plantilla: string,
  contrato: Partial<Contrato>
): string {
  return plantilla
    .replace(/\{\{nombreCliente\}\}/g, contrato.nombreCliente ?? '')
    .replace(/\{\{tipoEvento\}\}/g, contrato.tipoEvento ?? '')
    .replace(/\{\{fechaEvento\}\}/g, contrato.fechaEvento ?? '')
    .replace(/\{\{turno\}\}/g, contrato.turno ?? '')
    .replace(/\{\{aforoDeclarado\}\}/g, String(contrato.aforoDeclarado ?? ''))
    .replace(
      /\{\{precioTotalContrato\}\}/g,
      String(contrato.precioTotalContrato ?? '0.00')
    )
    .replace(/\{\{montoAdelanto\}\}/g, String(contrato.montoAdelanto ?? '0.00'))
    .replace(
      /\{\{saldoPendiente\}\}/g,
      String(contrato.saldoPendiente ?? '0.00')
    )
}
