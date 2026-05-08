# Kiki y Lala PEMS — Frontend

Sistema de gestión de eventos Kiki y Lala. Next.js 14 + shadcn/ui + TanStack Query + NextAuth.js

## Inicio rápido

```bash
npm install
cp .env.local.example .env.local   # Edita las variables
npm run dev
```

## Variables de entorno

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secreto_min_32_chars>
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Estructura

```
app/
  (public)/       → Landing, reservar, eventos privados
  auth/           → Login y registro
  (cliente)/      → Panel privado del cliente
  admin/          → Panel de administración
components/
  ui/             → shadcn/ui components
  layout/         → Sidebars, navbars
  common/         → DataTable, PageHeader, StatusBadge...
services/         → Llamadas a la API REST
hooks/            → TanStack Query + lógica de UI
lib/              → Axios, auth config, Zustand stores, validaciones Zod
types/            → TypeScript types e interfaces
```

## Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Linting
```