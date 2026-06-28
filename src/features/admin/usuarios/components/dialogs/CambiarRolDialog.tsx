'use client'

import { useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import { useUsuariosList, useMutacionesUsuario } from '../../hooks/useUsuariosData'
import { getEstadoAdmin } from '../../types'
import { MAX_ADMINS_FRONTEND, MAX_CAJEROS_FRONTEND } from '../../constants'

type Paso = 'elegir' | 'confirmar'

const ROL_LABEL: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  CAJERO: 'Cajero',
}

export function CambiarRolDialog() {
  const { modal, userId, closeModal } = useUsuariosNav()
  const { data: usuarios = [] } = useUsuariosList()
  const { cambiarRol } = useMutacionesUsuario()

  const [nuevoRol, setNuevoRol] = useState<string>('')
  const [paso, setPaso] = useState<Paso>('elegir')

  const open = modal === 'rol'
  const usuario = usuarios.find((u) => u.id === userId) || null

  const adminsActivos = usuarios.filter(
    (u) => u.rol === 'ADMIN' && getEstadoAdmin(u) === 'ACTIVO'
  ).length
  const cajerosActivos = usuarios.filter(
    (u) => u.rol === 'CAJERO' && getEstadoAdmin(u) === 'ACTIVO'
  ).length

  const adminLleno = adminsActivos >= MAX_ADMINS_FRONTEND
  const cajeroLleno = cajerosActivos >= MAX_CAJEROS_FRONTEND

  const handleClose = () => {
    setNuevoRol('')
    setPaso('elegir')
    closeModal()
  }

  const handleConfirmar = () => {
    if (!usuario || !nuevoRol) return
    cambiarRol.mutate(
      { id: usuario.id, nuevoRol },
      { onSuccess: handleClose }
    )
  }

  if (!usuario) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            Cambiar rol
          </DialogTitle>
        </DialogHeader>

        {paso === 'elegir' ? (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground">
              Rol actual de <strong>{usuario.nombre}</strong>:{' '}
              <strong>{ROL_LABEL[usuario.rol] ?? usuario.rol}</strong>
            </p>

            <div className="space-y-1.5">
              <Label>Nuevo rol</Label>
              <Select value={nuevoRol} onValueChange={setNuevoRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {usuario.rol !== 'ADMIN' && (
                    <SelectItem value="ADMIN" disabled={adminLleno}>
                      Administrador{adminLleno ? ' (límite alcanzado)' : ''}
                    </SelectItem>
                  )}
                  {usuario.rol !== 'CAJERO' && (
                    <SelectItem value="CAJERO" disabled={cajeroLleno}>
                      Cajero{cajeroLleno ? ' (límite alcanzado)' : ''}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              Administradores: {adminsActivos}/{MAX_ADMINS_FRONTEND} activos ·{' '}
              Cajeros: {cajerosActivos}/{MAX_CAJEROS_FRONTEND} activos
            </p>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => setPaso('confirmar')}
                disabled={
                  !nuevoRol ||
                  (nuevoRol === 'ADMIN' && adminLleno) ||
                  (nuevoRol === 'CAJERO' && cajeroLleno)
                }
                className="bg-amber-500 hover:bg-amber-600 text-white border-none"
              >
                Siguiente
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground">
              Vas a cambiar el rol de <strong>{usuario.nombre}</strong> de{' '}
              <strong>{ROL_LABEL[usuario.rol] ?? usuario.rol}</strong> a{' '}
              <strong>{ROL_LABEL[nuevoRol] ?? nuevoRol}</strong>.
            </p>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {nuevoRol === 'CAJERO'
                ? 'El usuario perderá acceso a funciones de administración.'
                : 'El usuario obtendrá permisos de administración del sistema.'}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPaso('elegir')}>
                Atrás
              </Button>
              <Button
                onClick={handleConfirmar}
                disabled={cambiarRol.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-white border-none"
              >
                {cambiarRol.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cambiando...
                  </>
                ) : (
                  'Confirmar cambio'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
