'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useCrearUsuarioAdmin } from '@/hooks/useUsuariosAdmin'

const schema = z.object({
  nombre:    z.string().min(2).max(120),
  correo:    z.string().email('Correo inválido'),
  contrasena:z.string().min(8, 'Mínimo 8 caracteres'),
  rol:       z.string().default('ADMINISTRATIVO'),
  telefono:  z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  idSede: number
}

export function CrearUsuarioModal({ open, onClose, idSede }: Props) {
  const crear = useCrearUsuarioAdmin()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rol: 'ADMINISTRATIVO' },
  })

  function onSubmit(values: FormValues) {
    crear.mutate(
      { idSede, ...values },
      { onSuccess: () => { reset(); onClose() } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 text-primary" />
            Nuevo administrador
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input id="nombre" placeholder="María López" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="correo">Correo electrónico</Label>
            <Input id="correo" type="email" placeholder="admin@kikiy lala.pe" {...register('correo')} />
            {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contrasena">Contraseña temporal</Label>
            <Input id="contrasena" type="password" placeholder="••••••••" {...register('contrasena')} />
            {errors.contrasena && <p className="text-xs text-destructive">{errors.contrasena.message}</p>}
            <p className="text-xs text-muted-foreground">El usuario deberá cambiarla en su primer inicio de sesión.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select defaultValue="ADMINISTRATIVO" onValueChange={(v) => setValue('rol', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GERENTE">Gerente</SelectItem>
                  <SelectItem value="SUBGERENTE">Subgerente</SelectItem>
                  <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" placeholder="999 999 999" {...register('telefono')} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose() }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
                : 'Crear administrador'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
