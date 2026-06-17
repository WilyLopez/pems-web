'use client'

import { useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { UsuarioAdmin } from '@/types/usuario-admin.types'
import { useCambiarRolAdmin } from '@/hooks/useUsuariosAdmin'

interface Props {
  usuario: UsuarioAdmin | null
  open: boolean
  onClose: () => void
}

export function CambiarRolModal({ usuario, open, onClose }: Props) {
  const [nuevoRol, setNuevoRol] = useState<string>('')
  const cambiarRol = useCambiarRolAdmin()

  function handleOpen(v: boolean) {
    if (!v) {
      setNuevoRol('')
      onClose()
    }
  }

  function handleSubmit() {
    if (!usuario || !nuevoRol) return
    cambiarRol.mutate(
      { id: usuario.id, nuevoRol },
      { onSuccess: () => { setNuevoRol(''); onClose() } }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
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
              <Button type="button" variant="outline" onClick={() => { setNuevoRol(''); onClose() }}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!nuevoRol || cambiarRol.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {cambiarRol.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cambiando...</>
                ) : 'Confirmar cambio'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
