'use client'

import { Download, RefreshCw, UserPlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useUsuariosFiltrados } from '../../hooks/useUsuariosData'
import { useUsuariosNav } from '../../hooks/useUsuariosNav'
import { UsuariosStats } from '../ui/UsuariosStats'
import { UsuariosTable } from '../table/UsuariosTable'
import { CrearUsuarioDialog } from '../dialogs/CrearUsuarioDialog'
import { VerDetalleDialog } from '../dialogs/VerDetalleDialog'
import { EditarUsuarioDialog } from '../dialogs/EditarUsuarioDialog'
import { CambiarRolDialog } from '../dialogs/CambiarRolDialog'
import { ResetPasswordDialog } from '../dialogs/ResetPasswordDialog'
import { DesactivarUsuarioDialog } from '../dialogs/DesactivarUsuarioDialog'
import { DesbloquearUsuarioDialog } from '../dialogs/DesbloquearUsuarioDialog'

export function UsuariosListView() {
  const { idSede, idUsuario, isSuperAdmin } = useAuth()
  const { openModal, setPage } = useUsuariosNav()
  const {
    todos,
    paginados,
    totalFiltrados,
    totalGeneral,
    totalPaginas,
    pageActual,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
    isRefetching,
  } = useUsuariosFiltrados()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Usuarios administradores' }]} />

      <PageHeader
        title="Usuarios administradores"
        description="Gestión de cuentas con acceso al panel administrativo"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end gap-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
                Actualizar
              </Button>
              {dataUpdatedAt > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(dataUpdatedAt), { locale: es, addSuffix: true })}
                </span>
              )}
            </div>
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

      <UsuariosStats usuarios={todos} />

      <UsuariosTable
        paginados={paginados}
        totalFiltrados={totalFiltrados}
        totalGeneral={totalGeneral}
        totalPaginas={totalPaginas}
        pageActual={pageActual}
        onPageChange={setPage}
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
      <DesactivarUsuarioDialog />
      <DesbloquearUsuarioDialog />
    </div>
  )
}
