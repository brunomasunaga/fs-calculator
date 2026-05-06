package router

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/brunomasunaga/fs-calculator/backend/internal/controller"
	"github.com/brunomasunaga/fs-calculator/backend/internal/controller/calculator"
	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestSetupRouterOperations(t *testing.T) {
	engine := buildTestRouter()

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
			path:           "/health",
			expectedStatus: http.StatusOK,
			expectedBody:   `{"status":"ok"}`,
		},
		{
			name:           "add",
			method:         http.MethodPost,
			path:           "/v1/operations/add",
			body:           `{"operand_a":5,"operand_b":7}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":12}`,
		},
		{
			name:           "subtract",
			method:         http.MethodPost,
			path:           "/v1/operations/subtract",
			body:           `{"operand_a":10,"operand_b":3}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":7}`,
		},
		{
			name:           "multiply",
			method:         http.MethodPost,
			path:           "/v1/operations/multiply",
			body:           `{"operand_a":4,"operand_b":2.5}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":10}`,
		},
		{
			name:           "divide",
			method:         http.MethodPost,
			path:           "/v1/operations/divide",
			body:           `{"operand_a":10,"operand_b":4}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":2.5}`,
		},
		{
			name:           "power",
			method:         http.MethodPost,
			path:           "/v1/operations/power",
			body:           `{"operand_a":2,"operand_b":3}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":8}`,
		},
		{
			name:           "sqrt",
			method:         http.MethodPost,
			path:           "/v1/operations/sqrt",
			body:           `{"operand":25}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":5}`,
		},
		{
			name:           "percentage",
			method:         http.MethodPost,
			path:           "/v1/operations/percentage",
			body:           `{"operand_a":50,"operand_b":90}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `{"result":45}`,
		},
		{
			name:           "division by zero",
			method:         http.MethodPost,
			path:           "/v1/operations/divide",
			body:           `{"operand_a":10,"operand_b":0}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"error":"division by zero"}`,
		},
		{
			name:           "sqrt negative",
			method:         http.MethodPost,
			path:           "/v1/operations/sqrt",
			body:           `{"operand":-4}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"error":"square root of negative number"}`,
		},
		{
			name:           "invalid body",
			method:         http.MethodPost,
			path:           "/v1/operations/add",
			body:           `{"operand_a":`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"error":"unexpected EOF"}`,
		},
		{
			name:           "missing fields",
			method:         http.MethodPost,
			path:           "/v1/operations/add",
			body:           `{"operand_a":0}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"error":"operand_b is required"}`,
		},
		{
			name:           "zero operands allowed",
			method:         http.MethodPost,
			path:           "/v1/operations/add",
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
	engine := buildTestRouter()

	req := httptest.NewRequest(http.MethodOptions, "/v1/operations/add", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	req.Header.Set("Access-Control-Request-Method", http.MethodPost)

	recorder := httptest.NewRecorder()
	engine.ServeHTTP(recorder, req)

	assert.Equal(t, "http://localhost:3000", recorder.Header().Get("Access-Control-Allow-Origin"))
}

func TestHealthResponseShape(t *testing.T) {
	engine := buildTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	var response map[string]string
	err := json.Unmarshal(recorder.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "ok", response["status"])
}

func TestSwaggerRouteRegistered(t *testing.T) {
	engine := buildTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/docs/index.html", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	assert.NotEqual(t, http.StatusNotFound, recorder.Code)
}

func TestDocsRootRedirectsToIndex(t *testing.T) {
	engine := buildTestRouter()

	testCases := []string{"/docs", "/docs/"}

	for _, path := range testCases {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		recorder := httptest.NewRecorder()

		engine.ServeHTTP(recorder, req)

		assert.Equal(t, http.StatusMovedPermanently, recorder.Code)
		assert.Equal(t, "/docs/index.html", recorder.Header().Get("Location"))
	}
}

func TestUnknownRouteReturnsJsonNotFound(t *testing.T) {
	engine := buildTestRouter()

	req := httptest.NewRequest(http.MethodGet, "/missing", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	assert.Equal(t, http.StatusNotFound, recorder.Code)
	assert.JSONEq(t, `{"error":"not found"}`, recorder.Body.String())
}

func init() {
	gin.SetMode(gin.TestMode)
}

func buildTestRouter() *gin.Engine {
	svc := service.NewCalculatorService()
	calculatorController := calculator.NewCalculatorController(svc)
	healthController := controller.NewHealthController()
	swaggerController := controller.NewSwaggerController()

	return SetupRouter(Config{
		AllowedOrigins: []string{"http://localhost:3000"},
	}, Dependencies{
		CalculatorController: calculatorController,
		HealthController:     healthController,
		SwaggerController:    swaggerController,
	})
}
