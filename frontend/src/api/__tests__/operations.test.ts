import { beforeEach, describe, expect, it, vi } from 'vitest'

import client from '@/api/client'
import {
  add,
  divide,
  multiply,
  percentage,
  power,
  sqrt,
  subtract,
} from '@/api/operations'

vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn(),
  },
}))

const mockedClient = vi.mocked(client)

describe('operations api', () => {
  beforeEach(() => {
    mockedClient.post.mockReset()
  })

  it('posts binary operations to the expected endpoints', async () => {
    mockedClient.post
      .mockResolvedValueOnce({ data: { result: 3 } })
      .mockResolvedValueOnce({ data: { result: 1 } })
      .mockResolvedValueOnce({ data: { result: 8 } })
      .mockResolvedValueOnce({ data: { result: 2 } })
      .mockResolvedValueOnce({ data: { result: 9 } })

    await expect(add(1, 2)).resolves.toBe(3)
    await expect(subtract(3, 2)).resolves.toBe(1)
    await expect(multiply(4, 2)).resolves.toBe(8)
    await expect(divide(8, 4)).resolves.toBe(2)
    await expect(power(3, 2)).resolves.toBe(9)

    expect(mockedClient.post).toHaveBeenNthCalledWith(1, '/v1/operations/add', {
      operand_a: 1,
      operand_b: 2,
    })
    expect(mockedClient.post).toHaveBeenNthCalledWith(2, '/v1/operations/subtract', {
      operand_a: 3,
      operand_b: 2,
    })
    expect(mockedClient.post).toHaveBeenNthCalledWith(3, '/v1/operations/multiply', {
      operand_a: 4,
      operand_b: 2,
    })
    expect(mockedClient.post).toHaveBeenNthCalledWith(4, '/v1/operations/divide', {
      operand_a: 8,
      operand_b: 4,
    })
    expect(mockedClient.post).toHaveBeenNthCalledWith(5, '/v1/operations/power', {
      operand_a: 3,
      operand_b: 2,
    })
  })

  it('posts unary operations to the expected endpoints', async () => {
    mockedClient.post
      .mockResolvedValueOnce({ data: { result: 5 } })

    await expect(sqrt(25)).resolves.toBe(5)

    expect(mockedClient.post).toHaveBeenNthCalledWith(1, '/v1/operations/sqrt', {
      operand: 25,
    })
  })

  it('posts percentage as a binary operation', async () => {
    mockedClient.post.mockResolvedValueOnce({ data: { result: 45 } })

    await expect(percentage(50, 90)).resolves.toBe(45)

    expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/percentage', {
      operand_a: 50,
      operand_b: 90,
    })
  })

  it('preserves generic errors', async () => {
    mockedClient.post.mockRejectedValueOnce(new Error('network down'))

    await expect(add(1, 2)).rejects.toThrow('network down')
  })
})
