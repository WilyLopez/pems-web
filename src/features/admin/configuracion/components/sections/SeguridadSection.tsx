'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { ShieldAlert, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracion, toConfigMap } from '../../hooks/useConfiguracionData'
import type { SeccionNavProps } from '../../hooks/useConfiguracionNav'
import type { ConfiguracionSistema } from '../../types'
import { ReadOnlyList } from '../shared/ReadOnlyList'
import { ModuleCard } from '../shared/ModuleCard'

const schema = z.object({
  INTENTOS_LOGIN_ANTES_BLOQUEO:  z.coerce.number().int().min(1).max(20),
  DURACION_BLOQUEO_LOGIN_MIN:    z.coerce.number().int().min(1),
  EXPIRACION_SESION_ADMIN_MIN:   z.coerce.number().int().min(5),
  EXPIRACION_SESION_CLIENTE_MIN: z.coerce.number().int().min(5),
})

type FormValues = z.infer<typeof schema>

function SeguridadForm({ configs }: { configs: ConfiguracionSistema[] }) {
  const actualizar = useActualizarConfiguracion()
  const m = toConfigMap(configs)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      INTENTOS_LOGIN_ANTES_BLOQUEO:  Number(m.INTENTOS_LOGIN_ANTES_BLOQUEO  ?? 5),
      DURACION_BLOQUEO_LOGIN_MIN:    Number(m.DURACION_BLOQUEO_LOGIN_MIN    ?? 15),
      EXPIRACION_SESION_ADMIN_MIN:   Number(m.EXPIRACION_SESION_ADMIN_MIN   ?? 120),
      EXPIRACION_SESION_CLIENTE_MIN: Number(m.EXPIRACION_SESION_CLIENTE_MIN ?? 60),
    },
  })

  useEffect(() => {
    const map = toConfigMap(configs)
    reset({
      INTENTOS_LOGIN_ANTES_BLOQUEO:  Number(map.INTENTOS_LOGIN_ANTES_BLOQUEO  ?? 5),
      DURACION_BLOQUEO_LOGIN_MIN:    Number(map.DURACION_BLOQUEO_LOGIN_MIN    ?? 15),
      EXPIRACION_SESION_ADMIN_MIN:   Number(map.EXPIRACION_SESION_ADMIN_MIN   ?? 120),
      EXPIRACION_SESION_CLIENTE_MIN: Number(map.EXPIRACION_SESION_CLIENTE_MIN ?? 60),
    })
  }, [configs, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      INTENTOS_LOGIN_ANTES_BLOQUEO:  String(values.INTENTOS_LOGIN_ANTES_BLOQUEO),
      DURACION_BLOQUEO_LOGIN_MIN:    String(values.DURACION_BLOQUEO_LOGIN_MIN),
      EXPIRACION_SESION_ADMIN_MIN:   String(values.EXPIRACION_SESION_ADMIN_MIN),
      EXPIRACION_SESION_CLIENTE_MIN: String(values.EXPIRACION_SESION_CLIENTE_MIN),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Control de acceso</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="INTENTOS_LOGIN_ANTES_BLOQUEO">Intentos antes de bloqueo</Label>
          <div className="flex items-center gap-2">
            <Input id="INTENTOS_LOGIN_ANTES_BLOQUEO" type="number" min={1} max={20} className="max-w-[120px]" {...register('INTENTOS_LOGIN_ANTES_BLOQUEO')} />
            <span className="text-sm text-muted-foreground">intentos</span>
          </div>
          <p className="text-xs text-muted-foreground">Contraseñas incorrectas antes de bloquear la cuenta.</p>
          {errors.INTENTOS_LOGIN_ANTES_BLOQUEO && <p className="text-xs text-destructive">{errors.INTENTOS_LOGIN_ANTES_BLOQUEO.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="DURACION_BLOQUEO_LOGIN_MIN">Duración del bloqueo</Label>
          <div className="flex items-center gap-2">
            <Input id="DURACION_BLOQUEO_LOGIN_MIN" type="number" min={1} className="max-w-[120px]" {...register('DURACION_BLOQUEO_LOGIN_MIN')} />
            <span className="text-sm text-muted-foreground">minutos</span>
          </div>
          <p className="text-xs text-muted-foreground">Tiempo que permanece bloqueada la cuenta.</p>
          {errors.DURACION_BLOQUEO_LOGIN_MIN && <p className="text-xs text-destructive">{errors.DURACION_BLOQUEO_LOGIN_MIN.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Sesiones</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="EXPIRACION_SESION_ADMIN_MIN">Sesión de administrador</Label>
          <div className="flex items-center gap-2">
            <Input id="EXPIRACION_SESION_ADMIN_MIN" type="number" min={5} className="max-w-[120px]" {...register('EXPIRACION_SESION_ADMIN_MIN')} />
            <span className="text-sm text-muted-foreground">min de inactividad</span>
          </div>
          <p className="text-xs text-muted-foreground">Cierra la sesión del administrador tras la inactividad indicada.</p>
          {errors.EXPIRACION_SESION_ADMIN_MIN && <p className="text-xs text-destructive">{errors.EXPIRACION_SESION_ADMIN_MIN.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="EXPIRACION_SESION_CLIENTE_MIN">Sesión de cliente</Label>
          <div className="flex items-center gap-2">
            <Input id="EXPIRACION_SESION_CLIENTE_MIN" type="number" min={5} className="max-w-[120px]" {...register('EXPIRACION_SESION_CLIENTE_MIN')} />
            <span className="text-sm text-muted-foreground">min de inactividad</span>
          </div>
          <p className="text-xs text-muted-foreground">Cierra la sesión del cliente en el portal web.</p>
          {errors.EXPIRACION_SESION_CLIENTE_MIN && <p className="text-xs text-destructive">{errors.EXPIRACION_SESION_CLIENTE_MIN.message}</p>}
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
        <strong>Nota:</strong> Los cambios afectan a todos los administradores. Los bloqueos activos no se modifican retroactivamente.
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={actualizar.isPending || !isDirty} size="sm">
          {actualizar.isPending
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
            : <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
          }
        </Button>
      </div>
    </form>
  )
}

export function SeguridadSection({ configs, navProps }: { configs: ConfiguracionSistema[]; navProps?: SeccionNavProps }) {
  const m = toConfigMap(configs)

  const summary = [
    { label: 'Intentos antes bloqueo', value: m.INTENTOS_LOGIN_ANTES_BLOQUEO ?? '—' },
    { label: 'Sesión admin',           value: m.EXPIRACION_SESION_ADMIN_MIN   ? `${m.EXPIRACION_SESION_ADMIN_MIN} min`   : '—' },
    { label: 'Sesión cliente',         value: m.EXPIRACION_SESION_CLIENTE_MIN ? `${m.EXPIRACION_SESION_CLIENTE_MIN} min` : '—' },
  ]

  const viewItems = [
    { label: 'Intentos antes bloqueo', value: m.INTENTOS_LOGIN_ANTES_BLOQUEO ?? '—' },
    { label: 'Duración bloqueo',       value: m.DURACION_BLOQUEO_LOGIN_MIN    ? `${m.DURACION_BLOQUEO_LOGIN_MIN} min`    : '—' },
    { label: 'Sesión admin',           value: m.EXPIRACION_SESION_ADMIN_MIN   ? `${m.EXPIRACION_SESION_ADMIN_MIN} min`   : '—' },
    { label: 'Sesión cliente',         value: m.EXPIRACION_SESION_CLIENTE_MIN ? `${m.EXPIRACION_SESION_CLIENTE_MIN} min` : '—' },
  ]

  return (
    <ModuleCard
      icon={ShieldAlert}
      color="bg-red-50 text-red-600"
      title="Seguridad de acceso"
      description="Intentos de login, bloqueos y expiración de sesión"
      summary={summary}
      viewContent={<ReadOnlyList items={viewItems} />}
      editContent={<SeguridadForm configs={configs} />}
      navProps={navProps}
    />
  )
}
