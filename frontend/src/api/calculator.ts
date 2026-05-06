import axios from 'axios'

import client from '@/api/client'

export interface BinaryOperationRequest {
  operand_a: number
  operand_b: number
}

export interface UnaryOperationRequest {
  operand: number
}

export interface CalculateResponse {
  result: number
}

export interface ErrorResponse {
  error: string
}

export type CalculatorOperation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'power'
  | 'sqrt'
  | 'percentage'

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

export async function percentage(a: number): Promise<number> {
  return postUnary('/v1/operations/percentage', { operand: a })
}

export async function calculate(
  operation: CalculatorOperation,
  a: number,
  b?: number,
): Promise<number> {
  switch (operation) {
    case 'add':
      return add(a, b ?? 0)
    case 'subtract':
      return subtract(a, b ?? 0)
    case 'multiply':
      return multiply(a, b ?? 0)
    case 'divide':
      return divide(a, b ?? 0)
    case 'power':
      return power(a, b ?? 0)
    case 'sqrt':
      return sqrt(a)
    case 'percentage':
      return percentage(a)
  }
}

async function postBinary(
  path: string,
  payload: BinaryOperationRequest,
): Promise<number> {
  try {
    const response = await client.post<CalculateResponse>(path, payload)
    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}

async function postUnary(
  path: string,
  payload: UnaryOperationRequest,
): Promise<number> {
  try {
    const response = await client.post<CalculateResponse>(path, payload)
    return response.data.result
  } catch (error) {
    throw normalizeApiError(error)
  }
}

function normalizeApiError(error: unknown): Error {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return new Error(error.response?.data?.error ?? error.message)
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Unexpected error')
}
