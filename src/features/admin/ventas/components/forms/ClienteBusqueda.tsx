import React, { useState } from 'react'
import { Search, User, UserCheck, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { clienteService } from '@/services/cliente.service'
import { Cliente } from '@/types/cliente.types'
import { toast } from 'sonner'

interface ClienteBusquedaProps {
  onClienteSelect: (cliente: Cliente | null) => void
}

export const ClienteBusqueda = ({ onClienteSelect }: ClienteBusquedaProps) => {
  const [searchVal, setSearchVal] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [paso, setPaso] = useState<'inicio' | 'busqueda'>('inicio')
  const [resultados, setResultados] = useState<Cliente[]>([])

  const buscar = async () => {
    const trimmed = searchVal.trim()
    if (!trimmed) return
    setBuscando(true)
    setResultados([])
    try {
      const res = await clienteService.listar({ search: trimmed, size: 10 })
      if (res.content && res.content.length === 1) {
        onClienteSelect(res.content[0])
      } else if (res.content && res.content.length > 1) {
        setResultados(res.content)
      } else {
        toast.error('No se encontro ningun cliente')
      }
    } catch {
      toast.error('Error al buscar cliente')
    } finally {
      setBuscando(false)
    }
  }

  if (paso === 'inicio') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPaso('busqueda')}
          className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-brand-azul hover:bg-brand-azul/5 dark:hover:border-brand-azul/60 dark:hover:bg-brand-azul/10 transition-all text-left space-y-2"
        >
          <div className="h-8 w-8 rounded-lg bg-brand-azul/10 flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-brand-azul" />
          </div>
          <div>
            <p className="font-semibold text-xs text-gray-800 dark:text-gray-200">
              Si, tiene cuenta
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Buscar por documento, correo o nombre
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onClienteSelect(null)}
          className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left space-y-2"
        >
          <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-xs text-gray-800 dark:text-gray-200">
              No, es visitante
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Continuar sin cuenta
            </p>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
          Buscar cliente
        </p>
        <button
          type="button"
          onClick={() => {
            setPaso('inicio')
            setSearchVal('')
            setResultados([])
          }}
          className="text-[10px] text-brand-azul hover:underline"
        >
          Volver
        </button>
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="DNI, RUC, correo o nombre"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              buscar()
            }
          }}
          className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
        <button
          type="button"
          onClick={buscar}
          disabled={!searchVal.trim() || buscando}
          className="h-9 px-3 flex items-center justify-center rounded-lg bg-brand-azul text-white disabled:opacity-40 hover:bg-brand-azul/90 transition-colors"
        >
          {buscando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>

      {resultados.length > 0 && (
        <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 z-50 relative">
          {resultados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onClienteSelect(c)}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col gap-0.5"
            >
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {c.nombreCompleto}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {c.numeroDocumento} {c.correo ? `• ${c.correo}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
