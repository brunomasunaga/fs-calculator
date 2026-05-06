package calculator

import (
	"net/http"

	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type CalculatorController struct {
	svc service.CalculatorService
}

func NewCalculatorController(svc service.CalculatorService) *CalculatorController {
	return &CalculatorController{svc: svc}
}

// Add calculates the sum of two operands.
// @Tags Operations
// @Summary Add two numbers
// @Accept json
// @Produce json
// @Param request body calculator.BinaryOperationRequest true "Operands"
// @Success 200 {object} calculator.CalculateResponse
// @Failure 400 {object} calculator.ErrorResponse
// @Router /v1/operations/add [post]
func (cc *CalculatorController) Add(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: cc.svc.Add(req.OperandA, req.OperandB)})
}

// Subtract calculates the difference between two operands.
// @Tags Operations
// @Summary Subtract two numbers
// @Accept json
// @Produce json
// @Param request body calculator.BinaryOperationRequest true "Operands"
// @Success 200 {object} calculator.CalculateResponse
// @Failure 400 {object} calculator.ErrorResponse
// @Router /v1/operations/subtract [post]
func (cc *CalculatorController) Subtract(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: cc.svc.Subtract(req.OperandA, req.OperandB)})
}

// Multiply calculates the product of two operands.
// @Tags Operations
// @Summary Multiply two numbers
// @Accept json
// @Produce json
// @Param request body calculator.BinaryOperationRequest true "Operands"
// @Success 200 {object} calculator.CalculateResponse
// @Failure 400 {object} calculator.ErrorResponse
// @Router /v1/operations/multiply [post]
func (cc *CalculatorController) Multiply(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: cc.svc.Multiply(req.OperandA, req.OperandB)})
}

// Divide calculates the quotient of two operands.
// @Tags Operations
// @Summary Divide two numbers
// @Accept json
// @Produce json
// @Param request body calculator.BinaryOperationRequest true "Operands"
// @Success 200 {object} calculator.CalculateResponse
// @Failure 400 {object} calculator.ErrorResponse
// @Router /v1/operations/divide [post]
func (cc *CalculatorController) Divide(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	result, err := cc.svc.Divide(req.OperandA, req.OperandB)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: result})
}

// Power raises the first operand to the power of the second operand.
// @Tags Operations
// @Summary Raise a number to a power
// @Accept json
// @Produce json
// @Param request body calculator.BinaryOperationRequest true "Operands"
// @Success 200 {object} calculator.CalculateResponse
// @Failure 400 {object} calculator.ErrorResponse
// @Router /v1/operations/power [post]
func (cc *CalculatorController) Power(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: cc.svc.Power(req.OperandA, req.OperandB)})
}

// Sqrt calculates the square root of a single operand.
// @Tags Operations
// @Summary Calculate a square root
// @Accept json
// @Produce json
// @Param request body calculator.UnaryOperationRequest true "Operand"
// @Success 200 {object} calculator.CalculateResponse
// @Failure 400 {object} calculator.ErrorResponse
// @Router /v1/operations/sqrt [post]
func (cc *CalculatorController) Sqrt(c *gin.Context) {
	req, ok := bindUnaryRequest(c)
	if !ok {
		return
	}

	result, err := cc.svc.Sqrt(req.Operand)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: result})
}

// Percentage calculates a percentage of a value.
// @Tags Operations
// @Summary Calculate percentage
// @Accept json
// @Produce json
// @Param request body calculator.BinaryOperationRequest true "Operands"
// @Success 200 {object} calculator.CalculateResponse
// @Failure 400 {object} calculator.ErrorResponse
// @Router /v1/operations/percentage [post]
func (cc *CalculatorController) Percentage(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: cc.svc.Percentage(req.OperandA, req.OperandB)})
}
