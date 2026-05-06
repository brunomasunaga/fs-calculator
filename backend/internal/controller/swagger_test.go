package controller

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestSwaggerControllerHandle(t *testing.T) {
	gin.SetMode(gin.TestMode)

	engine := gin.New()
	controller := NewSwaggerController()
	engine.GET("/docs/*any", controller.Handle)

	req := httptest.NewRequest(http.MethodGet, "/docs/index.html", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	assert.NotEqual(t, http.StatusNotFound, recorder.Code)
}

func TestSwaggerControllerRedirectToDocsIndex(t *testing.T) {
	gin.SetMode(gin.TestMode)

	engine := gin.New()
	controller := NewSwaggerController()
	engine.GET("/docs", controller.RedirectToDocsIndex)

	req := httptest.NewRequest(http.MethodGet, "/docs", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	assert.Equal(t, http.StatusMovedPermanently, recorder.Code)
	assert.Equal(t, "/docs/index.html", recorder.Header().Get("Location"))
}

func TestSwaggerControllerRedirectDocsEntry(t *testing.T) {
	gin.SetMode(gin.TestMode)

	engine := gin.New()
	controller := NewSwaggerController()
	engine.RedirectTrailingSlash = false
	engine.Use(controller.RedirectDocsEntry())
	engine.GET("/docs", controller.RedirectToDocsIndex)
	engine.GET("/docs/*any", controller.Handle)

	req := httptest.NewRequest(http.MethodGet, "/docs/", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	assert.Equal(t, http.StatusMovedPermanently, recorder.Code)
	assert.Equal(t, "/docs/index.html", recorder.Header().Get("Location"))
}

func TestSwaggerControllerRedirectDocsEntryFallsThrough(t *testing.T) {
	gin.SetMode(gin.TestMode)

	engine := gin.New()
	controller := NewSwaggerController()
	engine.RedirectTrailingSlash = false
	engine.Use(controller.RedirectDocsEntry())
	engine.GET("/health", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()

	engine.ServeHTTP(recorder, req)

	assert.Equal(t, http.StatusNoContent, recorder.Code)
}
