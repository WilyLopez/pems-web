import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { PrecioLabel } from './PrecioLabel'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { cn } from '@/lib/utils'
import { legalService } from '@/services/legal.service'
import { Cliente } from '@/types/cliente.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'

interface VisitorStepProps {
  fechaSeleccionada: string | null
  minAge: number
  maxAge: number
  dispSeleccionada: Disponibilidad | null
  precioMap: Record<string, number> | undefined
  getTarifaKey: (fechaStr: string, esFeriado: boolean) => 'SEMANA' | 'FIN_SEMANA_FERIADO'
  onBack: () => void
  onSubmit: () => void
  perfilCliente?: Cliente | null
}

export function VisitorStep({
  fechaSeleccionada,
  minAge,
  maxAge,
  dispSeleccionada,
  precioMap,
  getTarifaKey,
  onBack,
  onSubmit,
  perfilCliente,
}: VisitorStepProps) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext()

  const [docAbierto, setDocAbierto] = useState<'REGLAMENTO' | 'ACTA' | null>(null)
  const [docTitulo, setDocTitulo] = useState('')
  const [docContenido, setDocContenido] = useState('')
  const [cargandoDoc, setCargandoDoc] = useState(false)
  const [usarMisDatos, setUsarMisDatos] = useState(false)

  async function abrirDocumento(tipo: 'REGLAMENTO' | 'ACTA') {
    setDocAbierto(tipo)
    setDocTitulo(tipo === 'REGLAMENTO' ? 'Reglamento del Local' : 'Acta de Responsabilidad')
    setDocContenido('')
    setCargandoDoc(true)
    try {
      const doc = await legalService.obtenerPublico(tipo)
      if (doc && doc.contenido) {
        setDocContenido(doc.contenido)
        setDocTitulo(doc.titulo)
      } else {
        throw new Error('Documento vacío')
      }
    } catch {
      if (tipo === 'REGLAMENTO') {
        setDocContenido(`
          <p><strong>REGLAMENTO DE LA ZONA DE JUEGOS KIKI Y LALA</strong></p>
          <p>1. El área de juegos está diseñada exclusivamente para niños de ${minAge} a ${maxAge} años de edad.</p>
          <p>2. Todo niño debe ingresar y permanecer bajo la supervisión directa de un adulto responsable.</p>
          <p>3. Es obligatorio el uso de medias antideslizantes para niños y adultos acompañantes en la zona alfombrada.</p>
          <p>4. Se prohíbe el ingreso de cualquier tipo de alimentos, bebidas, golosinas o chicles al área de juegos.</p>
          <p>5. No se permite el uso de objetos punzantes, hebillas o accesorios peligrosos.</p>
          <p>6. El respeto, la no agresión y el cuidado de los juegos son de obligatorio cumplimiento.</p>
        `)
      } else {
        setDocContenido(`
          <p><strong>ACTA DE RESPONSABILIDAD</strong></p>
          <p>1. El adulto acompañante declara asumir el cuidado y supervisión permanente y directa del menor durante su estadía.</p>
          <p>2. Se asumen los riesgos ordinarios inherentes a la recreación física infantil.</p>
          <p>3. El local no se responsabiliza por la pérdida o daño de objetos personales.</p>
          <p>4. En caso de emergencia, se autoriza al personal a brindar primeros auxilios y coordinar traslado médico.</p>
          <p>5. Se acepta firmar físicamente este acta en recepción antes del ingreso.</p>
        `)
      }
    } finally {
      setCargandoDoc(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors bg-white shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Datos del visitante
          </h1>
          {fechaSeleccionada && (
            <p className="text-xs text-gray-500 font-medium">
              Visita programada para el{' '}
              {format(parseISO(fechaSeleccionada), "EEEE d 'de' MMMM", {
                locale: es,
              })}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Nombre completo del niño/a <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ej: Thiago Ramos"
              {...register('nombreNino')}
              className={cn(
                'h-11 rounded-xl',
                errors.nombreNino && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {errors.nombreNino && (
              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.nombreNino.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Edad del niño/a <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={minAge}
              max={maxAge}
              placeholder={`De ${minAge} a ${maxAge} años`}
              {...register('edadNino', { valueAsNumber: true })}
              className={cn(
                'h-11 rounded-xl',
                errors.edadNino && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {errors.edadNino && (
              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.edadNino.message as string}
              </p>
            )}
          </div>

          {perfilCliente && (
            <div className="md:col-span-2 pt-2 border-t border-gray-100 flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  id="usarMisDatos"
                  checked={usarMisDatos}
                  onCheckedChange={(checked) => {
                    const isChecked = !!checked
                    setUsarMisDatos(isChecked)
                    if (isChecked) {
                      setValue('nombreAcompanante', perfilCliente.nombreCompleto)
                      setValue('dniAcompanante', perfilCliente.numeroDocumento)
                    } else {
                      setValue('nombreAcompanante', '')
                      setValue('dniAcompanante', '')
                    }
                  }}
                />
                <span className="text-xs font-bold text-gray-700">
                  Yo seré el acompañante responsable (usar mis datos de perfil)
                </span>
              </label>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              Nombre del acompañante responsable{' '}
              <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ej: María Ramos"
              {...register('nombreAcompanante')}
              className={cn(
                'h-11 rounded-xl',
                errors.nombreAcompanante && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {errors.nombreAcompanante && (
              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.nombreAcompanante.message as string}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">
              DNI del acompañante <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="DNI de 8 dígitos"
              inputMode="numeric"
              maxLength={8}
              {...register('dniAcompanante')}
              className={cn(
                'h-11 rounded-xl font-mono',
                errors.dniAcompanante && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {errors.dniAcompanante && (
              <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.dniAcompanante.message as string}
              </p>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-black text-amber-900 flex items-center gap-2 text-sm uppercase tracking-wider leading-none">
            <AlertTriangle className="h-[18px] w-[18px] text-amber-600 shrink-0" />
            Compromisos obligatorios
          </h3>

          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <Controller
                name="aceptaReglamento"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="reglamento"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    className="mt-0.5 border-amber-300 data-[state=checked]:bg-amber-600"
                  />
                )}
              />
              <span className="text-xs text-gray-800 leading-relaxed font-medium">
                He leído y acepto el{' '}
                <button
                  type="button"
                  onClick={() => abrirDocumento('REGLAMENTO')}
                  className="text-brand-azul underline font-bold hover:text-brand-azul/80 inline-block focus:outline-none"
                >
                  Reglamento del local
                </button>
                , incluyendo las normas de conducta, restricciones de edad y responsabilidades del acompañante adulto.
                <span className="text-red-500 font-bold"> *</span>
              </span>
            </label>
            {errors.aceptaReglamento && (
              <p className="flex items-center gap-1 text-xs text-red-600 ml-7">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.aceptaReglamento.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <Controller
                name="conoceActa"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="acta"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    className="mt-0.5 border-amber-300 data-[state=checked]:bg-amber-600"
                  />
                )}
              />
              <span className="text-xs text-gray-800 leading-relaxed font-medium">
                Entiendo que debo firmar el{' '}
                <button
                  type="button"
                  onClick={() => abrirDocumento('ACTA')}
                  className="text-brand-azul underline font-bold hover:text-brand-azul/80 inline-block focus:outline-none"
                >
                  Acta de Responsabilidad
                </button>{' '}
                físicamente en recepción antes de que el niño ingrese al local.
                <span className="text-red-500 font-bold"> *</span>
              </span>
            </label>
            {errors.conoceActa && (
              <p className="flex items-center gap-1 text-xs text-red-600 ml-7">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.conoceActa.message as string}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {fechaSeleccionada && dispSeleccionada && (
            <p className="text-sm text-gray-500 font-bold lg:hidden">
              Total:{' '}
              <PrecioLabel
                tipoDia={getTarifaKey(
                  fechaSeleccionada,
                  dispSeleccionada.esFeriado
                )}
                precioMap={precioMap}
              />
            </p>
          )}
          <Button
            type="button"
            onClick={onSubmit}
            className="w-full lg:w-auto ml-auto px-6 py-2.5 bg-brand-azul hover:bg-brand-azul/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-100"
          >
            Continuar al pago
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!docAbierto} onOpenChange={(v) => { if (!v) setDocAbierto(null) }}>
        <DialogContent className="max-w-lg rounded-3xl p-6 overflow-hidden max-h-[80vh] flex flex-col bg-white border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-gray-900">
              {docTitulo}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Documento informativo obligatorio de Kiki y Lala
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 text-sm text-gray-600 leading-relaxed space-y-3 pr-2 scrollbar-thin">
            {cargandoDoc ? (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando documento...
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: docContenido }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
