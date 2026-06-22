import { CheckCircle, MessageCircle, PartyPopper } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import { formatDate, formatCurrency } from '@/lib/utils'
import { EventoPrivado } from '../../../shared/types'

interface SuccessViewProps {
  evento: EventoPrivado
}

export function SuccessWizardView({ evento }: SuccessViewProps) {
  const whatsappUrl = useWhatsAppUrl('Hola, acabo de solicitar un evento y quiero confirmar los detalles')

  return (
    <div className="flex flex-col items-center text-center py-16 space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-900">Solicitud enviada</h2>
        <p className="text-gray-500">
          Nuestro equipo se pondrá en contacto contigo en menos de 24 horas para confirmar los detalles.
        </p>
      </div>

      <Card className="w-full text-left border border-gray-100 shadow-card rounded-2xl">
        <CardContent className="p-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha</span>
            <span className="font-semibold">{formatDate(evento.fechaEvento)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Turno</span>
            <span>{evento.turno} · {evento.horaInicio}–{evento.horaFin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tipo</span>
            <span>{evento.tipoEvento}</span>
          </div>
          <Separator />
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
            {evento.estado}
          </Badge>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button variant="outline" asChild className="flex-1 rounded-full">
          <Link href="/">Volver al inicio</Link>
        </Button>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border border-green-300 text-green-700 hover:bg-green-50 font-semibold py-2 text-sm transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        <Button asChild className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full gap-2">
          <Link href="/cliente/mis-eventos">
            <PartyPopper className="h-4 w-4" />
            Mis eventos
          </Link>
        </Button>
      </div>
    </div>
  )
}
