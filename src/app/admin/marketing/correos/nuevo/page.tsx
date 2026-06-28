'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { useTiposMarketing, useCrearCorreo } from '@/hooks/useMarketingEmails'
import { toast } from 'sonner'

export default function NuevoCorreoPage() {
  const router = useRouter()
  const { data: tipos, isLoading: cargandoTipos } = useTiposMarketing()
  const crear = useCrearCorreo()

  const [tipoEmailCodigo, setTipoEmailCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [asunto, setAsunto] = useState('')
  const [contenidoBloques, setContenidoBloques] = useState('[]')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!tipoEmailCodigo) {
      toast.error('Selecciona un tipo de correo.')
      return
    }
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

    crear.mutate(
      {
        tipoEmailCodigo,
        nombre: nombre.trim(),
        asunto: asunto.trim(),
        contenidoBloques,
      },
      { onSuccess: () => router.push('/admin/marketing/correos') }
    )
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Marketing', href: '/admin/marketing' },
          { label: 'Correos', href: '/admin/marketing/correos' },
          { label: 'Nuevo' },
        ]}
      />

      <PageHeader
        title="Nuevo correo de marketing"
        description="Diseña el contenido usando bloques. Las variables se insertan con los chips de la derecha."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo de correo</Label>
              {cargandoTipos ? (
                <div className="h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center px-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : (
                <select
                  id="tipo"
                  value={tipoEmailCodigo}
                  onChange={(e) => setTipoEmailCodigo(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
                >
                  <option value="">Selecciona un tipo...</option>
                  {tipos?.map((t) => (
                    <option key={t.codigo} value={t.codigo}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre interno</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Promo junio 2026"
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
              placeholder="Ej: ¡{{nombreCliente}}, tenemos una oferta para ti!"
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
            disabled={crear.isPending}
          >
            {crear.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar correo
          </Button>
        </div>
      </form>
    </div>
  )
}
