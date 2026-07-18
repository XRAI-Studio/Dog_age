import { cn } from '../../lib/utils'

export function Badge({ className, ...props }) {
  return <span className={cn('inline-flex items-center rounded-full bg-sun/35 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-ink', className)} {...props} />
}
