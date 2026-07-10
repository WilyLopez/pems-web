'use client'

import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface CajaRequeridaAlertProps {
  mensaje: string
  className?: string
}

export function CajaRequeridaAlert({
  mensaje,
  className,
}: CajaRequeridaAlertProps) {
  const { isAdmin } = useAuth()

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 flex items-start gap-3',
        className
      )}
    >
      <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2.5">
        <p className="text-sm text-amber-800 dark:text-amber-200">{mensaje}</p>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
        >
          <Link href="/admin/finanzas/caja">
            {isAdmin ? 'Abrir Caja Administrativa' : 'Abrir mi caja'}
          </Link>
        </Button>
      </div>
    </div>
  )
}
