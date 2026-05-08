'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FileText, FilePen, CheckSquare, ExternalLink, Loader2 } from 'lucide-react'

import { contratoService, Contrato } from '@/services/contrato.service'
import { StatusBadge } from '@/components/common/Statusbadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { formatDate } from '@/lib/utils'

export default function ContratosPage() {
  const [idEvento, setIdEvento] = useState('')
  const [contenido, setContenido] = useState('')
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [firmarDialog, setFirmarDialog] = useState(false)

  const buscar = useMutation({
    mutationFn: (id: number) => contratoService.obtenerPorEvento(id),
    onSuccess: (c) => setContrato(c),
    onError: () => toast.error('No se encontró contrato para ese evento.'),
  })

  const generar = useMutation({
    mutationFn: ({ id, texto }: { id: number; texto: string }) =>
      contratoService.generar(id, texto),
    onSuccess: (c) => {
      setContrato(c)
      setContenido('')
      toast.success('Contrato generado correctamente.')
    },
    onError: (err: { message?: string }) => toast.error(err?.message ?? 'Error al generar contrato.'),
  })

  const firmar = useMutation({
    mutationFn: (id: number) => contratoService.firmar(id),
    onSuccess: (c) => {
      setContrato(c)
      setFirmarDialog(false)
      toast.success('Contrato firmado.')
    },
    onError: (err: { message?: string }) => toast.error(err?.message ?? 'No se pudo firmar el contrato.'),
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contratos"
        description="Generación y firma de contratos de eventos privados"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buscar / generar contrato</CardTitle>
            <CardDescription>Busca el contrato de un evento existente o crea uno nuevo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label>ID del evento privado</Label>
                <Input
                  type="number"
                  placeholder="Ej: 5"
                  value={idEvento}
                  onChange={(e) => setIdEvento(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => buscar.mutate(parseInt(idEvento))}
                  disabled={!idEvento || buscar.isPending}
                >
                  {buscar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Contenido del contrato</Label>
              <Textarea
                rows={8}
                placeholder="Redacta aquí los términos y condiciones del contrato..."
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              disabled={!idEvento || !contenido || generar.isPending}
              onClick={() => generar.mutate({ id: parseInt(idEvento), texto: contenido })}
            >
              {generar.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</>
                : <><FilePen className="mr-2 h-4 w-4" /> Generar contrato</>
              }
            </Button>
          </CardContent>
        </Card>

        {contrato && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Contrato #{contrato.id}</CardTitle>
                </div>
                <StatusBadge status={contrato.estado} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Evento</span>
                <span>#{contrato.idEventoPrivado}</span>
                <span className="text-muted-foreground">Creado</span>
                <span>{formatDate(contrato.fechaCreacion)}</span>
                {contrato.fechaFirma && (
                  <>
                    <span className="text-muted-foreground">Firmado</span>
                    <span>{formatDate(contrato.fechaFirma)}</span>
                  </>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {contrato.archivoPdfUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={contrato.archivoPdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Ver PDF
                    </a>
                  </Button>
                )}
                {contrato.estado === 'BORRADOR' && (
                  <Button size="sm" onClick={() => setFirmarDialog(true)}>
                    <CheckSquare className="mr-1.5 h-4 w-4" />
                    Marcar como firmado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={firmarDialog}
        onOpenChange={setFirmarDialog}
        title="¿Marcar contrato como firmado?"
        description="Se registrará la firma del contrato y no podrá revertirse a borrador."
        confirmLabel="Confirmar firma"
        loading={firmar.isPending}
        onConfirm={() => contrato && firmar.mutate(contrato.id)}
      />
    </div>
  )
}