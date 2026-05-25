'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { clienteService } from '@/services/cliente.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const schema = z.object({
  nombre: z.string().min(2).max(120),
  correo: z.string().email().max(120).optional().or(z.literal('')),
  telefono: z.string().min(6).max(20),
  dni: z.string().length(8).optional().or(z.literal('')),
  fechaNacimiento: z.string().optional().or(z.literal('')),
  observaciones: z.string().max(500).optional().or(z.literal('')),
  tipoCliente: z.enum(['PERSONA', 'EMPRESA']).default('PERSONA'),
  aceptaComunicaciones: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

export default function NuevoClientePage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipoCliente: 'PERSONA', aceptaComunicaciones: true },
  })

  const crear = useMutation({
    mutationFn: (values: FormValues) =>
      clienteService.registrarAdmin({
        nombre: values.nombre,
        correo: values.correo || undefined,
        telefono: values.telefono,
        dni: values.dni || undefined,
        fechaNacimiento: values.fechaNacimiento || undefined,
        observaciones: values.observaciones || undefined,
        tipoCliente: values.tipoCliente,
        aceptaComunicaciones: values.aceptaComunicaciones,
      }),
    onSuccess: (cliente) => {
      toast.success('Cliente registrado correctamente.')
      router.push(`/admin/clientes`)
    },
    onError: () => toast.error('No se pudo registrar el cliente.'),
  })

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Clientes', href: '/admin/clientes' },
          { label: 'Nuevo cliente' },
        ]}
      />

      <PageHeader
        title="Nuevo cliente"
        description="Registro manual de cliente por administrador"
        actions={
          <Link href="/admin/clientes">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />

      <div className="max-w-2xl">
        <form
          onSubmit={handleSubmit((v) => crear.mutate(v))}
          className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register('nombre')} placeholder="Juan Pérez" />
              {errors.nombre && (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input id="telefono" {...register('telefono')} placeholder="999888777" />
              {errors.telefono && (
                <p className="text-xs text-red-500">{errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input id="correo" type="email" {...register('correo')} placeholder="juan@email.com" />
              {errors.correo && (
                <p className="text-xs text-red-500">{errors.correo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" {...register('dni')} placeholder="12345678" maxLength={8} />
              {errors.dni && (
                <p className="text-xs text-red-500">{errors.dni.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
              <Input id="fechaNacimiento" type="date" {...register('fechaNacimiento')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tipoCliente">Tipo de cliente</Label>
              <select
                id="tipoCliente"
                {...register('tipoCliente')}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
              >
                <option value="PERSONA">Persona natural</option>
                <option value="EMPRESA">Empresa</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <textarea
              id="observaciones"
              {...register('observaciones')}
              rows={3}
              placeholder="Notas internas sobre el cliente..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('aceptaComunicaciones')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">
              Acepta recibir comunicaciones y promociones
            </span>
          </label>

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/admin/clientes">
              <Button variant="outline" type="button" className="rounded-xl">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={crear.isPending}
              className="rounded-xl gap-1.5"
            >
              {crear.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Registrar cliente
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
