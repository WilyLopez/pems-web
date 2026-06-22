'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TiposEmailManager } from '@/components/admin/marketing/TiposEmailManager'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'

export default function TiposEmailPage() {
  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Marketing', href: '/admin/marketing' },
          { label: 'Tipos de correo' },
        ]}
      />

      <div className="flex items-center gap-3">
        <Link
          href="/admin/marketing"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-azul transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Marketing
        </Link>
      </div>

      <PageHeader
        title="Tipos de correo"
        description="Catálogo de tipos de email utilizados en plantillas y campañas"
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <TiposEmailManager showForm />
      </div>
    </div>
  )
}
