import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type OperationButtonProps = {
  label: string
  onClick: () => void
  variant?: 'digit' | 'operation' | 'special'
  className?: string
}

export function OperationButton({
  label,
  onClick,
  variant = 'digit',
  className,
}: OperationButtonProps) {
  const buttonVariant =
    variant === 'operation'
      ? 'default'
      : variant === 'special'
        ? 'secondary'
        : 'outline'

  return (
    <Button
      type="button"
      variant={buttonVariant}
      className={cn(
        'h-16 rounded-[1.4rem] text-lg md:h-[4.5rem]',
        variant === 'digit' && 'font-mono text-xl',
        variant === 'operation' && 'text-xl',
        className,
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

