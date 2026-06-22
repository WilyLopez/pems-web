'use client'

import { Download, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useUsuariosList } from '../../hooks/useUsuariosData'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import { UsuariosStats } from '../ui/UsuariosStats'
import { UsuariosTable } from '../table/UsuariosTable'
import { CrearUsuarioDialog } from '../dialogs/CrearUsuarioDialog'
import { VerDetalleDialog } from '../dialogs/VerDetalleDialog'
import { EditarUsuarioDialog } from '../dialogs/EditarUsuarioDialog'
import { CambiarRolDialog } from '../dialogs/CambiarRolDialog'
import { ResetPasswordDialog } from '../dialogs/ResetPasswordDialog'

export function UsuariosListView() {
  const { idSede, idUsuario, isSuperAdmin } = useAuth()
  const { openModal } = useUsuariosNav()
  const { data: usuarios = [], isLoading, isError, refetch } = useUsuariosList()

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
            <Button onClick={() => openModal('nuevo')}>
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

      <CrearUsuarioDialog idSede={idSede ?? 1} />
      <VerDetalleDialog />
      <EditarUsuarioDialog />
      <CambiarRolDialog />
      <ResetPasswordDialog />
    </div>
  )
}
