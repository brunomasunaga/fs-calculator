package service

import (
	"errors"
	"math"
)

var (
	ErrDivisionByZero = errors.New("division by zero")
	ErrNegativeSqrt   = errors.New("square root of negative number")
)

// NewOperationsService creates an operations service.
func NewOperationsService() OperationsService {
	return OperationsService{}
}

type OperationsService struct{}

func (OperationsService) Add(a, b float64) float64 {
	return a + b
}

func (OperationsService) Subtract(a, b float64) float64 {
	return a - b
}

func (OperationsService) Multiply(a, b float64) float64 {
	return a * b
}

func (OperationsService) Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}

	return a / b, nil
}

func (OperationsService) Power(a, b float64) float64 {
	return math.Pow(a, b)
}

func (OperationsService) Sqrt(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSqrt
	}

	return math.Sqrt(a), nil
}

func (OperationsService) Percentage(a, b float64) float64 {
	return (a / 100) * b
}
