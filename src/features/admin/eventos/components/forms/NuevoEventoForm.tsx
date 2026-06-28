'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, Controller, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Loader2,
  ChevronLeft,
  X,
  CalendarDays,
  Clock,
  UserPlus,
  User,
  Package,
  PartyPopper,
  Users,
  Banknote,
  Radio,
} from 'lucide-react'
import {
  buildNuevoEventoSchema,
  NuevoEventoFormValues,
  ORIGENES_CONTACTO,
} from '../../schema/nuevoEvento.schema'
import { useSolicitarEvento, useTurnos } from '../../hooks/useEventos'
import { usePaquetesPublico } from '@/features/admin/comercial/paquetes/hooks/usePaquetes'
import { useTiposEventoPublico } from '@/features/admin/comercial/tipos-evento/hooks/useTiposEvento'
import { TipoEvento } from '@/types/comercial.types'
import { clientesApi } from '@/features/admin/clientes/services/clientes.api'
import { Cliente } from '@/features/admin/clientes/types'
import { NuevoClienteModal } from '@/features/admin/clientes/components/forms/NuevoClienteModal'
import { useAuth } from '@/hooks/useAuth'
import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { ADMIN_ROUTES } from '@/config/routes'
import { cn, formatCurrency } from '@/lib/utils'

interface EventoDraft {
  formValues: Partial<NuevoEventoFormValues>
  clienteSel: Cliente | null
  clienteSearch: string
  tipoEventoSel: TipoEvento | null
}

function loadDraft(key: string): EventoDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as EventoDraft) : null
  } catch {
    return null
  }
}

export function NuevoEventoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { idSede } = useAuth()

  const fechaParam = searchParams.get('fecha') ?? ''
  const idTurnoParam = searchParams.get('idTurno')
  const idTurno = idTurnoParam ? parseInt(idTurnoParam, 10) : null

  const draftKey =
    fechaParam && idTurno ? `nuevo-evento-draft-${fechaParam}-${idTurno}` : ''

  const [initialDraft] = useState<EventoDraft | null>(() =>
    draftKey ? loadDraft(draftKey) : null
  )

  const { data: turnos } = useTurnos(idSede)
  const turnoActual = turnos?.find((t) => t.id === idTurno)
  const { data: paquetes } = usePaquetesPublico()
  const { data: tiposEvento } = useTiposEventoPublico()
  const { data: config } = useConfiguracionCalendario(idSede!)

  const aforoMax = config?.aforoMaximo ?? 60
  const edadMin = config?.edadMinCumple ?? 0
  const edadMax = config?.edadMaxCumple ?? 18

  const schema = useMemo(
    () =>
      buildNuevoEventoSchema({
        aforoMaximo: aforoMax,
        edadMinCumple: edadMin,
        edadMaxCumple: edadMax,
      }),
    [aforoMax, edadMin, edadMax]
  )

  const [clienteSearch, setClienteSearch] = useState<string>(
    () => initialDraft?.clienteSearch ?? ''
  )
  const [clienteSel, setClienteSel] = useState<Cliente | null>(
    () => initialDraft?.clienteSel ?? null
  )
  const [showDropdown, setShowDropdown] = useState(false)
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false)
  const [tipoEventoSel, setTipoEventoSel] = useState<TipoEvento | null>(
    () => initialDraft?.tipoEventoSel ?? null
  )

  const { data: clientesPage, isFetching: buscandoClientes } = useQuery({
    queryKey: ['clientes-search', clienteSearch],
    queryFn: () => clientesApi.listar({ search: clienteSearch, size: 8 }),
    enabled: clienteSearch.length >= 2 && !clienteSel,
    staleTime: 10_000,
  })
  const clientes = clientesPage?.content ?? []

  const solicitar = useSolicitarEvento()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<NuevoEventoFormValues>({
    resolver: zodResolver(schema) as Resolver<NuevoEventoFormValues>,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      idTurno: idTurno ?? undefined,
      fechaEvento: fechaParam || undefined,
      ...(initialDraft?.formValues ?? {}),
    },
  })

  const watchValues = watch()

  useEffect(() => {
    if (!draftKey) return
    const draft: EventoDraft = {
      formValues: watchValues,
      clienteSel,
      clienteSearch,
      tipoEventoSel,
    }
    sessionStorage.setItem(draftKey, JSON.stringify(draft))
  }, [watchValues, clienteSel, clienteSearch, tipoEventoSel, draftKey])

  const paquetesFiltrados = tipoEventoSel
    ? (paquetes ?? []).filter(
        (p) =>
          !p.tipoEventoCodigo || p.tipoEventoCodigo === tipoEventoSel.codigo
      )
    : (paquetes ?? [])

  const paqueteSel = paquetesFiltrados.find(
    (p) => p.id === watchValues.idPaquete
  )

  if (!idSede)
    return (
      <ErrorState message="No tienes sede asignada. Contacta al administrador." />
    )
  if (!fechaParam || !idTurno || isNaN(idTurno) || idTurno <= 0) {
    return <ErrorState message="Parámetros de fecha o turno inválidos." />
  }

  const onSubmit = (values: NuevoEventoFormValues) => {
    solicitar.mutate(
      {
        idCliente: values.idCliente,
        idSede,
        payload: {
          idTurno: values.idTurno,
          fechaEvento: values.fechaEvento,
          tipoEvento: values.tipoEvento,
          contactoAdicional: values.contactoAdicional || undefined,
          aforoDeclarado: values.aforoDeclarado,
          nombreNino: values.nombreNino || undefined,
          edadCumple: values.edadCumple,
          idPaquete: values.idPaquete,
          origenContacto: values.origenContacto,
          presupuestoEstimado: values.presupuestoEstimado,
          extrasLibres: values.extrasLibres
            ? values.extrasLibres
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
          observaciones: values.observaciones || undefined,
        },
      },
      {
        onSuccess: (evento) => {
          if (draftKey) sessionStorage.removeItem(draftKey)
          router.push(ADMIN_ROUTES.eventoDetalle(evento.id))
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Eventos', href: ADMIN_ROUTES.eventos },
          { label: 'Nuevo evento', href: '/admin/eventos/nuevo' },
          { label: 'Datos del evento' },
        ]}
      />
      <PageHeader
        title="Datos del evento"
        description="Completa la información para registrar el nuevo evento privado"
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-wrap gap-5">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-brand-azul" />
          <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">
            {format(parseISO(fechaParam), "EEEE d 'de' MMMM yyyy", {
              locale: es,
            })}
          </span>
        </div>
        {turnoActual && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-brand-azul" />
            <span className="text-gray-600 dark:text-gray-400">
              {turnoActual.nombre} · {turnoActual.horaInicio}–
              {turnoActual.horaFin}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Cliente
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg gap-1.5 text-xs text-brand-azul border-brand-azul/30 hover:bg-brand-azul/5 dark:border-brand-azul/40 dark:hover:bg-brand-azul/10"
                onClick={() => setModalNuevoCliente(true)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Nuevo cliente
              </Button>
            </div>
            <Controller
              name="idCliente"
              control={control}
              render={({ field, fieldState }) => (
                <div className="space-y-1 relative">
                  <Label className="dark:text-gray-300">Buscar cliente *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      value={clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value)
                        if (clienteSel) {
                          setClienteSel(null)
                          field.onChange(undefined)
                        }
                        setShowDropdown(true)
                      }}
                      onFocus={() =>
                        clienteSearch.length >= 2 && setShowDropdown(true)
                      }
                      onBlur={() =>
                        setTimeout(() => setShowDropdown(false), 150)
                      }
                      placeholder="Nombre o número de documento..."
                      autoComplete="off"
                      readOnly={!!clienteSel}
                      className={cn(
                        'pl-9 pr-8 dark:bg-gray-800 dark:border-gray-700',
                        fieldState.error &&
                          'border-red-400 focus-visible:ring-red-300'
                      )}
                    />
                    {clienteSel ? (
                      <button
                        type="button"
                        onClick={() => {
                          setClienteSel(null)
                          setClienteSearch('')
                          field.onChange(undefined)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : buscandoClientes ? (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                    ) : null}
                  </div>

                  {showDropdown && !clienteSel && clientes.length > 0 && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                      {clientes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setClienteSel(c)
                            setClienteSearch(c.nombreCompleto)
                            setShowDropdown(false)
                            field.onChange(c.id)
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {c.nombreCompleto}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {c.tipoDocumentoCodigo} {c.numeroDocumento}
                            {c.telefono && ` · ${c.telefono}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {fieldState.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Detalles del evento
            </h2>

            <div className="space-y-1">
              <Label className="dark:text-gray-300">Tipo de evento *</Label>
              <Controller
                name="tipoEvento"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => {
                        field.onChange(v)
                        const tipo =
                          tiposEvento?.find((t) => t.codigo === v) ?? null
                        setTipoEventoSel(tipo)
                        setValue('idPaquete', undefined)
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          'rounded-xl dark:bg-gray-800 dark:border-gray-700',
                          fieldState.error && 'border-red-400'
                        )}
                      >
                        <SelectValue placeholder="Selecciona el tipo de evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {(tiposEvento ?? []).map((t) => (
                          <SelectItem key={t.codigo} value={t.codigo}>
                            {t.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nombreNino" className="dark:text-gray-300">
                  Nombre del niño
                </Label>
                <Input
                  id="nombreNino"
                  {...register('nombreNino')}
                  placeholder="Opcional"
                  className={cn(
                    'dark:bg-gray-800 dark:border-gray-700',
                    errors.nombreNino &&
                      'border-red-400 focus-visible:ring-red-300'
                  )}
                />
                {errors.nombreNino && (
                  <p className="text-xs text-red-500">
                    {errors.nombreNino.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="edadCumple" className="dark:text-gray-300">
                  Edad que cumple
                </Label>
                <Controller
                  name="edadCumple"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="edadCumple"
                      type="number"
                      min={edadMin}
                      max={edadMax}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        field.onChange(isNaN(v) ? undefined : v)
                      }}
                      placeholder={`${edadMin}–${edadMax}`}
                      className={cn(
                        'dark:bg-gray-800 dark:border-gray-700',
                        errors.edadCumple &&
                          'border-red-400 focus-visible:ring-red-300'
                      )}
                    />
                  )}
                />
                {errors.edadCumple && (
                  <p className="text-xs text-red-500">
                    {errors.edadCumple.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="aforoDeclarado" className="dark:text-gray-300">
                  Aforo estimado
                  {config?.aforoMaximo && (
                    <span className="ml-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">
                      (máx. {config.aforoMaximo})
                    </span>
                  )}
                </Label>
                <Controller
                  name="aforoDeclarado"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="aforoDeclarado"
                      type="number"
                      min={1}
                      max={aforoMax}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        field.onChange(isNaN(v) ? undefined : v)
                      }}
                      placeholder={`Número de invitados`}
                      className={cn(
                        'dark:bg-gray-800 dark:border-gray-700',
                        errors.aforoDeclarado &&
                          'border-red-400 focus-visible:ring-red-300'
                      )}
                    />
                  )}
                />
                {errors.aforoDeclarado && (
                  <p className="text-xs text-red-500">
                    {errors.aforoDeclarado.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="contactoAdicional"
                  className="dark:text-gray-300"
                >
                  Teléfono o correo adicional
                </Label>
                <Input
                  id="contactoAdicional"
                  {...register('contactoAdicional')}
                  placeholder="9XXXXXXXX o correo@ejemplo.com"
                  className={cn(
                    'dark:bg-gray-800 dark:border-gray-700',
                    errors.contactoAdicional &&
                      'border-red-400 focus-visible:ring-red-300'
                  )}
                />
                {errors.contactoAdicional && (
                  <p className="text-xs text-red-500">
                    {errors.contactoAdicional.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Paquete
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {tipoEventoSel
                  ? `Mostrando paquetes para ${tipoEventoSel.nombre}`
                  : 'Opcional — puede asignarse después'}
              </p>
            </div>
            <Controller
              name="idPaquete"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() ?? ''}
                  onValueChange={(v) =>
                    field.onChange(v ? parseInt(v, 10) : undefined)
                  }
                >
                  <SelectTrigger className="rounded-xl dark:bg-gray-800 dark:border-gray-700">
                    <SelectValue placeholder="Sin paquete seleccionado" />
                  </SelectTrigger>
                  <SelectContent>
                    {paquetesFiltrados.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nombre}
                        {p.precio ? ` · ${formatCurrency(p.precio)}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Canal y presupuesto
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="dark:text-gray-300">Canal de contacto</Label>
                <Controller
                  name="origenContacto"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v || undefined)}
                    >
                      <SelectTrigger className="rounded-xl dark:bg-gray-800 dark:border-gray-700">
                        <SelectValue placeholder="¿Cómo contactó el cliente?" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORIGENES_CONTACTO.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="presupuestoEstimado"
                  className="dark:text-gray-300"
                >
                  Presupuesto acordado (S/)
                </Label>
                <Controller
                  name="presupuestoEstimado"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="presupuestoEstimado"
                      type="number"
                      min={0}
                      step={0.01}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        field.onChange(isNaN(v) ? undefined : v)
                      }}
                      placeholder="0.00"
                      className={cn(
                        'dark:bg-gray-800 dark:border-gray-700',
                        errors.presupuestoEstimado &&
                          'border-red-400 focus-visible:ring-red-300'
                      )}
                    />
                  )}
                />
                {errors.presupuestoEstimado && (
                  <p className="text-xs text-red-500">
                    {errors.presupuestoEstimado.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="extrasLibres" className="dark:text-gray-300">
                Extras solicitados
              </Label>
              <Textarea
                id="extrasLibres"
                {...register('extrasLibres')}
                placeholder={
                  'Un extra por línea\nEj: Torta personalizada\nEj: Decoración temática'
                }
                rows={3}
                className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                Uno por línea. Servicios adicionales que el cliente solicitó y
                no están en el paquete.
              </p>
              {errors.extrasLibres && (
                <p className="text-xs text-red-500">
                  {errors.extrasLibres.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-2">
            <Label htmlFor="observaciones" className="dark:text-gray-300">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              {...register('observaciones')}
              placeholder="Notas internas, solicitudes especiales, detalles del evento..."
              rows={3}
              className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700"
            />
            {errors.observaciones && (
              <p className="text-xs text-red-500">
                {errors.observaciones.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pb-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-1.5 dark:border-gray-700 dark:text-gray-300"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button
              type="submit"
              className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl px-6 gap-2 disabled:opacity-50"
              disabled={!isValid || solicitar.isPending}
            >
              {solicitar.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Crear evento
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4 lg:sticky lg:top-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Resumen del evento
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="h-4 w-4 text-brand-azul shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Fecha
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {format(parseISO(fechaParam), "d 'de' MMMM yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>

              {turnoActual && (
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-brand-azul shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Turno
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {turnoActual.nombre} · {turnoActual.horaInicio}–
                      {turnoActual.horaFin}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800" />

              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Cliente
                  </p>
                  {clienteSel ? (
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {clienteSel.nombreCompleto}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-300 dark:text-gray-600">
                      Sin seleccionar
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <PartyPopper className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Tipo de evento
                  </p>
                  {tipoEventoSel ? (
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {tipoEventoSel.nombre}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-300 dark:text-gray-600">
                      Sin seleccionar
                    </p>
                  )}
                </div>
              </div>

              {paqueteSel && (
                <div className="flex items-start gap-2.5">
                  <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Paquete
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {paqueteSel.nombre}
                    </p>
                    {paqueteSel.precio > 0 && (
                      <p className="text-xs text-brand-azul font-bold">
                        {formatCurrency(paqueteSel.precio)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {watchValues.nombreNino && (
                <div className="flex items-start gap-2.5">
                  <PartyPopper className="h-4 w-4 text-brand-rosa shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Cumpleañero
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {watchValues.nombreNino}
                      {watchValues.edadCumple !== undefined &&
                        ` · ${watchValues.edadCumple} años`}
                    </p>
                  </div>
                </div>
              )}

              {watchValues.aforoDeclarado && (
                <div className="flex items-start gap-2.5">
                  <Users className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Aforo estimado
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {watchValues.aforoDeclarado} personas
                    </p>
                  </div>
                </div>
              )}

              {watchValues.origenContacto && (
                <div className="flex items-start gap-2.5">
                  <Radio className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Canal
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {
                        ORIGENES_CONTACTO.find(
                          (o) => o.value === watchValues.origenContacto
                        )?.label
                      }
                    </p>
                  </div>
                </div>
              )}

              {watchValues.presupuestoEstimado !== undefined && (
                <div className="flex items-start gap-2.5">
                  <Banknote className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      Presupuesto acordado
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(watchValues.presupuestoEstimado)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                <span>Campos clave</span>
                <span className="font-semibold">
                  {
                    [
                      clienteSel,
                      tipoEventoSel,
                      watchValues.aforoDeclarado,
                      watchValues.origenContacto,
                    ].filter(Boolean).length
                  }
                  /4
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-brand-azul transition-all"
                  style={{
                    width: `${([clienteSel, tipoEventoSel, watchValues.aforoDeclarado, watchValues.origenContacto].filter(Boolean).length / 4) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <NuevoClienteModal
        open={modalNuevoCliente}
        onOpenChange={setModalNuevoCliente}
        initialSearch={clienteSearch}
        onCreated={(cliente) => {
          setClienteSel(cliente)
          setClienteSearch(cliente.nombreCompleto)
          setValue('idCliente', cliente.id)
        }}
      />
    </div>
  )
}
