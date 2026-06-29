'use client'

import { useEffect, useState } from 'react'
import { Link2, Globe, Shield, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { toast } from 'sonner'
import { integracionService, SedeIntegracion } from '@/services/integracion.service'
import { ModuleCard } from '../shared/ModuleCard'
import { ReadOnlyList } from '../shared/ReadOnlyList'
import type { SeccionNavProps } from '../../hooks/useConfiguracionNav'

function IntegracionesForm({
  idSede,
  onSaveSuccess,
}: {
  idSede: number
  onSaveSuccess: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Decolecta state
  const [decUrl, setDecUrl] = useState('')
  const [decToken, setDecToken] = useState('')
  const [decLimit, setDecLimit] = useState(100)
  const [decActive, setDecActive] = useState(false)

  // APISPERU state
  const [apiUrl, setApiUrl] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [apiLimit, setApiLimit] = useState(2000)
  const [apiActive, setApiActive] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const list = await integracionService.listar(idSede)
        const dec = list.find((i) => i.proveedorCodigo === 'DECOLECTA')
        if (dec) {
          setDecUrl(dec.apiUrl)
          setDecToken(dec.apiToken)
          setDecLimit(dec.limiteMensual)
          setDecActive(dec.activo)
        }
        const api = list.find((i) => i.proveedorCodigo === 'APISPERU')
        if (api) {
          setApiUrl(api.apiUrl)
          setApiToken(api.apiToken)
          setApiLimit(api.limiteMensual)
          setApiActive(api.activo)
        }
      } catch (err: any) {
        toast.error('Error al cargar integraciones')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [idSede])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Guardar Decolecta
      await integracionService.guardar(idSede, 'DECOLECTA', {
        apiUrl: decUrl || 'https://api.decolecta.com',
        apiToken: decToken,
        limiteMensual: decLimit,
        activo: decActive,
      })
      // Guardar APISPERU
      await integracionService.guardar(idSede, 'APISPERU', {
        apiUrl: apiUrl || 'https://dniruc.apisperu.com',
        apiToken: apiToken,
        limiteMensual: apiLimit,
        activo: apiActive,
      })
      toast.success('Integraciones guardadas con éxito')
      onSaveSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al guardar configuraciones de integración. Asegúrate de ejecutar el script SQL legacy.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      {/* DECOLECTA CARD */}
      <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-azul" />
            <span className="text-sm font-bold text-card-foreground">Decolecta API (100 gratis)</span>
          </div>
          <a
            href="https://decolecta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-azul hover:underline flex items-center gap-1"
          >
            Ir al sitio <Link2 className="h-3 w-3" />
          </a>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="decUrl">URL API</Label>
            <Input
              id="decUrl"
              value={decUrl}
              onChange={(e) => setDecUrl(e.target.value)}
              placeholder="https://api.decolecta.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="decToken">Token de Acceso</Label>
            <Input
              id="decToken"
              type="password"
              value={decToken}
              onChange={(e) => setDecToken(e.target.value)}
              placeholder="Ingrese token de Decolecta"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="space-y-1.5">
              <Label htmlFor="decLimit">Límite mensual</Label>
              <Input
                id="decLimit"
                type="number"
                value={decLimit}
                onChange={(e) => setDecLimit(Number(e.target.value))}
                min={0}
                required
              />
            </div>
            <div className="flex items-center justify-between pt-5">
              <span className="text-xs font-medium">Activar proveedor</span>
              <Switch
                checked={decActive}
                onCheckedChange={(checked) => {
                  setDecActive(checked)
                  if (checked) setApiActive(false)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* APISPERU CARD */}
      <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-card-foreground">APISPERU (2000 gratis)</span>
          </div>
          <a
            href="https://apisperu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-azul hover:underline flex items-center gap-1"
          >
            Ir al sitio <Link2 className="h-3 w-3" />
          </a>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="apiUrl">URL API</Label>
            <Input
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://dniruc.apisperu.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apiToken">Token de Acceso</Label>
            <Input
              id="apiToken"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Ingrese token de APISPERU"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="space-y-1.5">
              <Label htmlFor="apiLimit">Límite mensual</Label>
              <Input
                id="apiLimit"
                type="number"
                value={apiLimit}
                onChange={(e) => setApiLimit(Number(e.target.value))}
                min={0}
                required
              />
            </div>
            <div className="flex items-center justify-between pt-5">
              <span className="text-xs font-medium">Activar proveedor</span>
              <Switch
                checked={apiActive}
                onCheckedChange={(checked) => {
                  setApiActive(checked)
                  if (checked) setDecActive(false)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export function IntegracionesSection({
  idSede,
  navProps,
}: {
  idSede: number
  navProps?: SeccionNavProps
}) {
  const [list, setList] = useState<SedeIntegracion[]>([])
  const [trigger, setTrigger] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await integracionService.listar(idSede)
        setList(res)
      } catch (err: any) {
        // Ignorar fallos de red o base de datos si la tabla no existe para evitar alertar antes de la migración
      }
    }
    load()
  }, [idSede, trigger])

  const activo = list.find((i) => i.activo)
  const activoNombre = activo ? activo.proveedorCodigo : 'Ninguno (Default Decolecta)'
  const limite = activo ? activo.limiteMensual : 100

  const summary = [
    { label: 'Proveedor Activo', value: activoNombre },
    { label: 'Límite Mensual', value: `${limite} consultas` },
  ]

  return (
    <ModuleCard
      icon={Shield}
      color="bg-emerald-50 text-emerald-600"
      title="Integración de Consultas"
      description="Configura los tokens y límites de Decolecta y APISPERU por sede"
      summary={summary}
      editSize="sm:max-w-md"
      viewContent={<ReadOnlyList items={summary} />}
      editContent={
        <IntegracionesForm
          idSede={idSede}
          onSaveSuccess={() => setTrigger((t) => t + 1)}
        />
      }
      navProps={navProps}
    />
  )
}
