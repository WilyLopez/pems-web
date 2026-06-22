'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useMiCuentaData } from '@/features/cliente/mi-cuenta/hooks/useMiCuentaData'
import { eventoService } from '@/services/evento.service'
import { clienteKeys } from '@/features/cliente/shared/queryKeys'
import { BeneficiosVip } from '@/features/cliente/mi-cuenta/components/ui/BeneficiosVip'
import { ErrorState } from '@/components/common/Errorstate'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionCard } from '@/features/cliente/shared/components/SectionCard'
import { Star, Award, ShieldCheck, HelpCircle, Gift, Sparkles, ChevronRight } from 'lucide-react'
import Link from 'next/link'

function BeneficiosSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-2xl md:col-span-1" />
        <Skeleton className="h-96 rounded-2xl md:col-span-2" />
      </div>
    </div>
  )
}

export default function BeneficiosPage() {
  const { clientePerfilId, isAuthenticated } = useAuth()

  const {
    cliente,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useMiCuentaData(clientePerfilId ?? undefined)

  const {
    data: eventosData,
    isLoading: isEventosLoading,
    isError: isEventosError,
    refetch: refetchEventos,
  } = useQuery({
    queryKey: clienteKeys.eventos.list({ page: 0, size: 50 }),
    queryFn: () => eventoService.listar({ page: 0, size: 50 }),
    enabled: isAuthenticated && !!clientePerfilId,
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = isProfileLoading || isEventosLoading
  const isError = isProfileError || isEventosError

  const handleRetry = () => {
    refetchProfile()
    refetchEventos()
  }

  if (isLoading) return <BeneficiosSkeleton />

  if (isError || !cliente) {
    return (
      <ErrorState
        message="Ocurrió un error al cargar tus beneficios. Por favor, intenta de nuevo."
        onRetry={handleRetry}
      />
    )
  }

  const eventos = eventosData?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
          Mis beneficios
        </h1>
        <p className="text-sm text-gray-500">
          Consulta tu nivel de fidelidad, beneficios VIP y ventajas exclusivas por tu preferencia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Columna Izquierda: Tarjeta de fidelidad actual */}
        <div className="space-y-4 md:col-span-1">
          <BeneficiosVip cliente={cliente} eventos={eventos} />

          {/* Tarjeta estática informativa de nivel VIP */}
          <div className="bg-gradient-to-br from-indigo-900 to-brand-azul text-white rounded-2xl p-5 shadow-sm border border-indigo-950/20 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-300" />
              <p className="font-bold text-sm">¿Cómo subir a VIP?</p>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Completa 5 visitas y automáticamente pasarás a ser <strong>Cliente Frecuente</strong>.
            </p>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Nuestros clientes más leales reciben invitaciones directas a la categoría <strong>VIP</strong>, que incluye descuentos exclusivos en celebraciones de cumpleaños y reservas.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Todos los beneficios disponibles en el programa */}
        <div className="md:col-span-2 space-y-6">
          <SectionCard titulo="Beneficios exclusivos de tu membresía" icon={Sparkles}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {[
                {
                  titulo: 'Reservas prioritarias',
                  descripcion: 'Accede antes que nadie a las fechas de mayor demanda para celebraciones privadas.',
                  icon: Gift,
                  color: 'text-amber-500 bg-amber-50 border-amber-100',
                },
                {
                  titulo: 'Descuentos acumulativos',
                  descripcion: 'Tus compras y visitas se acumulan para darte acceso a mayores porcentajes de descuento.',
                  icon: ShieldCheck,
                  color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
                },
                {
                  titulo: 'Atención personalizada',
                  descripcion: 'Un ejecutivo de eventos a tu disposición para organizar cada detalle de tu fiesta.',
                  icon: Sparkles,
                  color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
                },
                {
                  titulo: 'Preventa y ofertas',
                  descripcion: 'Recibe promociones de preventa en entradas para la Zona de Juegos y eventos de temporada.',
                  icon: Award,
                  color: 'text-rose-500 bg-rose-50 border-rose-100',
                },
              ].map((item) => (
                <div key={item.titulo} className="flex gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all bg-gray-50/30">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900">{item.titulo}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard titulo="¿Tienes preguntas?" icon={HelpCircle}>
            <div className="space-y-3 mt-2">
              <p className="text-xs text-gray-500 leading-relaxed">
                Si consideras que hay un error en tu contador de visitas o necesitas asistencia para aplicar tus descuentos VIP en una cotización, ponte en contacto con nosotros.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://wa.me/51987654321"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Contactar por WhatsApp
                </a>
                <Link
                  href="/cliente"
                  className="inline-flex items-center justify-center text-xs font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 hover:bg-gray-100 rounded-xl transition-all gap-1"
                >
                  Volver al inicio
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
