import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Ticket, Clock } from 'lucide-react'

export const AccesoEventosPrivadosView = () => {
  return (
    <Card className="border-none shadow-none bg-gray-50/50">
      <CardContent className="py-24 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-700">En Desarrollo</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          El módulo de control de acceso para invitados a eventos privados se encuentra en construcción y estará disponible próximamente.
        </p>
      </CardContent>
    </Card>
  )
}
