import { Badge } from '@/components/ui/Badge'

export function HistoriaPreview({
  valores,
}: {
  valores: Record<string, string>
}) {
  return (
    <div className="bg-white p-6">
      <Badge className="border-brand-rosa/20 bg-brand-rosa/10 text-brand-rosa">
        {valores['nosotros.historia.badge'] || 'Etiqueta'}
      </Badge>
      <h2 className="mt-2 text-2xl font-black text-gray-900">
        {valores['nosotros.historia.titulo'] || 'Título'}
      </h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">
        <p>{valores['nosotros.historia.parrafo1'] || 'Párrafo 1'}</p>
        <p>{valores['nosotros.historia.parrafo2'] || 'Párrafo 2'}</p>
        <p>{valores['nosotros.historia.parrafo3'] || 'Párrafo 3'}</p>
      </div>
    </div>
  )
}
