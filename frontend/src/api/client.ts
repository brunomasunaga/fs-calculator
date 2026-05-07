import axios from 'axios'

export interface ApiErrorResponse {
  error: string
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeClientError(error)),
)

export default client

export function normalizeClientError(error: unknown): Error {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return new Error(error.response?.data?.error ?? error.message)
  }

  if (error instanceof Error) {
    return error
  }

  return new Error('Unexpected error')
}
