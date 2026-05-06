package calculator

// CalculateResponse represents a successful calculation result.
type CalculateResponse struct {
	Result float64 `json:"result" example:"13.7"`
}

// ErrorResponse represents a failed calculation response.
type ErrorResponse struct {
	Error string `json:"error" example:"division by zero"`
}
