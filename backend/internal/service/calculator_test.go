package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCalculatorServiceBinaryOperations(t *testing.T) {
	t.Parallel()

	svc := NewCalculatorService()

	testCases := []struct {
		name      string
		operation func() float64
		expected  float64
	}{
		{
			name: "add",
			operation: func() float64 {
				return svc.Add(10.5, 3.2)
			},
			expected: 13.7,
		},
		{
			name: "subtract",
			operation: func() float64 {
				return svc.Subtract(10.5, 3.2)
			},
			expected: 7.3,
		},
		{
			name: "multiply",
			operation: func() float64 {
				return svc.Multiply(10.5, 3)
			},
			expected: 31.5,
		},
		{
			name: "power",
			operation: func() float64 {
				return svc.Power(2, 3)
			},
			expected: 8,
		},
		{
			name: "percentage",
			operation: func() float64 {
				return svc.Percentage(50, 90)
			},
			expected: 45,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.InDelta(t, tc.expected, tc.operation(), 1e-9)
		})
	}
}

func TestCalculatorServiceDivide(t *testing.T) {
	t.Parallel()

	svc := NewCalculatorService()

	testCases := []struct {
		name        string
		a           float64
		b           float64
		expected    float64
		expectedErr error
	}{
		{
			name:     "success",
			a:        10,
			b:        4,
			expected: 2.5,
		},
		{
			name:        "division by zero",
			a:           10,
			b:           0,
			expectedErr: ErrDivisionByZero,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			result, err := svc.Divide(tc.a, tc.b)

			if tc.expectedErr != nil {
				assert.ErrorIs(t, err, tc.expectedErr)
				assert.Zero(t, result)
				return
			}

			assert.NoError(t, err)
			assert.InDelta(t, tc.expected, result, 1e-9)
		})
	}
}

func TestCalculatorServiceSqrt(t *testing.T) {
	t.Parallel()

	svc := NewCalculatorService()

	testCases := []struct {
		name        string
		input       float64
		expected    float64
		expectedErr error
	}{
		{
			name:     "success",
			input:    25,
			expected: 5,
		},
		{
			name:        "negative number",
			input:       -1,
			expectedErr: ErrNegativeSqrt,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			result, err := svc.Sqrt(tc.input)

			if tc.expectedErr != nil {
				assert.ErrorIs(t, err, tc.expectedErr)
				assert.Zero(t, result)
				return
			}

			assert.NoError(t, err)
			assert.InDelta(t, tc.expected, result, 1e-9)
		})
	}
}
