import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import {
  type BinaryOperationSymbol,
  executeBinaryOperation,
  executeUnaryOperation,
  formatBinaryResolvedExpression,
  formatUnaryResolvedExpression,
} from '@/store/calculator/operations'
import {
  applyBackspaceInput,
  applyBinaryEvaluationResult,
  applyBinaryOperationSelection,
  applyDecimalInput,
  applyDigitInput,
  applyMinusInput,
  applyUnaryEvaluationResult,
  createCalculatorState,
  getBinaryEvaluation,
  getUnaryEvaluation,
  resolveIncompleteBinaryOperation,
  selectDisplay,
  shouldTreatMinusAsNegativeSign,
  type CalculatorState,
} from '@/store/calculator/state'

type StandardBinaryOperationSymbol = Exclude<BinaryOperationSymbol, '-'>

type CalculatorStore = CalculatorState & {
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

export const useCalculatorStore = create<CalculatorStore>((set, get) => {
  const clearError = () => {
    set({ error: null })
  }

  const applyError = (message: string) => {
    set({ error: message })
  }

  const applyInput = (update: (state: CalculatorState) => CalculatorState) => {
    set((state) => ({
      ...update(state),
      error: null,
    }))
  }

  const runEvaluation = async <T>(
    evaluate: () => Promise<T>,
    applyResult: (result: T) => void,
  ) => {
    clearError()

    try {
      applyResult(await evaluate())
    } catch (error) {
      applyError(getErrorMessage(error))
    }
  }

  const applyBinaryEvaluation = (
    result: number,
    resolvedExpression: string,
    nextOperation?: BinaryOperationSymbol,
  ) => {
    if (result == null || !Number.isFinite(result)) {
      set({ error: 'Result overflow' })
      return
    }
    set({
      ...applyBinaryEvaluationResult(result, resolvedExpression, nextOperation),
      error: null,
    })
  }

  const handleBinaryOperation = async (operation: BinaryOperationSymbol) => {
    const currentState = get()

    // After an error, don't retry the failing computation — reset to the left operand
    if (currentState.error) {
      const leftOperand = currentState.pendingOperation?.leftOperand
      set({
        entry: '',
        pendingOperation:
          leftOperand !== undefined ? { leftOperand, operation } : null,
        resolvedExpression: null,
        error: null,
      })
      return
    }

    const binaryEvaluation = getBinaryEvaluation(currentState)

    if (!binaryEvaluation) {
      applyInput((state) => applyBinaryOperationSelection(state, operation))
      return
    }

    await runEvaluation(
      () =>
        executeBinaryOperation(
          binaryEvaluation.operation,
          binaryEvaluation.leftOperand,
          binaryEvaluation.rightOperand,
        ),
      (result) => {
        applyBinaryEvaluation(
          result,
          formatBinaryResolvedExpression(
            binaryEvaluation.operation,
            binaryEvaluation.leftOperandText,
            binaryEvaluation.rightOperandText,
          ),
          operation,
        )
      },
    )
  }

  return {
    ...createCalculatorState(),
    error: null,
    inputDigit: (digit) => {
      applyInput((state) => applyDigitInput(state, digit))
    },
    inputOperation: async (operation) => {
      await handleBinaryOperation(operation)
    },
    inputMinus: async () => {
      if (shouldTreatMinusAsNegativeSign(get())) {
        applyInput(applyMinusInput)
        return
      }

      await handleBinaryOperation('-')
    },
    inputEquals: async () => {
      const state = get()

      if (!state.pendingOperation) {
        return
      }

      const binaryEvaluation = getBinaryEvaluation(state)

      if (!binaryEvaluation) {
        applyInput(resolveIncompleteBinaryOperation)
        return
      }

      await runEvaluation(
        () =>
          executeBinaryOperation(
            binaryEvaluation.operation,
            binaryEvaluation.leftOperand,
            binaryEvaluation.rightOperand,
          ),
        (result) => {
          applyBinaryEvaluation(
            result,
            formatBinaryResolvedExpression(
              binaryEvaluation.operation,
              binaryEvaluation.leftOperandText,
              binaryEvaluation.rightOperandText,
            ),
          )
        },
      )
    },
    inputClear: () => {
      applyInput(() => createCalculatorState())
    },
    inputBackspace: () => {
      applyInput(applyBackspaceInput)
    },
    inputSqrt: async () => {
      const unaryEvaluation = getUnaryEvaluation(get())

      if (!unaryEvaluation) {
        return
      }

      await runEvaluation(
        () => executeUnaryOperation('√', unaryEvaluation.value),
        (result) => {
          set((state) => ({
            ...applyUnaryEvaluationResult(
              state,
              result,
              formatUnaryResolvedExpression('√', unaryEvaluation.valueText),
              unaryEvaluation.target,
            ),
            error: null,
          }))
        },
      )
    },
    inputPercentage: async () => {
      await handleBinaryOperation('%')
    },
    inputDecimal: () => {
      applyInput(applyDecimalInput)
    },
  }
})

export function useCalculatorView() {
  return useCalculatorStore(
    useShallow((state) => ({
      display: selectDisplay(state),
      resolvedExpression: state.resolvedExpression,
      error: state.error,
    })),
  )
}

export function useCalculatorActions() {
  return useCalculatorStore(
    useShallow((state) => ({
      inputDigit: state.inputDigit,
      inputOperation: state.inputOperation,
      inputMinus: state.inputMinus,
      inputEquals: state.inputEquals,
      inputClear: state.inputClear,
      inputBackspace: state.inputBackspace,
      inputSqrt: state.inputSqrt,
      inputPercentage: state.inputPercentage,
      inputDecimal: state.inputDecimal,
    })),
  )
}

export function resetCalculatorStore() {
  useCalculatorStore.setState({
    ...createCalculatorState(),
    error: null,
  })
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
