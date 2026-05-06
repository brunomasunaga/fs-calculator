import {
  createContext,
  type PropsWithChildren,
  startTransition,
  useContext,
  useState,
} from 'react'

import { calculate, type CalculatorOperation } from '@/api/calculator'

type BinaryOperation = Exclude<CalculatorOperation, 'sqrt' | 'percentage'>

type CalculatorContextValue = {
  display: string
  operandA: number | null
  operation: string | null
  waitingForOperandB: boolean
  error: string | null
  inputDigit: (digit: string) => void
  inputOperation: (operation: string) => void
  inputEquals: () => Promise<void>
  inputClear: () => void
  inputSqrt: () => Promise<void>
  inputPercentage: () => Promise<void>
  inputDecimal: () => void
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null)

const operationMap: Record<string, BinaryOperation> = {
  '+': 'add',
  '-': 'subtract',
  '×': 'multiply',
  '*': 'multiply',
  '÷': 'divide',
  '/': 'divide',
  '^': 'power',
}

export function CalculatorProvider({ children }: PropsWithChildren) {
  const [display, setDisplay] = useState('0')
  const [operandA, setOperandA] = useState<number | null>(null)
  const [operation, setOperation] = useState<BinaryOperation | null>(null)
  const [waitingForOperandB, setWaitingForOperandB] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputDigit = (digit: string) => {
    setError(null)

    if (waitingForOperandB) {
      setDisplay(digit)
      setWaitingForOperandB(false)
      return
    }

    setDisplay((currentDisplay) =>
      currentDisplay === '0' ? digit : `${currentDisplay}${digit}`,
    )
  }

  const inputOperation = (nextOperation: string) => {
    const mappedOperation = operationMap[nextOperation]
    if (!mappedOperation) {
      return
    }

    setError(null)
    setOperandA(parseDisplay(display))
    setOperation(mappedOperation)
    setWaitingForOperandB(true)
  }

  const inputEquals = async () => {
    if (!operation || operandA === null) {
      return
    }

    try {
      const result = await calculate(operation, operandA, parseDisplay(display))

      startTransition(() => {
        applyResolvedValue(result)
      })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  const inputClear = () => {
    setDisplay('0')
    setOperandA(null)
    setOperation(null)
    setWaitingForOperandB(false)
    setError(null)
  }

  const inputSqrt = async () => {
    await runUnaryOperation('sqrt')
  }

  const inputPercentage = async () => {
    await runUnaryOperation('percentage')
  }

  const inputDecimal = () => {
    setError(null)

    if (waitingForOperandB) {
      setDisplay('0.')
      setWaitingForOperandB(false)
      return
    }

    setDisplay((currentDisplay) =>
      currentDisplay.includes('.') ? currentDisplay : `${currentDisplay}.`,
    )
  }

  const runUnaryOperation = async (
    nextOperation: Extract<CalculatorOperation, 'sqrt' | 'percentage'>,
  ) => {
    try {
      const result = await calculate(nextOperation, parseDisplay(display))

      startTransition(() => {
        applyResolvedValue(result)
      })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  const applyResolvedValue = (value: number) => {
    setDisplay(formatDisplay(value))
    setOperandA(null)
    setOperation(null)
    setWaitingForOperandB(false)
    setError(null)
  }

  const value: CalculatorContextValue = {
    display,
    operandA,
    operation,
    waitingForOperandB,
    error,
    inputDigit,
    inputOperation,
    inputEquals,
    inputClear,
    inputSqrt,
    inputPercentage,
    inputDecimal,
  }

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  )
}

export function useCalculatorContext() {
  const context = useContext(CalculatorContext)

  if (!context) {
    throw new Error('useCalculatorContext must be used within CalculatorProvider')
  }

  return context
}

function parseDisplay(value: string) {
  return Number.parseFloat(value)
}

function formatDisplay(value: number) {
  return value.toString()
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
