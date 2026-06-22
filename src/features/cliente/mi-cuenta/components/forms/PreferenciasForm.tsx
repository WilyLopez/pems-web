import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Cliente } from '@/features/cliente/shared/types'
import { Switch } from '@/components/ui/Switch'
import { SectionCard } from '../../../shared/components/SectionCard'

interface PreferenciasFormProps {
  cliente: Cliente
  onSave: (val: boolean) => void
  isSaving: boolean
}

export function PreferenciasForm({ cliente, onSave, isSaving }: PreferenciasFormProps) {
  const [acepta, setAcepta] = useState(cliente.aceptaComunicaciones)

  useEffect(() => {
    setAcepta(cliente.aceptaComunicaciones)
  }, [cliente.aceptaComunicaciones])

  function toggle(val: boolean) {
    setAcepta(val)
    onSave(val)
  }

  return (
    <SectionCard titulo="Preferencias de comunicación" icon={Bell}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Recibir comunicaciones</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Promociones, recordatorios y novedades de Kiki y Lala por correo y WhatsApp.
          </p>
        </div>
        <Switch
          checked={acepta}
          onCheckedChange={toggle}
          disabled={isSaving}
        />
      </div>
    </SectionCard>
  )
}
