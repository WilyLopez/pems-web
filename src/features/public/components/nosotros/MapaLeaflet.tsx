'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
const ESTILO_MAPA = 'mapbox://styles/mapbox/light-v11'
const ESTILO_SAT = 'mapbox://styles/mapbox/outdoors-v12'

interface Props {
  latitud: number
  longitud: number
  nombre?: string
  direccion?: string
  googleMapsUrl?: string
  horarioSemana?: string
  horarioFinDeSemana?: string
}

function buildMarkerEl(): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText = 'width:40px;height:52px;cursor:pointer'
  el.innerHTML =
    '<svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<filter id="ms" x="-40%" y="-30%" width="180%" height="170%">' +
    '<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#00000028"/>' +
    '</filter>' +
    '<path filter="url(#ms)" d="M20 2C10.059 2 2 10.059 2 20C2 33.5 20 50 20 50S38 33.5 38 20C38 10.059 29.941 2 20 2Z" fill="#ef4444"/>' +
    '<circle cx="20" cy="20" r="9" fill="white"/>' +
    '<circle cx="20" cy="20" r="4.5" fill="#ef4444"/>' +
    '</svg>'
  return el
}

function buildPopupHTML(
  nombre?: string,
  direccion?: string,
  horarioSemana?: string,
  horarioFinDeSemana?: string,
  googleMapsUrl?: string
): string {
  const parts: string[] = []
  if (nombre)
    parts.push(
      `<p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#0f172a">${nombre}</p>`
    )
  if (direccion)
    parts.push(
      `<p style="font-size:12px;color:#64748b;margin:0 0 6px;line-height:1.5">${direccion}</p>`
    )
  if (horarioSemana || horarioFinDeSemana)
    parts.push(
      '<div style="border-top:1px solid #f1f5f9;margin:8px 0 6px;padding-top:6px">' +
        (horarioSemana
          ? `<p style="font-size:11px;color:#94a3b8;margin:0 0 2px">${horarioSemana}</p>`
          : '') +
        (horarioFinDeSemana
          ? `<p style="font-size:11px;color:#94a3b8;margin:0">${horarioFinDeSemana}</p>`
          : '') +
        '</div>'
    )
  if (googleMapsUrl)
    parts.push(
      `<a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" ` +
        `style="display:block;text-align:center;padding:8px 12px;background:#ef4444;color:white;` +
        `border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;margin-top:4px;` +
        `letter-spacing:0.02em">Cómo llegar</a>`
    )
  return `<div style="padding:8px 4px 4px;min-width:185px;font-family:system-ui,sans-serif">${parts.join('')}</div>`
}

function agregar3dEdificios(map: mapboxgl.Map): void {
  if (map.getLayer('3d-buildings')) return
  const layers = map.getStyle().layers
  let primeraEtiqueta: string | undefined
  for (const layer of layers) {
    if (
      layer.type === 'symbol' &&
      (layer.layout as Record<string, unknown>)['text-field']
    ) {
      primeraEtiqueta = layer.id
      break
    }
  }
  map.addLayer(
    {
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#dde8f0',
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height'],
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height'],
        ],
        'fill-extrusion-opacity': 0.75,
      },
    },
    primeraEtiqueta
  )
}

class ToggleEstiloControl implements mapboxgl.IControl {
  private _map: mapboxgl.Map | null = null
  private _container: HTMLDivElement | null = null
  private _satelite = false

  onAdd(map: mapboxgl.Map): HTMLElement {
    this._map = map
    const container = document.createElement('div')
    container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'
    this._container = container
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.title = 'Cambiar estilo'
    btn.textContent = 'Terreno'
    btn.style.cssText =
      'padding:0 10px;font-size:11px;font-weight:700;width:auto;min-width:64px;' +
      'color:#333;letter-spacing:0.03em;cursor:pointer'
    btn.addEventListener('click', () => {
      this._satelite = !this._satelite
      map.setStyle(this._satelite ? ESTILO_SAT : ESTILO_MAPA, { diff: false })
      btn.textContent = this._satelite ? 'Claro' : 'Terreno'
      map.once('style.load', () => agregar3dEdificios(map))
    })
    container.appendChild(btn)
    return container
  }

  onRemove(): void {
    this._container?.remove()
    this._map = null
  }
}

export function MapaLeaflet({
  latitud,
  longitud,
  nombre,
  direccion,
  googleMapsUrl,
  horarioSemana,
  horarioFinDeSemana,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return

    try {
      const cfg = (mapboxgl as any).config
      Object.defineProperty(cfg, 'EVENTS_URL', {
        get: () => '',
        set: () => {},
        configurable: true,
      })
    } catch {
      /* getter-only y no configurable en esta versión — sin efecto */
    }
    mapboxgl.accessToken = TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: ESTILO_MAPA,
      center: [longitud, latitud],
      zoom: 13,
      pitch: 0,
      attributionControl: false,
    })

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: true }),
      'top-right'
    )
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    map.addControl(new ToggleEstiloControl(), 'top-right')
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-right'
    )

    map.on('load', () => {
      agregar3dEdificios(map)

      const popup = new mapboxgl.Popup({
        closeButton: true,
        maxWidth: '240px',
        className: 'mapa-popup',
        offset: 20,
      }).setHTML(
        buildPopupHTML(
          nombre,
          direccion,
          horarioSemana,
          horarioFinDeSemana,
          googleMapsUrl
        )
      )

      new mapboxgl.Marker({ element: buildMarkerEl(), anchor: 'bottom' })
        .setLngLat([longitud, latitud])
        .setPopup(popup)
        .addTo(map)

      map.flyTo({
        center: [longitud, latitud],
        zoom: 16.5,
        pitch: 52,
        duration: 2800,
        essential: true,
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [
    latitud,
    longitud,
    nombre,
    direccion,
    googleMapsUrl,
    horarioSemana,
    horarioFinDeSemana,
  ])

  return <div ref={containerRef} style={{ height: 340, width: '100%' }} />
}
