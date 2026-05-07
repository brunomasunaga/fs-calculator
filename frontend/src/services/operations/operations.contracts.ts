export interface BinaryOperationRequest {
  operand_a: number
  operand_b: number
}

export interface UnaryOperationRequest {
  operand: number
}

export interface OperationResponse {
  result: number
}

export type Operation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'power'
  | 'sqrt'
  | 'percentage'
