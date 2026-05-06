import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white shadow-[0_16px_30px_rgba(240,108,43,0.24)] hover:translate-y-[-1px] hover:bg-[#d85a1c]',
        secondary:
          'bg-[#0f766e] text-white shadow-[0_16px_30px_rgba(15,118,110,0.2)] hover:translate-y-[-1px] hover:bg-[#0b5f59]',
        outline:
          'border border-[#d8cfbc] bg-[#fff7eb] text-foreground hover:bg-[#f6ecd9]',
        ghost: 'bg-transparent text-foreground hover:bg-white/50',
      },
      size: {
        default: 'h-14 px-4 py-2',
        icon: 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

