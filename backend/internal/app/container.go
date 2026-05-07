package app

import (
	"github.com/brunomasunaga/fs-calculator/backend/internal/config"
	"github.com/brunomasunaga/fs-calculator/backend/internal/controller"
	operationscontroller "github.com/brunomasunaga/fs-calculator/backend/internal/controller/operations"
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
	Operations service.OperationsService
}

type Controllers struct {
	Operations *operationscontroller.OperationsController
	Health     *controller.HealthController
	Swagger    *controller.SwaggerController
}

func NewContainer(cfg config.Config) *Container {
	services := Services{
		Operations: service.NewOperationsService(),
	}

	controllers := Controllers{
		Operations: operationscontroller.NewOperationsController(services.Operations),
		Health:     controller.NewHealthController(),
		Swagger:    controller.NewSwaggerController(),
	}

	engine := router.SetupRouter(router.Config{
		AllowedOrigins: cfg.AllowedOrigins,
	}, router.Dependencies{
		OperationsController: controllers.Operations,
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
