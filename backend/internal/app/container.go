package app

import (
	"github.com/brunomasunaga/fs-calculator/backend/internal/config"
	"github.com/brunomasunaga/fs-calculator/backend/internal/controller"
	"github.com/brunomasunaga/fs-calculator/backend/internal/router"
	"github.com/brunomasunaga/fs-calculator/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type Container struct {
	Config      config.Config
	Services    Services
	Controllers Controllers
	Router      *gin.Engine
}

type Services struct {
	Calculator service.CalculatorService
}

type Controllers struct {
	Calculator *controller.CalculatorController
	Health     *controller.HealthController
	Swagger    *controller.SwaggerController
}

func NewContainer(cfg config.Config) *Container {
	services := Services{
		Calculator: service.NewCalculatorService(),
	}

	controllers := Controllers{
		Calculator: controller.NewCalculatorController(services.Calculator),
		Health:     controller.NewHealthController(),
		Swagger:    controller.NewSwaggerController(),
	}

	engine := router.SetupRouter(router.Config{
		AllowedOrigins: cfg.AllowedOrigins,
	}, router.Dependencies{
		CalculatorController: controllers.Calculator,
		HealthController:     controllers.Health,
		SwaggerController:    controllers.Swagger,
	})

	return &Container{
		Config:      cfg,
		Services:    services,
		Controllers: controllers,
		Router:      engine,
	}
}
