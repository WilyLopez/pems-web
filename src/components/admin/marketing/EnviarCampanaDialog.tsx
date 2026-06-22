'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, X, Send } from 'lucide-react'

import { marketingService } from '@/services/marketing.service'
import { CampanaEmail } from '@/types/marketing.types'
import { Button } from '@/components/ui/Button'

interface FiltroEnvio {
  soloVip: boolean
  soloFrecuentes: boolean
  soloNuevos: boolean
  soloInactivos: boolean
  soloCorporativos: boolean
  soloConAccesoWeb: boolean
  soloPresenciales: boolean
}

const FILTROS: { key: keyof FiltroEnvio; label: string; desc: string }[] = [
  { key: 'soloVip',           label: 'Solo VIP',              desc: 'Clientes con descuento VIP activo' },
  { key: 'soloFrecuentes',    label: 'Solo frecuentes',       desc: 'Segmento FRECUENTE' },
  { key: 'soloNuevos',        label: 'Solo nuevos',           desc: 'Segmento NUEVO' },
  { key: 'soloInactivos',     label: 'Solo inactivos',        desc: 'Segmento INACTIVO' },
  { key: 'soloCorporativos',  label: 'Solo corporativos',     desc: 'Segmento CORPORATIVO' },
  { key: 'soloConAccesoWeb',  label: 'Solo con acceso web',   desc: 'tieneAccesoWeb = true' },
  { key: 'soloPresenciales',  label: 'Solo presenciales',     desc: 'Origen PRESENCIAL' },
]

interface Props {
  campana: CampanaEmail | null
  onClose: () => void
  onSent: () => void
}

export function EnviarCampanaDialog({ campana, onClose, onSent }: Props) {
  const [filtro, setFiltro] = useState<FiltroEnvio>({
    soloVip: false,
    soloFrecuentes: false,
    soloNuevos: false,
    soloInactivos: false,
    soloCorporativos: false,
    soloConAccesoWeb: false,
    soloPresenciales: false,
  })

  const enviar = useMutation({
    mutationFn: () => marketingService.enviarCampana(campana!.id, filtro),
    onSuccess: () => {
      toast.success('Campaña iniciada. Los envíos se procesarán en segundo plano.')
      onSent()
      onClose()
    },
    onError: () => toast.error('No se pudo iniciar el envío de la campaña.'),
  })

  if (!campana) return null

  const toggle = (key: keyof FiltroEnvio) =>
    setFiltro((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900">Enviar campaña</h2>
              <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{campana.nombre}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">
              Selecciona los segmentos de destinatarios. Si no seleccionas ninguno, se enviará a{' '}
              <span className="font-semibold">todos los clientes activos</span> que aceptan comunicaciones y tienen correo.
            </p>

            <div className="space-y-2">
              {FILTROS.map(({ key, label, desc }) => (
                <label
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filtro[key]}
                    onChange={() => toggle(key)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-azul focus:ring-brand-azul/30"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
              El envío se procesa en lotes de 50 correos por minuto. Los resultados se actualizarán en tiempo real.
            </div>
          </div>

          <div className="flex justify-end gap-3 px-5 pb-5 border-t border-gray-100 pt-4">
            <Button variant="outline" type="button" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={() => enviar.mutate()}
              disabled={enviar.isPending}
              className="rounded-xl gap-1.5 bg-brand-azul hover:bg-brand-azul/90"
            >
              {enviar.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Iniciar envío
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
