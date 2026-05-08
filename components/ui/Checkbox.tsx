'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {

  size?: 'sm' | 'md' | 'lg'
  indeterminate?: boolean
}

const sizeMap = {
  sm: 'h-3.5 w-3.5 rounded',
  md: 'h-[18px] w-[18px] rounded-md',
  lg: 'h-[22px] w-[22px] rounded-md',
}

const iconSizeMap = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = 'md', indeterminate = false, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      
      'shrink-0 border-2 transition-all outline-none',
      'focus-visible:ring-2 focus-visible:ring-brand-azul/40 focus-visible:ring-offset-1',
      
      'border-gray-300 bg-white hover:border-brand-azul',
      
      'data-[state=checked]:border-brand-azul data-[state=checked]:bg-brand-azul',
      
      'data-[state=indeterminate]:border-brand-azul data-[state=indeterminate]:bg-brand-azul',
      
      'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300',
      sizeMap[size],
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className="flex items-center justify-center text-white"
    >
      {indeterminate ? (
        <Minus className={cn(iconSizeMap[size], 'stroke-[3]')} />
      ) : (
        <Check className={cn(iconSizeMap[size], 'stroke-[3]')} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }