import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { formatCurrency, cn } from '@/lib/utils'
import { ServicioVariante } from '@/types/comercial.types'
import {
  useServicioVariantes,
  useServicioVarianteMutations,
} from '../hooks/useServicios'

interface VarianteFormState {
  nombre: string
  precio: string
  descripcion: string
  activo: boolean
}

interface VarianteFormErrors {
  nombre?: string
  precio?: string
}

const FORM_VACIO: VarianteFormState = {
  nombre: '',
  precio: '',
  descripcion: '',
  activo: true,
}

function validar(form: VarianteFormState): VarianteFormErrors {
  const errores: VarianteFormErrors = {}
  if (!form.nombre.trim()) errores.nombre = 'El nombre es requerido'
  else if (form.nombre.length > 100) errores.nombre = 'Máximo 100 caracteres'
  if (form.precio.trim() === '') errores.precio = 'El precio es requerido'
  else if (Number.isNaN(Number(form.precio)) || Number(form.precio) < 0)
    errores.precio = 'Ingresa un precio válido'
  return errores
}

interface VariantesFieldProps {
  idServicio?: number
}

export function VariantesField({ idServicio }: VariantesFieldProps) {
  const { data: variantes = [] } = useServicioVariantes(idServicio)
  const { crear, actualizar, eliminar, reordenar } =
    useServicioVarianteMutations(idServicio)

  const [editandoId, setEditandoId] = useState<number | 'nueva' | null>(null)
  const [form, setForm] = useState<VarianteFormState>(FORM_VACIO)
  const [errores, setErrores] = useState<VarianteFormErrors>({})

  if (!idServicio) {
    return (
      <div className="space-y-2">
        <Label>Variantes</Label>
        <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-3 py-2.5">
          Guarda el servicio primero para poder agregar variantes.
        </p>
      </div>
    )
  }

  function abrirNueva() {
    setForm(FORM_VACIO)
    setErrores({})
    setEditandoId('nueva')
  }

  function abrirEdicion(variante: ServicioVariante) {
    setForm({
      nombre: variante.nombre,
      precio: String(variante.precio),
      descripcion: variante.descripcion ?? '',
      activo: variante.activo,
    })
    setErrores({})
    setEditandoId(variante.id)
  }

  function cerrar() {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setErrores({})
  }

  function guardar() {
    const erroresForm = validar(form)
    setErrores(erroresForm)
    if (Object.keys(erroresForm).length > 0) return

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      precio: Number(form.precio),
      activo: form.activo,
      orden: editandoId === 'nueva' ? variantes.length : 0,
    }

    if (editandoId === 'nueva') {
      crear.mutate(payload, { onSuccess: cerrar })
    } else if (typeof editandoId === 'number') {
      const existente = variantes.find((v) => v.id === editandoId)
      actualizar.mutate(
        {
          id: editandoId,
          payload: { ...payload, orden: existente?.orden ?? 0 },
        },
        { onSuccess: cerrar }
      )
    }
  }

  function mover(variante: ServicioVariante, direccion: -1 | 1) {
    const ordenados = [...variantes].sort((a, b) => a.orden - b.orden)
    const indice = ordenados.findIndex((v) => v.id === variante.id)
    const destino = ordenados[indice + direccion]
    if (!destino) return
    reordenar.mutate({ id: variante.id, nuevoOrden: destino.orden })
  }

  const guardando = crear.isPending || actualizar.isPending
  const ordenados = [...variantes].sort((a, b) => a.orden - b.orden)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Variantes</Label>
        {editandoId === null && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={abrirNueva}
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar variante
          </Button>
        )}
      </div>

      {ordenados.length === 0 && editandoId !== 'nueva' && (
        <p className="text-xs text-muted-foreground">
          Sin variantes. El servicio usa su precio único.
        </p>
      )}

      <div className="space-y-2">
        {ordenados.map((variante, index) =>
          editandoId === variante.id ? (
            <VarianteFormRow
              key={variante.id}
              form={form}
              errores={errores}
              guardando={guardando}
              onChange={setForm}
              onGuardar={guardar}
              onCancelar={cerrar}
            />
          ) : (
            <div
              key={variante.id}
              className={cn(
                'flex items-center gap-2 rounded-lg border border-border px-3 py-2',
                !variante.activo && 'opacity-60'
              )}
            >
              <div className="flex flex-col shrink-0">
                <button
                  type="button"
                  disabled={index === 0 || reordenar.isPending}
                  onClick={() => mover(variante, -1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={
                    index === ordenados.length - 1 || reordenar.isPending
                  }
                  onClick={() => mover(variante, 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {variante.nombre}
                </p>
                {variante.descripcion && (
                  <p className="text-xs text-muted-foreground truncate">
                    {variante.descripcion}
                  </p>
                )}
              </div>
              <span className="text-sm font-semibold text-brand-azul shrink-0">
                {formatCurrency(variante.precio)}
              </span>
              <div className="flex gap-1 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => abrirEdicion(variante)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:text-destructive"
                  disabled={eliminar.isPending}
                  onClick={() => eliminar.mutate(variante.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        )}

        {editandoId === 'nueva' && (
          <VarianteFormRow
            form={form}
            errores={errores}
            guardando={guardando}
            onChange={setForm}
            onGuardar={guardar}
            onCancelar={cerrar}
          />
        )}
      </div>
    </div>
  )
}

interface VarianteFormRowProps {
  form: VarianteFormState
  errores: VarianteFormErrors
  guardando: boolean
  onChange: (form: VarianteFormState) => void
  onGuardar: () => void
  onCancelar: () => void
}

function VarianteFormRow({
  form,
  errores,
  guardando,
  onChange,
  onGuardar,
  onCancelar,
}: VarianteFormRowProps) {
  return (
    <div className="rounded-lg border border-brand-azul/40 bg-brand-azul/5 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Input
            placeholder="Nombre (Ej: Pequeña)"
            value={form.nombre}
            onChange={(e) => onChange({ ...form, nombre: e.target.value })}
            aria-invalid={!!errores.nombre}
          />
          {errores.nombre && (
            <p className="text-xs text-destructive">{errores.nombre}</p>
          )}
        </div>
        <div className="space-y-1">
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Precio"
            value={form.precio}
            onChange={(e) => onChange({ ...form, precio: e.target.value })}
            aria-invalid={!!errores.precio}
          />
          {errores.precio && (
            <p className="text-xs text-destructive">{errores.precio}</p>
          )}
        </div>
      </div>
      <Input
        placeholder="Descripción (opcional)"
        value={form.descripcion}
        onChange={(e) => onChange({ ...form, descripcion: e.target.value })}
      />
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => onChange({ ...form, activo: e.target.checked })}
            className="h-3.5 w-3.5 rounded"
          />
          Activa
        </label>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onCancelar}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 w-7 p-0 bg-brand-azul text-white hover:bg-brand-azul/90"
            disabled={guardando}
            onClick={onGuardar}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
