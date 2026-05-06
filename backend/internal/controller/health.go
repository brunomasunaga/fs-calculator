package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type HealthController struct{}

func NewHealthController() *HealthController {
	return &HealthController{}
}

// Health reports the API status.
// @Tags Health
// @Summary Health check
// @Produce json
// @Success 200 {object} map[string]string
// @Router /health [get]
func (hc *HealthController) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
