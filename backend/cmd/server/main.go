package main

import (
	"log"
	"os"

	_ "github.com/brunomasunaga/fs-calculator/backend/docs"
	"github.com/brunomasunaga/fs-calculator/backend/internal/router"
	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
)

// @title FS Calculator API
// @version 1.0
// @description REST API for arithmetic and advanced calculator operations.
// @BasePath /
func main() {
	svc := service.NewCalculatorService()
	engine := router.SetupRouter(svc)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := engine.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
