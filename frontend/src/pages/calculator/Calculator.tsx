import { Card, CardContent } from '@/components/ui/card'
import { CalculatorProvider } from '@/context/CalculatorContext'

import { Display } from '@/pages/calculator/Display'
import { Keypad } from '@/pages/calculator/Keypad'

export function Calculator() {
  return (
    <CalculatorProvider>
      <main className="calculator-stage">
        <div className="calculator-orb calculator-orb--primary" aria-hidden="true" />
        <div className="calculator-orb calculator-orb--secondary" aria-hidden="true" />

        <Card className="calculator-shell relative z-10 w-full max-w-[26rem] overflow-hidden">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="eyebrow">Built for clear arithmetic</p>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-[#111827]">
                    FS Calculator
                  </h1>
                  <p className="mt-1 text-sm text-[#667085]">
                    Basic and advanced operations with a clean API-backed flow.
                  </p>
                </div>
                <div className="rounded-full border border-[#fde2c4] bg-[#fff5e7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#d85a1c]">
                  Live
                </div>
              </div>
            </div>

            <Display />
            <Keypad />
          </CardContent>
        </Card>
      </main>
    </CalculatorProvider>
  )
}
