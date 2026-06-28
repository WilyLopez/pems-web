'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PaqueteEvento } from '@/types/comercial.types'
import { formatCurrency } from '@/lib/utils'
import { fixMediaUrl } from '@/lib/media'
import {
  Check,
  Clock,
  Users,
  Calendar,
  Star,
  Info,
  ListChecks,
} from 'lucide-react'
import Image from 'next/image'

interface PaqueteDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paquete: PaqueteEvento | null
}

export function PaqueteDetailDialog({
  open,
  onOpenChange,
  paquete,
}: PaqueteDetailDialogProps) {
  if (!paquete) return null

  const color = paquete.color || '#00AEEF'
  const beneficios = paquete.beneficios || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden sm:rounded-2xl border-gray-200">
        <div className="flex flex-col w-full h-full overflow-hidden">
          <DialogHeader className="px-6 py-4 pr-12 border-b shrink-0 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Detalle del paquete: {paquete.nombre}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header block with Image/Gradient Banner */}
            <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              {paquete.imagenUrl ? (
                <div className="aspect-[21/9] relative w-full bg-gray-100">
                  <Image
                    src={fixMediaUrl(paquete.imagenUrl)}
                    alt={paquete.nombre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 700px"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="aspect-[21/9] w-full flex flex-col justify-end p-6 relative"
                  style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
                </div>
              )}

              {/* Badge overlay or status indicator */}
              {paquete.badge && (
                <span
                  className="absolute top-3 left-3 text-xs font-black px-2.5 py-1 rounded-full text-white shadow-md uppercase tracking-wider"
                  style={{ backgroundColor: color }}
                >
                  {paquete.badge}
                </span>
              )}

              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <Badge
                  variant={paquete.activo ? 'default' : 'secondary'}
                  className="shadow-sm font-semibold"
                >
                  {paquete.activo ? 'Activo' : 'Inactivo'}
                </Badge>
                {paquete.destacado && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold flex gap-1 items-center shadow-sm">
                    <Star className="h-3 w-3 fill-current" /> Destacado
                  </Badge>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* General Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2">
                    <Info className="h-3.5 w-3.5 text-gray-400" /> Información
                    General
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 block uppercase">
                        Nombre
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paquete.nombre}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 block uppercase">
                        Precio
                      </span>
                      <span className="text-lg font-black" style={{ color }}>
                        {formatCurrency(paquete.precio)}
                      </span>
                    </div>
                    {paquete.tipoEventoCodigo && (
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 block uppercase">
                          Tipo de Evento
                        </span>
                        <Badge
                          className="text-xs font-bold border-0 mt-0.5"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          {paquete.tipoEventoCodigo}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />{' '}
                    Especificaciones
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 block uppercase flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Duración
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paquete.duracionMinutos
                          ? `${paquete.duracionMinutos} min`
                          : 'No especificado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 block uppercase flex items-center gap-1">
                        <Users className="h-3 w-3" /> Capacidad
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paquete.limitepersonas
                          ? `${paquete.limitepersonas} personas`
                          : 'Sin límite'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 block uppercase">
                        Orden
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {paquete.orden}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions & Benefits */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2">
                    <ListChecks className="h-3.5 w-3.5 text-gray-400" />{' '}
                    Beneficios Incluidos ({beneficios.length})
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 max-h-[220px] overflow-y-auto">
                    {beneficios.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        No tiene beneficios registrados.
                      </p>
                    ) : (
                      beneficios.map((b, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 text-xs text-gray-700"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: `${color}1a` }}
                          >
                            <Check className="h-2.5 w-2.5" style={{ color }} />
                          </div>
                          <span className="font-normal leading-relaxed">
                            {b}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Block */}
            {paquete.descripcionCorta && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Descripción
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">
                      Corta
                    </span>
                    <p className="text-sm text-gray-700 font-medium">
                      {paquete.descripcionCorta}
                    </p>
                  </div>
                  {paquete.descripcionLarga && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">
                        Detallada
                      </span>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {paquete.descripcionLarga}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t px-6 py-4 bg-gray-50/50 shrink-0 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
