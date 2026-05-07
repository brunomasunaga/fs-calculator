import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type OperationButtonProps = {
  label: string
  onClick: () => void
  variant?: 'digit' | 'operation' | 'special' | 'advanced'
  shape?: 'circle' | 'pill'
  className?: string
}

export function OperationButton({
  label,
  onClick,
  variant = 'digit',
  shape = 'circle',
  className,
}: OperationButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={null as never}
      className={cn(
        'rounded-full font-medium tracking-[-0.02em] transition-all duration-100 focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-0 active:brightness-75',
        shape === 'circle' && 'aspect-square w-full p-0 text-[1.6rem]',
        shape === 'pill' && 'h-full w-full text-[1.6rem]',
        variant === 'digit' && 'bg-[#636366] text-white hover:bg-[#6e6e72]',
        variant === 'special' && 'bg-[#8e8e93] text-white hover:bg-[#9e9ea3]',
        variant === 'advanced' &&
          'h-10 px-5 text-[1rem] bg-[#434346] text-[#f5f5f7] hover:bg-[#4a4a4e]',
        variant === 'operation' && 'bg-[#ff9500] text-white hover:bg-[#ffa520]',
        className,
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
