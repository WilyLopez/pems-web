'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { AlertTriangle } from 'lucide-react'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

interface Props {
  latitud:  number | null | undefined
  longitud: number | null | undefined
  onChange: (lat: number, lng: number) => void
}

interface PendingPos { lat: number; lng: number }

function buildPickerMarkerEl(): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText = 'width:32px;height:44px;cursor:grab'
  el.innerHTML =
    '<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<filter id="ps" x="-40%" y="-30%" width="180%" height="170%">' +
    '<feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#00000030"/>' +
    '</filter>' +
    '<path filter="url(#ps)" d="M16 2C7.163 2 0 9.163 0 18C0 29.5 16 44 16 44S32 29.5 32 18C32 9.163 24.837 2 16 2Z" fill="#f64b8a"/>' +
    '<circle cx="16" cy="18" r="6" fill="white"/>' +
    '</svg>'
  return el
}

const ICONO_UBICACION =
  '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="7.5" cy="7.5" r="2.2" fill="#333"/>' +
  '<circle cx="7.5" cy="7.5" r="5" stroke="#333" stroke-width="1.4" fill="none"/>' +
  '<line x1="7.5" y1="0.5" x2="7.5" y2="2.2" stroke="#333" stroke-width="1.4" stroke-linecap="round"/>' +
  '<line x1="7.5" y1="12.8" x2="7.5" y2="14.5" stroke="#333" stroke-width="1.4" stroke-linecap="round"/>' +
  '<line x1="0.5" y1="7.5" x2="2.2" y2="7.5" stroke="#333" stroke-width="1.4" stroke-linecap="round"/>' +
  '<line x1="12.8" y1="7.5" x2="14.5" y2="7.5" stroke="#333" stroke-width="1.4" stroke-linecap="round"/>' +
  '</svg>'

class MiUbicacionControl implements mapboxgl.IControl {
  private _map:       mapboxgl.Map | null   = null
  private _container: HTMLDivElement | null = null
  private _onLocate:  (lat: number, lng: number) => void

  constructor(onLocate: (lat: number, lng: number) => void) {
    this._onLocate = onLocate
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    this._map = map
    const container = document.createElement('div')
    container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'
    this._container     = container
    const btn           = document.createElement('button')
    btn.type            = 'button'
    btn.title           = 'Mi ubicación actual'
    btn.innerHTML       = ICONO_UBICACION
    btn.style.cssText   = 'display:flex;align-items:center;justify-content:center;width:29px;height:29px;cursor:pointer'
    btn.addEventListener('click', () => {
      if (!navigator.geolocation) return
      btn.style.opacity = '0.4'
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords
          map.flyTo({ center: [lng, lat], zoom: 16, duration: 1200 })
          this._onLocate(lat, lng)
          btn.style.opacity = ''
        },
        () => { btn.style.opacity = '' },
      )
    })
    container.appendChild(btn)
    return container
  }

  onRemove(): void {
    this._container?.remove()
    this._map = null
  }
}

export function MapaPicker({ latitud, longitud, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const markerRef    = useRef<mapboxgl.Marker | null>(null)
  const onChangeRef  = useRef(onChange)
  const initRef      = useRef({ latitud, longitud })

  const [sinPin,     setSinPin]     = useState(latitud == null)
  const [pendingPos, setPendingPos] = useState<PendingPos | null>(null)

  useEffect(() => { onChangeRef.current = onChange })

  const cancelar = () => {
    if (latitud != null && longitud != null) {
      markerRef.current?.setLngLat([longitud, latitud])
      mapRef.current?.flyTo({ center: [longitud, latitud], duration: 600 })
      setSinPin(false)
    } else {
      markerRef.current?.remove()
      markerRef.current = null
      setSinPin(true)
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'crosshair'
    }
    setPendingPos(null)
  }

  const confirmar = () => {
    if (!pendingPos) return
    onChangeRef.current(pendingPos.lat, pendingPos.lng)
    setSinPin(false)
    setPendingPos(null)
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return

    mapboxgl.accessToken = TOKEN

    const { latitud: initLat, longitud: initLng } = initRef.current
    const hasCoords = initLat != null && initLng != null

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:     'mapbox://styles/mapbox/streets-v12',
      center:    hasCoords ? [initLng, initLat] : [-79.8409, -6.7714],
      zoom:      hasCoords ? 15 : 13,
      attributionControl: false,
    })

    if (!hasCoords) map.getCanvas().style.cursor = 'crosshair'

    const placeMarker = (lng: number, lat: number) => {
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        const m = new mapboxgl.Marker({ element: buildPickerMarkerEl(), anchor: 'bottom', draggable: true })
          .setLngLat([lng, lat])
          .addTo(map)
        m.on('dragend', () => {
          const pos = m.getLngLat()
          setSinPin(false)
          map.getCanvas().style.cursor = ''
          setPendingPos({ lat: pos.lat, lng: pos.lng })
        })
        markerRef.current = m
      }
    }

    const setearPendiente = (lng: number, lat: number) => {
      setSinPin(false)
      map.getCanvas().style.cursor = ''
      setPendingPos({ lat, lng })
    }

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }),      'bottom-right')
    map.addControl(
      new MiUbicacionControl((lat, lng) => {
        placeMarker(lng, lat)
        setearPendiente(lng, lat)
      }),
      'top-right',
    )

    const geocoder = new MapboxGeocoder({
      accessToken: TOKEN,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapboxgl:    mapboxgl as any,
      placeholder: 'Buscar dirección...',
      countries:   'pe',
      language:    'es',
      marker:      false,
    })
    map.addControl(geocoder, 'top-left')

    if (hasCoords) placeMarker(initLng, initLat)

    map.on('click', (e) => {
      placeMarker(e.lngLat.lng, e.lngLat.lat)
      setearPendiente(e.lngLat.lng, e.lngLat.lat)
    })

    geocoder.on('result', (e: { result: { center: [number, number] } }) => {
      const [lng, lat] = e.result.center
      placeMarker(lng, lat)
      map.flyTo({ center: [lng, lat], zoom: 16, duration: 900 })
      setearPendiente(lng, lat)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current    = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    if (latitud != null && longitud != null) {
      markerRef.current?.setLngLat([longitud, latitud])
      setSinPin(false)
      mapRef.current.getCanvas().style.cursor = ''
    } else {
      markerRef.current?.remove()
      markerRef.current = null
      setSinPin(true)
      mapRef.current.getCanvas().style.cursor = 'crosshair'
    }
    setPendingPos(null)
  }, [latitud, longitud])

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <div ref={containerRef} style={{ height: 300, width: '100%' }} />
        {sinPin && !pendingPos && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'white', borderRadius: 10, padding: '9px 18px',
              fontSize: 13, fontWeight: 600, color: '#334155',
              boxShadow: '0 4px 16px rgba(0,0,0,0.14)', letterSpacing: '0.01em',
            }}>
              Haz clic en el mapa para colocar tu local
            </div>
          </div>
        )}
      </div>

      {pendingPos && (
        <div className="flex items-center justify-between gap-3 border-t border-amber-100 bg-amber-50 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-amber-800">
                ¿Confirmar nueva ubicación?
              </p>
              <p className="font-mono text-xs tabular-nums text-amber-600">
                {pendingPos.lat.toFixed(6)}, {pendingPos.lng.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={cancelar}
              className="rounded-md px-2.5 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
