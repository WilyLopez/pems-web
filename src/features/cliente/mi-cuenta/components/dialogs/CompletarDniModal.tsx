'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { CreditCard, Loader2, ShieldCheck, Ticket, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  completarDniSchema,
  CompletarDniValues,
} from '../../schema/mi-cuenta.schema'

interface CompletarDniModalProps {
  open: boolean
  onClose: () => void
  onSave: (dni: string) => Promise<unknown>
  isSaving: boolean
}

const BENEFICIOS = [
  {
    icon: Ticket,
    texto: 'Podrás crear reservas y comprar entradas sin restricciones.',
  },
  {
    icon: Zap,
    texto: 'Ingreso más rápido en caja, sin verificaciones adicionales.',
  },
  {
    icon: ShieldCheck,
    texto: 'Tus datos quedan protegidos y solo se usan para tu cuenta.',
  },
]

export function CompletarDniModal({
  open,
  onClose,
  onSave,
  isSaving,
}: CompletarDniModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompletarDniValues>({
    resolver: zodResolver(completarDniSchema),
    defaultValues: { dni: '' },
  })

  function handleClose() {
    reset({ dni: '' })
    onClose()
  }

  async function alEnviar(values: CompletarDniValues) {
    try {
      await onSave(values.dni)
      reset({ dni: '' })
      onClose()
    } catch {
      // El toast de error ya lo maneja la mutación
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center mb-3">
            <CreditCard className="h-5 w-5 text-brand-azul" />
          </div>
          <DialogTitle className="text-base font-black text-gray-900">
            Registra tu DNI
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            Es el único dato que te falta para completar tu perfil.
          </p>
        </div>

        <form onSubmit={handleSubmit(alEnviar)}>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dni-modal" className="text-sm font-semibold">
                Número de DNI
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="dni-modal"
                  placeholder="12345678"
                  maxLength={8}
                  inputMode="numeric"
                  autoFocus
                  className="h-11 rounded-xl pl-9"
                  {...register('dni')}
                />
              </div>
              {errors.dni && (
                <p className="text-xs font-medium text-red-500">
                  {errors.dni.message}
                </p>
              )}
            </div>

            <div className="space-y-2 bg-brand-azul/5 rounded-xl p-3">
              {BENEFICIOS.map(({ icon: Icon, texto }) => (
                <div key={texto} className="flex items-start gap-2.5">
                  <Icon className="h-3.5 w-3.5 text-brand-azul shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-snug">{texto}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 pb-5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Ahora no
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-azul text-white text-sm font-bold disabled:opacity-50 hover:bg-brand-azul/90 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Guardar DNI'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
