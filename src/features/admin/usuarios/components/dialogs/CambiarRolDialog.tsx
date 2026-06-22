'use client'

import { useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import { useUsuariosList, useMutacionesUsuario } from '../../hooks/useUsuariosData'

export function CambiarRolDialog() {
  const { modal, userId, closeModal } = useUsuariosNav()
  const { data: usuarios = [] } = useUsuariosList()
  const { cambiarRol } = useMutacionesUsuario()

  const [nuevoRol, setNuevoRol] = useState<string>('')

  const open = modal === 'rol'
  const usuario = usuarios.find((u) => u.id === userId) || null

  const handleClose = () => {
    setNuevoRol('')
    closeModal()
  }

  const handleSubmit = () => {
    if (!usuario || !nuevoRol) return
    cambiarRol.mutate(
      { id: usuario.id, nuevoRol },
      {
        onSuccess: () => {
          handleClose()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            Cambiar rol
          </DialogTitle>
        </DialogHeader>

        {usuario && (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-muted-foreground">
              Cambiando rol de <strong>{usuario.nombre}</strong> (actual:{' '}
              <strong>{usuario.rol}</strong>).
            </p>

            <div className="space-y-1.5">
              <Label>Nuevo rol</Label>
              <Select value={nuevoRol} onValueChange={setNuevoRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {usuario.rol !== 'ADMIN' && (
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  )}
                  {usuario.rol !== 'CAJERO' && (
                    <SelectItem value="CAJERO">Cajero</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              Límite: máx. 3 administradores activos · máx. 3 cajeros activos.
            </p>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!nuevoRol || cambiarRol.isPending}
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
