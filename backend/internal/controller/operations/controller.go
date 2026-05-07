package operations

import (
	"net/http"

	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type OperationsController struct {
	svc service.OperationsService
}

func NewOperationsController(svc service.OperationsService) *OperationsController {
	return &OperationsController{svc: svc}
}

// Add calculates the sum of two operands.
// @Tags Operations
// @Summary Add two numbers
// @Accept json
// @Produce json
// @Param request body operations.BinaryOperationRequest true "Operands"
// @Success 200 {object} operations.CalculateResponse
// @Failure 400 {object} operations.ErrorResponse
// @Router /v1/operations/add [post]
func (oc *OperationsController) Add(c *gin.Context) {
	req, err := bindBinaryRequest(c)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: oc.svc.Add(req.OperandA, req.OperandB)})
}

// Subtract calculates the difference between two operands.
// @Tags Operations
// @Summary Subtract two numbers
// @Accept json
// @Produce json
// @Param request body operations.BinaryOperationRequest true "Operands"
// @Success 200 {object} operations.CalculateResponse
// @Failure 400 {object} operations.ErrorResponse
// @Router /v1/operations/subtract [post]
func (oc *OperationsController) Subtract(c *gin.Context) {
	req, err := bindBinaryRequest(c)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: oc.svc.Subtract(req.OperandA, req.OperandB)})
}

// Multiply calculates the product of two operands.
// @Tags Operations
// @Summary Multiply two numbers
// @Accept json
// @Produce json
// @Param request body operations.BinaryOperationRequest true "Operands"
// @Success 200 {object} operations.CalculateResponse
// @Failure 400 {object} operations.ErrorResponse
// @Router /v1/operations/multiply [post]
func (oc *OperationsController) Multiply(c *gin.Context) {
	req, err := bindBinaryRequest(c)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: oc.svc.Multiply(req.OperandA, req.OperandB)})
}

// Divide calculates the quotient of two operands.
// @Tags Operations
// @Summary Divide two numbers
// @Accept json
// @Produce json
// @Param request body operations.BinaryOperationRequest true "Operands"
// @Success 200 {object} operations.CalculateResponse
// @Failure 400 {object} operations.ErrorResponse
// @Router /v1/operations/divide [post]
func (oc *OperationsController) Divide(c *gin.Context) {
	req, err := bindBinaryRequest(c)
	if err != nil {
		writeError(c, err)
		return
	}

	result, err := oc.svc.Divide(req.OperandA, req.OperandB)
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
// @Param request body operations.BinaryOperationRequest true "Operands"
// @Success 200 {object} operations.CalculateResponse
// @Failure 400 {object} operations.ErrorResponse
// @Router /v1/operations/power [post]
func (oc *OperationsController) Power(c *gin.Context) {
	req, err := bindBinaryRequest(c)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: oc.svc.Power(req.OperandA, req.OperandB)})
}

// Sqrt calculates the square root of a single operand.
// @Tags Operations
// @Summary Calculate a square root
// @Accept json
// @Produce json
// @Param request body operations.UnaryOperationRequest true "Operand"
// @Success 200 {object} operations.CalculateResponse
// @Failure 400 {object} operations.ErrorResponse
// @Router /v1/operations/sqrt [post]
func (oc *OperationsController) Sqrt(c *gin.Context) {
	req, err := bindUnaryRequest(c)
	if err != nil {
		writeError(c, err)
		return
	}

	result, err := oc.svc.Sqrt(req.Operand)
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
// @Param request body operations.BinaryOperationRequest true "Operands"
// @Success 200 {object} operations.CalculateResponse
// @Failure 400 {object} operations.ErrorResponse
// @Router /v1/operations/percentage [post]
func (oc *OperationsController) Percentage(c *gin.Context) {
	req, err := bindBinaryRequest(c)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, CalculateResponse{Result: oc.svc.Percentage(req.OperandA, req.OperandB)})
}

func writeError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
}
