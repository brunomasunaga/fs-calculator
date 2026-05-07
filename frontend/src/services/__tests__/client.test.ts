import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'

import { normalizeClientError } from '@/services/client'

describe('api client', () => {
  it('normalizes axios api errors', () => {
    const error = new AxiosError(
      'Request failed',
      undefined,
      undefined,
      undefined,
      {
        data: {
          error: 'division by zero',
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
      },
    )

    expect(normalizeClientError(error)).toEqual(new Error('division by zero'))
  })

  it('preserves generic errors', () => {
    const error = new Error('network down')

    expect(normalizeClientError(error)).toBe(error)
  })

  it('normalizes unknown failures', () => {
    expect(normalizeClientError('boom')).toEqual(new Error('Unexpected error'))
  })
})
