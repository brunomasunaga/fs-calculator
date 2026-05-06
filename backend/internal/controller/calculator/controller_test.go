package calculator

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCalculatorControllerBinaryHandlers(t *testing.T) {
	testCases := []struct {
		name           string
		handler        func(*CalculatorController, *gin.Context)
		body           string
		expectedStatus int
		expectedBody   map[string]any
	}{
		{
			name:           "add success",
			handler:        (*CalculatorController).Add,
			body:           `{"operand_a":10,"operand_b":2}`,
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 12.0},
		},
		{
			name:           "subtract success",
			handler:        (*CalculatorController).Subtract,
			body:           `{"operand_a":10,"operand_b":2}`,
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 8.0},
		},
		{
			name:           "subtract invalid json",
			handler:        (*CalculatorController).Subtract,
			body:           `{`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "unexpected EOF"},
		},
		{
			name:           "multiply success",
			handler:        (*CalculatorController).Multiply,
			body:           `{"operand_a":10,"operand_b":2}`,
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 20.0},
		},
		{
			name:           "multiply missing operand b",
			handler:        (*CalculatorController).Multiply,
			body:           `{"operand_a":10}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "operand_b is required"},
		},
		{
			name:           "power success",
			handler:        (*CalculatorController).Power,
			body:           `{"operand_a":2,"operand_b":3}`,
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 8.0},
		},
		{
			name:           "power invalid operand type",
			handler:        (*CalculatorController).Power,
			body:           `{"operand_a":"bad","operand_b":3}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "json: cannot unmarshal string into Go struct field BinaryOperationRequest.operand_a of type float64"},
		},
		{
			name:           "percentage success",
			handler:        (*CalculatorController).Percentage,
			body:           `{"operand_a":50,"operand_b":90}`,
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 45.0},
		},
		{
			name:           "percentage missing operand b",
			handler:        (*CalculatorController).Percentage,
			body:           `{"operand_a":50}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "operand_b is required"},
		},
		{
			name:           "divide success",
			handler:        (*CalculatorController).Divide,
			body:           `{"operand_a":10,"operand_b":2}`,
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 5.0},
		},
		{
			name:           "divide invalid json",
			handler:        (*CalculatorController).Divide,
			body:           `{`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "unexpected EOF"},
		},
		{
			name:           "divide service error",
			handler:        (*CalculatorController).Divide,
			body:           `{"operand_a":10,"operand_b":0}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": service.ErrDivisionByZero.Error()},
		},
		{
			name:           "invalid json",
			handler:        (*CalculatorController).Add,
			body:           `{"operand_a":10,`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "unexpected EOF"},
		},
		{
			name:           "invalid operand type",
			handler:        (*CalculatorController).Add,
			body:           `{"operand_a":"bad","operand_b":2}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "json: cannot unmarshal string into Go struct field BinaryOperationRequest.operand_a of type float64"},
		},
		{
			name:           "missing fields",
			handler:        (*CalculatorController).Add,
			body:           `{"operand_a":10}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "operand_b is required"},
		},
		{
			name:           "missing operand a",
			handler:        (*CalculatorController).Add,
			body:           `{"operand_b":10}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "operand_a is required"},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(recorder)
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tc.body))
			req.Header.Set("Content-Type", "application/json")
			ctx.Request = req

			controller := NewCalculatorController(service.NewCalculatorService())
			tc.handler(controller, ctx)

			assert.Equal(t, tc.expectedStatus, recorder.Code)

			var body map[string]any
			err := json.Unmarshal(recorder.Body.Bytes(), &body)
			assert.NoError(t, err)
			assert.Equal(t, tc.expectedBody, body)
		})
	}
}

func TestCalculatorControllerUnaryHandlers(t *testing.T) {
	testCases := []struct {
		name           string
		handler        func(*CalculatorController, *gin.Context)
		body           string
		expectedStatus int
		expectedBody   map[string]any
	}{
		{
			name:           "sqrt success",
			handler:        (*CalculatorController).Sqrt,
			body:           `{"operand":25}`,
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 5.0},
		},
		{
			name:           "sqrt service error",
			handler:        (*CalculatorController).Sqrt,
			body:           `{"operand":-1}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": service.ErrNegativeSqrt.Error()},
		},
		{
			name:           "sqrt invalid json",
			handler:        (*CalculatorController).Sqrt,
			body:           `{`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "unexpected EOF"},
		},
		{
			name:           "sqrt invalid operand type",
			handler:        (*CalculatorController).Sqrt,
			body:           `{"operand":"bad"}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "json: cannot unmarshal string into Go struct field UnaryOperationRequest.operand of type float64"},
		},
		{
			name:           "sqrt missing operand",
			handler:        (*CalculatorController).Sqrt,
			body:           `{}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "operand is required"},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(recorder)
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tc.body))
			req.Header.Set("Content-Type", "application/json")
			ctx.Request = req

			controller := NewCalculatorController(service.NewCalculatorService())
			tc.handler(controller, ctx)

			assert.Equal(t, tc.expectedStatus, recorder.Code)

			var body map[string]any
			err := json.Unmarshal(recorder.Body.Bytes(), &body)
			assert.NoError(t, err)
			assert.Equal(t, tc.expectedBody, body)
		})
	}
}

func TestWriteError(t *testing.T) {
	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)

	writeError(ctx, errors.New("boom"))

	assert.Equal(t, http.StatusBadRequest, recorder.Code)
	assert.JSONEq(t, `{"error":"boom"}`, recorder.Body.String())
}

func init() {
	gin.SetMode(gin.TestMode)
}
