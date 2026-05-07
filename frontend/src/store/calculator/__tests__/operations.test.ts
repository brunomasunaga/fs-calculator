import { beforeEach, describe, expect, it, vi } from 'vitest'

import client from '@/services/client'
import {
  executeBinaryOperation,
  executeUnaryOperation,
  formatBinaryResolvedExpression,
  formatUnaryResolvedExpression,
} from '@/store/calculator/operations'

vi.mock('@/services/client', () => ({
  default: {
    post: vi.fn(),
  },
}))

const mockedClient = vi.mocked(client)

describe('calculator operations', () => {
  beforeEach(() => {
    mockedClient.post.mockReset()
  })

  it('routes binary operation symbols to the expected api requests', async () => {
    mockedClient.post
      .mockResolvedValueOnce({ data: { result: 3 } })
      .mockResolvedValueOnce({ data: { result: 8 } })
      .mockResolvedValueOnce({ data: { result: 15 } })
      .mockResolvedValueOnce({ data: { result: 5 } })
      .mockResolvedValueOnce({ data: { result: 32 } })
      .mockResolvedValueOnce({ data: { result: 2 } })

    await expect(executeBinaryOperation('+', 1, 2)).resolves.toBe(3)
    await expect(executeBinaryOperation('-', 10, 2)).resolves.toBe(8)
    await expect(executeBinaryOperation('×', 3, 5)).resolves.toBe(15)
    await expect(executeBinaryOperation('÷', 10, 2)).resolves.toBe(5)
    await expect(executeBinaryOperation('^', 2, 5)).resolves.toBe(32)
    await expect(executeBinaryOperation('%', 50, 4)).resolves.toBe(2)

    expect(mockedClient.post).toHaveBeenNthCalledWith(1, '/v1/operations/add', {
      operand_a: 1,
      operand_b: 2,
    })
    expect(mockedClient.post).toHaveBeenNthCalledWith(
      2,
      '/v1/operations/subtract',
      {
        operand_a: 10,
        operand_b: 2,
      },
    )
    expect(mockedClient.post).toHaveBeenNthCalledWith(
      3,
      '/v1/operations/multiply',
      {
        operand_a: 3,
        operand_b: 5,
      },
    )
    expect(mockedClient.post).toHaveBeenNthCalledWith(
      4,
      '/v1/operations/divide',
      {
        operand_a: 10,
        operand_b: 2,
      },
    )
    expect(mockedClient.post).toHaveBeenNthCalledWith(
      5,
      '/v1/operations/power',
      {
        operand_a: 2,
        operand_b: 5,
      },
    )
    expect(mockedClient.post).toHaveBeenNthCalledWith(
      6,
      '/v1/operations/percentage',
      {
        operand_a: 50,
        operand_b: 4,
      },
    )
  })

  it('routes unary operation symbols to the expected api requests', async () => {
    mockedClient.post.mockResolvedValueOnce({ data: { result: 4 } })

    await expect(executeUnaryOperation('√', 16)).resolves.toBe(4)

    expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/sqrt', {
      operand: 16,
    })
  })

  it('formats resolved expressions for binary and unary operations', () => {
    expect(formatBinaryResolvedExpression('+', '-12', '3')).toBe('-12 + 3 =')
    expect(formatBinaryResolvedExpression('-', '10', '2')).toBe('10 - 2 =')
    expect(formatBinaryResolvedExpression('×', '3', '5')).toBe('3 × 5 =')
    expect(formatBinaryResolvedExpression('÷', '10', '2')).toBe('10 ÷ 2 =')
    expect(formatBinaryResolvedExpression('^', '2', '5')).toBe('2 ^ 5 =')
    expect(formatBinaryResolvedExpression('%', '50', '4')).toBe('50 % 4 =')
    expect(formatUnaryResolvedExpression('√', '-12')).toBe('√(-12) =')
  })
})
