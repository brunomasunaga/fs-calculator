package service

import (
	"errors"
	"math"
)

var (
	ErrDivisionByZero = errors.New("division by zero")
	ErrNegativeSqrt   = errors.New("square root of negative number")
)

type calculatorService struct{}

// NewCalculatorService creates a calculator service implementation.
func NewCalculatorService() CalculatorService {
	return calculatorService{}
}

func (calculatorService) Add(a, b float64) float64 {
	return a + b
}

func (calculatorService) Subtract(a, b float64) float64 {
	return a - b
}

func (calculatorService) Multiply(a, b float64) float64 {
	return a * b
}

func (calculatorService) Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}

	return a / b, nil
}

func (calculatorService) Power(a, b float64) float64 {
	return math.Pow(a, b)
}

func (calculatorService) Sqrt(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSqrt
	}

	return math.Sqrt(a), nil
}

func (calculatorService) Percentage(a float64) float64 {
	return a / 100
}
