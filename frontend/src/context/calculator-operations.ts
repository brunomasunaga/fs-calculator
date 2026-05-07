import {
  add,
  divide,
  multiply,
  percentage,
  power,
  sqrt,
  subtract,
} from '@/api/operations'

type BinaryOperationDefinition = {
  execute: (a: number, b: number) => Promise<number>
  formatResolvedExpression: (lhsText: string, rhsText: string) => string
}

type UnaryOperationDefinition = {
  execute: (value: number) => Promise<number>
  formatResolvedExpression: (valueText: string) => string
}

const binaryOperations = {
  '+': {
    execute: add,
    formatResolvedExpression: (lhsText, rhsText) => `${lhsText} + ${rhsText} =`,
  },
  '-': {
    execute: subtract,
    formatResolvedExpression: (lhsText, rhsText) => `${lhsText} - ${rhsText} =`,
  },
  '×': {
    execute: multiply,
    formatResolvedExpression: (lhsText, rhsText) => `${lhsText} × ${rhsText} =`,
  },
  '÷': {
    execute: divide,
    formatResolvedExpression: (lhsText, rhsText) => `${lhsText} ÷ ${rhsText} =`,
  },
  '^': {
    execute: power,
    formatResolvedExpression: (lhsText, rhsText) => `${lhsText} ^ ${rhsText} =`,
  },
  '%': {
    execute: percentage,
    formatResolvedExpression: (lhsText, rhsText) => `${lhsText} % ${rhsText} =`,
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
  lhs: number,
  rhs: number,
) {
  return binaryOperations[operation].execute(lhs, rhs)
}

export function formatBinaryResolvedExpression(
  operation: BinaryOperationSymbol,
  lhsText: string,
  rhsText: string,
) {
  return binaryOperations[operation].formatResolvedExpression(lhsText, rhsText)
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
