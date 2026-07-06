# Mapa de ubicación — Página de Contacto

**Fecha:** 2026-07-05
**Autor:** Wilian Lopez (wlopezvilcarromero@hotmail.com)

## Qué se usa

La página `/contacto` muestra la ubicación del local mediante un **iframe de Google Maps** (el "embed" que genera Google Maps al usar Compartir → Insertar un mapa).

Este dato pertenece a la **sede** (el local), no a la configuración pública del sitio: se guarda en la tabla `sede` (columna `google_maps_embed_url`) y se edita en **Panel admin → Configuración → Sede**.

### Archivos involucrados

| Archivo | Rol |
|---|---|
| `src/features/public/shared/components/GoogleMapEmbed.tsx` | Componente genérico que renderiza un `<iframe>` de Google Maps. Recibe `src`, `title` y `className`. Se usa tanto en `/contacto` (público) como en la vista previa del panel admin. |
| `src/features/public/contacto/ContactoView.tsx` | Vista de la página `/contacto`. Obtiene la sede activa con `useSedesPublicas()` y lee `sedeActiva.googleMapsEmbedUrl`. Si el campo está vacío, muestra un estado alternativo (solo ícono + texto, sin mapa). |
| `src/features/public/shared/hooks/useSedesPublicas.ts` | Hook público que consulta `GET /api/v1/sedes` (endpoint sin autenticación) y expone `sedeActiva`, `idSedeActiva`, `idSedeUnica`. Es la fuente del embed en el sitio público. |
| `src/features/admin/configuracion/components/sections/SedeSection.tsx` | Formulario admin de datos de sede (nombre, ciudad, departamento, RUC) donde también se pega la URL del embed (campo "Enlace de inserción", bajo el título "Mapa insertado de Google Maps"), con vista previa en vivo y un enlace a la guía oficial de Google para obtenerla. |

### Campos que ya no existen

`direccion`, `googleMapsUrl` y el antiguo `googleMapsEmbedUrl` de "Configuración Pública" (tabla `configuracion_publica`) se eliminaron por completo del sistema (backend, admin y sitio público) el 2026-07-05. Antes se editaban en **Configuración pública → Contacto**; esa sección ya no existe.

Como consecuencia, la página `/contacto` y el footer público ya no muestran el texto de dirección ni un botón "Abrir en Google Maps" — solo el mapa embebido cuando está configurado.

Las coordenadas `latitud`/`longitud` de `Sede` siguen existiendo en el backend, pero ya no tienen campos editables en el formulario de Sede (no alimentan ningún mapa público; el mapa de Contacto usa únicamente el embed de Google).

## Cómo funciona

Flujo end-to-end:
1. Backend (`pems`): tabla `sede`, columna `google_maps_embed_url` (ver migración `db/migration_legacy/V41__sede_google_maps_embed.sql`, ejecutar manualmente en Supabase — este proyecto tiene Flyway deshabilitado).
2. API: `GET/PUT /api/v1/sedes/{idSede}` expone el campo. El `GET` (individual y el listado `GET /api/v1/sedes`) no requiere autenticación, por lo que el sitio público puede consumirlo directamente; el `PUT` sí requiere el permiso `configuracion.editar`.
3. Frontend admin: `SedeSection.tsx` tiene el campo de texto + una vista previa (`<GoogleMapEmbed>`) que se activa automáticamente si el valor empieza con `https://www.google.com/maps/embed`.
4. Frontend público: `ContactoView.tsx` obtiene la sede activa con `useSedesPublicas()` y renderiza `<GoogleMapEmbed src={sedeActiva.googleMapsEmbedUrl} />` dentro de la tarjeta "¿Dónde estamos?".

## Cómo cambiarlo

### Cambiar la ubicación mostrada (mudanza de local, etc.)

Se hace desde el panel de administración, sin tocar código:

1. Ir a [Google Maps](https://www.google.com/maps) y buscar el nuevo lugar (idealmente la ficha del negocio, no solo un punto en el mapa).
2. Click en **Compartir** → pestaña **Insertar un mapa**.
3. Copiar el `src` que aparece dentro del `<iframe>` que genera Google (una URL larga que empieza con `https://www.google.com/maps/embed?pb=...`).
4. Ir a **Panel admin → Configuración → Sede**, pegar esa URL en el campo "Enlace de inserción" (bajo "Mapa insertado de Google Maps"). El formulario también tiene un enlace directo "¿Cómo obtener este enlace?" con la guía oficial de Google.
5. Verificar la vista previa que aparece debajo del campo, y guardar.

### Ajustar tamaño o estilo del mapa

El tamaño lo controla el contenedor, no el iframe (el iframe siempre es `w-full h-full`). Para cambiar el alto en la página pública, ajustar las clases en `ContactoView.tsx` (`min-h-[300px]` para el mapa, `min-h-[340px]` para toda la tarjeta). Para la vista previa del admin, ajustar la clase `h-64` en `SedeSection.tsx`.

## Por qué se cambió

- El mapa es un dato del **local**, no de la configuración pública del sitio, así que se movió a la entidad `Sede`.
- El negocio ya tiene una ficha real en Google Maps (con nombre, reseñas, fotos) que el embed de Google aprovecha directamente — no requiere token de API ni facturación.
- Es más simple de mantener: cambiar la ubicación es copiar y pegar una URL desde el propio panel de administración, sin tocar código.

## Nota sobre multi-sede

`googleMapsEmbedUrl` ya vive en la entidad `Sede`, lo cual facilita el soporte multi-sede a futuro: cada sede podría tener su propio mapa. Hoy el sitio público sigue asumiendo una sola sede activa (`useSedesPublicas().sedeActiva`); si el negocio abre una segunda sede física, la página de Contacto tendría que pasar a mostrar un selector o lista de sedes. Es un cambio más grande, pendiente como iniciativa aparte.
