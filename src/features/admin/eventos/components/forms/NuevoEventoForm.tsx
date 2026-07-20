'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ChevronLeft, Loader2 } from 'lucide-react'
import {
  buildNuevoEventoSchema,
  NuevoEventoFormValues,
} from '../../schema/nuevoEvento.schema'
import { ApiError } from '@/types/api.types'
import { useSolicitarEvento, useTurnos } from '../../hooks/useEventos'
import { useEventoDraft } from '../../hooks/useEventoDraft'
import { mapFormValuesToPayload } from '../../utils/mapFormValuesToPayload'
import { usePaquetesPublico } from '@/features/admin/comercial/paquetes/hooks/usePaquetes'
import { useTiposEventoPublico } from '@/features/admin/comercial/tipos-evento/hooks/useTiposEvento'
import { TipoEvento } from '@/types/comercial.types'
import { Cliente } from '@/features/admin/clientes/types'
import { NuevoClienteModal } from '@/features/admin/clientes/components/forms/NuevoClienteModal'
import { useAuth } from '@/hooks/useAuth'
import { useConfiguracionCalendario } from '@/hooks/useCalendario'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Textarea } from '@/components/ui/Textarea'
import { ADMIN_ROUTES } from '@/config/routes'
import { StepperCreacionEvento } from '../StepperCreacionEvento'
import { ClienteBuscador } from './campos/ClienteBuscador'
import { DetallesEventoFields } from './campos/DetallesEventoFields'
import { PaqueteSelector } from './campos/PaqueteSelector'
import { ExtrasYServiciosSelector } from './campos/ExtrasYServiciosSelector'
import { CanalYPresupuestoFields } from './campos/CanalYPresupuestoFields'
import { ResumenEventoPanel } from './ResumenEventoPanel'
import { EventoDraftAutoSave } from './EventoDraftAutoSave'
import { EventoFechaTurnoCard } from './EventoFechaTurnoCard'

const DRAFT_KEY = 'nuevo-evento-draft'

export function NuevoEventoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { idSede } = useAuth()

  const fechaParam = searchParams.get('fecha') ?? ''
  const idTurnoParam = searchParams.get('idTurno')
  const idTurno = idTurnoParam ? parseInt(idTurnoParam, 10) : null

  const { initialDraft, limpiar: limpiarDraft } = useEventoDraft(DRAFT_KEY)

  const [idTurnoSel, setIdTurnoSel] = useState<number | null>(idTurno)

  const { data: turnos } = useTurnos(idSede)
  const turnoActual = turnos?.find((t) => t.id === idTurnoSel)
  const { data: paquetes, isLoading: loadingPaquetes } = usePaquetesPublico()
  const { data: tiposEvento, isLoading: loadingTiposEvento } =
    useTiposEventoPublico()
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
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false)
  const [tipoEventoSel, setTipoEventoSel] = useState<TipoEvento | null>(
    () => initialDraft?.tipoEventoSel ?? null
  )
  const [serviciosPendientes, setServiciosPendientes] = useState(false)

  const solicitar = useSolicitarEvento()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isValid, dirtyFields },
  } = useForm<NuevoEventoFormValues>({
    resolver: zodResolver(schema) as Resolver<NuevoEventoFormValues>,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      ...(initialDraft?.formValues ?? {}),
      idTurno: idTurno ?? undefined,
      fechaEvento: fechaParam || undefined,
    },
  })

  const paquetesFiltrados = tipoEventoSel
    ? (paquetes ?? []).filter(
        (p) =>
          !p.tipoEventoCodigo || p.tipoEventoCodigo === tipoEventoSel.codigo
      )
    : (paquetes ?? [])

  if (!idSede)
    return (
      <ErrorState message="No tienes sede asignada. Contacta al administrador." />
    )
  if (!fechaParam || !idTurno || isNaN(idTurno) || idTurno <= 0) {
    return <ErrorState message="Parámetros de fecha o turno inválidos." />
  }

  const handleTurnoChange = (nuevoIdTurno: number) => {
    setIdTurnoSel(nuevoIdTurno)
    setValue('idTurno', nuevoIdTurno, { shouldValidate: true })
  }

  const motivoDeshabilitado = !clienteSel
    ? 'Completa el campo Cliente para continuar.'
    : !tipoEventoSel
      ? 'Completa el campo Tipo de evento para continuar.'
      : serviciosPendientes
        ? 'Elige una opción para cada servicio de catálogo seleccionado.'
        : !isValid
          ? 'Corrige los errores del formulario para continuar.'
          : null

  const onSubmit = (values: NuevoEventoFormValues) => {
    solicitar.mutate(
      {
        idCliente: values.idCliente,
        idSede,
        payload: mapFormValuesToPayload(values),
      },
      {
        onSuccess: (evento) => {
          limpiarDraft()
          router.push(ADMIN_ROUTES.eventoDetalle(evento.id))
        },
        onError: (err: ApiError) => {
          const fieldErrors = err.erroresCampo ?? []
          const errorTurno = fieldErrors.find((e) => e.campo === 'idTurno')

          fieldErrors.forEach((error) => {
            if (
              error.campo &&
              error.campo !== 'idTurno' &&
              error.campo in values
            ) {
              setError(error.campo as keyof NuevoEventoFormValues, {
                type: 'server',
                message: error.mensaje,
              })
            }
          })

          if (errorTurno) {
            toast.error(errorTurno.mensaje, {
              action: {
                label: 'Volver a elegir turno',
                onClick: () =>
                  router.push(`/admin/eventos/nuevo?fecha=${fechaParam}`),
              },
            })
          }
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <StepperCreacionEvento pasoActual={2} />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          <span className="text-red-500">*</span> Campo obligatorio
        </p>
      </div>

      <EventoFechaTurnoCard
        fechaParam={fechaParam}
        turnoActual={turnoActual}
        idSede={idSede}
        idTurnoSel={idTurnoSel}
        onTurnoChange={handleTurnoChange}
      />

      <div className="grid gap-5 md:grid-cols-[1fr_260px] xl:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <ClienteBuscador
            control={control}
            register={register}
            errors={errors}
            clienteSel={clienteSel}
            onClienteSelChange={setClienteSel}
            clienteSearch={clienteSearch}
            onClienteSearchChange={setClienteSearch}
            onNuevoCliente={() => setModalNuevoCliente(true)}
          />

          <DetallesEventoFields
            control={control}
            errors={errors}
            setValue={setValue}
            tiposEvento={tiposEvento ?? []}
            loadingTiposEvento={loadingTiposEvento}
            tipoEventoSel={tipoEventoSel}
            onTipoEventoChange={setTipoEventoSel}
            edadMin={edadMin}
            edadMax={edadMax}
            aforoMax={aforoMax}
            aforoMaximoConfig={config?.aforoMaximo}
            aforoTocado={!!dirtyFields.aforoDeclarado}
          />

          <PaqueteSelector
            control={control}
            setValue={setValue}
            tipoEventoSel={tipoEventoSel}
            paquetesFiltrados={paquetesFiltrados}
            loadingPaquetes={loadingPaquetes}
            aforoTocado={!!dirtyFields.aforoDeclarado}
            presupuestoTocado={!!dirtyFields.presupuestoEstimado}
          />

          <ExtrasYServiciosSelector
            control={control}
            register={register}
            errors={errors}
            onPendienteChange={setServiciosPendientes}
          />

          <CanalYPresupuestoFields
            control={control}
            errors={errors}
            presupuestoTocado={!!dirtyFields.presupuestoEstimado}
          />

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <FormField
              id="observaciones"
              label="Observaciones"
              error={errors.observaciones?.message}
            >
              {(fieldProps) => (
                <Textarea
                  {...fieldProps}
                  {...register('observaciones')}
                  placeholder="Notas internas, solicitudes especiales, detalles del evento..."
                  rows={3}
                  className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700"
                />
              )}
            </FormField>
          </div>

          <div className="flex flex-col items-end gap-1.5 pb-4">
            {motivoDeshabilitado && !solicitar.isPending && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {motivoDeshabilitado}
              </p>
            )}
            <div className="flex gap-3 justify-end">
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
                disabled={
                  !isValid || serviciosPendientes || solicitar.isPending
                }
              >
                {solicitar.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Crear evento
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <ResumenEventoPanel
            control={control}
            fechaParam={fechaParam}
            turnoActual={turnoActual}
            clienteSel={clienteSel}
            tipoEventoSel={tipoEventoSel}
            paquetesFiltrados={paquetesFiltrados}
          />
        </div>
      </div>

      <EventoDraftAutoSave
        control={control}
        draftKey={DRAFT_KEY}
        clienteSel={clienteSel}
        clienteSearch={clienteSearch}
        tipoEventoSel={tipoEventoSel}
      />

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
