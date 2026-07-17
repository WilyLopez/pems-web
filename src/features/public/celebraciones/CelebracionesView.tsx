'use client'

import { Cake, Baby, GraduationCap, Star, Building2, CalendarDays } from 'lucide-react'
import { usePaquetesPublico, useTiposEventoPublico } from '@/hooks/useComercial'
import { usePublicConfig } from '@/features/public/shared/hooks/usePublicConfig'
import { GaleriaPublica } from '@/features/public/shared/components/GaleriaPublica'
import { CelebracionesHero } from './components/CelebracionesHero'
import { TiposEvento, TipoEventoItem } from './components/TiposEvento'
import { Paquetes } from './components/Paquetes'
import { Servicios } from './components/Servicios'
import { Pasos } from './components/Pasos'
import { CtaInstituciones } from './components/CtaInstituciones'
import { CelebracionesCta } from './components/CelebracionesCta'

const tiposEventosPorDefecto: TipoEventoItem[] = [
  {
    icon: Cake,
    nombre: 'Cumpleaños infantiles',
    desc: 'El clásico que nunca falla. Personaliza cada detalle.',
  },
  {
    icon: Baby,
    nombre: 'Baby shower',
    desc: 'Celebra la llegada del nuevo integrante de la familia.',
  },
  {
    icon: GraduationCap,
    nombre: 'Fin de año escolar',
    desc: 'Premia a los niños con una fiesta increíble.',
  },
  {
    icon: Star,
    nombre: 'Eventos temáticos',
    desc: 'Superhéroes, princesas, dinosaurios y más.',
  },
  {
    icon: Building2,
    nombre: 'Salidas escolares',
    desc: 'Grupos de hasta 60 niños con actividades dirigidas.',
  },
  {
    icon: CalendarDays,
    nombre: 'Celebraciones familiares',
    desc: 'Reuniones y eventos con zona infantil.',
  },
]

export function CelebracionesView() {
  const { data: paquetes, isLoading: loadingPaquetes } = usePaquetesPublico()
  const { data: config } = usePublicConfig()
  const { data: tiposEventosQuery = [] } = useTiposEventoPublico()

  const tiposEventos: TipoEventoItem[] =
    tiposEventosQuery.length > 0
      ? tiposEventosQuery.map((t) => ({
          icon: t.icono,
          nombre: t.nombre,
          desc: t.descripcion || '',
        }))
      : tiposEventosPorDefecto

  const whatsappNumero = config?.whatsapp?.replace(/\D/g, '') ?? null
  const whatsappUrl = whatsappNumero ? `https://wa.me/${whatsappNumero}` : null

  return (
    <>
      <CelebracionesHero whatsappUrl={whatsappUrl} />
      <TiposEvento tipos={tiposEventos} />
      <Paquetes
        paquetes={paquetes}
        loading={loadingPaquetes}
        whatsappUrl={whatsappUrl}
      />
      <Servicios />
      <GaleriaPublica id="momentos" />
      <Pasos />
      <CtaInstituciones whatsappUrl={whatsappUrl} />
      <CelebracionesCta whatsappUrl={whatsappUrl} />
    </>
  )
}
