package service

// CalculatorService defines the calculator business operations.
type CalculatorService interface {
	Add(a, b float64) float64
	Subtract(a, b float64) float64
	Multiply(a, b float64) float64
	Divide(a, b float64) (float64, error)
	Power(a, b float64) float64
	Sqrt(a float64) (float64, error)
	Percentage(a float64) float64
}
