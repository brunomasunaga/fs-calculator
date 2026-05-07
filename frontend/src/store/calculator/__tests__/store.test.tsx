import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import client from '@/services/client'
import {
  resetCalculatorStore,
  useCalculatorActions,
  useCalculatorStore,
  useCalculatorView,
} from '@/store/calculator/store'

vi.mock('@/services/client', () => ({
  default: {
    post: vi.fn(),
  },
}))

const mockedClient = vi.mocked(client)

function Harness() {
  const { display, resolvedExpression, error } = useCalculatorView()
  const {
    inputDigit,
    inputOperation,
    inputMinus,
    inputEquals,
    inputClear,
    inputBackspace,
    inputSqrt,
    inputPercentage,
    inputDecimal,
  } = useCalculatorActions()

  return (
    <div>
      <output data-testid="display">{display}</output>
      <output data-testid="resolved-expression">
        {resolvedExpression ?? 'null'}
      </output>
      <output data-testid="error">{error ?? 'null'}</output>

      <button onClick={() => inputDigit('1')}>digit-1</button>
      <button onClick={() => inputDigit('2')}>digit-2</button>
      <button onClick={() => inputDigit('3')}>digit-3</button>
      <button onClick={() => inputDigit('8')}>digit-8</button>
      <button onClick={() => inputDigit('9')}>digit-9</button>
      <button onClick={() => void inputOperation('+')}>add</button>
      <button onClick={() => void inputMinus()}>minus</button>
      <button onClick={() => void inputOperation('×')}>multiply</button>
      <button onClick={() => void inputPercentage()}>percentage</button>
      <button onClick={() => void inputSqrt()}>sqrt</button>
      <button onClick={() => void inputEquals()}>equals</button>
      <button onClick={inputDecimal}>decimal</button>
      <button onClick={inputBackspace}>backspace</button>
      <button onClick={inputClear}>clear</button>
    </div>
  )
}

function renderHarness() {
  return render(<Harness />)
}

describe('calculator store', () => {
  beforeEach(() => {
    resetCalculatorStore()
    mockedClient.post.mockReset()
  })

  it('builds the display from digit input', () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))

    expect(screen.getByTestId('display')).toHaveTextContent('12')
  })

  it('builds decimal input without duplicating the separator', () => {
    renderHarness()

    fireEvent.click(screen.getByText('decimal'))
    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('decimal'))
    fireEvent.click(screen.getByText('digit-2'))

    expect(screen.getByTestId('display')).toHaveTextContent('0.12')
  })

  it('shows the selected operation in the display', () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))

    expect(screen.getByTestId('display')).toHaveTextContent('1 +')
  })

  it('replaces a pending operation when another operation is pressed', () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('percentage'))

    expect(screen.getByTestId('display')).toHaveTextContent('1 %')
  })

  it('supports negative numbers for the first operand', () => {
    renderHarness()

    fireEvent.click(screen.getByText('minus'))
    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))

    expect(screen.getByTestId('display')).toHaveTextContent('-12')
  })

  it('uses minus as subtraction when a number is already present', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: -11,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('minus'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('digit-3'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith(
        '/v1/operations/subtract',
        {
          operand_a: 12,
          operand_b: 23,
        },
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('-11')
    })
  })

  it('supports negative numbers for the second operand', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: -1,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('minus'))
    fireEvent.click(screen.getByText('digit-2'))

    expect(screen.getByTestId('display')).toHaveTextContent('1 + -2')

    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/add', {
        operand_a: 1,
        operand_b: -2,
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('-1')
    })
  })

  it('does not allow subtraction to create a negative second operand', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: -11,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('minus'))

    expect(screen.getByTestId('display')).toHaveTextContent('12 -')

    fireEvent.click(screen.getByText('minus'))

    expect(screen.getByTestId('display')).toHaveTextContent('12 -')

    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('digit-3'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith(
        '/v1/operations/subtract',
        {
          operand_a: 12,
          operand_b: 23,
        },
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('-11')
    })
  })

  it('supports negative numbers in both operands for multiplication', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: 72,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('minus'))
    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-8'))
    fireEvent.click(screen.getByText('multiply'))
    fireEvent.click(screen.getByText('minus'))
    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-9'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith(
        '/v1/operations/multiply',
        {
          operand_a: -18,
          operand_b: -19,
        },
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('72')
    })
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

    expect(screen.getByTestId('display')).toHaveTextContent('1 + 2')
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/add', {
        operand_a: 1,
        operand_b: 2,
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('42')
    })

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent(
      '1 + 2 =',
    )
  })

  it('shows backend errors and keeps the current expression', async () => {
    mockedClient.post.mockRejectedValueOnce(new Error('division by zero'))

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('division by zero')
    })

    expect(screen.getByTestId('display')).toHaveTextContent('1 + 2')
    expect(screen.getByTestId('resolved-expression')).toHaveTextContent('null')
  })

  it('normalizes unexpected async failures', async () => {
    mockedClient.post.mockRejectedValueOnce('boom')

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Unexpected error')
    })
  })

  it('allows selecting a new operation from the left operand after an error', async () => {
    mockedClient.post.mockRejectedValueOnce(new Error('division by zero'))

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('division by zero')
    })

    fireEvent.click(screen.getByText('multiply'))

    expect(screen.getByTestId('display')).toHaveTextContent('1 ×')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('clears standalone error state when selecting a binary operation', () => {
    useCalculatorStore.setState({
      entry: '5',
      pendingOperation: null,
      resolvedExpression: null,
      error: 'previous failure',
    })

    renderHarness()

    fireEvent.click(screen.getByText('add'))

    expect(screen.getByTestId('display')).toHaveTextContent('0')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('shows overflow errors for non-finite backend results', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: Infinity,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Result overflow')
    })
    expect(screen.getByTestId('display')).toHaveTextContent('1 + 2')
  })

  it('chains pending binary operations when another operation is selected', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: 3,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('minus'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/add', {
        operand_a: 1,
        operand_b: 2,
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('3 -')
    })

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent(
      '1 + 2 =',
    )
  })

  it('calls the API client for percentage as a binary operation', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: 45,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('percentage'))
    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith(
        '/v1/operations/percentage',
        {
          operand_a: 12,
          operand_b: 12,
        },
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('45')
    })

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent(
      '12 % 12 =',
    )
  })

  it('stores the resolved expression for unary operations', async () => {
    mockedClient.post.mockResolvedValueOnce({
      data: {
        result: 3.46,
      },
    })

    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('sqrt'))

    await waitFor(() => {
      expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/sqrt', {
        operand: 12,
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('3.46')
    })

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent(
      '√(12) =',
    )
  })

  it('resolves incomplete binary operations locally without calling the API', async () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('equals'))

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('1')
    })

    expect(mockedClient.post).not.toHaveBeenCalled()
    expect(screen.getByTestId('resolved-expression')).toHaveTextContent('null')
  })

  it('does nothing when equals is pressed without a pending operation', () => {
    renderHarness()

    fireEvent.click(screen.getByText('equals'))

    expect(mockedClient.post).not.toHaveBeenCalled()
    expect(screen.getByTestId('display')).toHaveTextContent('0')
  })

  it('does nothing when sqrt is pressed for an incomplete entry', () => {
    renderHarness()

    fireEvent.click(screen.getByText('minus'))
    fireEvent.click(screen.getByText('sqrt'))

    expect(mockedClient.post).not.toHaveBeenCalled()
    expect(screen.getByTestId('display')).toHaveTextContent('-')
  })

  it('clears the resolved expression when the user modifies the result', async () => {
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
      expect(screen.getByTestId('resolved-expression')).toHaveTextContent(
        '1 + 2 =',
      )
    })

    fireEvent.click(screen.getByText('digit-1'))

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent('null')
  })

  it('backspaces the current input', () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('digit-2'))
    fireEvent.click(screen.getByText('backspace'))

    expect(screen.getByTestId('display')).toHaveTextContent('1')
  })

  it('resets state on clear', () => {
    renderHarness()

    fireEvent.click(screen.getByText('digit-1'))
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('clear'))

    expect(screen.getByTestId('display')).toHaveTextContent('0')
    expect(screen.getByTestId('resolved-expression')).toHaveTextContent('null')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })
})
