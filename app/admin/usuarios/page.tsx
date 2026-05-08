'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UserPlus, Loader2, Shield } from 'lucide-react'
import api from '@/services/api'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  nombre: z.string().min(2).max(120),
  correo: z.string().email('Correo inválido'),
  contrasena: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormValues = z.infer<typeof schema>

export default function UsuariosPage() {
  const { idSede } = useAuth()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const crear = useMutation({
    mutationFn: (values: FormValues) =>
      api.post(`/usuarios-admin/sedes/${idSede ?? 1}`, values),
    onSuccess: () => {
      toast.success('Administrador creado correctamente.')
      reset()
    },
    onError: (err: { message?: string }) => toast.error(err?.message ?? 'No se pudo crear el usuario.'),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios administradores"
        description="Gestión de acceso al panel de administración"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Crear nuevo administrador
            </CardTitle>
            <CardDescription>
              El usuario tendrá acceso completo al panel administrativo de la sede actual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((v) => crear.mutate(v))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input id="nombre" placeholder="María López" {...register('nombre')} />
                {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input id="correo" type="email" placeholder="admin@Kiki y Lala.pe" {...register('correo')} />
                {errors.correo && <p className="text-sm text-destructive">{errors.correo.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contrasena">Contraseña temporal</Label>
                <Input id="contrasena" type="password" placeholder="••••••••" {...register('contrasena')} />
                {errors.contrasena && <p className="text-sm text-destructive">{errors.contrasena.message}</p>}
                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres. El usuario deberá cambiarla en su primer inicio de sesión.</p>
              </div>
              <Button type="submit" disabled={crear.isPending} className="w-full">
                {crear.isPending
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
                  : <><UserPlus className="mr-2 h-4 w-4" /> Crear administrador</>
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Políticas de acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Los administradores tienen acceso completo al panel de gestión incluyendo:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Gestión de reservas y eventos</li>
              <li>Manejo de inventario y ventas</li>
              <li>Emisión de comprobantes SUNAT</li>
              <li>Administración del calendario</li>
              <li>Gestión de contenido (CMS)</li>
            </ul>
            <p className="pt-2">Para desactivar un usuario, contacta al administrador principal.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}