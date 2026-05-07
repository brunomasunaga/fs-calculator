import { useCalculatorActions } from '@/store/calculator/store'

import { OperationButton } from '@/pages/calculator/components/OperationButton'

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
  } = useCalculatorActions()

  return (
    <section className="space-y-3 p-3">
      <div className="flex justify-end gap-2">
        <OperationButton
          label="xʸ"
          variant="advanced"
          onClick={() => void inputOperation('^')}
        />
        <OperationButton
          label="√"
          variant="advanced"
          onClick={() => void inputSqrt()}
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <OperationButton label="⌫" variant="special" onClick={inputBackspace} />
        <OperationButton label="AC" variant="special" onClick={inputClear} />
        <OperationButton
          label="%"
          variant="special"
          onClick={() => void inputPercentage()}
        />
        <OperationButton
          label="÷"
          variant="operation"
          onClick={() => void inputOperation('÷')}
        />

        <OperationButton label="7" onClick={() => inputDigit('7')} />
        <OperationButton label="8" onClick={() => inputDigit('8')} />
        <OperationButton label="9" onClick={() => inputDigit('9')} />
        <OperationButton
          label="×"
          variant="operation"
          onClick={() => void inputOperation('×')}
        />

        <OperationButton label="4" onClick={() => inputDigit('4')} />
        <OperationButton label="5" onClick={() => inputDigit('5')} />
        <OperationButton label="6" onClick={() => inputDigit('6')} />
        <OperationButton
          label="−"
          variant="operation"
          onClick={() => void inputMinus()}
        />

        <OperationButton label="1" onClick={() => inputDigit('1')} />
        <OperationButton label="2" onClick={() => inputDigit('2')} />
        <OperationButton label="3" onClick={() => inputDigit('3')} />
        <OperationButton
          label="+"
          variant="operation"
          onClick={() => void inputOperation('+')}
        />

        <OperationButton
          label="0"
          className="col-span-2 justify-start px-6"
          shape="pill"
          onClick={() => inputDigit('0')}
        />
        <OperationButton label="." onClick={inputDecimal} />
        <OperationButton
          label="="
          variant="operation"
          onClick={() => void inputEquals()}
        />
      </div>
    </section>
  )
}
