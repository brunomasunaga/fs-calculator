package service

import (
	"errors"
	"math"
)

var (
	ErrDivisionByZero = errors.New("division by zero")
	ErrNegativeSqrt   = errors.New("square root of negative number")
)

type CalculatorService struct{}

// NewCalculatorService creates a calculator service.
func NewCalculatorService() CalculatorService {
	return CalculatorService{}
}

func (CalculatorService) Add(a, b float64) float64 {
	return a + b
}

func (CalculatorService) Subtract(a, b float64) float64 {
	return a - b
}

func (CalculatorService) Multiply(a, b float64) float64 {
	return a * b
}

func (CalculatorService) Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}

	return a / b, nil
}

func (CalculatorService) Power(a, b float64) float64 {
	return math.Pow(a, b)
}

func (CalculatorService) Sqrt(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSqrt
	}

	return math.Sqrt(a), nil
}

func (CalculatorService) Percentage(a, b float64) float64 {
	return (a / 100) * b
}
