import type { BinaryOperationSymbol } from '@/context/calculator-operations'

export type PendingBinaryOperation = {
  lhs: number
  operation: BinaryOperationSymbol
}

export type CalculatorState = {
  entry: string
  pendingBinary: PendingBinaryOperation | null
  resolvedExpression: string | null
  error: string | null
  status: 'idle' | 'evaluating'
}

type CalculatorAction =
  | { type: 'digit-input'; digit: string }
  | { type: 'decimal-input' }
  | { type: 'minus-input' }
  | { type: 'binary-operation-selected'; operation: BinaryOperationSymbol }
  | { type: 'clear-input' }
  | { type: 'backspace-input' }
  | { type: 'evaluation-started' }
  | {
      type: 'binary-evaluation-succeeded'
      result: number
      resolvedExpression?: string | null
      nextOperation?: BinaryOperationSymbol
    }
  | { type: 'binary-evaluation-resolved-locally'; value: number }
  | {
      type: 'unary-evaluation-succeeded'
      result: number
      resolvedExpression: string
      target: 'entry' | 'lhs'
    }
  | { type: 'evaluation-failed'; error: string }

export const initialCalculatorState: CalculatorState = {
  entry: '0',
  pendingBinary: null,
  resolvedExpression: null,
  error: null,
  status: 'idle',
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case 'digit-input':
      return {
        ...clearTransientState(state),
        entry: appendDigit(state.entry, action.digit),
      }
    case 'decimal-input':
      return {
        ...clearTransientState(state),
        entry: appendDecimal(state.entry),
      }
    case 'minus-input':
      return {
        ...clearTransientState(state),
        entry: prependNegativeSign(state.entry),
      }
    case 'binary-operation-selected':
      return selectBinaryOperation(state, action.operation)
    case 'clear-input':
      return initialCalculatorState
    case 'backspace-input':
      return backspaceInput(state)
    case 'evaluation-started':
      return {
        ...state,
        resolvedExpression: null,
        error: null,
        status: 'evaluating',
      }
    case 'binary-evaluation-succeeded':
      return {
        entry: action.nextOperation ? '' : formatDisplay(action.result),
        pendingBinary: action.nextOperation
          ? {
              lhs: action.result,
              operation: action.nextOperation,
            }
          : null,
        resolvedExpression: action.resolvedExpression ?? null,
        error: null,
        status: 'idle',
      }
    case 'binary-evaluation-resolved-locally':
      return {
        entry: formatDisplay(action.value),
        pendingBinary: null,
        resolvedExpression: null,
        error: null,
        status: 'idle',
      }
    case 'unary-evaluation-succeeded':
      if (action.target === 'lhs' && state.pendingBinary) {
        return {
          entry: state.entry,
          pendingBinary: {
            ...state.pendingBinary,
            lhs: action.result,
          },
          resolvedExpression: action.resolvedExpression,
          error: null,
          status: 'idle',
        }
      }

      return {
        entry: formatDisplay(action.result),
        pendingBinary: state.pendingBinary,
        resolvedExpression: action.resolvedExpression,
        error: null,
        status: 'idle',
      }
    case 'evaluation-failed':
      return {
        ...state,
        resolvedExpression: null,
        error: action.error,
        status: 'idle',
      }
  }
}

export function selectDisplay(state: CalculatorState) {
  if (!state.pendingBinary) {
    return state.entry || '0'
  }

  const lhsText = formatDisplay(state.pendingBinary.lhs)

  if (state.entry === '') {
    return `${lhsText} ${state.pendingBinary.operation}`
  }

  return `${lhsText} ${state.pendingBinary.operation} ${state.entry}`
}

export function selectResolvedExpression(state: CalculatorState) {
  return state.resolvedExpression
}

export function selectError(state: CalculatorState) {
  return state.error
}

export function getBinaryEvaluationRequest(state: CalculatorState) {
  if (!state.pendingBinary) {
    return null
  }

  const rhs = parseEntry(state.entry)

  if (rhs === null) {
    return null
  }

  return {
    lhs: state.pendingBinary.lhs,
    lhsText: formatDisplay(state.pendingBinary.lhs),
    operation: state.pendingBinary.operation,
    rhs,
    rhsText: state.entry,
  }
}

export function getUnaryEvaluationTarget(state: CalculatorState) {
  const entryValue = parseEntry(state.entry)

  if (entryValue !== null) {
    return {
      target: 'entry' as const,
      value: entryValue,
      valueText: state.entry,
    }
  }

  if (state.pendingBinary && state.entry === '') {
    return {
      target: 'lhs' as const,
      value: state.pendingBinary.lhs,
      valueText: formatDisplay(state.pendingBinary.lhs),
    }
  }

  return null
}

export function shouldTreatMinusAsNegativeSign(state: CalculatorState) {
  if (state.pendingBinary) {
    if (state.pendingBinary.operation === '-') {
      return false
    }

    return state.entry === '' || state.entry === '-'
  }

  return state.entry === '0' || state.entry === '' || state.entry === '-'
}

function selectBinaryOperation(
  state: CalculatorState,
  operation: BinaryOperationSymbol,
) {
  const nextState = clearTransientState(state)

  if (nextState.pendingBinary) {
    if (parseEntry(nextState.entry) === null) {
      return {
        ...nextState,
        pendingBinary: {
          ...nextState.pendingBinary,
          operation,
        },
      }
    }

    return nextState
  }

  const entryValue = parseEntry(nextState.entry)

  if (entryValue === null) {
    return nextState
  }

  return {
    ...nextState,
    entry: '',
    pendingBinary: {
      lhs: entryValue,
      operation,
    },
  }
}

function backspaceInput(state: CalculatorState) {
  const nextState = clearTransientState(state)

  if (nextState.pendingBinary && nextState.entry === '') {
    return {
      ...nextState,
      entry: formatDisplay(nextState.pendingBinary.lhs),
      pendingBinary: null,
    }
  }

  return {
    ...nextState,
    entry: removeLastCharacter(
      nextState.entry,
      nextState.pendingBinary ? '' : '0',
    ),
  }
}

function clearTransientState(state: CalculatorState) {
  return {
    ...state,
    resolvedExpression: null,
    error: null,
    status: 'idle' as const,
  }
}

function appendDigit(entry: string, digit: string) {
  if (entry === '0') {
    return digit
  }

  if (entry === '-0') {
    return `-${digit}`
  }

  return `${entry}${digit}`
}

function appendDecimal(entry: string) {
  if (entry.includes('.')) {
    return entry
  }

  if (entry === '' || entry === '0') {
    return '0.'
  }

  if (entry === '-') {
    return '-0.'
  }

  return `${entry}.`
}

function prependNegativeSign(entry: string) {
  if (entry === '-' || entry.startsWith('-')) {
    return entry
  }

  if (entry === '0' || entry === '') {
    return '-'
  }

  return `-${entry}`
}

function removeLastCharacter(entry: string, fallback: string) {
  if (entry === '') {
    return fallback
  }

  if (entry === '-') {
    return fallback
  }

  const nextEntry = entry.slice(0, -1)

  return nextEntry === '' ? fallback : nextEntry
}

function parseEntry(entry: string) {
  if (entry === '' || entry === '-' || entry === '.' || entry === '-.') {
    return null
  }

  const parsedValue = Number.parseFloat(entry)
  return Number.isNaN(parsedValue) ? null : parsedValue
}

function formatDisplay(value: number) {
  return value.toString()
}
