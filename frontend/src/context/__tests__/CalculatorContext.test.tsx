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
      <output data-testid="resolved-expression">
        {context.resolvedExpression ?? 'null'}
      </output>
      <output data-testid="error">{context.error ?? 'null'}</output>

      <button onClick={() => context.inputDigit('1')}>digit-1</button>
      <button onClick={() => context.inputDigit('2')}>digit-2</button>
      <button onClick={() => context.inputDigit('3')}>digit-3</button>
      <button onClick={() => context.inputDigit('8')}>digit-8</button>
      <button onClick={() => context.inputDigit('9')}>digit-9</button>
      <button onClick={() => context.inputOperation('+')}>add</button>
      <button onClick={() => void context.inputMinus()}>minus</button>
      <button onClick={() => context.inputOperation('×')}>multiply</button>
      <button onClick={() => void context.inputPercentage()}>percentage</button>
      <button onClick={() => void context.inputSqrt()}>sqrt</button>
      <button onClick={() => void context.inputEquals()}>equals</button>
      <button onClick={() => context.inputBackspace()}>backspace</button>
      <button onClick={() => context.inputClear()}>clear</button>
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
      expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/subtract', {
        operand_a: 12,
        operand_b: 23,
      })
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
      expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/subtract', {
        operand_a: 12,
        operand_b: 23,
      })
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
      expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/multiply', {
        operand_a: -18,
        operand_b: -19,
      })
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

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent('1 + 2 =')
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

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent('1 + 2 =')
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
      expect(mockedClient.post).toHaveBeenCalledWith('/v1/operations/percentage', {
        operand_a: 12,
        operand_b: 12,
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('45')
    })

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent('12 % 12 =')
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

    expect(screen.getByTestId('resolved-expression')).toHaveTextContent('√(12) =')
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
      expect(screen.getByTestId('resolved-expression')).toHaveTextContent('1 + 2 =')
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
