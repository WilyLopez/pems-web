'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Loader2,
  X,
  Monitor,
  Smartphone,
  Info,
  FlaskConical,
} from 'lucide-react'
import { useState, useMemo } from 'react'

import { marketingService } from '@/services/marketing.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const schema = z.object({
  tipoEmailCodigo: z
    .string()
    .min(1, { message: 'Selecciona un tipo de email' }),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es obligatorio' })
    .max(120, { message: 'Maximo 120 caracteres' }),
  asunto: z
    .string()
    .min(1, { message: 'El asunto es obligatorio' })
    .max(200, { message: 'Maximo 200 caracteres' }),
  contenidoHtml: z
    .string()
    .min(1, { message: 'El contenido HTML es obligatorio' }),
  variablesPermitidas: z.string().optional().or(z.literal('')),
  contenidoFallback: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>
type Device = 'desktop' | 'mobile'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

function parseVariables(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((v) => v.trim().replace(/\{\{|\}\}/g, ''))
    .filter(Boolean)
}

function applyVariables(html: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replaceAll(`{{${key}}}`, val || `{{${key}}}`),
    html
  )
}

const VARIABLES_SISTEMA: Record<string, string> = {
  logoUrl: 'https://placehold.co/260x80/e91e8c/ffffff?text=Logo',
  appUrl: 'https://kikililala.com',
  anio: String(new Date().getFullYear()),
}

const VARIABLE_SUGERIDAS = [
  { nombre: 'nombre', desc: 'Nombre del cliente' },
  { nombre: 'email', desc: 'Email del cliente' },
  { nombre: 'logoUrl', desc: 'URL publica del logo (sistema)' },
  { nombre: 'appUrl', desc: 'URL de la aplicacion (sistema)' },
  { nombre: 'anio', desc: 'Año actual (sistema)' },
  { nombre: 'codigoTicket', desc: 'Codigo de ticket/reserva' },
  { nombre: 'fechaEvento', desc: 'Fecha del evento' },
  { nombre: 'monto', desc: 'Monto del pago' },
  { nombre: 'promocion', desc: 'Nombre de la promocion' },
]

export function CrearPlantillaDialog({ open, onClose, onCreated }: Props) {
  const [device, setDevice] = useState<Device>('desktop')
  const [datosPrueba, setDatosPrueba] = useState<Record<string, string>>({})

  const { data: tipos } = useQuery({
    queryKey: ['tipos-email'],
    queryFn: marketingService.listarTipos,
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const htmlRaw = watch('contenidoHtml') ?? ''
  const variablesRaw = watch('variablesPermitidas') ?? ''

  const variablesDeclaradas = useMemo(
    () => parseVariables(variablesRaw),
    [variablesRaw]
  )

  const htmlPreview = useMemo(() => {
    const merged = { ...VARIABLES_SISTEMA, ...datosPrueba }
    return applyVariables(htmlRaw, merged)
  }, [htmlRaw, datosPrueba])

  const crear = useMutation({
    mutationFn: (values: FormValues) =>
      marketingService.crearPlantilla({
        tipoEmailCodigo: values.tipoEmailCodigo,
        nombre: values.nombre,
        asunto: values.asunto,
        contenidoHtml: values.contenidoHtml,
        variablesPermitidas: values.variablesPermitidas || undefined,
        contenidoFallback: values.contenidoFallback || undefined,
      }),
    onSuccess: () => {
      toast.success('Plantilla creada.')
      reset()
      setDatosPrueba({})
      onCreated()
      onClose()
    },
    onError: () => toast.error('No se pudo crear la plantilla.'),
  })

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1200px] max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-gray-900">
              Nueva plantilla de email
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Body: 3 columnas */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* ── Col 1: Formulario ── */}
            <form
              id="plantilla-form"
              onSubmit={handleSubmit((v) => crear.mutate(v))}
              className="w-[340px] shrink-0 overflow-y-auto border-r border-gray-100 p-5 space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de email *</Label>
                <select
                  {...register('tipoEmailCodigo')}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
                >
                  <option value="">Seleccionar...</option>
                  {tipos?.map((t) => (
                    <option key={t.codigo} value={t.codigo}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipoEmailCodigo && (
                  <p className="text-xs text-red-500">
                    {errors.tipoEmailCodigo.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Nombre *</Label>
                <Input
                  {...register('nombre')}
                  placeholder="Ej: Bienvenida nuevo cliente"
                  className="text-sm"
                />
                {errors.nombre && (
                  <p className="text-xs text-red-500">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Asunto del correo *</Label>
                <Input
                  {...register('asunto')}
                  placeholder="Ej: ¡Bienvenido a Kiki y Lala!"
                  className="text-sm"
                />
                {errors.asunto && (
                  <p className="text-xs text-red-500">
                    {errors.asunto.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Variables declaradas</Label>
                </div>
                <Input
                  {...register('variablesPermitidas')}
                  placeholder="nombre, email, fechaEvento"
                  className="text-sm font-mono"
                />
                <p className="text-[11px] text-gray-400">
                  Separa por comas. Usa{' '}
                  <code className="bg-gray-100 px-1 rounded">
                    {'{{variable}}'}
                  </code>{' '}
                  en el HTML.
                </p>

                {/* Sugerencias de variables */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
                    <Info className="h-3 w-3" />
                    Variables disponibles
                  </div>
                  <ul className="space-y-1">
                    {VARIABLE_SUGERIDAS.map((v) => (
                      <li
                        key={v.nombre}
                        className="flex items-baseline gap-1.5"
                      >
                        <code className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded shrink-0">
                          {`{{${v.nombre}}}`}
                        </code>
                        <span className="text-[10px] text-blue-600">
                          {v.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-blue-500 pt-1 border-t border-blue-100">
                    Las variables de sistema se reemplazan automaticamente. Para
                    el logo usa{' '}
                    <code className="bg-blue-100 px-0.5 rounded">
                      {'{{logoUrl}}'}
                    </code>{' '}
                    en lugar de{' '}
                    <code className="bg-blue-100 px-0.5 rounded">cid:logo</code>
                    .
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Contenido HTML *</Label>
                <textarea
                  {...register('contenidoHtml')}
                  rows={12}
                  placeholder={
                    '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hola, {{nombre}}!</h1>\n  <img src="{{logoUrl}}" alt="Logo"/>\n</body>\n</html>'
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azul/30 resize-none leading-relaxed"
                />
                {errors.contenidoHtml && (
                  <p className="text-xs text-red-500">
                    {errors.contenidoHtml.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Texto alternativo (fallback)</Label>
                <textarea
                  {...register('contenidoFallback')}
                  rows={2}
                  placeholder="Version en texto plano..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30 resize-none"
                />
              </div>
            </form>

            {/* ── Col 2: Datos de prueba ── */}
            <div className="w-[220px] shrink-0 border-r border-gray-100 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <FlaskConical className="h-3 w-3" />
                  Datos de prueba
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Se aplican solo en la vista previa
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {variablesDeclaradas.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-4">
                    Declara variables arriba para ver los campos aqui
                  </p>
                ) : (
                  variablesDeclaradas.map((v) => {
                    const esSistema = v in VARIABLES_SISTEMA
                    return (
                      <div key={v} className="space-y-0.5">
                        <label className="flex items-center gap-1 text-[11px] font-semibold text-gray-600">
                          <code className="font-mono text-brand-azul">{`{{${v}}}`}</code>
                          {esSistema && (
                            <span className="text-[9px] bg-gray-100 text-gray-400 px-1 rounded">
                              sistema
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            esSistema ? VARIABLES_SISTEMA[v] : `valor de ${v}`
                          }
                          disabled={esSistema}
                          value={
                            esSistema
                              ? VARIABLES_SISTEMA[v]
                              : (datosPrueba[v] ?? '')
                          }
                          onChange={(e) =>
                            setDatosPrueba((prev) => ({
                              ...prev,
                              [v]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-azul/30 disabled:bg-gray-50 disabled:text-gray-400"
                        />
                      </div>
                    )
                  })
                )}

                {/* Variables de sistema siempre activas */}
                {variablesDeclaradas.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 mb-1.5">
                      Siempre disponibles:
                    </p>
                    {Object.entries(VARIABLES_SISTEMA).map(([k, v]) =>
                      !variablesDeclaradas.includes(k) ? (
                        <div key={k} className="space-y-0.5 mb-2">
                          <label className="text-[11px] font-semibold text-gray-500">
                            <code className="font-mono text-gray-400">{`{{${k}}}`}</code>
                          </label>
                          <input
                            type="text"
                            value={v}
                            disabled
                            className="w-full rounded-lg border border-gray-100 px-2 py-1 text-xs bg-gray-50 text-gray-400"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Col 3: Preview ── */}
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Vista previa en vivo
                </span>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setDevice('desktop')}
                    title="Escritorio"
                    className={`p-1.5 rounded-md transition-colors ${
                      device === 'desktop'
                        ? 'bg-brand-azul text-white'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice('mobile')}
                    title="Movil"
                    className={`p-1.5 rounded-md transition-colors ${
                      device === 'mobile'
                        ? 'bg-brand-azul text-white'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto flex items-start justify-center p-4">
                {htmlRaw.trim() ? (
                  <div
                    className={`transition-all duration-300 ${
                      device === 'desktop' ? 'w-full max-w-2xl' : 'w-[375px]'
                    } bg-white rounded-xl shadow-md overflow-hidden`}
                  >
                    <iframe
                      key={device}
                      srcDoc={htmlPreview}
                      title="Vista previa del email"
                      sandbox="allow-same-origin"
                      className="w-full border-0"
                      style={{ height: 520, display: 'block' }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-300 py-16">
                    <Monitor className="h-12 w-12" />
                    <p className="text-sm text-center">
                      Escribe el contenido HTML
                      <br />
                      para ver la vista previa aqui
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="plantilla-form"
              disabled={crear.isPending}
              className="rounded-xl gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              {crear.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear plantilla
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
