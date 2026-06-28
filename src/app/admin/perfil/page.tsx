'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { useAuth } from '@/hooks/useAuth'
import { usePerfilData } from '@/features/admin/perfil/hooks/usePerfilData'
import { usePerfilNav, PerfilTab } from '@/features/admin/perfil/hooks/usePerfilNav'
import { PerfilHeader } from '@/features/admin/perfil/components/ui/PerfilHeader'
import { InfoPersonalForm } from '@/features/admin/perfil/components/forms/InfoPersonalForm'
import { SeguridadInfo } from '@/features/admin/perfil/components/ui/SeguridadInfo'
import { ActividadReciente } from '@/features/admin/perfil/components/ui/ActividadReciente'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Shield, KeyRound, User, ArrowRight, Crown, Users, Settings, ExternalLink } from 'lucide-react'
import Link from 'next/link'

function PerfilSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  )
}

function AccesoRapidoCard({
  icon: Icon,
  title,
  description,
  tab,
  onTabChange,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType
  title: string
  description: string
  tab: PerfilTab
  onTabChange: (t: PerfilTab) => void
  iconBg: string
  iconColor: string
}) {
  return (
    <button
      onClick={() => onTabChange(tab)}
      className="group w-full text-left rounded-2xl border border-gray-100 bg-white p-5 hover:border-brand-azul/30 hover:shadow-card transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-azul group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      </div>
    </button>
  )
}

function AccesoRapidoLink({
  icon: Icon,
  title,
  description,
  href,
  iconBg,
  iconColor,
  badge,
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
  iconBg: string
  iconColor: string
  badge?: string
}) {
  return (
    <Link
      href={href}
      className="group w-full text-left rounded-2xl border border-gray-100 bg-white p-5 hover:border-brand-azul/30 hover:shadow-card transition-all duration-200 flex items-start justify-between"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">{title}</p>
            {badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 leading-none">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-brand-azul transition-colors shrink-0 mt-1" />
    </Link>
  )
}

export default function PerfilPage() {
  const { user, idUsuario, isSuperAdmin } = useAuth()
  const { tab, userId, setTab, setUserId } = usePerfilNav()

  useEffect(() => {
    if (userId && idUsuario && userId !== idUsuario && !isSuperAdmin) {
      setUserId(null)
    }
  }, [userId, idUsuario, isSuperAdmin, setUserId])

  const targetUserId = (userId && isSuperAdmin) ? userId : idUsuario
  const isOwnProfile = !userId || userId === idUsuario
  const canEdit = isOwnProfile || isSuperAdmin

  const { admin, isLoading, isError, refetch } = usePerfilData(targetUserId)

  if (isLoading || !idUsuario)
    return (
      <div className="space-y-6">
        <PageHeader title="Mi perfil" description="Información personal y seguridad de cuenta" />
        <PerfilSkeleton />
      </div>
    )

  if (isError || !admin) return <ErrorState onRetry={refetch} />

  const showSeguridadTab = isOwnProfile || isSuperAdmin

  return (
    <div className="space-y-6">
      <Breadcrumbs items={isOwnProfile ? [{ label: 'Mi perfil' }] : [{ label: 'Usuarios', href: '/admin/usuarios' }, { label: `Perfil: ${admin.nombre}` }]} />

      <PageHeader
        title={isOwnProfile ? 'Mi perfil' : `Perfil de ${admin.nombre}`}
        description={isOwnProfile ? 'Información personal y configuración de seguridad' : 'Gestión de cuenta de administrador'}
      />

      <PerfilHeader admin={admin} onTabChange={setTab} isOwnProfile={isOwnProfile} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as PerfilTab)}>
        <TabsList className="bg-gray-100/80 rounded-xl p-1 h-auto">
          <TabsTrigger
            value="perfil"
            className="rounded-lg text-sm gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          {showSeguridadTab && (
            <TabsTrigger
              value="seguridad"
              className="rounded-lg text-sm gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Shield className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="perfil" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <InfoPersonalForm admin={admin} canEdit={canEdit} />

              {isSuperAdmin && isOwnProfile && (
                <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                      <Crown className="h-4 w-4 text-violet-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-violet-900">Privilegios de Super Administrador</h4>
                      <p className="text-xs text-violet-600">Tu cuenta tiene acceso completo a todos los módulos del sistema</p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { icon: Users,    label: 'Gestión de usuarios y roles' },
                      { icon: Settings, label: 'Configuración del sistema' },
                      { icon: Shield,   label: 'Seguridad y accesos' },
                      { icon: Crown,    label: 'Administración de sedes' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-xs text-violet-700">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {isOwnProfile && (
                  <AccesoRapidoCard
                    icon={Shield}
                    title="Seguridad de la cuenta"
                    description="Revisa el estado de tu cuenta, intentos de acceso y restricciones activas."
                    tab="seguridad"
                    onTabChange={setTab}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                  />
                )}
                {isOwnProfile && (
                  <AccesoRapidoLink
                    icon={KeyRound}
                    title="Cambiar contraseña"
                    description="Actualiza tu contraseña periódicamente para mantener tu cuenta segura."
                    href="/auth/cambiar-contrasena"
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    badge="Página dedicada"
                  />
                )}
              </div>
            </div>

            <ActividadReciente idAdmin={isOwnProfile ? user?.id : undefined} />
          </div>
        </TabsContent>

        {showSeguridadTab && (
          <TabsContent value="seguridad" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SeguridadInfo admin={admin} />
              </div>
              <ActividadReciente idAdmin={isOwnProfile ? user?.id : undefined} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
