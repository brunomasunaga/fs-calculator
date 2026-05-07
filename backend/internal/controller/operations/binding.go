package operations

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func bindBinaryRequest(c *gin.Context) (BinaryOperationRequest, error) {
	var payload map[string]any
	var req BinaryOperationRequest

	if err := c.ShouldBindBodyWith(&payload, binding.JSON); err != nil {
		return BinaryOperationRequest{}, err
	}

	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		return BinaryOperationRequest{}, err
	}

	if _, ok := payload["operand_a"]; !ok {
		return BinaryOperationRequest{}, errors.New("operand_a is required")
	}

	if _, ok := payload["operand_b"]; !ok {
		return BinaryOperationRequest{}, errors.New("operand_b is required")
	}

	return req, nil
}

func bindUnaryRequest(c *gin.Context) (UnaryOperationRequest, error) {
	var payload map[string]any
	var req UnaryOperationRequest

	if err := c.ShouldBindBodyWith(&payload, binding.JSON); err != nil {
		return UnaryOperationRequest{}, err
	}

	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		return UnaryOperationRequest{}, err
	}

	if _, ok := payload["operand"]; !ok {
		return UnaryOperationRequest{}, errors.New("operand is required")
	}

	return req, nil
}
