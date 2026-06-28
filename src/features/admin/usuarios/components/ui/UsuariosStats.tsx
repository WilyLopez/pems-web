'use client'

import { Users, UserCheck, UserX, Shield, ShieldCheck } from 'lucide-react'
import { UsuarioAdmin, getEstadoAdmin } from '../../types'

interface Props {
  usuarios: UsuarioAdmin[]
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function UsuariosStats({ usuarios }: Props) {
  const total = usuarios.length
  const activos = usuarios.filter((u) => getEstadoAdmin(u) === 'ACTIVO').length
  const inactivos = usuarios.filter((u) => getEstadoAdmin(u) !== 'ACTIVO').length
  const admins = usuarios.filter(
    (u) => u.rol === 'ADMIN' || u.rol === 'SUPERADMIN'
  ).length
  const cajeros = usuarios.filter((u) => u.rol === 'CAJERO').length

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Total usuarios" value={total} icon={Users} color="bg-gray-100 text-gray-600" />
      <StatCard label="Activos" value={activos} icon={UserCheck} color="bg-green-100 text-green-600" />
      <StatCard label="Inactivos/Bloq." value={inactivos} icon={UserX} color="bg-red-100 text-red-600" />
      <StatCard label="Admins + SA" value={admins} icon={Shield} color="bg-purple-100 text-purple-600" />
      <StatCard label="Cajeros" value={cajeros} icon={ShieldCheck} color="bg-blue-100 text-blue-600" />
    </div>
  )
}
