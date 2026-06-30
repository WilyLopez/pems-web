import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, isToday, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useConfiguracionCalendario, useConfiguracionVenta } from '@/hooks/useConfiguracion'
import { usePromociones } from '@/hooks/usePromocion'
import { useDebounce } from '@/hooks/useDebounce'
import { usePrecioDia, useRegistrarVentaMostrador } from './useVentasData'
import { useDisponibilidad } from '@/features/admin/calendario/hooks/useCalendarData'
import { clienteService } from '@/services/cliente.service'
import { consultaService } from '@/services/consulta.service'
import { Cliente } from '@/types/cliente.types'
import { buildVentaMostradorSchema, VentaMostradorFormValues } from '../schema/ventaMostrador.schema'
import { calcularResumenVenta } from '../utils/ventas.utils'
import { PagoLinea } from '../types'

const LOCAL_STORAGE_KEY = 'pems_venta_mostrador_form'
const LOCAL_STORAGE_CLIENTE_KEY = 'pems_venta_mostrador_cliente'

export function useVentaMostradorForm() {
  const { idSede } = useAuth()
  const { edadMin, edadMax } = useConfiguracionVenta()
  const { data: confCal } = useConfiguracionCalendario(idSede ?? null)
  const diasMaxFecha = confCal?.diasMaxReservaPublica ?? 14

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [consultandoDni, setConsultandoDni] = useState(false)
  const [statusBusqueda, setStatusBusqueda] = useState<'IDLE' | 'BUSCANDO' | 'ENCONTRADO' | 'NO_ENCONTRADO'>('IDLE')
  const [borradorRecuperado, setBorradorRecuperado] = useState(false)

  const schema = useMemo(
    () => buildVentaMostradorSchema(edadMin, edadMax),
    [edadMin, edadMax]
  )

  const methods = useForm<VentaMostradorFormValues>({
    resolver: zodResolver(schema) as any,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      fechaVisita: format(new Date(), 'yyyy-MM-dd'),
      ninos: [{ nombreNino: '', edadNino: edadMin }],
      acompanante: { tipoDocumento: 'DNI', nombre: '', dni: '', telefono: '' },
      idPromocion: null,
      pagos: [{ medioPago: 'EFECTIVO', monto: 0 }],
      efectivoRecibido: 0,
      actaFirmada: false,
    },
  })

  const { setValue, reset, watch, formState: { errors, isValid } } = methods

  const fechaVisita = watch('fechaVisita')
  const ninos = watch('ninos')
  const idPromocion = watch('idPromocion')
  const pagos = watch('pagos')
  const efectivoRecibido = watch('efectivoRecibido')
  const acompananteDni = watch('acompanante.dni')
  const tipoDocumento = watch('acompanante.tipoDocumento') || 'DNI'

  useEffect(() => {
    setStatusBusqueda('IDLE')
  }, [acompananteDni])

  const debouncedFecha = useDebounce(fechaVisita, 400)
  const { data: precioDia } = usePrecioDia(idSede ?? null, debouncedFecha)
  const { data: disponibilidad, isLoading: isLoadingDisp } = useDisponibilidad(idSede ?? 0, debouncedFecha)
  const { data: promociones } = usePromociones()
  const registrar = useRegistrarVentaMostrador()

  const tieneMetodoEfectivo = (pagos as PagoLinea[]).some(
    (p) => p.medioPago === 'EFECTIVO'
  )

  useEffect(() => {
    if (!tieneMetodoEfectivo) {
      setValue('efectivoRecibido', 0)
    }
  }, [tieneMetodoEfectivo, setValue])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedForm = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedForm) {
        try {
          const parsed = JSON.parse(savedForm)
          reset(parsed)
          setBorradorRecuperado(true)
        } catch {}
      }
      const savedCliente = localStorage.getItem(LOCAL_STORAGE_CLIENTE_KEY)
      if (savedCliente) {
        try {
          const parsed = JSON.parse(savedCliente)
          setCliente(parsed)
        } catch {}
      }
    }
  }, [reset])

  const watchedValues = watch()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchedValues))
    }
  }, [watchedValues])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (cliente) {
        localStorage.setItem(LOCAL_STORAGE_CLIENTE_KEY, JSON.stringify(cliente))
      } else {
        localStorage.removeItem(LOCAL_STORAGE_CLIENTE_KEY)
      }
    }
  }, [cliente])

  useEffect(() => {
    if (cliente) {
      setValue('acompanante.nombre', cliente.nombreCompleto.toUpperCase())
      setValue('acompanante.dni', cliente.numeroDocumento)
      setValue('acompanante.telefono', cliente.telefono || '')
    } else {
      setValue('acompanante.nombre', '')
      setValue('acompanante.dni', '')
      setValue('acompanante.telefono', '')
    }
  }, [cliente, setValue])

  const precioUnit = precioDia?.precio ?? 0
  const promocionActual = promociones?.find(
    (p) => p.id === idPromocion && p.activo
  )

  const {
    subtotal,
    descuento,
    total,
    sumaPagos,
    efectivoAplicado,
    vuelto,
    montosCoinciden,
  } = useMemo(
    () =>
      calcularResumenVenta(
        precioUnit,
        ninos,
        promocionActual,
        pagos as any,
        efectivoRecibido
      ),
    [precioUnit, ninos, promocionActual, pagos, efectivoRecibido]
  )

  const efectivoInsuficiente = useMemo(() => {
    return efectivoAplicado > 0 && efectivoRecibido < efectivoAplicado
  }, [efectivoAplicado, efectivoRecibido])

  const esHoy = useMemo(() => isToday(parseISO(fechaVisita)), [fechaVisita])

  const fueraDeHorario = useMemo(() => {
    if (!esHoy || !confCal) return false
    const ahora = new Date()
    const horaActual = ahora.getHours() * 100 + ahora.getMinutes()
    const [hCierra, mCierra] = confCal.turnoT2Fin.split(':').map(Number)
    const horaCierra = hCierra * 100 + mCierra
    return horaActual > horaCierra
  }, [esHoy, confCal])

  const estaBloqueado = useMemo(() => {
    if (isLoadingDisp || !disponibilidad) return false
    if (fueraDeHorario) return true
    return !disponibilidad.disponiblePublico
  }, [disponibilidad, isLoadingDisp, fueraDeHorario])

  const plazasDisponibles = disponibilidad?.plazasDisponibles
  const exceedsAforo =
    plazasDisponibles != null && ninos.length > plazasDisponibles
  const precioValido = !precioDia || precioDia.precio > 0

  const puedeRegistrar =
    isValid &&
    montosCoinciden &&
    !estaBloqueado &&
    !registrar.isPending &&
    !efectivoInsuficiente &&
    precioValido &&
    !exceedsAforo

  const consultarAcompananteDni = async () => {
    const dni = acompananteDni?.trim()
    const isRuc = tipoDocumento === 'RUC'
    const len = isRuc ? 11 : 8
    if (!dni || dni.length !== len) {
      toast.error(`Ingresa un ${tipoDocumento} de ${len} dígitos para consultar`)
      return
    }
    if (!idSede) {
      toast.error('No se ha detectado una sede activa')
      return
    }
    setConsultandoDni(true)
    try {
      const localRes = await clienteService.listar({ search: dni, size: 1 })
      const found = localRes.content.find((c: Cliente) => c.numeroDocumento === dni)
      if (found) {
        setCliente(found as any)
        setValue('acompanante.nombre', found.nombreCompleto.toUpperCase())
        setValue('acompanante.telefono', found.telefono || '')
        toast.success('Cliente encontrado en la base de datos')
      } else {
        let data
        if (isRuc) {
          data = await consultaService.consultarRuc(dni, idSede)
        } else {
          data = await consultaService.consultarDni(dni, idSede)
        }

        if (data) {
          const rData = data as any
          if (rData.nombreCompleto || rData.razonSocial) {
            setCliente(null)
            const name = isRuc ? rData.razonSocial : rData.nombreCompleto
            setValue('acompanante.nombre', name.toUpperCase())
            toast.success(`${tipoDocumento} del acompañante consultado con éxito (nuevo cliente)`)
            setStatusBusqueda('ENCONTRADO')
          } else {
            toast.error(`No se encontraron datos para el ${tipoDocumento} del acompañante`)
            setStatusBusqueda('NO_ENCONTRADO')
          }
        } else {
          toast.error(`No se encontraron datos para el ${tipoDocumento} del acompañante`)
          setStatusBusqueda('NO_ENCONTRADO')
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || `Error al consultar ${tipoDocumento} del acompañante`
      if (errorMsg === 'LIMIT_EXCEEDED') {
        toast.error('Lote de consultas mensual agotado para el proveedor seleccionado.')
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setConsultandoDni(false)
    }
  }

  const cleanLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      localStorage.removeItem(LOCAL_STORAGE_CLIENTE_KEY)
    }
  }

  return {
    methods,
    cliente,
    setCliente,
    consultandoDni,
    consultarAcompananteDni,
    fechaVisita,
    ninos,
    idPromocion,
    pagos,
    efectivoRecibido,
    acompananteDni,
    precioDia,
    isLoadingDisp,
    plazasDisponibles,
    exceedsAforo,
    precioValido,
    estaBloqueado,
    esHoy,
    total,
    subtotal,
    descuento,
    vuelto,
    sumaPagos,
    efectivoAplicado,
    efectivoInsuficiente,
    montosCoinciden,
    puedeRegistrar,
    promociones,
    promocionActual,
    precioUnit,
    registrar,
    cleanLocalStorage,
    diasMaxFecha,
    errors,
    setValue,
    idSede,
    edadMin,
    edadMax,
    disponibilidad,
    confCal,
    statusBusqueda,
    setStatusBusqueda,
    borradorRecuperado,
    setBorradorRecuperado,
  }
}
