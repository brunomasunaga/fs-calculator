import type { BinaryOperationSymbol } from '@/store/calculator/operations'

export type PendingOperation = {
  leftOperand: number
  operation: BinaryOperationSymbol
}

export type BinaryEvaluation = {
  leftOperand: number
  leftOperandText: string
  operation: BinaryOperationSymbol
  rightOperand: number
  rightOperandText: string
}

export type UnaryEvaluation = {
  target: 'entry' | 'leftOperand'
  value: number
  valueText: string
}

export type CalculatorState = {
  entry: string
  pendingOperation: PendingOperation | null
  resolvedExpression: string | null
}

export function createCalculatorState(): CalculatorState {
  return {
    entry: '0',
    pendingOperation: null,
    resolvedExpression: null,
  }
}

export function applyDigitInput(
  state: CalculatorState,
  digit: string,
): CalculatorState {
  return {
    ...clearResolvedExpression(state),
    entry: appendDigit(state.entry, digit),
  }
}

export function applyDecimalInput(state: CalculatorState): CalculatorState {
  return {
    ...clearResolvedExpression(state),
    entry: appendDecimal(state.entry),
  }
}

export function applyMinusInput(state: CalculatorState): CalculatorState {
  return {
    ...clearResolvedExpression(state),
    entry: prependNegativeSign(state.entry),
  }
}

export function applyBinaryOperationSelection(
  state: CalculatorState,
  operation: BinaryOperationSymbol,
): CalculatorState {
  const nextState = clearResolvedExpression(state)

  if (nextState.pendingOperation) {
    if (parseEntry(nextState.entry) === null) {
      return {
        ...nextState,
        pendingOperation: {
          ...nextState.pendingOperation,
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
    pendingOperation: {
      leftOperand: entryValue,
      operation,
    },
  }
}

export function applyBackspaceInput(state: CalculatorState): CalculatorState {
  const nextState = clearResolvedExpression(state)

  if (nextState.pendingOperation && nextState.entry === '') {
    return {
      ...nextState,
      entry: formatDisplay(nextState.pendingOperation.leftOperand),
      pendingOperation: null,
    }
  }

  return {
    ...nextState,
    entry: removeLastCharacter(
      nextState.entry,
      nextState.pendingOperation ? '' : '0',
    ),
  }
}

export function applyBinaryEvaluationResult(
  result: number,
  resolvedExpression: string | null,
  nextOperation?: BinaryOperationSymbol,
): CalculatorState {
  return {
    entry: nextOperation ? '' : formatDisplay(result),
    pendingOperation: nextOperation
      ? {
          leftOperand: result,
          operation: nextOperation,
        }
      : null,
    resolvedExpression,
  }
}

export function resolveIncompleteBinaryOperation(
  state: CalculatorState,
): CalculatorState {
  if (!state.pendingOperation) {
    return state
  }

  return {
    entry: formatDisplay(state.pendingOperation.leftOperand),
    pendingOperation: null,
    resolvedExpression: null,
  }
}

export function applyUnaryEvaluationResult(
  state: CalculatorState,
  result: number,
  resolvedExpression: string,
  target: UnaryEvaluation['target'],
): CalculatorState {
  if (target === 'leftOperand' && state.pendingOperation) {
    return {
      entry: state.entry,
      pendingOperation: {
        ...state.pendingOperation,
        leftOperand: result,
      },
      resolvedExpression,
    }
  }

  return {
    entry: formatDisplay(result),
    pendingOperation: state.pendingOperation,
    resolvedExpression,
  }
}

export function selectDisplay(state: CalculatorState) {
  if (!state.pendingOperation) {
    return state.entry || '0'
  }

  const leftOperandText = formatDisplay(state.pendingOperation.leftOperand)

  if (state.entry === '') {
    return `${leftOperandText} ${state.pendingOperation.operation}`
  }

  return `${leftOperandText} ${state.pendingOperation.operation} ${state.entry}`
}

export function getBinaryEvaluation(
  state: CalculatorState,
): BinaryEvaluation | null {
  if (!state.pendingOperation) {
    return null
  }

  const rightOperand = parseEntry(state.entry)

  if (rightOperand === null) {
    return null
  }

  return {
    leftOperand: state.pendingOperation.leftOperand,
    leftOperandText: formatDisplay(state.pendingOperation.leftOperand),
    operation: state.pendingOperation.operation,
    rightOperand,
    rightOperandText: state.entry,
  }
}

export function getUnaryEvaluation(
  state: CalculatorState,
): UnaryEvaluation | null {
  const entryValue = parseEntry(state.entry)

  if (entryValue !== null) {
    return {
      target: 'entry',
      value: entryValue,
      valueText: state.entry,
    }
  }

  if (state.pendingOperation && state.entry === '') {
    return {
      target: 'leftOperand',
      value: state.pendingOperation.leftOperand,
      valueText: formatDisplay(state.pendingOperation.leftOperand),
    }
  }

  return null
}

export function shouldTreatMinusAsNegativeSign(state: CalculatorState) {
  if (state.pendingOperation) {
    if (state.pendingOperation.operation === '-') {
      return false
    }

    return state.entry === '' || state.entry === '-'
  }

  return state.entry === '0' || state.entry === '' || state.entry === '-'
}

function clearResolvedExpression(state: CalculatorState) {
  return {
    ...state,
    resolvedExpression: null,
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
  if (entry === '' || entry === '-') {
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

const MAX_DECIMAL_PLACES = 5

function formatDisplay(value: number) {
  const str = value.toString()
  const dotIndex = str.indexOf('.')
  // Don't truncate scientific notation — only plain decimals
  if (
    dotIndex !== -1 &&
    !str.toLowerCase().includes('e') &&
    str.length > dotIndex + 1 + MAX_DECIMAL_PLACES
  ) {
    return str.slice(0, dotIndex + 1 + MAX_DECIMAL_PLACES)
  }
  return str
}
