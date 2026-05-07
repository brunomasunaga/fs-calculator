package app

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/brunomasunaga/fs-calculator/backend/internal/config"
	"github.com/stretchr/testify/assert"
)

func TestNewContainerBuildsDependencies(t *testing.T) {
	container := NewContainer(config.Config{
		Port: "8080",
		AllowedOrigins: []string{
			"http://localhost:3000",
		},
	})

	assert.Equal(t, "8080", container.Config.Port)
	assert.Equal(t, []string{"http://localhost:3000"}, container.Config.AllowedOrigins)
	assert.NotNil(t, container.Services.Operations)
	assert.NotNil(t, container.Controllers.Operations)
	assert.NotNil(t, container.Controllers.Health)
	assert.NotNil(t, container.Controllers.Swagger)
	assert.NotNil(t, container.Router)
}

func TestNewContainerRouterUsesConfiguredOrigins(t *testing.T) {
	container := NewContainer(config.Config{
		AllowedOrigins: []string{"https://app.example.com"},
	})

	req := httptest.NewRequest(http.MethodOptions, "/v1/operations/add", nil)
	req.Header.Set("Origin", "https://app.example.com")
	req.Header.Set("Access-Control-Request-Method", http.MethodPost)

	recorder := httptest.NewRecorder()
	container.Router.ServeHTTP(recorder, req)

	assert.Equal(t, "https://app.example.com", recorder.Header().Get("Access-Control-Allow-Origin"))
}
