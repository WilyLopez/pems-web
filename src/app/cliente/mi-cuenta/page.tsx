'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  formatDistanceToNow,
  parseISO,
  differenceInDays,
  isFuture,
  startOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  User, Phone, Loader2, Save, Building2, Shield, Bell,
  Lock, Camera, CheckCircle2, XCircle, Pencil,
  Ticket, PartyPopper, CalendarDays, History, ChevronRight,
  AlertTriangle, Star, Wallet, Clock, Upload, Trash2, ArrowRight,
  CreditCard, TrendingUp, Check,
} from 'lucide-react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

import { clienteService } from '@/services/cliente.service'
import { eventoService } from '@/services/evento.service'
import { reservaService } from '@/services/reserva.service'
import { Cliente } from '@/types/cliente.types'
import { Reserva } from '@/types/reserva.types'
import { EventoPrivado } from '@/types/evento.types'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { Skeleton } from '@/components/ui/Skeleton'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { cn, formatDate, formatCurrency, getInitials, fileUrl } from '@/lib/utils'

const FRECUENTE_THRESHOLD = 5
const FOTO_MAX_BYTES = 5 * 1024 * 1024
const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp']

const infoPersonalSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  telefono: z
    .string()
    .min(7, 'Ingresa un teléfono válido')
    .max(20)
    .regex(/^[0-9+\s()-]+$/, 'Solo números y caracteres válidos'),
})

const infoFiscalSchema = z
  .object({
    ruc: z.string().regex(/^$|^[0-9]{11}$/, 'RUC debe tener 11 dígitos').optional(),
    razonSocial: z.string().max(200).optional(),
    direccionFiscal: z.string().max(300).optional(),
  })
  .refine(
    (d) => {
      if (d.ruc && d.ruc.length === 11) {
        return !!d.razonSocial && d.razonSocial.trim().length > 0
      }
      return true
    },
    { message: 'Ingresa la razón social si tienes RUC', path: ['razonSocial'] }
  )

type InfoPersonalValues = z.infer<typeof infoPersonalSchema>
type InfoFiscalValues = z.infer<typeof infoFiscalSchema>

function formatRelativo(fecha: string): string {
  try {
    return formatDistanceToNow(parseISO(fecha), { addSuffix: true, locale: es })
  } catch {
    return ''
  }
}

function calcularCompletitud(cliente: Cliente): { porcentaje: number; pendientes: string[] } {
  const items = [
    { completo: !!cliente.fotoPerfil, label: 'Foto de perfil' },
    { completo: !!cliente.telefono, label: 'Teléfono' },
    { completo: !!cliente.dni, label: 'DNI' },
    { completo: !!cliente.fechaNacimiento, label: 'Fecha de nacimiento' },
    { completo: cliente.correoVerificado, label: 'Correo verificado' },
  ]
  const completados = items.filter((i) => i.completo).length
  return {
    porcentaje: Math.round((completados / items.length) * 100),
    pendientes: items.filter((i) => !i.completo).map((i) => i.label),
  }
}

interface TimelineItem {
  id: string
  titulo: string
  subtitulo: string
  fecha: string
  iconColor: string
  bgColor: string
  Icon: LucideIcon
}

function buildTimeline(reservas: Reserva[], eventos: EventoPrivado[]): TimelineItem[] {
  const reservaConfig: Record<string, { titulo: string; iconColor: string; bgColor: string; Icon: LucideIcon }> = {
    PENDIENTE:    { titulo: 'Reserva creada',       iconColor: 'text-amber-600',   bgColor: 'bg-amber-50',   Icon: Ticket },
    CONFIRMADA:   { titulo: 'Reserva confirmada',   iconColor: 'text-green-600',   bgColor: 'bg-green-50',   Icon: CheckCircle2 },
    COMPLETADA:   { titulo: 'Visita realizada',     iconColor: 'text-brand-azul',  bgColor: 'bg-brand-azul/10', Icon: CheckCircle2 },
    CANCELADA:    { titulo: 'Reserva cancelada',    iconColor: 'text-red-500',     bgColor: 'bg-red-50',     Icon: XCircle },
    REPROGRAMADA: { titulo: 'Reserva reprogramada', iconColor: 'text-purple-600',  bgColor: 'bg-purple-50',  Icon: Clock },
  }
  const eventoConfig: Record<string, { titulo: string; iconColor: string; bgColor: string; Icon: LucideIcon }> = {
    SOLICITADA:  { titulo: 'Evento solicitado',  iconColor: 'text-brand-rosa',  bgColor: 'bg-brand-rosa/10', Icon: PartyPopper },
    CONFIRMADA:  { titulo: 'Evento confirmado',  iconColor: 'text-green-600',   bgColor: 'bg-green-50',   Icon: CheckCircle2 },
    COMPLETADA:  { titulo: 'Evento completado',  iconColor: 'text-amber-500',   bgColor: 'bg-amber-50',   Icon: Star },
    CANCELADA:   { titulo: 'Evento cancelado',   iconColor: 'text-red-500',     bgColor: 'bg-red-50',     Icon: XCircle },
  }

  const items: TimelineItem[] = [
    ...reservas.slice(0, 10).map((r) => {
      const c = reservaConfig[r.estado] ?? { titulo: r.estado, iconColor: 'text-gray-500', bgColor: 'bg-gray-50', Icon: Ticket }
      return {
        id: `r-${r.id}`,
        titulo: c.titulo,
        subtitulo: `Visita de ${r.nombreNino} · ${formatDate(r.fechaEvento)}`,
        fecha: r.fechaCreacion,
        iconColor: c.iconColor,
        bgColor: c.bgColor,
        Icon: c.Icon,
      }
    }),
    ...eventos.slice(0, 10).map((e) => {
      const c = eventoConfig[e.estado] ?? { titulo: e.estado, iconColor: 'text-gray-500', bgColor: 'bg-gray-50', Icon: PartyPopper }
      return {
        id: `e-${e.id}`,
        titulo: c.titulo,
        subtitulo: `${e.tipoEvento} · ${formatDate(e.fechaEvento)}`,
        fecha: e.fechaCreacion,
        iconColor: c.iconColor,
        bgColor: c.bgColor,
        Icon: c.Icon,
      }
    }),
  ]

  return items
    .sort((a, b) => parseISO(b.fecha).getTime() - parseISO(a.fecha).getTime())
    .slice(0, 8)
}

function SectionCard({
  titulo,
  icon: Icon,
  children,
  accion,
}: {
  titulo: string
  icon: LucideIcon
  children: React.ReactNode
  accion?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-azul/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-brand-azul" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">{titulo}</h2>
        </div>
        {accion}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function CampoLectura({ label, valor, vacio }: { label: string; valor?: string | null; vacio?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={cn('text-sm font-semibold', valor ? 'text-gray-900' : 'text-gray-400')}>
        {valor ?? (vacio ?? 'No registrado')}
      </p>
    </div>
  )
}

function PhotoUploadModal({
  open,
  onClose,
  cliente,
}: {
  open: boolean
  onClose: () => void
  cliente: Cliente
}) {
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [archivo, setArchivo] = useState<File | null>(null)

  useEffect(() => {
    if (!open) {
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setArchivo(null)
    }
  }, [open])

  const subir = useMutation({
    mutationFn: (file: File) => clienteService.subirFoto(cliente.id, file),
    onSuccess: () => {
      toast.success('Foto actualizada correctamente.')
      qc.invalidateQueries({ queryKey: ['cliente-perfil'] })
      onClose()
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar la foto.'),
  })

  const eliminar = useMutation({
    mutationFn: () => clienteService.eliminarFoto(cliente.id),
    onSuccess: () => {
      toast.success('Foto eliminada.')
      qc.invalidateQueries({ queryKey: ['cliente-perfil'] })
      onClose()
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo eliminar la foto.'),
  })

  function seleccionarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!FOTO_TIPOS.includes(file.type)) {
      toast.error('Formato no válido. Solo se aceptan JPG, PNG o WebP.')
      return
    }
    if (file.size > FOTO_MAX_BYTES) {
      toast.error('El archivo no puede superar 5 MB.')
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setArchivo(file)
    e.target.value = ''
  }

  const fotoActual = fileUrl(cliente.fotoPerfil)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <DialogTitle className="text-base font-black text-gray-900">Foto de perfil</DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">JPG, PNG o WebP · Máximo 5 MB</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-brand-rosa flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
              ) : fotoActual ? (
                <img src={fotoActual} alt={cliente.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-black">{getInitials(cliente.nombre)}</span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={FOTO_TIPOS.join(',')}
              className="hidden"
              onChange={seleccionarArchivo}
            />

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                {preview ? 'Cambiar' : 'Seleccionar'}
              </button>
              {(fotoActual || preview) && (
                <button
                  onClick={() => {
                    if (preview) {
                      URL.revokeObjectURL(preview)
                      setPreview(null)
                      setArchivo(null)
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </button>
              )}
            </div>
          </div>

          {fotoActual && !preview && (
            <button
              onClick={() => eliminar.mutate()}
              disabled={eliminar.isPending}
              className="w-full py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {eliminar.isPending ? 'Eliminando...' : 'Eliminar foto actual'}
            </button>
          )}
        </div>

        <div className="px-5 pb-5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => archivo && subir.mutate(archivo)}
            disabled={!archivo || subir.isPending}
            className="py-2.5 rounded-xl bg-brand-azul text-white text-sm font-bold disabled:opacity-50 hover:bg-brand-azul/90 transition-colors"
          >
            {subir.isPending ? 'Guardando...' : 'Guardar foto'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ProfileHeader({ cliente }: { cliente: Cliente }) {
  const [fotoModal, setFotoModal] = useState(false)
  const foto = fileUrl(cliente.fotoPerfil)

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="h-24 sm:h-28 bg-gradient-to-r from-gray-900 via-gray-800 to-slate-700" />
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg bg-brand-rosa overflow-hidden flex items-center justify-center">
                  {foto ? (
                    <img src={foto} alt={cliente.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl sm:text-3xl font-black">
                      {getInitials(cliente.nombre)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setFotoModal(true)}
                  title="Cambiar foto"
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white border-2 border-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-3.5 w-3.5 text-gray-700" />
                </button>
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900">{cliente.nombre}</h1>
                  {cliente.esVip && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                      <Star className="h-2.5 w-2.5 fill-white" />
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{cliente.correo}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:pb-1">
              <span className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                cliente.correoVerificado
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {cliente.correoVerificado ? (
                  <><CheckCircle2 className="h-3 w-3" /> Correo verificado</>
                ) : (
                  <><AlertTriangle className="h-3 w-3" /> Sin verificar</>
                )}
              </span>
              <span className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                cliente.activo ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              )}>
                <div className={cn('w-1.5 h-1.5 rounded-full', cliente.activo ? 'bg-blue-500' : 'bg-red-500')} />
                {cliente.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
            <span className="text-xs text-gray-400">
              <span className="font-semibold text-gray-600">Miembro desde</span> {formatDate(cliente.fechaCreacion, 'MMMM yyyy')}
            </span>
            {cliente.ultimoLogin && (
              <span className="text-xs text-gray-400">
                <span className="font-semibold text-gray-600">Último acceso</span> {formatRelativo(cliente.ultimoLogin)}
              </span>
            )}
            {cliente.segmentoCliente && (
              <span className="text-xs text-gray-400">
                <span className="font-semibold text-gray-600">Segmento</span> {cliente.segmentoCliente}
              </span>
            )}
          </div>
        </div>
      </div>

      <PhotoUploadModal
        open={fotoModal}
        onClose={() => setFotoModal(false)}
        cliente={cliente}
      />
    </>
  )
}

function QuickActions() {
  const links = [
    { href: '/reservar',         icon: Ticket,      label: 'Crear reserva',   color: 'bg-brand-azul/10 text-brand-azul' },
    { href: '/eventos-privados', icon: PartyPopper,  label: 'Solicitar evento', color: 'bg-brand-rosa/10 text-brand-rosa' },
    { href: '/cliente/mis-eventos',  icon: CalendarDays, label: 'Mis eventos',   color: 'bg-purple-100 text-purple-600' },
    { href: '/cliente/mis-reservas', icon: History,      label: 'Historial',     color: 'bg-gray-100 text-gray-600' },
  ]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <p className="text-sm font-bold text-gray-900 mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-brand-azul/30 hover:shadow-sm transition-all group"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', l.color)}>
              <l.icon className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-brand-azul text-center transition-colors leading-tight">
              {l.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function PerfilCompletado({ cliente }: { cliente: Cliente }) {
  const { porcentaje, pendientes } = calcularCompletitud(cliente)
  const completo = porcentaje === 100

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">Perfil completado</p>
        <span className={cn(
          'text-sm font-black',
          porcentaje === 100 ? 'text-green-600' : 'text-brand-azul'
        )}>{porcentaje}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            completo ? 'bg-green-500' : 'bg-brand-azul'
          )}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      {completo ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-semibold">Perfil al 100%. Todo listo.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-[11px] text-gray-500">
            Completa tu perfil para una mejor experiencia.
          </p>
          {pendientes.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
              <span className="text-xs text-gray-500">{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResumenActividad({
  cliente,
  eventos,
}: {
  cliente: Cliente
  eventos: EventoPrivado[]
}) {
  const eventosCompletados = eventos.filter((e) => e.estado === 'COMPLETADA').length
  const stats = [
    { valor: cliente.contadorVisitas,                  label: 'Visitas',           icon: Ticket,      color: 'bg-brand-azul/10 text-brand-azul' },
    { valor: eventos.length,                           label: 'Eventos',           icon: PartyPopper, color: 'bg-brand-rosa/10 text-brand-rosa' },
    { valor: eventosCompletados,                       label: 'Completados',       icon: CheckCircle2,color: 'bg-green-100 text-green-600' },
    { valor: cliente.totalGastado != null ? formatCurrency(cliente.totalGastado) : '—', label: 'Total gastado', icon: Wallet, color: 'bg-amber-100 text-amber-600' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-2', s.color)}>
            <s.icon className="h-4 w-4" />
          </div>
          <p className="text-lg sm:text-2xl font-black text-gray-900 leading-none">{s.valor}</p>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

function BeneficiosVip({
  cliente,
  eventos,
}: {
  cliente: Cliente
  eventos: EventoPrivado[]
}) {
  const visitas = cliente.contadorVisitas

  if (cliente.esVip) {
    const descuento = cliente.descuentoVip ?? 0
    const ahorrado =
      cliente.totalGastado != null && descuento > 0
        ? cliente.totalGastado * (descuento / 100)
        : null

    return (
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Cliente VIP</p>
            <p className="text-xs text-amber-700">{descuento}% de descuento activo</p>
          </div>
        </div>
        <Separator className="border-amber-200" />
        <div className="space-y-1.5">
          {[
            'Descuento exclusivo en todas las reservas',
            'Acceso a preventas y fechas especiales',
            'Atención prioritaria',
          ].map((b) => (
            <div key={b} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="text-xs text-gray-700">{b}</span>
            </div>
          ))}
        </div>
        {ahorrado != null && ahorrado > 0 && (
          <div className="bg-white/70 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-500">Ahorro acumulado estimado</p>
            <p className="text-base font-black text-amber-600">{formatCurrency(ahorrado)}</p>
          </div>
        )}
      </div>
    )
  }

  const progreso = Math.min((visitas / FRECUENTE_THRESHOLD) * 100, 100)
  const faltan = Math.max(FRECUENTE_THRESHOLD - visitas, 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-brand-azul/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-brand-azul" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Programa de fidelidad</p>
          <p className="text-xs text-gray-500">
            {cliente.segmentoCliente === 'FRECUENTE' ? 'Cliente frecuente' : 'Cliente nuevo'}
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{visitas} visitas</span>
          <span className="font-semibold text-brand-azul">{FRECUENTE_THRESHOLD} para frecuente</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-azul rounded-full transition-all duration-700"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {faltan > 0
          ? `Te faltan ${faltan} visita${faltan !== 1 ? 's' : ''} para convertirte en cliente frecuente.`
          : 'Ya eres cliente frecuente. Habla con nuestro equipo sobre beneficios VIP.'}
      </p>
    </div>
  )
}

function ProximoEvento({
  reservas,
  eventos,
}: {
  reservas: Reserva[]
  eventos: EventoPrivado[]
}) {
  const hoy = startOfDay(new Date())

  const proximaReserva = useMemo(
    () =>
      reservas
        .filter(
          (r) =>
            ['PENDIENTE', 'CONFIRMADA'].includes(r.estado) &&
            isFuture(startOfDay(parseISO(r.fechaEvento)))
        )
        .sort((a, b) => parseISO(a.fechaEvento).getTime() - parseISO(b.fechaEvento).getTime())[0] ?? null,
    [reservas]
  )

  const proximoEvento = useMemo(
    () =>
      eventos
        .filter(
          (e) =>
            e.estado === 'CONFIRMADA' &&
            isFuture(startOfDay(parseISO(e.fechaEvento)))
        )
        .sort((a, b) => parseISO(a.fechaEvento).getTime() - parseISO(b.fechaEvento).getTime())[0] ?? null,
    [eventos]
  )

  if (!proximaReserva && !proximoEvento) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <CalendarDays className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Sin próximas visitas</p>
          <p className="text-xs text-gray-500 mt-0.5">Actualmente no tienes eventos programados.</p>
        </div>
        <Link
          href="/reservar"
          className="ml-auto shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-azul hover:underline"
        >
          Reservar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  if (proximoEvento) {
    const dias = differenceInDays(startOfDay(parseISO(proximoEvento.fechaEvento)), hoy)
    return (
      <div className="bg-gradient-to-r from-brand-rosa/5 to-brand-azul/5 rounded-2xl border border-brand-rosa/20 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-rosa/15 flex items-center justify-center shrink-0">
              <PartyPopper className="h-5 w-5 text-brand-rosa" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-rosa mb-0.5">
                Próximo evento privado
              </p>
              <p className="text-base font-black text-gray-900">{proximoEvento.tipoEvento}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatDate(proximoEvento.fechaEvento, "EEEE d 'de' MMMM")}
                {dias === 0 ? ' · ¡Hoy!' : dias === 1 ? ' · Mañana' : ` · en ${dias} días`}
              </p>
            </div>
          </div>
          <Link
            href={`/cliente/mis-eventos/${proximoEvento.id}`}
            className="shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-azul bg-white border border-brand-azul/20 px-3 py-1.5 rounded-xl hover:bg-brand-azul/5 transition-colors"
          >
            Ver <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  const dias = differenceInDays(startOfDay(parseISO(proximaReserva!.fechaEvento)), hoy)
  return (
    <div className="bg-gradient-to-r from-brand-azul/5 to-brand-azul/10 rounded-2xl border border-brand-azul/20 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-azul/15 flex items-center justify-center shrink-0">
            <Ticket className="h-5 w-5 text-brand-azul" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-azul mb-0.5">
              Próxima visita
            </p>
            <p className="text-base font-black text-gray-900">
              {formatDate(proximaReserva!.fechaEvento, "EEEE d 'de' MMMM")}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              Visita de {proximaReserva!.nombreNino}
              {dias === 0 ? ' · ¡Hoy!' : dias === 1 ? ' · Mañana' : ` · en ${dias} días`}
            </p>
          </div>
        </div>
        <Link
          href="/cliente/mis-reservas"
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-azul bg-white border border-brand-azul/20 px-3 py-1.5 rounded-xl hover:bg-brand-azul/5 transition-colors"
        >
          Ver <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

function ActividadReciente({
  reservas,
  eventos,
}: {
  reservas: Reserva[]
  eventos: EventoPrivado[]
}) {
  const items = useMemo(() => buildTimeline(reservas, eventos), [reservas, eventos])

  if (items.length === 0) {
    return (
      <SectionCard titulo="Actividad reciente" icon={History}>
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">Sin actividad registrada aún.</p>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard titulo="Actividad reciente" icon={History}>
      <div className="space-y-0">
        {items.map((item, idx) => (
          <div key={item.id} className="flex gap-3 relative">
            {idx < items.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-100" />
            )}
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10', item.bgColor)}>
              <item.Icon className={cn('h-3.5 w-3.5', item.iconColor)} />
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{item.titulo}</p>
              <p className="text-xs text-gray-500 truncate">{item.subtitulo}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{formatRelativo(item.fecha)}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function InfoPersonalSection({ cliente }: { cliente: Cliente }) {
  const [editando, setEditando] = useState(false)
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InfoPersonalValues>({
    resolver: zodResolver(infoPersonalSchema),
    defaultValues: { nombre: cliente.nombre ?? '', telefono: cliente.telefono ?? '' },
  })

  function cancelar() {
    reset({ nombre: cliente.nombre ?? '', telefono: cliente.telefono ?? '' })
    setEditando(false)
  }

  const guardar = useMutation({
    mutationFn: (v: InfoPersonalValues) => clienteService.actualizar(cliente.id, v),
    onSuccess: () => {
      toast.success('Datos personales actualizados.')
      qc.invalidateQueries({ queryKey: ['cliente-perfil'] })
      setEditando(false)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar.'),
  })

  return (
    <SectionCard
      titulo="Información personal"
      icon={User}
      accion={
        !editando ? (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-azul hover:bg-brand-azul/5 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        ) : null
      }
    >
      {!editando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CampoLectura label="Nombre completo" valor={cliente.nombre} />
          <CampoLectura label="Correo electrónico" valor={cliente.correo} />
          <CampoLectura label="Teléfono" valor={cliente.telefono} />
          <CampoLectura
            label="Fecha de nacimiento"
            valor={cliente.fechaNacimiento ? formatDate(cliente.fechaNacimiento) : null}
          />
          <CampoLectura label="DNI" valor={cliente.dni} />
        </div>
      ) : (
        <form onSubmit={handleSubmit((v) => guardar.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-sm font-semibold">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="nombre" className="h-11 rounded-xl pl-9" {...register('nombre')} />
              </div>
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-sm font-semibold">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="telefono" placeholder="987654321" className="h-11 rounded-xl pl-9" {...register('telefono')} />
              </div>
              {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-gray-700">Correo electrónico</p>
              <div className="h-11 rounded-xl bg-gray-50 border border-gray-200 px-3 flex items-center">
                <span className="text-sm text-gray-500">{cliente.correo}</span>
              </div>
              <p className="text-[11px] text-gray-400">El correo no puede modificarse.</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-gray-700">DNI</p>
              <div className="h-11 rounded-xl bg-gray-50 border border-gray-200 px-3 flex items-center">
                <span className="text-sm text-gray-500">{cliente.dni ?? 'No registrado'}</span>
              </div>
              <p className="text-[11px] text-gray-400">Contacta al soporte para modificarlo.</p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={cancelar}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardar.isPending}
              className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-brand-azul text-white text-sm font-bold hover:bg-brand-azul/90 disabled:opacity-60 transition-colors"
            >
              {guardar.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...</> : <><Save className="h-3.5 w-3.5" /> Guardar</>}
            </button>
          </div>
        </form>
      )}
    </SectionCard>
  )
}

function InfoFiscalSection({ cliente }: { cliente: Cliente }) {
  const [editando, setEditando] = useState(false)
  const qc = useQueryClient()

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<InfoFiscalValues>({
    resolver: zodResolver(infoFiscalSchema),
    defaultValues: {
      ruc: cliente.ruc ?? '',
      razonSocial: cliente.razonSocial ?? '',
      direccionFiscal: cliente.direccion ?? '',
    },
  })

  const rucVal = watch('ruc')
  const tieneRuc = !!rucVal && rucVal.length === 11

  function cancelar() {
    reset({ ruc: cliente.ruc ?? '', razonSocial: cliente.razonSocial ?? '', direccionFiscal: cliente.direccion ?? '' })
    setEditando(false)
  }

  const guardar = useMutation({
    mutationFn: (v: InfoFiscalValues) =>
      clienteService.actualizar(cliente.id, {
        ruc: v.ruc,
        razonSocial: v.razonSocial,
        direccion: v.direccionFiscal,
      }),
    onSuccess: () => {
      toast.success('Datos fiscales actualizados.')
      qc.invalidateQueries({ queryKey: ['cliente-perfil'] })
      setEditando(false)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar.'),
  })

  return (
    <SectionCard
      titulo="Información fiscal"
      icon={Building2}
      accion={
        !editando ? (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-azul hover:bg-brand-azul/5 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        ) : null
      }
    >
      {!editando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CampoLectura label="RUC" valor={cliente.ruc} />
          <CampoLectura label="Razón social" valor={cliente.razonSocial} />
          <div className="sm:col-span-2">
            <CampoLectura label="Dirección fiscal" valor={cliente.direccion} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit((v) => guardar.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ruc" className="text-sm font-semibold">RUC</Label>
            <Input id="ruc" placeholder="20000000001" maxLength={11} className="h-11 rounded-xl" {...register('ruc')} />
            {errors.ruc && <p className="text-xs text-destructive">{errors.ruc.message}</p>}
          </div>
          {tieneRuc && (
            <div className="space-y-1.5">
              <Label htmlFor="razonSocial" className="text-sm font-semibold">Razón social</Label>
              <Input id="razonSocial" placeholder="Empresa S.A.C." className="h-11 rounded-xl" {...register('razonSocial')} />
              {errors.razonSocial && <p className="text-xs text-destructive">{errors.razonSocial.message}</p>}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="direccionFiscal" className="text-sm font-semibold">Dirección fiscal</Label>
            <Input id="direccionFiscal" placeholder="Av. Ejemplo 123, Lima" className="h-11 rounded-xl" {...register('direccionFiscal')} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={cancelar} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={guardar.isPending} className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-brand-azul text-white text-sm font-bold hover:bg-brand-azul/90 disabled:opacity-60 transition-colors">
              {guardar.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...</> : <><Save className="h-3.5 w-3.5" /> Guardar</>}
            </button>
          </div>
        </form>
      )}
    </SectionCard>
  )
}

function SeguridadSection() {
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

function EstadoCuentaSection({ reservas }: { reservas: Reserva[] }) {
  const pendientes = reservas.filter((r) => r.estado === 'PENDIENTE')
  const totalPendiente = pendientes.reduce((s, r) => s + r.totalPagado, 0)

  return (
    <SectionCard titulo="Estado de cuenta" icon={CreditCard}>
      {pendientes.length === 0 ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">Sin pagos pendientes</p>
            <p className="text-xs text-green-700">Tu cuenta está al día.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                {pendientes.length} pago{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700">
                Total: <span className="font-bold">{formatCurrency(totalPendiente)}</span> · Presenta tu ticket en caja.
              </p>
            </div>
          </div>
          <Link
            href="/cliente/mis-reservas"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-azul/40 hover:text-brand-azul transition-all"
          >
            Ver reservas pendientes <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </SectionCard>
  )
}

function PreferenciasSection({ cliente }: { cliente: Cliente }) {
  const [acepta, setAcepta] = useState(cliente.aceptaComunicaciones)
  const qc = useQueryClient()

  const actualizar = useMutation({
    mutationFn: (val: boolean) =>
      clienteService.actualizar(cliente.id, { aceptaComunicaciones: val }),
    onSuccess: () => {
      toast.success('Preferencias guardadas.')
      qc.invalidateQueries({ queryKey: ['cliente-perfil'] })
    },
    onError: (err: { message?: string }) => {
      setAcepta(!acepta)
      toast.error(err?.message ?? 'No se pudo actualizar.')
    },
  })

  function toggle(val: boolean) {
    setAcepta(val)
    actualizar.mutate(val)
  }

  return (
    <SectionCard titulo="Preferencias de comunicación" icon={Bell}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Recibir comunicaciones</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Promociones, recordatorios y novedades de Kiki y Lala por correo y WhatsApp.
          </p>
        </div>
        <Switch
          checked={acepta}
          onCheckedChange={toggle}
          disabled={actualizar.isPending}
        />
      </div>
    </SectionCard>
  )
}

function MiCuentaSkeleton() {
  return (
    <div className="max-w-6xl mx-auto w-full space-y-5">
      <Skeleton className="h-48 sm:h-52 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export default function MiCuentaPage() {
  const { data: session } = useSession()
  const userId = parseInt(session?.user?.id ?? '0')

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente-perfil', userId],
    queryFn: () => clienteService.obtener(userId),
    enabled: !!userId,
  })

  const { data: eventosData } = useQuery({
    queryKey: ['mis-eventos-cuenta', userId],
    queryFn: () => eventoService.listar({ page: 0, size: 50 }),
    enabled: !!userId,
  })

  const { data: reservasData } = useQuery({
    queryKey: ['mis-reservas-cuenta', userId],
    queryFn: () => reservaService.listar({ page: 0, size: 50 }),
    enabled: !!userId,
  })

  const eventos: EventoPrivado[] = eventosData?.content ?? []
  const reservas: Reserva[] = reservasData?.content ?? []

  if (isLoading || !cliente) return <MiCuentaSkeleton />

  const mostrarFiscal = cliente.tipoCliente === 'EMPRESA' || !!cliente.ruc

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 sm:space-y-5">
      <ProfileHeader cliente={cliente} />

      <ResumenActividad cliente={cliente} eventos={eventos} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="space-y-4">
          <PerfilCompletado cliente={cliente} />
          <BeneficiosVip cliente={cliente} eventos={eventos} />
          <QuickActions />
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <ProximoEvento reservas={reservas} eventos={eventos} />
          <ActividadReciente reservas={reservas} eventos={eventos} />
          <InfoPersonalSection cliente={cliente} />
          {mostrarFiscal && <InfoFiscalSection cliente={cliente} />}
          <SeguridadSection />
          <EstadoCuentaSection reservas={reservas} />
          <PreferenciasSection cliente={cliente} />
        </div>
      </div>
    </div>
  )
}
