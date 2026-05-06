import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import client from '@/api/client'
import {
  CalculatorProvider,
  useCalculatorContext,
} from '@/context/CalculatorContext'

vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn(),
  },
}))

const mockedClient = vi.mocked(client)

function Harness() {
  const context = useCalculatorContext()

  return (
    <div>
      <output data-testid="display">{context.display}</output>
      <output data-testid="operand-a">
        {context.operandA === null ? 'null' : context.operandA}
      </output>
      <output data-testid="operation">{context.operation ?? 'null'}</output>
      <output data-testid="waiting">
        {context.waitingForOperandB ? 'true' : 'false'}
      </output>
      <output data-testid="error">{context.error ?? 'null'}</output>

      <button onClick={() => context.inputDigit('1')}>digit-1</button>
      <button onClick={() => context.inputDigit('2')}>digit-2</button>
      <button onClick={() => context.inputOperation('+')}>add</button>
      <button onClick={() => void context.inputEquals()}>equals</button>
      <button onClick={() => context.inputClear()}>clear</button>
      <button onClick={() => void context.inputPercentage()}>percentage</button>
    </div>
  )
}

function renderHarness() {
  return render(
    <CalculatorProvider>
      <Harness />
    </CalculatorProvider>,
  )
}

describe('CalculatorContext', () => {
  beforeEach(() => {
    mockedClient.post.mockReset()
  })

  it('builds the display from digit input', () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))

    expect(screen.getByTestId('display')).toHaveTextContent('12')
  })

  it('stores the selected operation and waits for the second operand', () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))

    expect(screen.getByTestId('operand-a')).toHaveTextContent('1')
    expect(screen.getByTestId('operation')).toHaveTextContent('add')
    expect(screen.getByTestId('waiting')).toHaveTextContent('true')
  })

  it('calls the API client when resolving equals', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: 42,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith('/api/v1/add', {
        operand_a: 1,
        operand_b: 2,
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('42')
    })
  })

  it('resets state on clear', () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('clear'))

    expect(screen.getByTestId('display')).toHaveTextContent('0')
    expect(screen.getByTestId('operand-a')).toHaveTextContent('null')
    expect(screen.getByTestId('operation')).toHaveTextContent('null')
    expect(screen.getByTestId('waiting')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })
})

