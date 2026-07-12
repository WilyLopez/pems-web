'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, ShieldAlert, MailCheck } from 'lucide-react'

import { useConfirmarCambioCorreo } from '../../hooks/useConfirmarCambioCorreo'
import { ApiError } from '@/types/api.types'

export function ConfirmarCambioCorreoView() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const confirmarMutation = useConfirmarCambioCorreo()
  const yaEjecutado = useRef(false)

  useEffect(() => {
    if (!token || yaEjecutado.current) return
    yaEjecutado.current = true

    confirmarMutation.mutate(token, {
      onError: (err: ApiError) => {
        setErrorMsg(
          err.message ||
            'No se pudo confirmar el cambio de correo. El enlace puede haber expirado.'
        )
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (!token) {
    return (
      <EstadoCard
        icono={<ShieldAlert className="h-5 w-5 text-destructive" />}
        iconoFondo="bg-destructive/10"
        titulo="Enlace inválido"
        mensaje="Este enlace de confirmación no es válido."
      />
    )
  }

  if (confirmarMutation.isPending || confirmarMutation.isIdle) {
    return (
      <EstadoCard
        icono={<Loader2 className="h-5 w-5 text-brand-azul animate-spin" />}
        iconoFondo="bg-brand-azul/10"
        titulo="Confirmando tu correo..."
        mensaje="Esto solo tomará un momento."
      />
    )
  }

  if (confirmarMutation.isError) {
    return (
      <EstadoCard
        icono={<ShieldAlert className="h-5 w-5 text-destructive" />}
        iconoFondo="bg-destructive/10"
        titulo="No se pudo confirmar"
        mensaje={
          errorMsg || 'El enlace puede haber expirado o ya fue utilizado.'
        }
      />
    )
  }

  return (
    <EstadoCard
      icono={<CheckCircle2 className="h-5 w-5 text-green-600" />}
      iconoFondo="bg-green-100"
      titulo="Correo confirmado"
      mensaje="Tu correo de contacto se actualizó correctamente."
      accion={
        <Link
          href="/cliente/mi-cuenta"
          className="text-sm font-semibold text-brand-azul hover:underline"
        >
          Ir a mi cuenta
        </Link>
      }
    />
  )
}

function EstadoCard({
  icono,
  iconoFondo,
  titulo,
  mensaje,
  accion,
}: {
  icono: React.ReactNode
  iconoFondo: string
  titulo: string
  mensaje: string
  accion?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 max-w-md w-full space-y-4 text-center">
        <div
          className={`w-10 h-10 rounded-xl ${iconoFondo} flex items-center justify-center mx-auto`}
        >
          {icono}
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <MailCheck className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wide font-semibold">
            Kiki y Lala
          </span>
        </div>
        <p className="font-black text-gray-900">{titulo}</p>
        <p className="text-sm text-gray-500">{mensaje}</p>
        {accion}
      </div>
    </div>
  )
}
