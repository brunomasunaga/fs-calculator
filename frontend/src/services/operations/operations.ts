import client from '@/services/client'
import {
  type BinaryOperationRequest,
  type OperationResponse,
  type UnaryOperationRequest,
} from '@/services/operations/operations.contracts'

export async function add(a: number, b: number): Promise<number> {
  return postBinary('/v1/operations/add', { operand_a: a, operand_b: b })
}

export async function subtract(a: number, b: number): Promise<number> {
  return postBinary('/v1/operations/subtract', { operand_a: a, operand_b: b })
}

export async function multiply(a: number, b: number): Promise<number> {
  return postBinary('/v1/operations/multiply', { operand_a: a, operand_b: b })
}

export async function divide(a: number, b: number): Promise<number> {
  return postBinary('/v1/operations/divide', { operand_a: a, operand_b: b })
}

export async function power(a: number, b: number): Promise<number> {
  return postBinary('/v1/operations/power', { operand_a: a, operand_b: b })
}

export async function sqrt(a: number): Promise<number> {
  return postUnary('/v1/operations/sqrt', { operand: a })
}

export async function percentage(a: number, b: number): Promise<number> {
  return postBinary('/v1/operations/percentage', { operand_a: a, operand_b: b })
}

async function postBinary(
  path: string,
  payload: BinaryOperationRequest,
): Promise<number> {
  const response = await client.post<OperationResponse>(path, payload)
  return response.data.result
}

async function postUnary(
  path: string,
  payload: UnaryOperationRequest,
): Promise<number> {
  const response = await client.post<OperationResponse>(path, payload)
  return response.data.result
}
