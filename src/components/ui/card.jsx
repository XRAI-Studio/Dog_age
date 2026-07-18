import * as React from 'react'
import { cn } from '../../lib/utils'

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-[2rem] border border-ink/10 bg-white shadow-lift', className)} {...props} />
))
Card.displayName = 'Card'

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-1.5 p-6 pb-3 sm:p-8 sm:pb-4', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('text-2xl font-black tracking-tight text-ink', className)} {...props} />
))
CardTitle.displayName = 'CardTitle'

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-3 sm:p-8 sm:pt-4', className)} {...props} />
))
CardContent.displayName = 'CardContent'
