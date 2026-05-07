import { useCalculatorContext } from '@/context/CalculatorContext'

import { OperationButton } from '@/pages/calculator/OperationButton'

export function Keypad() {
  const {
    inputDigit,
    inputOperation,
    inputMinus,
    inputEquals,
    inputClear,
    inputBackspace,
    inputSqrt,
    inputPercentage,
    inputDecimal,
  } = useCalculatorContext()

  return (
    <section className="grid grid-cols-4 gap-3">
      <OperationButton label="C" variant="special" onClick={inputClear} />
      <OperationButton label="⌫" variant="special" onClick={inputBackspace} />
      <OperationButton
        label="^"
        variant="special"
        onClick={() => void inputOperation('^')}
      />
      <OperationButton
        label="%"
        variant="special"
        onClick={() => void inputPercentage()}
      />

      <OperationButton label="7" onClick={() => inputDigit('7')} />
      <OperationButton label="8" onClick={() => inputDigit('8')} />
      <OperationButton label="9" onClick={() => inputDigit('9')} />
      <OperationButton
        label="÷"
        variant="operation"
        onClick={() => void inputOperation('÷')}
      />

      <OperationButton label="4" onClick={() => inputDigit('4')} />
      <OperationButton label="5" onClick={() => inputDigit('5')} />
      <OperationButton label="6" onClick={() => inputDigit('6')} />
      <OperationButton
        label="×"
        variant="operation"
        onClick={() => void inputOperation('×')}
      />

      <OperationButton label="1" onClick={() => inputDigit('1')} />
      <OperationButton label="2" onClick={() => inputDigit('2')} />
      <OperationButton label="3" onClick={() => inputDigit('3')} />
      <OperationButton
        label="-"
        variant="operation"
        onClick={() => void inputMinus()}
      />

      <OperationButton label="0" onClick={() => inputDigit('0')} />
      <OperationButton label="." onClick={inputDecimal} />
      <OperationButton
        label="√"
        variant="special"
        onClick={() => void inputSqrt()}
      />
      <OperationButton
        label="+"
        variant="operation"
        onClick={() => void inputOperation('+')}
      />

      <OperationButton
        label="="
        variant="operation"
        className="col-span-4"
        onClick={() => void inputEquals()}
      />
    </section>
  )
}
