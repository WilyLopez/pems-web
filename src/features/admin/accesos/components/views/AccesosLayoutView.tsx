'use client'

import React, { useState } from 'react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PageHeader } from '@/components/common/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { QrCode, PartyPopper } from 'lucide-react'
import { AccesoPublicoView } from '../public/AccesoPublicoView'
import { AccesoEventosPrivadosView } from '../private/AccesoEventosPrivadosView'

export const AccesosLayoutView = () => {
  const [tab, setTab] = useState('publico')

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Control de acceso' }]} />
      
      <PageHeader
        title="Control de acceso"
        description="Escaneo de tickets y registro de ingreso al establecimiento"
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <TabsList className="h-10">
          <TabsTrigger value="publico" className="gap-1.5 text-sm px-6">
            <QrCode className="h-4 w-4" />
            Acceso público
          </TabsTrigger>
          <TabsTrigger value="privado" className="gap-1.5 text-sm px-6">
            <PartyPopper className="h-4 w-4" />
            Eventos privados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="publico" className="mt-5">
          <AccesoPublicoView />
        </TabsContent>

        <TabsContent value="privado" className="mt-5">
          <AccesoEventosPrivadosView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
