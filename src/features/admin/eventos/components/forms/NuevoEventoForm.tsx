'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
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
} from 'lucide-react'
import { nuevoEventoSchema, NuevoEventoFormValues } from '../../schema/nuevoEvento.schema'
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

export function NuevoEventoForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { idSede }   = useAuth()

  const fechaParam   = searchParams.get('fecha')   ?? ''
  const idTurnoParam = searchParams.get('idTurno')
  const idTurno      = idTurnoParam ? parseInt(idTurnoParam) : null

  const { data: turnos }      = useTurnos(idSede)
  const turnoActual            = turnos?.find((t) => t.id === idTurno)
  const { data: paquetes }    = usePaquetesPublico()
  const { data: tiposEvento } = useTiposEventoPublico()
  const { data: config }      = useConfiguracionCalendario(idSede!)

  const edadMin = config?.edadMinCumple ?? 0
  const edadMax = config?.edadMaxCumple ?? 18

  const [clienteSearch, setClienteSearch]       = useState('')
  const [clienteSel, setClienteSel]             = useState<Cliente | null>(null)
  const [showDropdown, setShowDropdown]         = useState(false)
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false)
  const [tipoEventoSel, setTipoEventoSel]       = useState<TipoEvento | null>(null)

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
    formState: { errors },
  } = useForm<NuevoEventoFormValues>({
    resolver: zodResolver(nuevoEventoSchema),
  })

  const watchValues = watch()

  const paquetesFiltrados = tipoEventoSel
    ? (paquetes ?? []).filter((p) => !p.tipoEventoCodigo || p.tipoEventoCodigo === tipoEventoSel.codigo)
    : (paquetes ?? [])

  const paqueteSel = paquetesFiltrados.find((p) => p.id === watchValues.idPaquete)

  if (!idSede) return <ErrorState message="No tienes sede asignada. Contacta al administrador." />
  if (!fechaParam || !idTurno) return <ErrorState message="Parámetros de fecha o turno inválidos." />

  const onSubmit = (values: NuevoEventoFormValues) => {
    solicitar.mutate(
      {
        idCliente: values.idCliente,
        idSede,
        payload: {
          idTurno,
          fechaEvento: fechaParam,
          tipoEvento: values.tipoEvento,
          contactoAdicional: values.contactoAdicional || undefined,
          aforoDeclarado: values.aforoDeclarado,
          nombreNino: values.nombreNino || undefined,
          edadCumple: values.edadCumple,
          idPaquete: values.idPaquete,
          observaciones: values.observaciones || undefined,
        },
      },
      { onSuccess: (evento) => router.push(ADMIN_ROUTES.eventoDetalle(evento.id)) }
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-5">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-brand-azul" />
          <span className="font-semibold text-gray-700 capitalize">
            {format(parseISO(fechaParam), "EEEE d 'de' MMMM yyyy", { locale: es })}
          </span>
        </div>
        {turnoActual && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-brand-azul" />
            <span className="text-gray-600">
              {turnoActual.nombre} · {turnoActual.horaInicio}–{turnoActual.horaFin}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Cliente */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Cliente</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg gap-1.5 text-xs text-brand-azul border-brand-azul/30 hover:bg-brand-azul/5"
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
                  <Label>Buscar cliente *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      value={clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value)
                        if (clienteSel) { setClienteSel(null); field.onChange(undefined) }
                        setShowDropdown(true)
                      }}
                      onFocus={() => clienteSearch.length >= 2 && setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                      placeholder="Nombre o número de documento..."
                      autoComplete="off"
                      readOnly={!!clienteSel}
                      className={cn(
                        'pl-9 pr-8',
                        fieldState.error && 'border-red-400 focus-visible:ring-red-300'
                      )}
                    />
                    {clienteSel ? (
                      <button
                        type="button"
                        onClick={() => { setClienteSel(null); setClienteSearch(''); field.onChange(undefined) }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : buscandoClientes ? (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                    ) : null}
                  </div>

                  {showDropdown && !clienteSel && clientes.length > 0 && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
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
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="text-sm font-medium text-gray-900">{c.nombreCompleto}</div>
                          <div className="text-xs text-gray-400">
                            {c.tipoDocumentoCodigo} {c.numeroDocumento}
                            {c.telefono && ` · ${c.telefono}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {fieldState.error && (
                    <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Detalles */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Detalles del evento</h2>

            <div className="space-y-1">
              <Label>Tipo de evento *</Label>
              <Controller
                name="tipoEvento"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => {
                        field.onChange(v)
                        const tipo = tiposEvento?.find((t) => t.codigo === v) ?? null
                        setTipoEventoSel(tipo)
                        setValue('idPaquete', undefined)
                      }}
                    >
                      <SelectTrigger className={cn('rounded-xl', fieldState.error && 'border-red-400')}>
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
                      <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nombreNino">Nombre del niño</Label>
                <Input
                  id="nombreNino"
                  {...register('nombreNino')}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edadCumple">Edad que cumple</Label>
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
                        const v = parseInt(e.target.value)
                        field.onChange(isNaN(v) ? undefined : v)
                      }}
                      placeholder={`${edadMin}–${edadMax}`}
                      className={cn(errors.edadCumple && 'border-red-400 focus-visible:ring-red-300')}
                    />
                  )}
                />
                {errors.edadCumple && (
                  <p className="text-xs text-red-500">{errors.edadCumple.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="aforoDeclarado">Aforo estimado</Label>
                <Controller
                  name="aforoDeclarado"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="aforoDeclarado"
                      type="number"
                      min={1}
                      max={config?.aforoMaximo ?? 60}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = parseInt(e.target.value)
                        field.onChange(isNaN(v) ? undefined : v)
                      }}
                      placeholder={`Número de invitados (máx. ${config?.aforoMaximo ?? 60})`}
                      className={cn(errors.aforoDeclarado && 'border-red-400 focus-visible:ring-red-300')}
                    />
                  )}
                />
                {errors.aforoDeclarado && (
                  <p className="text-xs text-red-500">{errors.aforoDeclarado.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="contactoAdicional">Contacto adicional</Label>
                <Input
                  id="contactoAdicional"
                  {...register('contactoAdicional')}
                  placeholder="Teléfono o correo alternativo"
                />
              </div>
            </div>
          </div>

          {/* Paquete */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Paquete</h2>
              <p className="text-xs text-gray-400 mt-0.5">
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
                  onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)}
                >
                  <SelectTrigger className="rounded-xl">
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

          {/* Observaciones */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              {...register('observaciones')}
              placeholder="Notas internas, solicitudes especiales, detalles del evento..."
              rows={3}
              className="rounded-xl resize-none"
            />
            {errors.observaciones && (
              <p className="text-xs text-red-500">{errors.observaciones.message}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end pb-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-1.5"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button
              type="submit"
              className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl px-6 gap-2"
              disabled={solicitar.isPending}
            >
              {solicitar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear evento
            </Button>
          </div>
        </form>

        {/* Resumen en tiempo real */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 lg:sticky lg:top-4">
            <h3 className="text-sm font-bold text-gray-900">Resumen del evento</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="h-4 w-4 text-brand-azul shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fecha</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {format(parseISO(fechaParam), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              {turnoActual && (
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-brand-azul shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Turno</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {turnoActual.nombre} · {turnoActual.horaInicio}–{turnoActual.horaFin}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100" />

              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cliente</p>
                  {clienteSel ? (
                    <p className="text-sm font-semibold text-gray-900">{clienteSel.nombreCompleto}</p>
                  ) : (
                    <p className="text-sm text-gray-300">Sin seleccionar</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <PartyPopper className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tipo de evento</p>
                  {tipoEventoSel ? (
                    <p className="text-sm font-semibold text-gray-900">{tipoEventoSel.nombre}</p>
                  ) : (
                    <p className="text-sm text-gray-300">Sin seleccionar</p>
                  )}
                </div>
              </div>

              {paqueteSel && (
                <div className="flex items-start gap-2.5">
                  <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Paquete</p>
                    <p className="text-sm font-semibold text-gray-900">{paqueteSel.nombre}</p>
                    {paqueteSel.precio > 0 && (
                      <p className="text-xs text-brand-azul font-bold">{formatCurrency(paqueteSel.precio)}</p>
                    )}
                  </div>
                </div>
              )}

              {watchValues.nombreNino && (
                <div className="flex items-start gap-2.5">
                  <PartyPopper className="h-4 w-4 text-brand-rosa shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cumpleañero</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {watchValues.nombreNino}
                      {watchValues.edadCumple !== undefined && ` · ${watchValues.edadCumple} años`}
                    </p>
                  </div>
                </div>
              )}

              {watchValues.aforoDeclarado && (
                <div className="flex items-start gap-2.5">
                  <Users className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Aforo estimado</p>
                    <p className="text-sm font-semibold text-gray-900">{watchValues.aforoDeclarado} personas</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Completado</span>
                <span className="font-semibold">
                  {[clienteSel, tipoEventoSel].filter(Boolean).length}/2 campos clave
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-brand-azul transition-all"
                  style={{ width: `${([clienteSel, tipoEventoSel].filter(Boolean).length / 2) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <NuevoClienteModal
        open={modalNuevoCliente}
        onOpenChange={setModalNuevoCliente}
        onCreated={(cliente) => {
          setClienteSel(cliente)
          setClienteSearch(cliente.nombreCompleto)
          setValue('idCliente', cliente.id)
        }}
      />
    </div>
  )
}
