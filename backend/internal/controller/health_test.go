package controller

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestHealthControllerHealth(t *testing.T) {
	gin.SetMode(gin.TestMode)

	engine := gin.New()
	controller := NewHealthController()
	engine.GET("/health", controller.Health)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	var response map[string]string
	err := json.Unmarshal(recorder.Body.Bytes(), &response)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, recorder.Code)
	assert.Equal(t, "ok", response["status"])
}
