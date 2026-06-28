'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { BlockEditor } from '@/components/admin/marketing/BlockEditor'
import {
  bloquesContienenVariablesBloqueadas,
  parsearBloques,
} from '@/types/emailBlocks.types'
import {
  useCorreoMarketing,
  useActualizarCorreo,
} from '@/hooks/useMarketingEmails'
import { toast } from 'sonner'

export default function EditarCorreoPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const correoId = Number(id)

  const { data: correo, isLoading } = useCorreoMarketing(
    Number.isFinite(correoId) ? correoId : null
  )
  const actualizar = useActualizarCorreo(correoId)

  const [nombre, setNombre] = useState('')
  const [asunto, setAsunto] = useState('')
  const [contenidoBloques, setContenidoBloques] = useState('[]')

  useEffect(() => {
    if (correo) {
      setNombre(correo.nombre)
      setAsunto(correo.asunto)
      setContenidoBloques(correo.contenidoBloques ?? '[]')
    }
  }, [correo])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio.')
      return
    }
    if (!asunto.trim()) {
      toast.error('El asunto es obligatorio.')
      return
    }
    const bloques = parsearBloques(contenidoBloques)
    if (bloques.length === 0) {
      toast.error('Agrega al menos un bloque de contenido.')
      return
    }
    const varBloqueada = bloquesContienenVariablesBloqueadas(bloques)
    if (varBloqueada) {
      toast.error(
        `La variable {{${varBloqueada}}} está reservada para correos del sistema.`
      )
      return
    }

    actualizar.mutate(
      { nombre: nombre.trim(), asunto: asunto.trim(), contenidoBloques },
      { onSuccess: () => router.push('/admin/marketing/correos') }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-6 w-6 animate-spin text-brand-azul" />
      </div>
    )
  }

  if (!correo) {
    return (
      <div className="flex items-center justify-center h-60 text-sm text-gray-400">
        Correo no encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Marketing', href: '/admin/marketing' },
          { label: 'Correos', href: '/admin/marketing/correos' },
          { label: correo.nombre },
        ]}
      />

      <PageHeader
        title="Editar correo de marketing"
        description={`Tipo: ${correo.tipoEmailNombre}`}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de correo</Label>
              <div className="h-10 rounded-xl border border-gray-100 bg-gray-50 px-3 flex items-center text-sm text-gray-500">
                {correo.tipoEmailNombre}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre interno</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="asunto">Asunto del correo</Label>
            <Input
              id="asunto"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <p className="text-sm font-semibold text-gray-800">
            Contenido del correo
          </p>
          <BlockEditor
            value={contenidoBloques}
            onChange={setContenidoBloques}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push('/admin/marketing/correos')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="rounded-xl gap-1.5"
            disabled={actualizar.isPending}
          >
            {actualizar.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
