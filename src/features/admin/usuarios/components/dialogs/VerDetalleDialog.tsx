'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { RolBadge } from '../ui/RolBadge'
import { EstadoBadge } from '../ui/EstadoBadge'
import { getEstadoAdmin } from '../../types'
import { formatDateTime } from '@/lib/utils'
import { AlertTriangle, Mail, Phone, Building2, Calendar, Clock } from 'lucide-react'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import { useUsuariosList } from '../../hooks/useUsuariosData'

function initials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}

export function VerDetalleDialog() {
  const { modal, userId, closeModal } = useUsuariosNav()
  const { data: usuarios = [] } = useUsuariosList()

  const open = modal === 'ver'
  const usuario = usuarios.find((u) => u.id === userId) || null

  if (!usuario) return null
  const estado = getEstadoAdmin(usuario)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Detalle de usuario</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 pt-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={usuario.fotoPerfilUrl} />
            <AvatarFallback className="bg-brand-gradient text-white font-semibold">
              {initials(usuario.nombre)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">{usuario.nombre}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RolBadge rol={usuario.rol} />
              <EstadoBadge estado={estado} />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <Row label={<span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Correo</span>} value={usuario.correo} />
          <Row label={<span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</span>} value={usuario.telefono ?? '—'} />
          <Row label={<span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> Sede</span>} value={usuario.sedeNombre ?? `ID ${usuario.idSede}`} />
          <Row label={<span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Último acceso</span>} value={usuario.ultimoAcceso ? formatDateTime(usuario.ultimoAcceso) : '—'} />
          <Row label={<span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Creado</span>} value={formatDateTime(usuario.fechaCreacion)} />
          {usuario.bloqueadoHasta && (
            <Row label="Bloqueado hasta" value={formatDateTime(usuario.bloqueadoHasta)} />
          )}
          {usuario.intentosFallidos > 0 && (
            <Row label="Intentos fallidos" value={
              <span className="text-amber-600">{usuario.intentosFallidos}</span>
            } />
          )}
          {usuario.debeCambiarContrasena && (
            <Row label="Contraseña" value={
              <span className="flex items-center gap-1 text-amber-600 text-xs">
                <AlertTriangle className="h-3 w-3" /> Debe cambiar al iniciar sesión
              </span>
            } />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
