import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { User, Phone, Loader2, Save, Pencil } from 'lucide-react'
import { infoPersonalSchema, InfoPersonalValues } from '../../schema/mi-cuenta.schema'
import { Cliente } from '@/features/cliente/shared/types'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils'
import { SectionCard } from '../../../shared/components/SectionCard'

interface InfoPersonalFormProps {
  cliente: Cliente
  onSave: (values: InfoPersonalValues) => Promise<any>
  isSaving: boolean
}

function CampoLectura({ label, valor, vacio }: { label: string; valor?: string | null; vacio?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={cn('text-sm font-semibold', valor ? 'text-gray-900' : 'text-gray-400')}>
        {valor ?? (vacio ?? 'No registrado')}
      </p>
    </div>
  )
}

export function InfoPersonalForm({ cliente, onSave, isSaving }: InfoPersonalFormProps) {
  const [editando, setEditando] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InfoPersonalValues>({
    resolver: zodResolver(infoPersonalSchema),
    defaultValues: {
      nombres: cliente.nombres ?? '',
      apellidoPaterno: cliente.apellidoPaterno ?? '',
      apellidoMaterno: cliente.apellidoMaterno ?? '',
      telefono: cliente.telefono ?? '',
    },
  })

  useEffect(() => {
    reset({
      nombres: cliente.nombres ?? '',
      apellidoPaterno: cliente.apellidoPaterno ?? '',
      apellidoMaterno: cliente.apellidoMaterno ?? '',
      telefono: cliente.telefono ?? '',
    })
  }, [cliente, reset])

  function cancelar() {
    reset({
      nombres: cliente.nombres ?? '',
      apellidoPaterno: cliente.apellidoPaterno ?? '',
      apellidoMaterno: cliente.apellidoMaterno ?? '',
      telefono: cliente.telefono ?? '',
    })
    setEditando(false)
  }

  async function alEnviar(v: InfoPersonalValues) {
    try {
      await onSave(v)
      setEditando(false)
    } catch {
      // Keep edit mode active on error
    }
  }

  return (
    <SectionCard
      titulo="Información personal"
      icon={User}
      accion={
        !editando ? (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-azul hover:bg-brand-azul/5 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        ) : null
      }
    >
      {!editando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CampoLectura label="Nombre completo" valor={cliente.nombreCompleto} />
          <CampoLectura label="Correo electrónico" valor={cliente.correo} />
          <CampoLectura label="Teléfono" valor={cliente.telefono} />
          <CampoLectura label="Documento" valor={`${cliente.tipoDocumentoCodigo}: ${cliente.numeroDocumento}`} />
        </div>
      ) : (
        <form onSubmit={handleSubmit(alEnviar)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombres" className="text-sm font-semibold">Nombres</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="nombres" className="h-11 rounded-xl pl-9" {...register('nombres')} />
              </div>
              {errors.nombres && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.nombres.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellidoPaterno" className="text-sm font-semibold">Apellido paterno</Label>
              <Input id="apellidoPaterno" className="h-11 rounded-xl" {...register('apellidoPaterno')} />
              {errors.apellidoPaterno && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.apellidoPaterno.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellidoMaterno" className="text-sm font-semibold">Apellido materno</Label>
              <Input id="apellidoMaterno" className="h-11 rounded-xl" {...register('apellidoMaterno')} />
              {errors.apellidoMaterno && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.apellidoMaterno.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-sm font-semibold">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="telefono" placeholder="987654321" className="h-11 rounded-xl pl-9" {...register('telefono')} />
              </div>
              {errors.telefono && (
                <p className="text-xs font-medium text-red-500 mt-1">{errors.telefono.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-gray-700">Correo electrónico</p>
              <div className="h-11 rounded-xl bg-gray-50 border border-gray-200 px-3 flex items-center">
                <span className="text-sm text-gray-500">{cliente.correo}</span>
              </div>
              <p className="text-[11px] text-gray-400">El correo no puede modificarse.</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-gray-700">{cliente.tipoDocumentoCodigo}</p>
              <div className="h-11 rounded-xl bg-gray-50 border border-gray-200 px-3 flex items-center">
                <span className="text-sm text-gray-500">{cliente.numeroDocumento}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={cancelar}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-brand-azul text-white text-sm font-bold hover:bg-brand-azul/90 disabled:opacity-60 transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </SectionCard>
  )
}
