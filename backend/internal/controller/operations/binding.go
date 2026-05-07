package operations

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func bindBinaryRequest(c *gin.Context) (BinaryOperationRequest, bool) {
	var payload map[string]any
	var req BinaryOperationRequest

	if err := c.ShouldBindBodyWith(&payload, binding.JSON); err != nil {
		writeError(c, err)
		return BinaryOperationRequest{}, false
	}

	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		writeError(c, err)
		return BinaryOperationRequest{}, false
	}

	if _, ok := payload["operand_a"]; !ok {
		writeError(c, errors.New("operand_a is required"))
		return BinaryOperationRequest{}, false
	}

	if _, ok := payload["operand_b"]; !ok {
		writeError(c, errors.New("operand_b is required"))
		return BinaryOperationRequest{}, false
	}

	return req, true
}

func bindUnaryRequest(c *gin.Context) (UnaryOperationRequest, bool) {
	var payload map[string]any
	var req UnaryOperationRequest

	if err := c.ShouldBindBodyWith(&payload, binding.JSON); err != nil {
		writeError(c, err)
		return UnaryOperationRequest{}, false
	}

	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		writeError(c, err)
		return UnaryOperationRequest{}, false
	}

	if _, ok := payload["operand"]; !ok {
		writeError(c, errors.New("operand is required"))
		return UnaryOperationRequest{}, false
	}

	return req, true
}

func writeError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
}
