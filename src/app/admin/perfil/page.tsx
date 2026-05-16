'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { usePerfil } from '@/hooks/usePerfil'
import { useAuth } from '@/hooks/useAuth'
import { PerfilHeader } from '@/components/admin/perfil/PerfilHeader'
import { InfoPersonalForm } from '@/components/admin/perfil/InfoPersonalForm'
import { SeguridadInfo } from '@/components/admin/perfil/SeguridadInfo'
import { CambiarContrasenaForm } from '@/components/admin/perfil/CambiarContrasenaForm'
import { ActividadReciente } from '@/components/admin/perfil/ActividadReciente'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Shield, KeyRound, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

type Tab = 'perfil' | 'seguridad' | 'contrasena'

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
  tab: Tab
  onTabChange: (t: Tab) => void
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
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-azul group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      </div>
    </button>
  )
}

export default function PerfilPage() {
  const { user } = useAuth()
  const { data: admin, isLoading, isError, refetch } = usePerfil()

  const [tab, setTab] = useState<Tab>('perfil')

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'seguridad' || hash === 'contrasena') {
        setTab(hash as Tab)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  if (isLoading)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mi perfil"
          description="Informacion personal y seguridad de cuenta"
        />
        <PerfilSkeleton />
      </div>
    )

  if (isError || !admin) return <ErrorState onRetry={refetch} />

  const idAdmin = user?.id ? parseInt(user.id) : admin.id

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Mi perfil' }]} />

      <PageHeader
        title="Mi perfil"
        description="Informacion personal y configuracion de seguridad"
      />

      <PerfilHeader admin={admin} onTabChange={setTab} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="bg-gray-100/80 rounded-xl p-1 h-auto">
          <TabsTrigger
            value="perfil"
            className="rounded-lg text-sm gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger
            value="seguridad"
            className="rounded-lg text-sm gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger
            value="contrasena"
            className="rounded-lg text-sm gap-2 px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <KeyRound className="h-4 w-4" />
            Contrasena
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <InfoPersonalForm admin={admin} />

              <div className="grid gap-4 sm:grid-cols-2">
                <AccesoRapidoCard
                  icon={Shield}
                  title="Seguridad de la cuenta"
                  description="Revisa el estado de tu cuenta, intentos de acceso y restricciones activas."
                  tab="seguridad"
                  onTabChange={setTab}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <AccesoRapidoCard
                  icon={KeyRound}
                  title="Cambiar contrasena"
                  description="Actualiza tu contrasena periodicamente para mantener tu cuenta segura."
                  tab="contrasena"
                  onTabChange={setTab}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                />
              </div>
            </div>

            <ActividadReciente idAdmin={idAdmin} />
          </div>
        </TabsContent>

        <TabsContent value="seguridad" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SeguridadInfo admin={admin} />
            </div>
            <ActividadReciente idAdmin={idAdmin} />
          </div>
        </TabsContent>

        <TabsContent value="contrasena" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CambiarContrasenaForm />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 self-start">
              <h4 className="text-sm font-bold text-gray-900">
                Recomendaciones
              </h4>
              {[
                'Usa al menos 8 caracteres',
                'Incluye mayusculas y numeros',
                'Agrega caracteres especiales',
                'No reutilices contrasenas anteriores',
                'Cambia tu contrasena cada 3 meses',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-azul mt-1.5 shrink-0" />
                  <p className="text-xs text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
