import { Shield, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SectionCard } from '../../../shared/components/SectionCard'

export function SeguridadSection() {
  return (
    <SectionCard titulo="Seguridad" icon={Shield}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Contraseña</p>
            <p className="text-xs text-gray-400">Protegida y cifrada</p>
          </div>
        </div>
        <Link
          href="/auth/cambiar-contrasena"
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-brand-azul border border-brand-azul/30 px-3 py-2 rounded-xl hover:bg-brand-azul/5 transition-colors"
        >
          Cambiar contraseña
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </SectionCard>
  )
}
