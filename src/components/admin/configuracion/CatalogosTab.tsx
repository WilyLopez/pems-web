'use client'

import { BookOpen } from 'lucide-react'

interface CatalogGroup {
  titulo: string
  descripcion: string
  items: string[]
}

const CATALOGOS: CatalogGroup[] = [
  {
    titulo: 'Estado de reserva pública',
    descripcion: 'Ciclo de vida de las reservas del portal web',
    items: [
      'PENDIENTE',
      'CONFIRMADA',
      'CANCELADA',
      'REPROGRAMADA',
      'COMPLETADA',
    ],
  },
  {
    titulo: 'Estado de evento privado',
    descripcion: 'Estados de los eventos contratados por empresas o familias',
    items: [
      'SOLICITADO',
      'EN_REVISION',
      'APROBADO',
      'RECHAZADO',
      'CANCELADO',
      'REALIZADO',
    ],
  },
  {
    titulo: 'Canal de reserva',
    descripcion: 'Origen por el que llegan las reservas',
    items: ['WEB', 'PRESENCIAL', 'TELEFONO', 'WHATSAPP'],
  },
  {
    titulo: 'Medio de pago',
    descripcion: 'Formas de pago aceptadas',
    items: ['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'],
  },
  {
    titulo: 'Tipo de comprobante',
    descripcion: 'Documentos contables emitidos',
    items: ['BOLETA', 'FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'],
  },
  {
    titulo: 'Estado de comprobante',
    descripcion: 'Estado del comprobante ante SUNAT',
    items: ['PENDIENTE', 'EMITIDO', 'ANULADO', 'RECHAZADO'],
  },
  {
    titulo: 'Tipo de día (calendario)',
    descripcion: 'Clasificación de los días para tarifas y disponibilidad',
    items: ['LABORAL', 'FIN_DE_SEMANA', 'FERIADO', 'ESPECIAL'],
  },
  {
    titulo: 'Tipo de promoción',
    descripcion: 'Categorías de descuentos y beneficios',
    items: [
      'DESCUENTO_PORCENTAJE',
      'DESCUENTO_FIJO',
      'ENTRADA_GRATIS',
      'COMBO',
    ],
  },
  {
    titulo: 'Categoría de producto',
    descripcion: 'Grupos de productos del inventario',
    items: [
      'ALIMENTO',
      'BEBIDA',
      'DECORACION',
      'HIGIENE',
      'ENTRETENIMIENTO',
      'OTRO',
    ],
  },
]

const colorMap: Record<string, string> = {
  PENDIENTE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMADA: 'bg-green-50 text-green-700 border-green-200',
  CANCELADA: 'bg-red-50 text-red-700 border-red-200',
  RECHAZADO: 'bg-red-50 text-red-700 border-red-200',
  ANULADO: 'bg-red-50 text-red-700 border-red-200',
  COMPLETADA: 'bg-blue-50 text-blue-700 border-blue-200',
  REALIZADO: 'bg-blue-50 text-blue-700 border-blue-200',
  EMITIDO: 'bg-green-50 text-green-700 border-green-200',
  APROBADO: 'bg-green-50 text-green-700 border-green-200',
}

function getColor(item: string): string {
  return colorMap[item] ?? 'bg-gray-50 text-gray-700 border-gray-200'
}

export function CatalogosTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
          <BookOpen className="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Catálogos del sistema</h3>
          <p className="text-xs text-muted-foreground">
            Valores de referencia fijos — no editables desde la interfaz
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm text-blue-700">
        Estos catálogos son valores del dominio del negocio definidos a nivel de
        base de datos. Si necesitas modificarlos, contacta al equipo de
        desarrollo.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATALOGOS.map((grupo) => (
          <div
            key={grupo.titulo}
            className="rounded-xl border border-gray-100 p-4 space-y-3"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {grupo.titulo}
              </p>
              <p className="text-xs text-muted-foreground">
                {grupo.descripcion}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {grupo.items.map((item) => (
                <span
                  key={item}
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${getColor(item)}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
