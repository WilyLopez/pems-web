'use client'

import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { User, Phone, FileText, Loader2, Save, Building2 } from 'lucide-react'

import { clienteService } from '@/services/cliente.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Separator } from '@/components/ui/Separator'
import { getInitials } from '@/lib/utils'

const cuentaSchema = z
  .object({
    nombre: z.string().min(2).max(120),
    telefono: z
      .string()
      .min(7, 'Ingresa un teléfono válido')
      .max(20)
      .regex(/^[0-9+\s()-]+$/, 'Solo se permiten números y caracteres válidos'),
    ruc: z
      .string()
      .regex(/^$|^[0-9]{11}$/, 'El RUC debe tener 11 dígitos')
      .optional(),
    razonSocial: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      if (data.ruc && data.ruc.length === 11) {
        return !!data.razonSocial && data.razonSocial.trim().length > 0
      }
      return true
    },
    { message: 'Ingresa la razón social si tienes RUC', path: ['razonSocial'] }
  )

type CuentaFormValues = z.infer<typeof cuentaSchema>

export default function MiCuentaPage() {
  const { data: session } = useSession()
  const user = session?.user

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CuentaFormValues>({
    resolver: zodResolver(cuentaSchema),
    defaultValues: {
      nombre: user?.name ?? '',
      telefono: '',
      ruc: '',
      razonSocial: '',
    },
  })

  const rucValue = watch('ruc')
  const tieneRuc = !!rucValue && rucValue.length === 11

  const actualizar = useMutation({
    mutationFn: (values: CuentaFormValues) =>
      clienteService.actualizar(parseInt(user?.id ?? '0'), values),
    onSuccess: () => toast.success('Datos actualizados correctamente.'),
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar.'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Mi cuenta</h1>
        <p className="text-sm text-gray-400 mt-0.5">Administra tu información personal</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 border border-gray-100 shadow-card rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-brand-rosa text-white font-black">
                {user?.name ? getInitials(user.name) : 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
            <div className="w-full rounded-xl bg-brand-azul/8 px-4 py-3 flex items-center gap-2 justify-center">
              <User className="h-4 w-4 text-brand-azul" />
              <span className="text-sm font-semibold text-brand-azul">Cliente registrado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border border-gray-100 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-azul/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-brand-azul" />
              </div>
              Información personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((v) => actualizar.mutate(v))}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-semibold">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre"
                    className="h-11 rounded-xl pl-9"
                    {...register('nombre')}
                  />
                </div>
                {errors.nombre && (
                  <p className="text-xs text-destructive">{errors.nombre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm font-semibold">
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="telefono"
                    placeholder="987654321"
                    className="h-11 rounded-xl pl-9"
                    {...register('telefono')}
                  />
                </div>
                {errors.telefono && (
                  <p className="text-xs text-destructive">{errors.telefono.message}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  Datos de facturación
                  <span className="text-xs font-normal text-gray-400">(opcional)</span>
                </p>
                <p className="text-xs text-gray-400">
                  Completa estos campos si necesitas factura electrónica.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruc" className="text-sm font-semibold">
                  RUC
                </Label>
                <Input
                  id="ruc"
                  placeholder="20000000001"
                  maxLength={11}
                  className="h-11 rounded-xl"
                  {...register('ruc')}
                />
                {errors.ruc && (
                  <p className="text-xs text-destructive">{errors.ruc.message}</p>
                )}
              </div>

              {tieneRuc && (
                <div className="space-y-2">
                  <Label htmlFor="razonSocial" className="text-sm font-semibold">
                    Razón social
                  </Label>
                  <Input
                    id="razonSocial"
                    placeholder="Empresa S.A.C."
                    className="h-11 rounded-xl"
                    {...register('razonSocial')}
                  />
                  {errors.razonSocial && (
                    <p className="text-xs text-destructive">{errors.razonSocial.message}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-brand-azul hover:bg-brand-azul/90 text-white font-bold rounded-full gap-2"
                disabled={actualizar.isPending}
              >
                {actualizar.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
