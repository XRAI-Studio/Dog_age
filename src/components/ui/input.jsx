import * as React from 'react'
import { cn } from '../../lib/utils'

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn('flex h-12 w-full rounded-2xl border-2 border-ink/15 bg-cream/45 px-4 text-base text-ink outline-none transition placeholder:text-ink/40 focus:border-teal focus:ring-4 focus:ring-teal/10 disabled:cursor-not-allowed disabled:opacity-50', className)}
    {...props}
  />
))
Input.displayName = 'Input'
