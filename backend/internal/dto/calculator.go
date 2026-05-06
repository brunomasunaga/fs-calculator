package dto

// BinaryOperationRequest represents a request with two operands.
type BinaryOperationRequest struct {
	OperandA float64 `json:"operand_a" example:"10.5"`
	OperandB float64 `json:"operand_b" example:"3.2"`
}

// UnaryOperationRequest represents a request with one operand.
type UnaryOperationRequest struct {
	Operand float64 `json:"operand" example:"25"`
}

// CalculateResponse represents a successful calculation result.
type CalculateResponse struct {
	Result float64 `json:"result" example:"13.7"`
}

// ErrorResponse represents a failed calculation response.
type ErrorResponse struct {
	Error string `json:"error" example:"division by zero"`
}
