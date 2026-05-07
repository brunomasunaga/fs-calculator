import {
  add,
  divide,
  multiply,
  percentage,
  power,
  sqrt,
  subtract,
} from '@/services/operations/operations'

type BinaryOperationDefinition = {
  execute: (leftOperand: number, rightOperand: number) => Promise<number>
  formatResolvedExpression: (
    leftOperandText: string,
    rightOperandText: string,
  ) => string
}

type UnaryOperationDefinition = {
  execute: (value: number) => Promise<number>
  formatResolvedExpression: (valueText: string) => string
}

const binaryOperations = {
  '+': {
    execute: add,
    formatResolvedExpression: (leftOperandText, rightOperandText) =>
      `${leftOperandText} + ${rightOperandText} =`,
  },
  '-': {
    execute: subtract,
    formatResolvedExpression: (leftOperandText, rightOperandText) =>
      `${leftOperandText} - ${rightOperandText} =`,
  },
  '×': {
    execute: multiply,
    formatResolvedExpression: (leftOperandText, rightOperandText) =>
      `${leftOperandText} × ${rightOperandText} =`,
  },
  '÷': {
    execute: divide,
    formatResolvedExpression: (leftOperandText, rightOperandText) =>
      `${leftOperandText} ÷ ${rightOperandText} =`,
  },
  '^': {
    execute: power,
    formatResolvedExpression: (leftOperandText, rightOperandText) =>
      `${leftOperandText} ^ ${rightOperandText} =`,
  },
  '%': {
    execute: percentage,
    formatResolvedExpression: (leftOperandText, rightOperandText) =>
      `${leftOperandText} % ${rightOperandText} =`,
  },
} as const satisfies Record<string, BinaryOperationDefinition>

const unaryOperations = {
  '√': {
    execute: sqrt,
    formatResolvedExpression: (valueText) => `√(${valueText}) =`,
  },
} as const satisfies Record<string, UnaryOperationDefinition>

export type BinaryOperationSymbol = keyof typeof binaryOperations
export type UnaryOperationSymbol = keyof typeof unaryOperations

export function executeBinaryOperation(
  operation: BinaryOperationSymbol,
  leftOperand: number,
  rightOperand: number,
) {
  return binaryOperations[operation].execute(leftOperand, rightOperand)
}

export function formatBinaryResolvedExpression(
  operation: BinaryOperationSymbol,
  leftOperandText: string,
  rightOperandText: string,
) {
  return binaryOperations[operation].formatResolvedExpression(
    leftOperandText,
    rightOperandText,
  )
}

export function executeUnaryOperation(
  operation: UnaryOperationSymbol,
  value: number,
) {
  return unaryOperations[operation].execute(value)
}

export function formatUnaryResolvedExpression(
  operation: UnaryOperationSymbol,
  valueText: string,
) {
  return unaryOperations[operation].formatResolvedExpression(valueText)
}
