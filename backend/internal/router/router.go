package router

import (
	"net/http"

	"github.com/brunomasunaga/fs-calculator/backend/internal/controller"
	"github.com/brunomasunaga/fs-calculator/backend/internal/controller/calculator"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Config struct {
	AllowedOrigins []string
}

type Dependencies struct {
	CalculatorController *calculator.CalculatorController
	HealthController     *controller.HealthController
	SwaggerController    *controller.SwaggerController
}

func SetupRouter(cfg Config, deps Dependencies) *gin.Engine {
	engine := gin.Default()
	engine.RedirectTrailingSlash = false
	engine.Use(deps.SwaggerController.RedirectDocsEntry())
	engine.Use(cors.New(cors.Config{
		AllowOrigins: cfg.AllowedOrigins,
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept"},
	}))

	operations := engine.Group("/v1/operations")
	{
		operations.POST("/add", deps.CalculatorController.Add)
		operations.POST("/subtract", deps.CalculatorController.Subtract)
		operations.POST("/multiply", deps.CalculatorController.Multiply)
		operations.POST("/divide", deps.CalculatorController.Divide)
		operations.POST("/power", deps.CalculatorController.Power)
		operations.POST("/sqrt", deps.CalculatorController.Sqrt)
		operations.POST("/percentage", deps.CalculatorController.Percentage)
	}

	engine.GET("/health", deps.HealthController.Health)
	engine.GET("/docs", deps.SwaggerController.RedirectToDocsIndex)
	engine.GET("/docs/*any", deps.SwaggerController.Handle)
	engine.NoRoute(handleNotFound)

	return engine
}

func handleNotFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
}
