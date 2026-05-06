package main

import (
	"log"

	_ "github.com/brunomasunaga/fs-calculator/backend/docs"
	"github.com/brunomasunaga/fs-calculator/backend/internal/app"
	"github.com/brunomasunaga/fs-calculator/backend/internal/config"
)

// @title FS Calculator API
// @version 1.0
// @description REST API for arithmetic and advanced calculator operations.
// @BasePath /
func main() {
	cfg := config.Load()
	container := app.NewContainer(cfg)

	if err := container.Router.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
