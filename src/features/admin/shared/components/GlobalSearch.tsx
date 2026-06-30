'use client'

import { memo, useState, useRef, useEffect } from 'react'
import { Search, X, ExternalLink, LayoutDashboard, User } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const QUICK_LINKS = [
  { label: 'Nueva reserva', href: '/admin/reservas', icon: LayoutDashboard },
  {
    label: 'Ver calendario',
    href: '/admin/calendario',
    icon: LayoutDashboard,
  },
  { label: 'Clientes', href: '/admin/clientes', icon: User },
  {
    label: 'Reportes',
    href: '/admin/finanzas/reportes',
    icon: LayoutDashboard,
  },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-400 hover:border-brand-azul/40 hover:bg-white hover:text-gray-600 transition-all w-52 lg:w-72"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Buscar...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-400">
          Ctrl K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9 rounded-xl"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg top-[15%] translate-y-0">
          <DialogTitle className="sr-only">Buscador Global</DialogTitle>
          <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar reservas, clientes, eventos, pagos..."
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="p-3">
              <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Accesos rapidos
              </p>
              <div className="space-y-0.5">
                {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => {
                      setOpen(false)
                      setQuery('')
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-brand-azul/8 hover:text-brand-azul transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-brand-azul/15 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-gray-500 group-hover:text-brand-azul" />
                    </div>
                    {label}
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3 text-[10px] text-gray-400">
              <span>
                <kbd className="border rounded px-1">↑↓</kbd> Navegar
              </span>
              <span>
                <kbd className="border rounded px-1">↵</kbd> Abrir
              </span>
              <span>
                <kbd className="border rounded px-1">Esc</kbd> Cerrar
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
