package controller

import (
	"errors"
	"net/http"

	"github.com/brunomasunaga/fs-calculator/backend/internal/dto"
	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
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
// @Param request body dto.BinaryOperationRequest true "Operands"
// @Success 200 {object} dto.CalculateResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /v1/operations/add [post]
func (cc *CalculatorController) Add(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, dto.CalculateResponse{Result: cc.svc.Add(req.OperandA, req.OperandB)})
}

// Subtract calculates the difference between two operands.
// @Tags Operations
// @Summary Subtract two numbers
// @Accept json
// @Produce json
// @Param request body dto.BinaryOperationRequest true "Operands"
// @Success 200 {object} dto.CalculateResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /v1/operations/subtract [post]
func (cc *CalculatorController) Subtract(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, dto.CalculateResponse{Result: cc.svc.Subtract(req.OperandA, req.OperandB)})
}

// Multiply calculates the product of two operands.
// @Tags Operations
// @Summary Multiply two numbers
// @Accept json
// @Produce json
// @Param request body dto.BinaryOperationRequest true "Operands"
// @Success 200 {object} dto.CalculateResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /v1/operations/multiply [post]
func (cc *CalculatorController) Multiply(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, dto.CalculateResponse{Result: cc.svc.Multiply(req.OperandA, req.OperandB)})
}

// Divide calculates the quotient of two operands.
// @Tags Operations
// @Summary Divide two numbers
// @Accept json
// @Produce json
// @Param request body dto.BinaryOperationRequest true "Operands"
// @Success 200 {object} dto.CalculateResponse
// @Failure 400 {object} dto.ErrorResponse
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

	c.JSON(http.StatusOK, dto.CalculateResponse{Result: result})
}

// Power raises the first operand to the power of the second operand.
// @Tags Operations
// @Summary Raise a number to a power
// @Accept json
// @Produce json
// @Param request body dto.BinaryOperationRequest true "Operands"
// @Success 200 {object} dto.CalculateResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /v1/operations/power [post]
func (cc *CalculatorController) Power(c *gin.Context) {
	req, ok := bindBinaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, dto.CalculateResponse{Result: cc.svc.Power(req.OperandA, req.OperandB)})
}

// Sqrt calculates the square root of a single operand.
// @Tags Operations
// @Summary Calculate a square root
// @Accept json
// @Produce json
// @Param request body dto.UnaryOperationRequest true "Operand"
// @Success 200 {object} dto.CalculateResponse
// @Failure 400 {object} dto.ErrorResponse
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

	c.JSON(http.StatusOK, dto.CalculateResponse{Result: result})
}

// Percentage converts an operand into its percentage value.
// @Tags Operations
// @Summary Calculate percentage
// @Accept json
// @Produce json
// @Param request body dto.UnaryOperationRequest true "Operand"
// @Success 200 {object} dto.CalculateResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /v1/operations/percentage [post]
func (cc *CalculatorController) Percentage(c *gin.Context) {
	req, ok := bindUnaryRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, dto.CalculateResponse{Result: cc.svc.Percentage(req.Operand)})
}

func bindBinaryRequest(c *gin.Context) (dto.BinaryOperationRequest, bool) {
	var payload map[string]any
	var req dto.BinaryOperationRequest

	if err := c.ShouldBindBodyWith(&payload, binding.JSON); err != nil {
		writeError(c, err)
		return dto.BinaryOperationRequest{}, false
	}

	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		writeError(c, err)
		return dto.BinaryOperationRequest{}, false
	}

	if _, ok := payload["operand_a"]; !ok {
		writeError(c, errors.New("operand_a is required"))
		return dto.BinaryOperationRequest{}, false
	}

	if _, ok := payload["operand_b"]; !ok {
		writeError(c, errors.New("operand_b is required"))
		return dto.BinaryOperationRequest{}, false
	}

	return req, true
}

func bindUnaryRequest(c *gin.Context) (dto.UnaryOperationRequest, bool) {
	var payload map[string]any
	var req dto.UnaryOperationRequest

	if err := c.ShouldBindBodyWith(&payload, binding.JSON); err != nil {
		writeError(c, err)
		return dto.UnaryOperationRequest{}, false
	}

	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		writeError(c, err)
		return dto.UnaryOperationRequest{}, false
	}

	if _, ok := payload["operand"]; !ok {
		writeError(c, errors.New("operand is required"))
		return dto.UnaryOperationRequest{}, false
	}

	return req, true
}

func writeError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
}
