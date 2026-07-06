'use client'

import { Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ContenidoWeb } from '@/types/cms.types'
import { Bloque, clavesDeBloque } from '../config/bloques'
import { PREVIEWS } from './previews'

interface BloqueCardProps {
  bloque: Bloque
  mapa: Map<string, ContenidoWeb>
  onEditar: () => void
}

export function BloqueCard({ bloque, mapa, onEditar }: BloqueCardProps) {
  const Preview = PREVIEWS[bloque.preview]
  const valores: Record<string, string> = {}
  for (const clave of clavesDeBloque(bloque)) {
    valores[clave] = mapa.get(clave)?.valorEs ?? ''
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-bold">{bloque.titulo}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {bloque.descripcion}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5"
          onClick={onEditar}
        >
          <Pencil className="h-3.5 w-3.5" />
          Ver / Editar
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="pointer-events-none border-t">
          {Preview && <Preview valores={valores} />}
        </div>
      </CardContent>
    </Card>
  )
}
