import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'

import client, { normalizeClientError } from '@/services/client'

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

  it('falls back to the axios message when the api does not return an error payload', () => {
    const error = new AxiosError('Network Error')

    expect(normalizeClientError(error)).toEqual(new Error('Network Error'))
  })

  it('passes successful responses through the configured interceptor', async () => {
    const response = await client.get('/health', {
      adapter: async (config) => ({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
    })

    expect(response.data).toEqual({ status: 'ok' })
  })

  it('normalizes rejected responses through the configured interceptor', async () => {
    await expect(
      client.get('/health', {
        adapter: async () => Promise.reject(new AxiosError('Network Error')),
      }),
    ).rejects.toEqual(new Error('Network Error'))
  })

  it('preserves generic errors', () => {
    const error = new Error('network down')

    expect(normalizeClientError(error)).toBe(error)
  })

  it('normalizes unknown failures', () => {
    expect(normalizeClientError('boom')).toEqual(new Error('Unexpected error'))
  })
})
