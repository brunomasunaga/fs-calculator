import { describe, expect, it } from 'vitest'

import {
  applyBackspaceInput,
  applyBinaryEvaluationResult,
  applyBinaryOperationSelection,
  applyDecimalInput,
  applyDigitInput,
  applyMinusInput,
  applyUnaryEvaluationResult,
  createCalculatorState,
  getBinaryEvaluation,
  getUnaryEvaluation,
  resolveIncompleteBinaryOperation,
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

  it('leaves a complete pending binary operation unchanged when selecting another operation', () => {
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '+',
    )
    const completePendingAdd = applyDigitInput(pendingAdd, '2')

    expect(applyBinaryOperationSelection(completePendingAdd, '×')).toEqual(
      completePendingAdd,
    )
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

  it('keeps minus input stable when the entry is already negative', () => {
    const negativeState = applyMinusInput(createCalculatorState())

    expect(applyMinusInput(negativeState)).toMatchObject({
      entry: '-',
      pendingOperation: null,
    })
  })

  it('normalizes decimal input for empty and negative entries', () => {
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '+',
    )
    const negativeEntry = applyMinusInput(createCalculatorState())

    expect(applyDecimalInput(createCalculatorState()).entry).toBe('0.')
    expect(applyDecimalInput(pendingAdd).entry).toBe('0.')
    expect(applyDecimalInput(negativeEntry).entry).toBe('-0.')
  })

  it('does not append a second decimal separator', () => {
    const decimalState = applyDecimalInput(createCalculatorState())

    expect(applyDecimalInput(decimalState).entry).toBe('0.')
  })

  it('replaces signed zero when a digit is entered', () => {
    expect(applyDigitInput({ ...createCalculatorState(), entry: '-0' }, '5').entry).toBe(
      '-5',
    )
  })

  it('appends decimal and minus signs to non-zero entries', () => {
    expect(applyDecimalInput(applyDigitInput(createCalculatorState(), '5')).entry).toBe(
      '5.',
    )
    expect(applyMinusInput(applyDigitInput(createCalculatorState(), '5')).entry).toBe(
      '-5',
    )
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

  it('returns no unary evaluation when the current input is incomplete', () => {
    expect(getUnaryEvaluation(applyMinusInput(createCalculatorState()))).toBeNull()
  })

  it('applies unary results to a pending left operand without starting the right operand', () => {
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '9'),
      '+',
    )

    const nextState = applyUnaryEvaluationResult(pendingAdd, 3, '√(9) =', 'leftOperand')

    expect(selectDisplay(nextState)).toBe('3 +')
    expect(nextState.resolvedExpression).toBe('√(9) =')
  })

  it('formats binary results and keeps scientific notation intact', () => {
    expect(applyBinaryEvaluationResult(1 / 3, null).entry).toBe('0.33333')
    expect(applyBinaryEvaluationResult(1e21, null).entry).toBe('1e+21')
  })

  it('cancels a pending operation on backspace before the second operand starts', () => {
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '+',
    )

    const backspaced = applyBackspaceInput(pendingAdd)

    expect(selectDisplay(backspaced)).toBe('1')
  })

  it('falls back correctly when backspacing empty and sign-only entries', () => {
    const negativeState = applyMinusInput(createCalculatorState())
    const pendingAdd = applyBinaryOperationSelection(
      applyDigitInput(createCalculatorState(), '1'),
      '+',
    )
    const negativeSecondOperand = applyMinusInput(pendingAdd)

    expect(applyBackspaceInput(negativeState).entry).toBe('0')
    expect(applyBackspaceInput(negativeSecondOperand).entry).toBe('')
  })

  it('falls back to zero when backspacing the last non-zero digit', () => {
    expect(applyBackspaceInput(applyDigitInput(createCalculatorState(), '5')).entry).toBe(
      '0',
    )
  })

  it('ignores incomplete binary selections that have no parsable left operand', () => {
    const negativeState = applyMinusInput(createCalculatorState())

    expect(applyBinaryOperationSelection(negativeState, '+')).toEqual(negativeState)
  })

  it('ignores binary and unary evaluations for invalid direct entries', () => {
    const invalidState = { ...createCalculatorState(), entry: 'not-a-number' }

    expect(applyBinaryOperationSelection(invalidState, '+')).toEqual(invalidState)
    expect(getUnaryEvaluation(invalidState)).toBeNull()
  })

  it('returns the same state when resolving without a pending operation', () => {
    const state = createCalculatorState()

    expect(resolveIncompleteBinaryOperation(state)).toBe(state)
  })
})
