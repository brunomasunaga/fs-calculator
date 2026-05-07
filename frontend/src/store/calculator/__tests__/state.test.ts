import { describe, expect, it } from 'vitest'

import {
  applyBackspaceInput,
  applyBinaryOperationSelection,
  applyDigitInput,
  applyMinusInput,
  createCalculatorState,
  getBinaryEvaluation,
  getUnaryEvaluation,
  selectDisplay,
  shouldTreatMinusAsNegativeSign,
} from '@/store/calculator/state'

describe('calculator state', () => {
  it('stages a binary operation from the current entry', () => {
    const withDigit = applyDigitInput(createCalculatorState(), '1')
    const withOperation = applyBinaryOperationSelection(withDigit, '+')

    expect(selectDisplay(withOperation)).toBe('1 +')
    expect(getBinaryEvaluation(withOperation)).toBeNull()
  })

  it('replaces a pending binary operation while waiting for the second operand', () => {
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '+',
    )

    const pendingPercentage = applyBinaryOperationSelection(pendingAdd, '%')

    expect(selectDisplay(pendingPercentage)).toBe('1 %')
  })

  it('supports starting a negative second operand with minus input', () => {
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '+',
    )

    const negativeSecondOperand = applyMinusInput(pendingAdd)
    const withDigit = applyDigitInput(negativeSecondOperand, '2')

    expect(selectDisplay(withDigit)).toBe('1 + -2')
    expect(getBinaryEvaluation(withDigit)).toMatchObject({
      leftOperand: 1,
      rightOperand: -2,
      operation: '+',
    })
  })

  it('does not allow subtraction to start a negative second operand', () => {
    const pendingSubtract = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '-',
    )

    expect(shouldTreatMinusAsNegativeSign(pendingSubtract)).toBe(false)
  })

  it('treats minus as a negative sign only when the ui is expecting a number', () => {
    const initialState = createCalculatorState()
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '+',
    )
    const pendingSubtract = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '-',
    )
    const startedEntry = applyDigitInput(createCalculatorState(), '1')

    expect(shouldTreatMinusAsNegativeSign(initialState)).toBe(true)
    expect(shouldTreatMinusAsNegativeSign(pendingAdd)).toBe(true)
    expect(shouldTreatMinusAsNegativeSign(pendingSubtract)).toBe(false)
    expect(shouldTreatMinusAsNegativeSign(startedEntry)).toBe(false)
  })

  it('supports unary targets for the first operand while waiting for the second operand', () => {
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '9'),
      '+',
    )

    expect(getUnaryEvaluation(pendingAdd)).toEqual({
      target: 'leftOperand',
      value: 9,
      valueText: '9',
    })
  })

  it('cancels a pending operation on backspace before the second operand starts', () => {
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '+',
    )

    const backspaced = applyBackspaceInput(pendingAdd)

    expect(selectDisplay(backspaced)).toBe('1')
  })
})
