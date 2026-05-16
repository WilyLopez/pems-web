import { Metadata } from 'next'
import { Ticket, PartyPopper, Package, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen operativo de Kiki y Lala"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Reservas hoy"
          value="—"
          description="Entradas confirmadas"
          icon={<Ticket className="h-5 w-5" />}
        />
        <KpiCard
          title="Eventos privados"
          value="—"
          description="Este mes"
          icon={<PartyPopper className="h-5 w-5" />}
        />
        <KpiCard
          title="Alertas de stock"
          value="—"
          description="Productos bajo mínimo"
          icon={<Package className="h-5 w-5" />}
        />
        <KpiCard
          title="Clientes activos"
          value="—"
          description="Registrados en el sistema"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Reservas — últimos 30 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Gráfico próximamente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Disponibilidad de la semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Calendario próximamente
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
