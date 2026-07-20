'use client'

import { useId, useState } from 'react'
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form'
import { Loader2, Search, UserPlus, X } from 'lucide-react'
import { NuevoEventoFormValues } from '../../../schema/nuevoEvento.schema'
import { useBuscadorCliente } from '../../../hooks/useBuscadorCliente'
import { Cliente } from '@/features/admin/clientes/types'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface ClienteBuscadorProps {
  control: Control<NuevoEventoFormValues>
  register: UseFormRegister<NuevoEventoFormValues>
  errors: FieldErrors<NuevoEventoFormValues>
  clienteSel: Cliente | null
  onClienteSelChange: (cliente: Cliente | null) => void
  clienteSearch: string
  onClienteSearchChange: (search: string) => void
  onNuevoCliente: () => void
}

export function ClienteBuscador({
  control,
  register,
  errors,
  clienteSel,
  onClienteSelChange,
  clienteSearch,
  onClienteSearchChange,
  onNuevoCliente,
}: ClienteBuscadorProps) {
  const listboxId = useId()
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const { clientes, buscandoClientes } = useBuscadorCliente({
    clienteSearch,
    clienteSel,
  })

  const sinResultados =
    !buscandoClientes && clienteSearch.length >= 2 && clientes.length === 0

  const cerrarDropdown = () => {
    setShowDropdown(false)
    setHighlightedIndex(-1)
  }

  const seleccionarCliente = (
    cliente: Cliente,
    onChange: (id: number) => void
  ) => {
    onClienteSelChange(cliente)
    onClienteSearchChange(cliente.nombreCompleto)
    onChange(cliente.id)
    cerrarDropdown()
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Cliente
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 rounded-lg gap-1.5 text-xs text-brand-azul border-brand-azul/30 hover:bg-brand-azul/5 dark:border-brand-azul/40 dark:hover:bg-brand-azul/10"
          onClick={onNuevoCliente}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Nuevo cliente
        </Button>
      </div>
      <Controller
        name="idCliente"
        control={control}
        render={({ field, fieldState }) => (
          <FormField
            id="buscar-cliente"
            label="Buscar cliente"
            required
            error={fieldState.error?.message}
            className="relative"
          >
            {(fieldProps) => (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    {...fieldProps}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                      showDropdown && highlightedIndex >= 0
                        ? `${listboxId}-opcion-${highlightedIndex}`
                        : undefined
                    }
                    value={clienteSearch}
                    onChange={(e) => {
                      onClienteSearchChange(e.target.value)
                      if (clienteSel) {
                        onClienteSelChange(null)
                        field.onChange(undefined)
                      }
                      setShowDropdown(true)
                      setHighlightedIndex(-1)
                    }}
                    onFocus={() =>
                      clienteSearch.length >= 2 && setShowDropdown(true)
                    }
                    onBlur={cerrarDropdown}
                    onKeyDown={(e) => {
                      if (!showDropdown || clientes.length === 0) return
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setHighlightedIndex((i) =>
                          Math.min(i + 1, clientes.length - 1)
                        )
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        setHighlightedIndex((i) => Math.max(i - 1, 0))
                      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                        e.preventDefault()
                        seleccionarCliente(
                          clientes[highlightedIndex],
                          field.onChange
                        )
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        cerrarDropdown()
                      }
                    }}
                    placeholder="Nombre, documento, teléfono o correo..."
                    autoComplete="off"
                    readOnly={!!clienteSel}
                    className={cn(
                      'pl-9 pr-8 dark:bg-gray-800 dark:border-gray-700',
                      fieldState.error &&
                        'border-red-400 focus-visible:ring-red-300'
                    )}
                  />
                  {clienteSel ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClienteSelChange(null)
                        onClienteSearchChange('')
                        field.onChange(undefined)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : buscandoClientes ? (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  ) : null}
                </div>

                {showDropdown && !clienteSel && clientes.length > 0 && (
                  <div
                    id={listboxId}
                    role="listbox"
                    className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
                  >
                    {clientes.map((c, index) => (
                      <button
                        key={c.id}
                        id={`${listboxId}-opcion-${index}`}
                        type="button"
                        role="option"
                        aria-selected={index === highlightedIndex}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => seleccionarCliente(c, field.onChange)}
                        className={cn(
                          'w-full text-left px-4 py-2.5 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0',
                          index === highlightedIndex
                            ? 'bg-gray-50 dark:bg-gray-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        )}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {c.nombreCompleto}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {c.tipoDocumentoCodigo} {c.numeroDocumento}
                          {c.telefono && ` · ${c.telefono}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && !clienteSel && sinResultados && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No se encontraron clientes con «{clienteSearch}».
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg text-xs w-full"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        cerrarDropdown()
                        onNuevoCliente()
                      }}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Crear cliente nuevo con este nombre
                    </Button>
                  </div>
                )}
              </>
            )}
          </FormField>
        )}
      />

      <FormField
        id="contactoAdicional"
        label="Contacto alternativo (si es distinto al del cliente)"
        error={errors.contactoAdicional?.message}
        hint={
          clienteSel?.telefono
            ? `Teléfono del cliente: ${clienteSel.telefono}`
            : undefined
        }
      >
        {(fieldProps) => (
          <Input
            {...fieldProps}
            {...register('contactoAdicional')}
            placeholder="9XXXXXXXX o correo@ejemplo.com"
            className={cn(
              'dark:bg-gray-800 dark:border-gray-700',
              errors.contactoAdicional &&
                'border-red-400 focus-visible:ring-red-300'
            )}
          />
        )}
      </FormField>
    </div>
  )
}
