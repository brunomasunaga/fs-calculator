package router

import (
	"net/http"
	"os"

	"github.com/brunomasunaga/fs-calculator/backend/internal/controller"
	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter(svc service.CalculatorService) *gin.Engine {
	engine := gin.Default()
	engine.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:5173",
			envOrDefault("FRONTEND_ORIGIN", "http://localhost:3000"),
		},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept"},
	}))

	controller := controller.NewCalculatorController(svc)
	api := engine.Group("/api/v1")
	{
		api.POST("/add", controller.Add)
		api.POST("/subtract", controller.Subtract)
		api.POST("/multiply", controller.Multiply)
		api.POST("/divide", controller.Divide)
		api.POST("/power", controller.Power)
		api.POST("/sqrt", controller.Sqrt)
		api.POST("/percentage", controller.Percentage)
		api.GET("/health", health)
	}

	engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	return engine
}

// health reports the API status.
// @Summary Health check
// @Produce json
// @Success 200 {object} map[string]string
// @Router /api/v1/health [get]
func health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
