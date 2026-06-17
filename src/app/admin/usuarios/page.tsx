'use client'

import { useState } from 'react'
import { Download, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { useUsuariosAdmin } from '@/hooks/useUsuariosAdmin'
import { useAuth } from '@/hooks/useAuth'
import { UsuariosStats } from '@/components/admin/usuarios/UsuariosStats'
import { UsuariosTable } from '@/components/admin/usuarios/UsuariosTable'
import { CrearUsuarioModal } from '@/components/admin/usuarios/CrearUsuarioModal'

export default function UsuariosPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { idSede, idUsuario, isSuperAdmin } = useAuth()

  const {
    data: usuarios = [],
    isLoading,
    isError,
    refetch,
  } = useUsuariosAdmin()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Usuarios administradores' }]} />

      <PageHeader
        title="Usuarios administradores"
        description="Gestión de cuentas con acceso al panel administrativo"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Exportar a Excel (próximamente)"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo usuario
            </Button>
          </div>
        }
      />

      <UsuariosStats usuarios={usuarios} />

      <UsuariosTable
        usuarios={usuarios}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        currentUserId={idUsuario ?? undefined}
        isSuperAdmin={isSuperAdmin}
      />

      <CrearUsuarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        idSede={idSede ?? 1}
      />
    </div>
  )
}
