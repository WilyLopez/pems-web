'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  FileText,
  Settings,
  Globe,
  Star,
  LayoutGrid,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { bannerService } from '@/services/banner.service'
import { resenaService } from '@/services/resena.service'
import { faqService } from '@/services/faq.service'
import { galeriaService } from '@/services/galeria.service'

interface CmsModuleCard {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  badge?: string | number
  badgeVariant?: 'default' | 'destructive' | 'secondary'
}

function StatSkeleton() {
  return <Skeleton className="h-[88px] rounded-xl" />
}

function ModuleCard({ mod }: { mod: CmsModuleCard }) {
  return (
    <Link href={mod.href}>
      <Card className="group hover:shadow-card-hover transition-all duration-200 cursor-pointer h-full border border-border/60">
        <CardContent className="p-4 flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mod.color}`}
          >
            {mod.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-900 group-hover:text-brand-azul transition-colors">
                {mod.title}
              </h3>
              {mod.badge !== undefined && (
                <Badge
                  variant={mod.badgeVariant ?? 'secondary'}
                  className="h-5 px-1.5 text-xs"
                >
                  {mod.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {mod.description}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-brand-azul shrink-0 mt-0.5 transition-colors" />
        </CardContent>
      </Card>
    </Link>
  )
}

export default function CmsDashboardPage() {
  const { data: bannersData, isLoading: loadingBanners } = useQuery({
    queryKey: ['banners', 0, 1],
    queryFn: () => bannerService.listar(0, 1),
    staleTime: 30_000,
  })

  const { data: pendientesData, isLoading: loadingPendientes } = useQuery({
    queryKey: ['resenas', 'pendientes', 0, 1],
    queryFn: () => resenaService.listar(true, 0, 1),
    staleTime: 30_000,
  })

  const { data: faqsData, isLoading: loadingFaqs } = useQuery({
    queryKey: ['faqs-count'],
    queryFn: () => faqService.listarAdmin(),
    staleTime: 60_000,
  })

  const { data: galeriaData, isLoading: loadingGaleria } = useQuery({
    queryKey: ['galeria', 0, 1],
    queryFn: () => galeriaService.listar(0, 1),
    staleTime: 30_000,
  })

  const stats = [
    {
      label: 'Banners activos',
      value: bannersData?.totalElements ?? '—',
      icon: <ImageIcon className="h-4 w-4 text-brand-azul" />,
      bg: 'bg-brand-azul/10',
      loading: loadingBanners,
    },
    {
      label: 'Reseñas pendientes',
      value: pendientesData?.totalElements ?? '—',
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      bg: 'bg-amber-50',
      loading: loadingPendientes,
      alert: (pendientesData?.totalElements ?? 0) > 0,
    },
    {
      label: 'FAQs publicadas',
      value: faqsData?.filter((f) => f.visible)?.length ?? '—',
      icon: <HelpCircle className="h-4 w-4 text-brand-menta" />,
      bg: 'bg-brand-menta/10',
      loading: loadingFaqs,
    },
    {
      label: 'Imágenes en galería',
      value: galeriaData?.totalElements ?? '—',
      icon: <LayoutGrid className="h-4 w-4 text-brand-rosa" />,
      bg: 'bg-brand-rosa/10',
      loading: loadingGaleria,
    },
  ]

  const modules: CmsModuleCard[] = [
    {
      title: 'Banners',
      description:
        'Gestiona los banners del hero de la página principal. Control de fechas, orden y visibilidad.',
      href: '/admin/cms/banners',
      icon: <ImageIcon className="h-5 w-5 text-brand-azul" />,
      color: 'bg-brand-azul/10',
      badge: bannersData?.totalElements,
    },
    {
      title: 'Reseñas',
      description:
        'Modera las reseñas de clientes. Aprueba, responde y destaca las mejores opiniones.',
      href: '/admin/cms/resenas',
      icon: <Star className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50',
      badge: pendientesData?.totalElements
        ? `${pendientesData.totalElements} pendientes`
        : undefined,
      badgeVariant: 'destructive',
    },
    {
      title: 'Preguntas Frecuentes',
      description:
        'Crea y ordena las FAQs que se muestran en el sitio público.',
      href: '/admin/cms/faq',
      icon: <HelpCircle className="h-5 w-5 text-brand-menta" />,
      color: 'bg-brand-menta/10',
      badge: faqsData?.length,
    },
    {
      title: 'Contenido Legal',
      description:
        'Edita términos y condiciones, privacidad, reembolsos y protección de menores.',
      href: '/admin/cms/legal',
      icon: <FileText className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      title: 'Galería de Imágenes',
      description:
        'Sube y organiza las imágenes del sitio. Marca las destacadas para el público.',
      href: '/admin/cms/galeria',
      icon: <LayoutGrid className="h-5 w-5 text-brand-rosa" />,
      color: 'bg-brand-rosa/10',
      badge: galeriaData?.totalElements,
    },
    {
      title: 'Configuración Pública',
      description:
        'Administra datos del negocio: logos, redes, horarios, SEO y configuración visual.',
      href: '/admin/cms/configuracion-publica',
      icon: <Settings className="h-5 w-5 text-gray-600" />,
      color: 'bg-gray-100',
    },
    {
      title: 'Contenido Web',
      description:
        'Edita los textos dinámicos del sitio organizados por secciones.',
      href: '/admin/cms/contenido',
      icon: <Globe className="h-5 w-5 text-indigo-600" />,
      color: 'bg-indigo-50',
    },
    {
      title: 'Moderación Mensajes',
      description:
        'Gestiona mensajes y consultas enviadas desde el sitio público.',
      href: '/admin/cms/resenas',
      icon: <MessageSquare className="h-5 w-5 text-green-600" />,
      color: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'CMS' }]} />

      <PageHeader
        title="CMS"
        description="Panel de gestión de contenido del sitio web público"
      />

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) =>
          s.loading ? (
            <StatSkeleton key={s.label} />
          ) : (
            <Card key={s.label} className="border border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}
                >
                  {s.icon}
                </div>
                <div>
                  <p
                    className={`text-xl font-bold ${s.alert ? 'text-amber-600' : 'text-gray-900'}`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Modules grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Módulos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((mod) => (
            <ModuleCard key={mod.href + mod.title} mod={mod} />
          ))}
        </div>
      </div>

      {/* Quick links */}
      <Card className="border border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Accesos rápidos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { label: 'Nuevo banner', href: '/admin/cms/banners' },
            { label: 'Aprobar reseñas', href: '/admin/cms/resenas' },
            { label: 'Crear FAQ', href: '/admin/cms/faq' },
            { label: 'Actualizar legal', href: '/admin/cms/legal' },
            { label: 'Subir imágenes', href: '/admin/cms/galeria' },
            {
              label: 'Config. pública',
              href: '/admin/cms/configuracion-publica',
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-brand-azul/10 hover:text-brand-azul transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
