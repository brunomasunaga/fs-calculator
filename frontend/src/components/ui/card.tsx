import * as React from 'react'

import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-[2rem] border border-white/60 bg-white/80 text-foreground shadow-[0_24px_90px_rgba(31,41,51,0.15)] backdrop-blur',
      className,
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 md:p-8', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export { Card, CardContent }
