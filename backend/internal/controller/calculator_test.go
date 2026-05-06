package controller

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

type mockCalculatorService struct {
	addFn        func(a, b float64) float64
	subtractFn   func(a, b float64) float64
	multiplyFn   func(a, b float64) float64
	divideFn     func(a, b float64) (float64, error)
	powerFn      func(a, b float64) float64
	sqrtFn       func(a float64) (float64, error)
	percentageFn func(a float64) float64
}

func (m mockCalculatorService) Add(a, b float64) float64 {
	return m.addFn(a, b)
}

func (m mockCalculatorService) Subtract(a, b float64) float64 {
	return m.subtractFn(a, b)
}

func (m mockCalculatorService) Multiply(a, b float64) float64 {
	return m.multiplyFn(a, b)
}

func (m mockCalculatorService) Divide(a, b float64) (float64, error) {
	return m.divideFn(a, b)
}

func (m mockCalculatorService) Power(a, b float64) float64 {
	return m.powerFn(a, b)
}

func (m mockCalculatorService) Sqrt(a float64) (float64, error) {
	return m.sqrtFn(a)
}

func (m mockCalculatorService) Percentage(a float64) float64 {
	return m.percentageFn(a)
}

func TestCalculatorControllerBinaryHandlers(t *testing.T) {
	t.Parallel()

	gin.SetMode(gin.TestMode)

	testCases := []struct {
		name           string
		handler        func(*CalculatorController, *gin.Context)
		body           string
		buildService   func(t *testing.T) service.CalculatorService
		expectedStatus int
		expectedBody   map[string]any
	}{
		{
			name:    "add success",
			handler: (*CalculatorController).Add,
			body:    `{"operand_a":10,"operand_b":2}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{
					addFn: func(a, b float64) float64 {
						assert.Equal(t, 10.0, a)
						assert.Equal(t, 2.0, b)
						return 12
					},
				}
			},
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 12.0},
		},
		{
			name:    "subtract success",
			handler: (*CalculatorController).Subtract,
			body:    `{"operand_a":10,"operand_b":2}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{
					subtractFn: func(a, b float64) float64 { return 8 },
				}
			},
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 8.0},
		},
		{
			name:    "multiply success",
			handler: (*CalculatorController).Multiply,
			body:    `{"operand_a":10,"operand_b":2}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{
					multiplyFn: func(a, b float64) float64 { return 20 },
				}
			},
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 20.0},
		},
		{
			name:    "power success",
			handler: (*CalculatorController).Power,
			body:    `{"operand_a":2,"operand_b":3}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{
					powerFn: func(a, b float64) float64 { return 8 },
				}
			},
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 8.0},
		},
		{
			name:    "divide service error",
			handler: (*CalculatorController).Divide,
			body:    `{"operand_a":10,"operand_b":0}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{
					divideFn: func(a, b float64) (float64, error) {
						return 0, service.ErrDivisionByZero
					},
				}
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": service.ErrDivisionByZero.Error()},
		},
		{
			name:    "invalid json",
			handler: (*CalculatorController).Add,
			body:    `{"operand_a":10,`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{}
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "unexpected EOF"},
		},
		{
			name:    "missing fields",
			handler: (*CalculatorController).Add,
			body:    `{"operand_a":10}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{}
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "operand_b is required"},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			recorder := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(recorder)
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tc.body))
			req.Header.Set("Content-Type", "application/json")
			ctx.Request = req

			controller := NewCalculatorController(tc.buildService(t))
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
	t.Parallel()

	gin.SetMode(gin.TestMode)

	testCases := []struct {
		name           string
		handler        func(*CalculatorController, *gin.Context)
		body           string
		buildService   func(t *testing.T) service.CalculatorService
		expectedStatus int
		expectedBody   map[string]any
	}{
		{
			name:    "sqrt success",
			handler: (*CalculatorController).Sqrt,
			body:    `{"operand":25}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{
					sqrtFn: func(a float64) (float64, error) { return 5, nil },
				}
			},
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 5.0},
		},
		{
			name:    "percentage success",
			handler: (*CalculatorController).Percentage,
			body:    `{"operand":25}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{
					percentageFn: func(a float64) float64 { return 0.25 },
				}
			},
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"result": 0.25},
		},
		{
			name:    "sqrt service error",
			handler: (*CalculatorController).Sqrt,
			body:    `{"operand":-1}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{
					sqrtFn: func(a float64) (float64, error) { return 0, service.ErrNegativeSqrt },
				}
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": service.ErrNegativeSqrt.Error()},
		},
		{
			name:    "invalid json",
			handler: (*CalculatorController).Percentage,
			body:    `{`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{}
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "unexpected EOF"},
		},
		{
			name:    "missing operand",
			handler: (*CalculatorController).Percentage,
			body:    `{}`,
			buildService: func(t *testing.T) service.CalculatorService {
				return mockCalculatorService{}
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "operand is required"},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			recorder := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(recorder)
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tc.body))
			req.Header.Set("Content-Type", "application/json")
			ctx.Request = req

			controller := NewCalculatorController(tc.buildService(t))
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
	t.Parallel()

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)

	writeError(ctx, errors.New("boom"))

	assert.Equal(t, http.StatusBadRequest, recorder.Code)
	assert.JSONEq(t, `{"error":"boom"}`, recorder.Body.String())
}
