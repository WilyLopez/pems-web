'use client'

import { TiposEgresoManager } from '@/features/admin/finance'
import { PageHeader } from '@/components/common/PageHeader'

export default function TiposEgresoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de egreso"
        description="Administra las categorias y tipos de egreso de la sede"
      />
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <TiposEgresoManager />
      </div>
    </div>
  )
}
