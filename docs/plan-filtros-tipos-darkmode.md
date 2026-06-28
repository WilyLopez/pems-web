# Plan: Filtros, URL state, Tipos en Sheet y Dark Mode

> Creado: 2026-06-27. Aprobado antes de implementar.

---

## Contexto

Tres problemas identificados en el módulo `admin/finanzas`:

1. **Filtros sin URL state** — Los filtros de fecha, página y búsqueda se guardan en `useState` local. Al navegar o refrescar se pierden.
2. **Tipos de ingreso/egreso en páginas separadas** — Las rutas `/egresos/tipos` e `/ingresos/tipos` quedan con demasiado espacio en blanco y obligan a salir de la página padre.
3. **Dark mode incompleto** — Las pages usan clases hardcodeadas (`bg-white`, `text-gray-900`) en vez de tokens semánticos. El `globals.css` compensa parcialmente con overrides `!important`, pero faltan casos como `<select>` nativos y `border-b`.

---

## Fase A — URL state en las tres páginas

### A.1 Ingresos (`/admin/finanzas/ingresos/page.tsx`)

**Params en URL:**

| Param    | Tipo                       | Default | Descripción                                    |
| -------- | -------------------------- | ------- | ---------------------------------------------- |
| `desde`  | `string` (YYYY-MM-DD)      | `''`    | Inicio del rango de fechas                     |
| `hasta`  | `string` (YYYY-MM-DD)      | `''`    | Fin del rango de fechas                        |
| `page`   | `number`                   | `0`     | Página actual (paginación)                     |
| `tipo`   | `string`                   | `''`    | Código de tipo de ingreso (filtro client-side) |
| `medio`  | `string`                   | `''`    | Medio de pago (filtro client-side)             |
| `origen` | `'auto' \| 'manual' \| ''` | `''`    | Filtro por `esAutomatico`                      |

**Regla de activación de filtros client-side:**
Los filtros `tipo`, `medio` y `origen` solo se aplican cuando hay un rango de fechas activo (`desde` y `hasta`), porque solo entonces el backend devuelve la lista completa. Con paginación activa, filtrar sobre 20 registros sería confuso.

**UI de filtros:**

```
[ Desde ] [ Hasta ]  →  aparecen: [ Tipo ▾ ] [ Medio ▾ ] [ Origen ▾ ] [ Buscar... ]  [ × Limpiar ]
```

**Cambios:**

- Eliminar `const [page, setPage] = useState(0)` → `searchParams.get('page')`
- Eliminar `const [inicio, setFin] = useState('')` → `searchParams.get('desde')`
- Añadir barra de filtros secundaria (tipo, medio, origen) visible solo con rango activo
- Añadir input de búsqueda por texto (filtra sobre `descripcion` client-side)
- `useIngresos` y `useIngresosPorRango` ya existen — no cambiar hooks

---

### A.2 Egresos (`/admin/finanzas/egresos/page.tsx`)

**Params ya en URL:** `tab`, `anio`, `mes` ✓

**Params a agregar:**

| Param        | Aplica en tab | Descripción                                            |
| ------------ | ------------- | ------------------------------------------------------ |
| `desde`      | `egresos`     | Inicio del rango de fechas                             |
| `hasta`      | `egresos`     | Fin del rango de fechas                                |
| `page`       | `egresos`     | Página actual                                          |
| `tipo`       | `egresos`     | Código de tipo de egreso (client-side, solo con rango) |
| `recurrente` | `egresos`     | `'si' \| 'no' \| ''` (client-side, solo con rango)     |
| `q`          | `egresos`     | Búsqueda por texto en descripcion (client-side)        |

**Cambios:**

- Mover `page`, `inicio`, `fin` de `useState` a `useSearchParams`
- Añadir filtros secundarios (tipo, recurrente, q) visibles solo con rango activo en tab "egresos"
- Las tabs "gastos-op" y "gastos-ev" ya tienen `PeriodoSelector` con URL state — sin cambios

---

### A.3 Reportes (`/admin/finanzas/reportes/page.tsx`)

**Params a agregar:**

| Param   | Aplica en tab         | Descripción                           |
| ------- | --------------------- | ------------------------------------- |
| `tab`   | todas                 | `'mensual' \| 'diario' \| 'metricas'` |
| `anio`  | `mensual`, `metricas` | Año del período                       |
| `mes`   | `mensual`, `metricas` | Mes del período (1-12)                |
| `desde` | `diario`              | Inicio del rango diario               |
| `hasta` | `diario`              | Fin del rango diario                  |

**Cambios:**

- Reemplazar `defaultValue` de `<Tabs>` por `value={tab}` desde `useSearchParams`
- Subir el estado de período de cada sub-componente al componente padre
- Pasar los valores como props a `ResumenMensualTab`, `ResumenDiarioTab`, `MetricasReservasTab`

---

## Fase B — Tipos en Sheet lateral

### B.1 Decisión de arquitectura

| Opción                         | Descripción                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Sheet independiente por página | Botón "Gestionar tipos" en ingresos → Sheet de tipos ingreso. Mismo en egresos. |
| Sheet unificado desde nav      | Un solo Sheet accesible desde la nav del layout, con tabs Ingresos/Egresos.     |

**Elegida: Sheet independiente por página.** El usuario que está en ingresos gestiona solo tipos de ingreso, lo cual es más intuitivo y no requiere cambios en el layout.

### B.2 Componentes a crear/modificar

**`features/admin/finanzas/components/TiposIngresoManager.tsx`** (nuevo)

- Extrae la lógica de tipos de ingreso que actualmente está embebida en `ingresos/tipos/page.tsx`
- Misma estructura que `TiposEgresoManager`: tabla + Dialog crear + Dialog confirmar desactivar
- Añade: campo de búsqueda por nombre/código (client-side sobre `tipos`)
- Añade: stats resumen — `{activos} activos · {inactivos} inactivos`

**`features/admin/finanzas/components/TiposEgresoManager.tsx`** (modificar)

- Añadir: búsqueda por nombre/código (client-side)
- Añadir: stats resumen — `{activos} activos · {inactivos} inactivos`
- Añadir: columna "Código" (actualmente no visible en la tabla)
- Sin cambios en la lógica de mutaciones

**`features/admin/finanzas/components/TiposSheet.tsx`** (nuevo)

- Wrapper genérico que recibe `tipo: 'ingreso' | 'egreso'` y renderiza el manager correspondiente
- Alternativamente: dos componentes separados `TiposIngresoSheet.tsx` / `TiposEgresoSheet.tsx`

**Preferida: dos sheets separados** para evitar props condicionales y mantener simplicidad.

### B.3 Cambios en páginas

**`ingresos/page.tsx`:**

- Reemplazar: `<Link href="/admin/finanzas/ingresos/tipos"><Button>Ver tipos</Button></Link>`
- Por: `<Button onClick={() => setOpenTipos(true)}>Gestionar tipos</Button>`
- Añadir: `<Sheet open={openTipos} onOpenChange={setOpenTipos}><TiposIngresoManager /></Sheet>`
- Estado `openTipos` en `useState` (no necesita URL)

**`egresos/page.tsx`:**

- Mismo patrón con `TiposEgresoManager`

**Rutas `/egresos/tipos` e `/ingresos/tipos`:**

- Las páginas actuales se mantienen pero redirigen a la página padre con el sheet abierto
- O se eliminan y se confía en que el acceso es solo desde el botón
- **Elegido**: mantener las rutas pero simplificarlas (solo accesibles desde el botón en la page padre, no desde nav)

### B.4 UI del Sheet

```
┌─────────────────────────────────────┐
│ Tipos de egreso               [×]   │
│ 8 activos · 2 inactivos             │
├─────────────────────────────────────┤
│ [ 🔍 Buscar por nombre o código ] [+ Nuevo tipo] │
├─────────────────────────────────────┤
│ Tabla: Código | Nombre | Categoría | Estado | Acción │
│ ...filas...                         │
└─────────────────────────────────────┘
```

El "Nuevo tipo" dentro del Sheet abre el Dialog existente por encima (ya funciona así en `TiposEgresoManager`).

---

## Fase C — Dark mode

### C.1 Problema

Las pages usan clases hardcodeadas de Tailwind (`bg-white`, `bg-gray-50`, `text-gray-900`, etc.) en lugar de los tokens CSS semánticos definidos en `globals.css` (`:root` / `.dark`):

| Clase hardcodeada                 | Token semántico equivalente |
| --------------------------------- | --------------------------- |
| `bg-white`                        | `bg-card`                   |
| `bg-gray-50`                      | `bg-muted/40`               |
| `text-gray-900`                   | `text-foreground`           |
| `text-gray-700` / `text-gray-800` | `text-foreground/80`        |
| `text-gray-500` / `text-gray-600` | `text-muted-foreground`     |
| `text-gray-400`                   | `text-muted-foreground/70`  |
| `border-gray-100`                 | `border-border`             |
| `border-gray-200`                 | `border-border`             |
| `divide-gray-100`                 | `divide-border`             |

El `globals.css` compensa con overrides `!important`, pero estos no cubren:

- `<select>` nativos con `border-gray-200 bg-white` inline (en `reportes/page.tsx`)
- `border-b` sin clase de color (hereda el color por defecto del browser)
- `hover:bg-gray-50` en filas de tabla

### C.2 Estrategia

**Opción elegida: migración a tokens semánticos** en los archivos afectados del módulo finanzas.

Alcance: solo las páginas y componentes dentro de `features/admin/finanzas` y `app/admin/finanzas`. No tocar otros módulos.

**Patrón de migración:**

```tsx
// Antes
<div className="bg-white rounded-2xl border border-gray-100">
  <thead className="border-b bg-gray-50">
    <th className="text-gray-500">...</th>
  </thead>
  <tbody className="divide-y divide-gray-100">
    <tr className="hover:bg-gray-50">
      <td className="text-gray-900">...</td>
      <td className="text-gray-500">...</td>

// Después
<div className="bg-card rounded-2xl border border-border">
  <thead className="border-b bg-muted/40">
    <th className="text-muted-foreground">...</th>
  </thead>
  <tbody className="divide-y divide-border">
    <tr className="hover:bg-muted/30">
      <td className="text-foreground">...</td>
      <td className="text-muted-foreground">...</td>
```

**`<select>` nativos** (en `reportes/page.tsx`):

- Reemplazar `<select className="border-gray-200 bg-white...">` por el componente `<Select>` de shadcn/ui que ya soporta dark mode

**Layout (`finanzas/layout.tsx`):**

```tsx
// Antes
<nav className="... border-gray-100 bg-white ...">
  active: 'bg-brand-azul text-white'
  inactive: 'text-gray-500 hover:bg-gray-50 hover:text-brand-azul'

// Después
<nav className="... border-border bg-card ...">
  inactive: 'text-muted-foreground hover:bg-muted/40 hover:text-brand-azul'
```

### C.3 Archivos afectados

| Archivo                                                     | Cambios                                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `app/admin/finanzas/layout.tsx`                             | nav: `bg-white` → `bg-card`, `border-gray-100` → `border-border`, colores de texto |
| `app/admin/finanzas/ingresos/page.tsx`                      | tabla, headers, rows, filtros                                                      |
| `app/admin/finanzas/egresos/page.tsx`                       | tabla, headers, rows, Sheet                                                        |
| `app/admin/finanzas/reportes/page.tsx`                      | `<select>` nativos → `<Select>` de shadcn, tablas                                  |
| `app/admin/finanzas/caja/page.tsx`                          | si aplica                                                                          |
| `features/admin/finanzas/components/TiposEgresoManager.tsx` | tabla interna                                                                      |
| `features/cajero/components/MovimientosTable.tsx`           | tabla                                                                              |

**`globals.css`:** Una vez migrados, los overrides `!important` existentes se pueden mantener como fallback o eliminar progresivamente — no rompen nada.

---

## Resumen de fases y archivos

| Fase    | Archivos                             | Descripción                                                      |
| ------- | ------------------------------------ | ---------------------------------------------------------------- |
| **A.1** | `ingresos/page.tsx`                  | URL state (desde, hasta, page, tipo, medio, origen) + filtros UI |
| **A.2** | `egresos/page.tsx`                   | URL state (desde, hasta, page, tipo, recurrente, q) + filtros UI |
| **A.3** | `reportes/page.tsx`                  | URL state (tab, anio, mes, desde, hasta)                         |
| **B.1** | `TiposIngresoManager.tsx` (nuevo)    | Manager con búsqueda y stats                                     |
| **B.2** | `TiposEgresoManager.tsx` (modificar) | + búsqueda, + stats, + columna código                            |
| **B.3** | `ingresos/page.tsx`                  | Botón → Sheet con TiposIngresoManager                            |
| **B.4** | `egresos/page.tsx`                   | Botón → Sheet con TiposEgresoManager                             |
| **C.1** | `layout.tsx`                         | Tokens semánticos en nav                                         |
| **C.2** | `ingresos/page.tsx`                  | Tokens semánticos en tabla y filtros                             |
| **C.3** | `egresos/page.tsx`                   | Tokens semánticos                                                |
| **C.4** | `reportes/page.tsx`                  | Tokens semánticos + `<Select>` en vez de `<select>` nativo       |
| **C.5** | `TiposEgresoManager.tsx`             | Tokens semánticos                                                |
| **C.6** | `MovimientosTable.tsx`               | Tokens semánticos                                                |

---

## Orden de implementación sugerido

1. **Fase B** primero — los Sheets son independientes y no interfieren con el resto
2. **Fase A** — URL state + filtros en las tres páginas
3. **Fase C** — dark mode, al final para no mezclar cambios de lógica con cambios de estilo

---

## Notas técnicas

- Filtros client-side siempre sobre la lista ya cargada — nunca modificar los hooks
- `page` en URL debe resetearse a `0` cuando cambian los filtros de fecha
- En los Sheets, el estado `open` es `useState` local (no necesita URL — es UI transitoria)
- Los Sheets de tipos no requieren cambios de backend
- La migración de tokens semánticos es visual-only — no afecta lógica ni tests
