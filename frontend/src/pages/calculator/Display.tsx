import { useDeferredValue } from 'react'

import { useCalculatorContext } from '@/context/CalculatorContext'
import { cn } from '@/lib/utils'

export function Display() {
  const { display, error, resolvedExpression } = useCalculatorContext()
  const deferredDisplay = useDeferredValue(display)
  const deferredResolvedExpression = useDeferredValue(resolvedExpression)
  const hasResolvedExpression = Boolean(deferredResolvedExpression)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#6b7280]">
        <span>Calculator</span>
        <span>Sezzle</span>
      </div>

      <div className="relative pt-5">
        {deferredResolvedExpression ? (
          <div className="pointer-events-none absolute inset-x-4 top-0 z-10 flex justify-end">
            <div className="rounded-full border border-[#f3c185] bg-[#fff6e7] px-3 py-1 font-mono text-[0.72rem] font-semibold tracking-[0.08em] text-[#c66517] shadow-[0_10px_20px_rgba(240,108,43,0.14)]">
              {deferredResolvedExpression}
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            'rounded-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,239,226,0.92))] px-5 py-6 shadow-inner transition-all duration-200',
            hasResolvedExpression &&
              'border-[#f3c185] bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(255,241,217,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_38px_rgba(240,108,43,0.12)] ring-1 ring-[#f7d7b0]',
          )}
        >
          {error ? (
            <p className="mb-4 rounded-xl bg-[#fff1ea] px-3 py-2 text-sm font-medium text-[#b45309]">
              {error}
            </p>
          ) : null}

          <p className="text-right font-mono text-[clamp(2.5rem,8vw,4rem)] font-semibold tracking-[-0.06em] text-[#101828]">
            {deferredDisplay}
          </p>
        </div>
      </div>
    </section>
  )
}
