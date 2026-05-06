package router

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestSetupRouterOperations(t *testing.T) {
	engine := SetupRouter(service.NewCalculatorService())

	testCases := []struct {
		name           string
		method         string
		path           string
		body           string
		expectedStatus int
		expectedBody   string
	}{
		{
			name:           "health",
			method:         http.MethodGet,
			path:           "/api/v1/health",
			expectedStatus: http.StatusOK,
			expectedBody:   `{"status":"ok"}`,
		},
		{
			name:           "add",
			method:         http.MethodPost,
			path:           "/api/v1/add",
			body:           `{"operand_a":5,"operand_b":7}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":12}`,
		},
		{
			name:           "subtract",
			method:         http.MethodPost,
			path:           "/api/v1/subtract",
			body:           `{"operand_a":10,"operand_b":3}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":7}`,
		},
		{
			name:           "multiply",
			method:         http.MethodPost,
			path:           "/api/v1/multiply",
			body:           `{"operand_a":4,"operand_b":2.5}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":10}`,
		},
		{
			name:           "divide",
			method:         http.MethodPost,
			path:           "/api/v1/divide",
			body:           `{"operand_a":10,"operand_b":4}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":2.5}`,
		},
		{
			name:           "power",
			method:         http.MethodPost,
			path:           "/api/v1/power",
			body:           `{"operand_a":2,"operand_b":3}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":8}`,
		},
		{
			name:           "sqrt",
			method:         http.MethodPost,
			path:           "/api/v1/sqrt",
			body:           `{"operand":25}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":5}`,
		},
		{
			name:           "percentage",
			method:         http.MethodPost,
			path:           "/api/v1/percentage",
			body:           `{"operand":25}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":0.25}`,
		},
		{
			name:           "division by zero",
			method:         http.MethodPost,
			path:           "/api/v1/divide",
			body:           `{"operand_a":10,"operand_b":0}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"error":"division by zero"}`,
		},
		{
			name:           "sqrt negative",
			method:         http.MethodPost,
			path:           "/api/v1/sqrt",
			body:           `{"operand":-4}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"error":"square root of negative number"}`,
		},
		{
			name:           "invalid body",
			method:         http.MethodPost,
			path:           "/api/v1/add",
			body:           `{"operand_a":`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"error":"unexpected EOF"}`,
		},
		{
			name:           "missing fields",
			method:         http.MethodPost,
			path:           "/api/v1/add",
			body:           `{"operand_a":0}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"error":"operand_b is required"}`,
		},
		{
			name:           "zero operands allowed",
			method:         http.MethodPost,
			path:           "/api/v1/add",
			body:           `{"operand_a":0,"operand_b":0}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":0}`,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			var body *bytes.Buffer
			if tc.body == "" {
				body = bytes.NewBuffer(nil)
			} else {
				body = bytes.NewBufferString(tc.body)
			}

			req := httptest.NewRequest(tc.method, tc.path, body)
			if tc.body != "" {
				req.Header.Set("Content-Type", "application/json")
			}

			recorder := httptest.NewRecorder()
			engine.ServeHTTP(recorder, req)

			assert.Equal(t, tc.expectedStatus, recorder.Code)
			assert.JSONEq(t, tc.expectedBody, recorder.Body.String())
		})
	}
}

func TestRouterCorsHeaders(t *testing.T) {
	engine := SetupRouter(service.NewCalculatorService())

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/add", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	req.Header.Set("Access-Control-Request-Method", http.MethodPost)

	recorder := httptest.NewRecorder()
	engine.ServeHTTP(recorder, req)

	assert.Equal(t, "http://localhost:3000", recorder.Header().Get("Access-Control-Allow-Origin"))
}

func TestHealthResponseShape(t *testing.T) {
	engine := SetupRouter(service.NewCalculatorService())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	var response map[string]string
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "ok", response["status"])
}

func init() {
	gin.SetMode(gin.TestMode)
}
