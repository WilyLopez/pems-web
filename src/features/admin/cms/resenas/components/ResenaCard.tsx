'use client'

import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Home,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Resena } from '@/types/resena.types'
import { formatDate } from '@/lib/utils'

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < value ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

interface ResenaCardProps {
  resena: Resena
  showActions: boolean
  loadingId: number | null
  onAprobar?: () => void
  onRechazar?: () => void
  onResponder: () => void
  onDestacar: () => void
  onToggleHome: () => void
}

export function ResenaCard({
  resena,
  showActions,
  loadingId,
  onAprobar,
  onRechazar,
  onResponder,
  onDestacar,
  onToggleHome,
}: ResenaCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isBusy = loadingId === resena.id

  return (
    <Card className={`transition-opacity ${isBusy ? 'opacity-60' : ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {resena.fotoUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                <Image
                  src={resena.fotoUrl}
                  alt={resena.nombreAutor}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-azul/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-azul">
                {resena.nombreAutor.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{resena.nombreAutor}</p>
              <p className="text-xs text-muted-foreground font-normal">
                {formatDate(resena.fechaCreacion)}
              </p>
            </div>
          </div>
          <Stars value={resena.calificacion} />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed font-normal">
          {resena.contenido}
        </p>

        {resena.respuestaAdmin && (
          <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-brand-azul mb-1">
              Respuesta del equipo
            </p>
            <p className="text-xs text-muted-foreground font-normal">
              {resena.respuestaAdmin}
            </p>
          </div>
        )}

        {/* Estado badges */}
        <div className="flex flex-wrap gap-1.5">
          {resena.aprobada && (
            <Badge className="bg-green-100 text-green-800 text-xs h-5">
              Publicada
            </Badge>
          )}
          {resena.destacada && (
            <Badge className="bg-amber-100 text-amber-800 text-xs h-5">
              <Award className="h-3 w-3 mr-0.5" />
              Destacada
            </Badge>
          )}
          {resena.mostrarHome && (
            <Badge className="bg-brand-azul/10 text-brand-azul text-xs h-5">
              <Home className="h-3 w-3 mr-0.5" />
              Inicio
            </Badge>
          )}
        </div>

        {/* Acciones */}
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Acciones{' '}
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          {expanded && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
              {showActions && onAprobar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={onAprobar}
                  disabled={isBusy}
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Aprobar
                </Button>
              )}
              {showActions && onRechazar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-destructive border-destructive/30"
                  onClick={onRechazar}
                  disabled={isBusy}
                >
                  <XCircle className="h-3.5 w-3.5" /> Rechazar
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={onResponder}
                disabled={isBusy}
              >
                <MessageSquare className="h-3.5 w-3.5" />{' '}
                {resena.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={onDestacar}
                disabled={isBusy}
              >
                <Award className="h-3.5 w-3.5" />{' '}
                {resena.destacada ? 'Quitar destacado' : 'Destacar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={onToggleHome}
                disabled={isBusy}
              >
                <Home className="h-3.5 w-3.5" />{' '}
                {resena.mostrarHome ? 'Quitar de inicio' : 'Mostrar en inicio'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
