'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/store/sidebar.store'
import { Logo } from '@/components/brand/Logo'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { navGroups } from '../config/sidebar.config'
import type { NavLeaf, NavAccordionItem, NavGroupItem } from '../config/sidebar.config'

function isAccordion(item: NavGroupItem): item is NavAccordionItem {
  return 'children' in item
}

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  collapsed: boolean
  onClick?: () => void
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: NavItemProps) {
  const link = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center rounded-xl text-sm font-medium transition-colors duration-150',
        collapsed ? 'h-10 w-10 justify-center mx-auto' : 'gap-3 px-2.5 py-2',
        active
          ? 'bg-brand-azul text-white shadow-brand'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon
        className={cn(
          'h-[17px] w-[17px] shrink-0',
          active ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'
        )}
      />
      {!collapsed && <span className="truncate leading-none">{label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="text-xs font-medium"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

interface AccordionItemProps {
  label: string
  icon: LucideIcon
  children: NavLeaf[]
  collapsed: boolean
  isActive: (href: string, exact?: boolean) => boolean
  onItemClick?: () => void
}

function AccordionItem({
  label,
  icon: Icon,
  children,
  collapsed,
  isActive,
  onItemClick,
}: AccordionItemProps) {
  const hasActiveChild = children.some(({ href, exact }) =>
    isActive(href, exact)
  )
  const [open, setOpen] = useState(hasActiveChild)

  useEffect(() => {
    if (hasActiveChild) setOpen(true)
  }, [hasActiveChild])

  if (collapsed) {
    return (
      <div className="space-y-1">
        {children.map(({ label: l, href, icon, exact }) => (
          <NavItem
            key={href}
            href={href}
            label={l}
            icon={icon}
            active={isActive(href, exact)}
            collapsed
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-150',
          hasActiveChild
            ? 'bg-brand-azul/8 text-brand-azul'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <Icon
          className={cn(
            'h-[17px] w-[17px] shrink-0',
            hasActiveChild
              ? 'text-brand-azul'
              : 'text-gray-400 group-hover:text-gray-700'
          )}
        />
        <span className="flex-1 truncate leading-none text-left">{label}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
            hasActiveChild ? 'text-brand-azul/50' : 'text-gray-300'
          )}
        />
      </button>

      <div
        className={cn(
          'grid overflow-hidden transition-all duration-200 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-[30px] mt-0.5 space-y-0.5 border-l border-gray-100 pl-3 pb-1">
            {children.map(({ label: l, href, icon, exact }) => (
              <NavItem
                key={href}
                href={href}
                label={l}
                icon={icon}
                active={isActive(href, exact)}
                collapsed={false}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavGroupProps {
  label: string
  items: NavGroupItem[]
  collapsed: boolean
  isActive: (href: string, exact?: boolean) => boolean
  onItemClick?: () => void
}

function NavGroup({
  label,
  items,
  collapsed,
  isActive,
  onItemClick,
}: NavGroupProps) {
  const hasActive = items.some((item) => {
    if (isAccordion(item))
      return item.children.some(({ href, exact }) => isActive(href, exact))
    return isActive(item.href, item.exact)
  })
  const [open, setOpen] = useState(true)

  if (collapsed) {
    return (
      <div className="space-y-1">
        {items.map((item) => {
          if (isAccordion(item)) {
            return (
              <AccordionItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                children={item.children}
                collapsed
                isActive={isActive}
              />
            )
          }
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href, item.exact)}
              collapsed
            />
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="group mb-0.5 flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-gray-50"
      >
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-widest select-none transition-colors',
            hasActive
              ? 'text-brand-azul'
              : 'text-gray-400 group-hover:text-gray-500'
          )}
        >
          {label}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-gray-300 transition-transform duration-200',
            !open && '-rotate-90'
          )}
        />
      </button>

      <div
        className={cn(
          'grid overflow-hidden transition-all duration-200 ease-in-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="space-y-0.5 overflow-hidden">
          {items.map((item) => {
            if (isAccordion(item)) {
              return (
                <AccordionItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  children={item.children}
                  collapsed={false}
                  isActive={isActive}
                  onItemClick={onItemClick}
                />
              )
            }
            return (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href, item.exact)}
                collapsed={false}
                onClick={onItemClick}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SidebarContent({
  collapsed,
  isActive,
  onItemClick,
}: {
  collapsed: boolean
  isActive: (href: string, exact?: boolean) => boolean
  onItemClick?: () => void
}) {
  return (
    <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain scrollbar-thin pr-2">
      <nav className={cn('py-3 space-y-4', collapsed ? 'px-3' : 'px-3')}>
        {navGroups.map((group) => (
          <NavGroup
            key={group.label}
            label={group.label}
            items={group.items}
            collapsed={collapsed}
            isActive={isActive}
            onItemClick={onItemClick}
          />
        ))}
      </nav>
    </div>
  )
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { isOpen, mobileOpen, toggle, closeMobile } = useSidebarStore()
  const isDesktop = useIsDesktop()

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/')

  const collapsed = !isOpen

  if (isDesktop === null) {
    return (
      <div className="w-[240px] shrink-0 border-r border-gray-100 bg-white hidden lg:block h-dvh" />
    )
  }

  return (
    <TooltipProvider delayDuration={100}>
      {!isDesktop && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          onClick={closeMobile}
        />
      )}

      {!isDesktop && (
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col min-h-0 bg-white border-r border-gray-100 shadow-card-hover',
            'w-[240px] h-dvh overflow-hidden transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-5">
            <Logo variant="secundario" size="md" href="/admin/dashboard" />
          </div>

          <SidebarContent
            collapsed={false}
            isActive={isActive}
            onItemClick={closeMobile}
          />

          <div className="shrink-0 border-t border-gray-100 px-5 py-4">
            <p className="text-[11px] font-semibold text-gray-600 leading-none">
              Kiki y Lala Admin
            </p>
            <p className="text-[10px] text-gray-400 mt-1">v1.0.0</p>
          </div>
        </aside>
      )}

      {isDesktop && (
        <aside
          className={cn(
            'relative flex flex-col min-h-0 bg-white border-r border-gray-100 h-dvh overflow-hidden',
            'transition-[width] duration-300 ease-in-out shrink-0',
            collapsed ? 'w-[80px]' : 'w-[240px]'
          )}
        >
          <div
            className={cn(
              'flex h-16 shrink-0 items-center border-b border-gray-100 overflow-hidden',
              'transition-all duration-300',
              collapsed ? 'justify-center px-0' : 'px-5'
            )}
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/admin/dashboard">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-azul to-[#0090cc] flex items-center justify-center shadow-brand shrink-0">
                      <span className="text-white font-black text-sm">K</span>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="text-xs font-medium"
                >
                  Kiki y Lala Admin
                </TooltipContent>
              </Tooltip>
            ) : (
              <Logo variant="secundario" size="md" href="/admin/dashboard" />
            )}
          </div>

          <SidebarContent collapsed={collapsed} isActive={isActive} />

          <div
            className={cn(
              'shrink-0 border-t border-gray-100',
              collapsed ? 'flex justify-center py-4' : 'px-5 py-4'
            )}
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[9px] font-bold text-gray-400 select-none cursor-default">
                    v1
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Kiki y Lala Admin v1.0.0
                </TooltipContent>
              </Tooltip>
            ) : (
              <div>
                <p className="text-[11px] font-semibold text-gray-600 leading-none">
                  Kiki y Lala Admin
                </p>
                <p className="text-[10px] text-gray-400 mt-1">v1.0.0</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggle}
            className={cn(
              'absolute -right-3 top-[78px] z-50',
              'h-7 w-7 rounded-full flex items-center justify-center',
              'border border-gray-200 bg-white shadow-card',
              'text-gray-400 hover:text-brand-azul hover:border-brand-azul/40 hover:shadow-brand',
              'transition-all duration-200'
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </button>
        </aside>
      )}
    </TooltipProvider>
  )
}
