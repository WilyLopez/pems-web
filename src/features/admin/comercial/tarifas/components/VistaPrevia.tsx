import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'

interface VistaPreviaProps {
  precioSemana: number | null
  precioFinDeSemana: number | null
}

export function VistaPrevia({ precioSemana, precioFinDeSemana }: VistaPreviaProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Vista previa</CardTitle>
        <CardDescription>Así se verán los precios en la web pública</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b">
          <div>
            <p className="font-semibold text-sm">Lunes a Viernes</p>
            <p className="text-xs text-muted-foreground">Tarifa regular</p>
          </div>
          <span className="text-2xl font-black text-brand-azul">
            {precioSemana ? `S/ ${precioSemana.toFixed(2)}` : 'Sin configurar'}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 border-b">
          <div>
            <p className="font-semibold text-sm">Sábados, Domingos y Feriados</p>
            <p className="text-xs text-muted-foreground">Tarifa alta</p>
          </div>
          <span className="text-2xl font-black text-brand-rosa">
            {precioFinDeSemana ? `S/ ${precioFinDeSemana.toFixed(2)}` : 'Sin configurar'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Precio por niño. Incluye acceso total a la zona de juegos.
        </p>
      </CardContent>
    </Card>
  )
}
