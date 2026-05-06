import { useDeferredValue } from 'react'

import { useCalculatorContext } from '@/context/CalculatorContext'

export function Display() {
  const { display, error } = useCalculatorContext()
  const deferredDisplay = useDeferredValue(display)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#6b7280]">
        <span>Calculator</span>
        <span>Sezzle</span>
      </div>

      <div className="rounded-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,239,226,0.92))] px-5 py-6 shadow-inner">
        {error ? (
          <p className="mb-4 rounded-xl bg-[#fff1ea] px-3 py-2 text-sm font-medium text-[#b45309]">
            {error}
          </p>
        ) : null}
        <p className="text-right font-mono text-[clamp(2.5rem,8vw,4rem)] font-semibold tracking-[-0.06em] text-[#101828]">
          {deferredDisplay}
        </p>
      </div>
    </section>
  )
}

