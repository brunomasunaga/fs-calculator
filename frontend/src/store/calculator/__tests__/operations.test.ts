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
      .mockResolvedValueOnce({ data: { result: 2 } })

    await expect(executeBinaryOperation('+', 1, 2)).resolves.toBe(3)
    await expect(executeBinaryOperation('%', 50, 4)).resolves.toBe(2)

    expect(mockedClient.post).toHaveBeenNthCalledWith(1, '/v1/operations/add', {
      operand_a: 1,
      operand_b: 2,
    })
    expect(mockedClient.post).toHaveBeenNthCalledWith(
      2,
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
    expect(formatUnaryResolvedExpression('√', '-12')).toBe('√(-12) =')
  })
})
