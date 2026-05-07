import { useDeferredValue } from 'react'

import { useCalculatorView } from '@/store/calculator/store'
import { cn } from '@/lib/utils'
import {
  getDisplayPresentation,
  getHistoryPresentation,
} from '@/pages/calculator/helpers/display-presentation'

export function Display() {
  const { display, error, resolvedExpression } = useCalculatorView()
  const deferredDisplay = useDeferredValue(display)
  const deferredResolvedExpression = useDeferredValue(resolvedExpression)
  const historyText = getHistoryPresentation(deferredResolvedExpression)
  const displayText = getDisplayPresentation(deferredDisplay)

  return (
    <section className="flex flex-1 flex-col justify-end gap-1 px-5 pb-3 pt-4 text-right">
      <p
        className={cn(
          'min-h-[1.25rem] overflow-hidden text-[1rem] font-medium tracking-[-0.02em] text-[#8e8e93]',
          !historyText && 'opacity-0',
        )}
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 3rem)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 3rem)',
        }}
      >
        {historyText || '0'}
      </p>

      {error ? (
        <p className="text-sm font-medium tracking-[-0.01em] text-[#ff6b6b]">
          {error}
        </p>
      ) : null}

      <p
        className="overflow-hidden text-[2.5rem] font-light leading-none tracking-[-0.03em] text-white tabular-nums"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 3rem)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 3rem)',
        }}
      >
        {displayText}
      </p>
    </section>
  )
}
