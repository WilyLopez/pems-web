import React, { useState } from 'react'
import { Search, User, UserCheck, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { clienteService } from '@/services/cliente.service'
import { Cliente } from '@/types/cliente.types'
import { toast } from 'sonner'

interface ClienteBusquedaProps {
  onClienteSelect: (cliente: Cliente | null) => void
  selectedCliente: Cliente | null
}

export const ClienteBusqueda = ({ onClienteSelect, selectedCliente }: ClienteBusquedaProps) => {
  const [email, setEmail] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [paso, setPaso] = useState<'inicio' | 'busqueda'>(selectedCliente ? 'busqueda' : 'inicio')

  const buscar = async () => {
    if (!email.trim()) return
    setBuscando(true)
    try {
      const found = await clienteService.buscarPorCorreo(email.trim())
      if (found) {
        onClienteSelect(found)
      } else {
        toast.error('No se encontró el cliente.')
        onClienteSelect(null)
      }
    } catch {
      toast.error('Error al buscar cliente.')
    } finally {
      setBuscando(false)
    }
  }

  if (paso === 'inicio' && !selectedCliente) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setPaso('busqueda')}
          className="p-4 rounded-xl border-2 border-input hover:border-primary hover:bg-primary/5 transition-all text-left space-y-2"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-xs">Sí, tiene cuenta</p>
            <p className="text-[10px] text-muted-foreground">Buscar por correo</p>
          </div>
        </button>
        <button
          onClick={() => onClienteSelect(null)}
          className="p-4 rounded-xl border-2 border-input hover:border-primary hover:bg-primary/5 transition-all text-left space-y-2"
        >
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-xs">No, es visitante</p>
            <p className="text-[10px] text-muted-foreground">Continuar sin cuenta</p>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-gray-400 uppercase">Cliente</Label>
        {paso === 'busqueda' && !selectedCliente && (
           <button 
            onClick={() => setPaso('inicio')}
            className="text-[10px] text-primary hover:underline"
           >
            Volver
           </button>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && buscar()}
        />
        <button
          onClick={buscar}
          disabled={!email.trim() || buscando}
          className="h-9 px-3 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
        >
          {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </div>

      {selectedCliente && (
        <Card className="border-green-200 bg-green-50 shadow-none">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-green-800 text-xs truncate">
                {selectedCliente.nombreCompleto}
              </p>
              <p className="text-[10px] text-green-700 truncate">{selectedCliente.correo}</p>
            </div>
            <button 
              onClick={() => {
                onClienteSelect(null)
                setEmail('')
                setPaso('inicio')
              }}
              className="text-[10px] text-green-700 font-bold hover:underline"
            >
              Cambiar
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
