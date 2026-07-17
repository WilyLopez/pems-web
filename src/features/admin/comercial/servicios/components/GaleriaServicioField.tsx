import { useRef, useState } from 'react'
import { Plus, Star, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils'
import { ServicioImagen } from '@/types/comercial.types'
import {
  useServicioImagenes,
  useServicioImagenMutations,
} from '../hooks/useServicios'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_MB = 8
const MAX_IMAGENES = 8

interface GaleriaServicioFieldProps {
  idServicio?: number
}

export function GaleriaServicioField({
  idServicio,
}: GaleriaServicioFieldProps) {
  const { data: imagenes = [] } = useServicioImagenes(idServicio)
  const { subir, eliminar, reordenar, marcarPrincipal } =
    useServicioImagenMutations(idServicio)

  const inputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)

  if (!idServicio) {
    return (
      <div className="space-y-2">
        <Label>Imágenes</Label>
        <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-2.5">
          Guarda el servicio primero para poder agregar imágenes.
        </p>
      </div>
    )
  }

  const ordenadas = [...imagenes].sort((a, b) => a.orden - b.orden)
  const puedeAgregar = ordenadas.length < MAX_IMAGENES

  async function subirArchivos(archivos: FileList) {
    const disponibles = MAX_IMAGENES - ordenadas.length
    const candidatos = Array.from(archivos).slice(0, disponibles)
    if (archivos.length > disponibles) {
      toast.warning(`Solo puedes agregar ${disponibles} imagen(es) más.`)
    }

    const validos = candidatos.filter((archivo) => {
      if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        toast.error(`${archivo.name}: tipo de archivo no permitido.`)
        return false
      }
      if (archivo.size > MAX_MB * 1024 * 1024) {
        toast.error(`${archivo.name}: supera el límite de ${MAX_MB} MB.`)
        return false
      }
      return true
    })

    if (validos.length === 0) return

    setSubiendo(true)
    try {
      for (const archivo of validos) {
        await subir.mutateAsync({ archivo })
      }
    } catch {
      toast.error('No se pudieron subir todas las imágenes.')
    } finally {
      setSubiendo(false)
    }
  }

  function handleChangeFichero(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0)
      subirArchivos(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  function mover(imagen: ServicioImagen, direccion: -1 | 1) {
    const indice = ordenadas.findIndex((i) => i.id === imagen.id)
    const destino = ordenadas[indice + direccion]
    if (!destino) return
    reordenar.mutate({ id: imagen.id, nuevoOrden: destino.orden })
  }

  return (
    <div className="space-y-2">
      <Label>
        Imágenes ({ordenadas.length}/{MAX_IMAGENES})
      </Label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {ordenadas.map((imagen, index) => (
          <div
            key={imagen.id}
            className={cn(
              'relative aspect-square rounded-xl overflow-hidden border-2 bg-muted',
              imagen.esPrincipal ? 'border-brand-azul' : 'border-border'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagen.url}
              alt={imagen.altTexto ?? ''}
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              title={
                imagen.esPrincipal
                  ? 'Imagen principal'
                  : 'Marcar como principal'
              }
              onClick={() => marcarPrincipal.mutate(imagen.id)}
              disabled={marcarPrincipal.isPending}
              className={cn(
                'absolute top-1 left-1 h-6 w-6 rounded-full flex items-center justify-center transition-colors',
                imagen.esPrincipal
                  ? 'bg-brand-azul text-white'
                  : 'bg-black/50 text-white hover:bg-black/70'
              )}
            >
              <Star
                className="h-3.5 w-3.5"
                fill={imagen.esPrincipal ? 'currentColor' : 'none'}
              />
            </button>

            <button
              type="button"
              title="Eliminar imagen"
              onClick={() => eliminar.mutate(imagen.id)}
              disabled={eliminar.isPending}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/80 hover:bg-destructive hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="absolute bottom-1 inset-x-1 flex justify-between">
              <button
                type="button"
                title="Mover antes"
                disabled={index === 0 || reordenar.isPending}
                onClick={() => mover(imagen, -1)}
                className="h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                title="Mover después"
                disabled={index === ordenadas.length - 1 || reordenar.isPending}
                onClick={() => mover(imagen, 1)}
                className="h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        {puedeAgregar && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-brand-azul hover:bg-brand-azul/5 flex items-center justify-center transition-colors disabled:opacity-60"
          >
            {subiendo ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Plus className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground/70">
        JPG, PNG o WebP · Máx {MAX_MB} MB por imagen · La marcada con estrella
        se usa como imagen principal
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleChangeFichero}
      />
    </div>
  )
}
