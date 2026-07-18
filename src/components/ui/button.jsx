import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/25 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-coral px-6 py-3 text-white shadow-md hover:bg-[#d95749]',
        outline: 'border-2 border-ink/15 bg-white px-5 py-2.5 text-ink hover:border-teal/40 hover:bg-teal/5',
        ghost: 'px-4 py-2 text-teal hover:bg-teal/10',
      },
      size: {
        default: 'h-12',
        sm: 'h-10 text-xs',
        lg: 'h-14 px-8 text-base',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
