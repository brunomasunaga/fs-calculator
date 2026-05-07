import { describe, expect, it } from 'vitest'

import {
  calculatorReducer,
  getBinaryEvaluationRequest,
  getUnaryEvaluationTarget,
  initialCalculatorState,
  selectDisplay,
  shouldTreatMinusAsNegativeSign,
} from '@/context/calculator-state'

describe('calculator-state', () => {
  it('stages a binary operation from the current entry', () => {
    const withDigit = calculatorReducer(initialCalculatorState, {
      type: 'digit-input',
      digit: '1',
    })

    const withOperation = calculatorReducer(withDigit, {
      type: 'binary-operation-selected',
      operation: '+',
    })

    expect(selectDisplay(withOperation)).toBe('1 +')
    expect(getBinaryEvaluationRequest(withOperation)).toBeNull()
  })

  it('replaces a pending binary operation while waiting for the second operand', () => {
    const pendingAdd = calculatorReducer(
      calculatorReducer(initialCalculatorState, {
        type: 'digit-input',
        digit: '1',
      }),
      {
        type: 'binary-operation-selected',
        operation: '+',
      },
    )

    const pendingPercentage = calculatorReducer(pendingAdd, {
      type: 'binary-operation-selected',
      operation: '%',
    })

    expect(selectDisplay(pendingPercentage)).toBe('1 %')
  })

  it('supports starting a negative second operand with minus input', () => {
    const pendingAdd = calculatorReducer(
      calculatorReducer(initialCalculatorState, {
        type: 'digit-input',
        digit: '1',
      }),
      {
        type: 'binary-operation-selected',
        operation: '+',
      },
    )

    const negativeSecondOperand = calculatorReducer(pendingAdd, {
      type: 'minus-input',
    })

    const withDigit = calculatorReducer(negativeSecondOperand, {
      type: 'digit-input',
      digit: '2',
    })

    expect(selectDisplay(withDigit)).toBe('1 + -2')
    expect(getBinaryEvaluationRequest(withDigit)).toMatchObject({
      lhs: 1,
      rhs: -2,
      operation: '+',
    })
  })

  it('does not allow subtraction to start a negative second operand', () => {
    const pendingSubtract = calculatorReducer(
      calculatorReducer(initialCalculatorState, {
        type: 'digit-input',
        digit: '1',
      }),
      {
        type: 'binary-operation-selected',
        operation: '-',
      },
    )

    expect(shouldTreatMinusAsNegativeSign(pendingSubtract)).toBe(false)
  })

  it('treats minus as a negative sign only when the ui is expecting a number', () => {
    const initial = initialCalculatorState
    const pendingAdd = calculatorReducer(
      calculatorReducer(initialCalculatorState, {
        type: 'digit-input',
        digit: '1',
      }),
      {
        type: 'binary-operation-selected',
        operation: '+',
      },
    )
    const pendingSubtract = calculatorReducer(
      calculatorReducer(initialCalculatorState, {
        type: 'digit-input',
        digit: '1',
      }),
      {
        type: 'binary-operation-selected',
        operation: '-',
      },
    )
    const startedEntry = calculatorReducer(initialCalculatorState, {
      type: 'digit-input',
      digit: '1',
    })

    expect(shouldTreatMinusAsNegativeSign(initial)).toBe(true)
    expect(shouldTreatMinusAsNegativeSign(pendingAdd)).toBe(true)
    expect(shouldTreatMinusAsNegativeSign(pendingSubtract)).toBe(false)
    expect(shouldTreatMinusAsNegativeSign(startedEntry)).toBe(false)
  })

  it('supports unary targets for the first operand while waiting for the second operand', () => {
    const pendingAdd = calculatorReducer(
      calculatorReducer(initialCalculatorState, {
        type: 'digit-input',
        digit: '9',
      }),
      {
        type: 'binary-operation-selected',
        operation: '+',
      },
    )

    expect(getUnaryEvaluationTarget(pendingAdd)).toEqual({
      target: 'lhs',
      value: 9,
      valueText: '9',
    })
  })

  it('cancels a pending operation on backspace before the second operand starts', () => {
    const pendingAdd = calculatorReducer(
      calculatorReducer(initialCalculatorState, {
        type: 'digit-input',
        digit: '1',
      }),
      {
        type: 'binary-operation-selected',
        operation: '+',
      },
    )

    const backspaced = calculatorReducer(pendingAdd, {
      type: 'backspace-input',
    })

    expect(selectDisplay(backspaced)).toBe('1')
  })
})
