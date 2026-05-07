import { Display } from '@/pages/calculator/components/Display'
import { Keypad } from '@/pages/calculator/components/Keypad'

export function Calculator() {
  return (
    <main className="calculator-stage">
      <section className="calculator-shell flex w-full flex-col sm:max-w-[22rem]">
        <Display />
        <Keypad />
      </section>
    </main>
  )
}
