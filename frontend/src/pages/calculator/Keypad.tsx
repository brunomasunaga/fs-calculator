import { useCalculatorContext } from '@/context/CalculatorContext'

import { OperationButton } from '@/pages/calculator/OperationButton'

export function Keypad() {
  const {
    inputDigit,
    inputOperation,
    inputEquals,
    inputClear,
    inputSqrt,
    inputPercentage,
    inputDecimal,
  } = useCalculatorContext()

  return (
    <section className="grid grid-cols-4 gap-3">
      <OperationButton label="C" variant="special" onClick={inputClear} />
      <OperationButton
        label="^"
        variant="special"
        onClick={() => inputOperation('^')}
      />
      <OperationButton
        label="%"
        variant="special"
        onClick={inputPercentage}
      />
      <OperationButton
        label="÷"
        variant="operation"
        onClick={() => inputOperation('÷')}
      />

      <OperationButton label="7" onClick={() => inputDigit('7')} />
      <OperationButton label="8" onClick={() => inputDigit('8')} />
      <OperationButton label="9" onClick={() => inputDigit('9')} />
      <OperationButton
        label="×"
        variant="operation"
        onClick={() => inputOperation('×')}
      />

      <OperationButton label="4" onClick={() => inputDigit('4')} />
      <OperationButton label="5" onClick={() => inputDigit('5')} />
      <OperationButton label="6" onClick={() => inputDigit('6')} />
      <OperationButton
        label="-"
        variant="operation"
        onClick={() => inputOperation('-')}
      />

      <OperationButton label="1" onClick={() => inputDigit('1')} />
      <OperationButton label="2" onClick={() => inputDigit('2')} />
      <OperationButton label="3" onClick={() => inputDigit('3')} />
      <OperationButton
        label="+"
        variant="operation"
        onClick={() => inputOperation('+')}
      />

      <OperationButton
        label="0"
        className="col-span-2"
        onClick={() => inputDigit('0')}
      />
      <OperationButton label="." onClick={inputDecimal} />
      <OperationButton label="√" variant="special" onClick={() => void inputSqrt()} />
      <OperationButton
        label="="
        variant="operation"
        className="col-span-4"
        onClick={() => void inputEquals()}
      />
    </section>
  )
}
