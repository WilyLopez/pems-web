'use client'

import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { User, Crown, Award, Loader2, Save } from 'lucide-react'

import { clienteService } from '@/services/cliente.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { getInitials } from '@/lib/utils'

const cuentaSchema = z.object({
  nombre: z.string().min(2).max(120),
  telefono: z.string().min(7).max(20),
  ruc: z.string().optional(),
  razonSocial: z.string().optional(),
})

type CuentaFormValues = z.infer<typeof cuentaSchema>

export default function MiCuentaPage() {
  const { data: session, update } = useSession()
  const user = session?.user

  const { register, handleSubmit, formState: { errors } } = useForm<CuentaFormValues>({
    defaultValues: { nombre: user?.name ?? '' },
  })

  const actualizar = useMutation({
    mutationFn: (values: CuentaFormValues) =>
      clienteService.actualizar(parseInt(user?.id ?? '0'), values),
    onSuccess: () => toast.success('Datos actualizados correctamente.'),
    onError: (err: { message?: string }) => toast.error(err?.message ?? 'No se pudo actualizar.'),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Mi cuenta" description="Administra tu información personal" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {user?.name ? getInitials(user.name) : 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Cliente registrado
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Información personal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((v) => actualizar.mutate(v))} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input id="nombre" {...register('nombre')} />
                  {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" {...register('telefono')} />
                  {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>RUC <span className="text-muted-foreground">(para facturas)</span></Label>
                  <Input placeholder="20000000001" {...register('ruc')} />
                </div>
              </div>

              <Button type="submit" disabled={actualizar.isPending}>
                {actualizar.isPending
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                  : <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}