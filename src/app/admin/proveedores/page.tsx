'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Loader2, Building2 } from 'lucide-react'

import {
  proveedorService,
  Proveedor,
  GestionarProveedorPayload,
} from '@/services/proveedor.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'

const schema = z.object({
  nombre: z.string().min(2).max(200),
  ruc: z.string().length(11).optional().or(z.literal('')),
  contactoNombre: z.string().max(120).optional(),
  contactoTelefono: z.string().max(20).optional(),
  contactoCorreo: z.string().email().optional().or(z.literal('')),
  tipoServicio: z.string().min(2).max(200),
  notas: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const KEY = 'proveedores'

export default function ProveedoresPage() {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<{
    open: boolean
    proveedor: Proveedor | null
  }>({
    open: false,
    proveedor: null,
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [KEY],
    queryFn: () => proveedorService.listar(),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const guardar = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: GestionarProveedorPayload = {
        nombre: values.nombre,
        ruc: values.ruc || undefined,
        contactoNombre: values.contactoNombre,
        contactoTelefono: values.contactoTelefono,
        contactoCorreo: values.contactoCorreo || undefined,
        tipoServicio: values.tipoServicio,
        notas: values.notas,
      }
      return dialog.proveedor
        ? proveedorService.actualizar(dialog.proveedor.id, payload)
        : proveedorService.crear(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      toast.success(
        dialog.proveedor ? 'Proveedor actualizado.' : 'Proveedor creado.'
      )
      setDialog({ open: false, proveedor: null })
      reset()
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'Error al guardar.'),
  })

  const openCreate = () => {
    reset()
    setDialog({ open: true, proveedor: null })
  }
  const openEdit = (p: Proveedor) => {
    setValue('nombre', p.nombre)
    setValue('ruc', p.ruc ?? '')
    setValue('contactoNombre', p.contactoNombre ?? '')
    setValue('contactoTelefono', p.contactoTelefono ?? '')
    setValue('contactoCorreo', p.contactoCorreo ?? '')
    setValue('tipoServicio', p.tipoServicio)
    setDialog({ open: true, proveedor: p })
  }

  const columns: ColumnDef<Proveedor>[] = [
    {
      accessorKey: 'nombre',
      header: 'Proveedor',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.nombre}</p>
          {row.original.ruc && (
            <p className="text-xs text-muted-foreground">
              RUC: {row.original.ruc}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'tipoServicio',
      header: 'Tipo de servicio',
    },
    {
      accessorKey: 'contactoNombre',
      header: 'Contacto',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{row.original.contactoNombre ?? '—'}</p>
          {row.original.contactoTelefono && (
            <p className="text-xs text-muted-foreground">
              {row.original.contactoTelefono}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.activo
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-500'
          }
        >
          {row.original.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'acciones',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEdit(row.original)}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
      ),
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Proveedores' }]} />

      <PageHeader
        title="Proveedores"
        description="Gestión de proveedores de servicios y productos"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo proveedor
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyMessage="No hay proveedores registrados."
      />

      <Dialog
        open={dialog.open}
        onOpenChange={(o) => {
          setDialog({ open: o, proveedor: null })
          reset()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {dialog.proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((v) => guardar.mutate(v))}
            className="space-y-3 py-2"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nombre / razón social</Label>
                <Input placeholder="Empresa S.A.C." {...register('nombre')} />
                {errors.nombre && (
                  <p className="text-sm text-destructive">
                    {errors.nombre.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  RUC <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  placeholder="20000000001"
                  maxLength={11}
                  {...register('ruc')}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de servicio</Label>
                <Input
                  placeholder="Ej: Catering, Animación"
                  {...register('tipoServicio')}
                />
                {errors.tipoServicio && (
                  <p className="text-sm text-destructive">
                    {errors.tipoServicio.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nombre de contacto</Label>
                <Input
                  placeholder="Juan Rodríguez"
                  {...register('contactoNombre')}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono de contacto</Label>
                <Input
                  placeholder="987654321"
                  {...register('contactoTelefono')}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Correo de contacto</Label>
                <Input
                  type="email"
                  placeholder="contacto@empresa.com"
                  {...register('contactoCorreo')}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>
                  Notas internas{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea rows={2} {...register('notas')} />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialog({ open: false, proveedor: null })
                reset()
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit((v) => guardar.mutate(v))}
              disabled={guardar.isPending}
            >
              {guardar.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {dialog.proveedor ? 'Guardar cambios' : 'Crear proveedor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
