'use client'

import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { ContratoCard } from '@/components/admin/contratos/ContratoCard'
import { Button } from '@/components/ui/Button'

export default function ContratoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const idEvento = parseInt(params.id as string)

  return (
    <div className="space-y-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-1.5 text-gray-500 hover:text-brand-azul -ml-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Contratos
      </Button>

      <div className="max-w-2xl">
        <ContratoCard idEvento={idEvento} mostrarEnlaceEvento />
      </div>
    </div>
  )
}
