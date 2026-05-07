import {
  createContext,
  type PropsWithChildren,
  startTransition,
  useContext,
  useReducer,
  useRef,
} from 'react'

import {
  type BinaryOperationSymbol,
  executeBinaryOperation,
  executeUnaryOperation,
  formatBinaryResolvedExpression,
  formatUnaryResolvedExpression,
} from '@/context/calculator-operations'
import {
  calculatorReducer,
  getBinaryEvaluationRequest,
  getUnaryEvaluationTarget,
  initialCalculatorState,
  selectDisplay,
  selectError,
  selectResolvedExpression,
  shouldTreatMinusAsNegativeSign,
} from '@/context/calculator-state'

type StandardBinaryOperationSymbol = Exclude<BinaryOperationSymbol, '-'>

type CalculatorContextValue = {
  display: string
  resolvedExpression: string | null
  error: string | null
  inputDigit: (digit: string) => void
  inputOperation: (operation: StandardBinaryOperationSymbol) => Promise<void>
  inputMinus: () => Promise<void>
  inputEquals: () => Promise<void>
  inputClear: () => void
  inputBackspace: () => void
  inputSqrt: () => Promise<void>
  inputPercentage: () => Promise<void>
  inputDecimal: () => void
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null)

export function CalculatorProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    calculatorReducer,
    initialCalculatorState,
  )
  const requestVersionRef = useRef(0)

  const invalidatePendingRequests = () => {
    requestVersionRef.current += 1
  }

  const beginEvaluation = () => {
    const nextRequestVersion = requestVersionRef.current + 1
    requestVersionRef.current = nextRequestVersion
    dispatch({ type: 'evaluation-started' })
    return nextRequestVersion
  }

  const isCurrentRequest = (requestVersion: number) =>
    requestVersionRef.current === requestVersion

  const inputDigit = (digit: string) => {
    invalidatePendingRequests()
    dispatch({ type: 'digit-input', digit })
  }

  const inputOperation = async (operation: BinaryOperationSymbol) => {
    const pendingRequest = getBinaryEvaluationRequest(state)

    if (!pendingRequest) {
      invalidatePendingRequests()
      dispatch({ type: 'binary-operation-selected', operation })
      return
    }

    const requestVersion = beginEvaluation()

    try {
      const result = await executeBinaryOperation(
        pendingRequest.operation,
        pendingRequest.lhs,
        pendingRequest.rhs,
      )

      if (!isCurrentRequest(requestVersion)) {
        return
      }

      startTransition(() => {
        dispatch({
          type: 'binary-evaluation-succeeded',
          result,
          resolvedExpression: formatBinaryResolvedExpression(
            pendingRequest.operation,
            pendingRequest.lhsText,
            pendingRequest.rhsText,
          ),
          nextOperation: operation,
        })
      })
    } catch (requestError) {
      if (!isCurrentRequest(requestVersion)) {
        return
      }

      startTransition(() => {
        dispatch({
          type: 'evaluation-failed',
          error: getErrorMessage(requestError),
        })
      })
    }
  }

  const inputEquals = async () => {
    const pendingBinary = state.pendingBinary

    if (!pendingBinary) {
      return
    }

    const pendingRequest = getBinaryEvaluationRequest(state)

    if (!pendingRequest) {
      invalidatePendingRequests()
      startTransition(() => {
        dispatch({
          type: 'binary-evaluation-resolved-locally',
          value: pendingBinary.lhs,
        })
      })
      return
    }

    const requestVersion = beginEvaluation()

    try {
      const result = await executeBinaryOperation(
        pendingRequest.operation,
        pendingRequest.lhs,
        pendingRequest.rhs,
      )

      if (!isCurrentRequest(requestVersion)) {
        return
      }

      startTransition(() => {
        dispatch({
          type: 'binary-evaluation-succeeded',
          result,
          resolvedExpression: formatBinaryResolvedExpression(
            pendingRequest.operation,
            pendingRequest.lhsText,
            pendingRequest.rhsText,
          ),
        })
      })
    } catch (requestError) {
      if (!isCurrentRequest(requestVersion)) {
        return
      }

      startTransition(() => {
        dispatch({
          type: 'evaluation-failed',
          error: getErrorMessage(requestError),
        })
      })
    }
  }

  const inputClear = () => {
    invalidatePendingRequests()
    dispatch({ type: 'clear-input' })
  }

  const inputBackspace = () => {
    invalidatePendingRequests()
    dispatch({ type: 'backspace-input' })
  }

  const inputDecimal = () => {
    invalidatePendingRequests()
    dispatch({ type: 'decimal-input' })
  }

  const inputMinus = async () => {
    if (shouldTreatMinusAsNegativeSign(state)) {
      invalidatePendingRequests()
      dispatch({ type: 'minus-input' })
      return
    }

    await inputOperation('-')
  }

  const inputSqrt = async () => {
    const target = getUnaryEvaluationTarget(state)

    if (!target) {
      return
    }

    const requestVersion = beginEvaluation()

    try {
      const result = await executeUnaryOperation('√', target.value)

      if (!isCurrentRequest(requestVersion)) {
        return
      }

      startTransition(() => {
        dispatch({
          type: 'unary-evaluation-succeeded',
          result,
          resolvedExpression: formatUnaryResolvedExpression(
            '√',
            target.valueText,
          ),
          target: target.target,
        })
      })
    } catch (requestError) {
      if (!isCurrentRequest(requestVersion)) {
        return
      }

      startTransition(() => {
        dispatch({
          type: 'evaluation-failed',
          error: getErrorMessage(requestError),
        })
      })
    }
  }

  const inputPercentage = async () => {
    await inputOperation('%')
  }

  const value: CalculatorContextValue = {
    display: selectDisplay(state),
    resolvedExpression: selectResolvedExpression(state),
    error: selectError(state),
    inputDigit,
    inputOperation,
    inputMinus,
    inputEquals,
    inputClear,
    inputBackspace,
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
