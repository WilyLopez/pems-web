'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { useMutacionesCliente } from '@/features/admin/clientes/hooks/useClientesData'
import { ClienteForm } from '@/features/admin/clientes/components/forms/ClienteForm'
import { ClienteFormValues } from '@/features/admin/clientes/schema/cliente.schema'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'

export default function NuevoClientePage() {
  const router = useRouter()
  const { crearCliente } = useMutacionesCliente()

  const handleSubmit = (values: ClienteFormValues) => {
    crearCliente.mutate(values, {
      onSuccess: () => {
        router.push('/admin/clientes')
      },
    })
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Clientes', href: '/admin/clientes' },
          { label: 'Nuevo cliente' },
        ]}
      />

      <PageHeader
        title="Nuevo cliente"
        description="Registro manual de cliente por administrador"
        actions={
          <Link href="/admin/clientes">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />

      <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <ClienteForm
          onSubmit={handleSubmit}
          isSubmitting={crearCliente.isPending}
          onCancel={() => router.push('/admin/clientes')}
        />
      </div>
    </div>
  )
}
