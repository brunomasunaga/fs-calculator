package controller

import (
	"net/http"

	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/gin-gonic/gin"
)

type SwaggerController struct {
	handler gin.HandlerFunc
}

func NewSwaggerController() *SwaggerController {
	return &SwaggerController{
		handler: ginSwagger.WrapHandler(swaggerfiles.Handler),
	}
}

func (sc *SwaggerController) Handle(c *gin.Context) {
	sc.handler(c)
}

func (sc *SwaggerController) RedirectToDocsIndex(c *gin.Context) {
	c.Redirect(http.StatusMovedPermanently, "/docs/index.html")
}

func (sc *SwaggerController) RedirectDocsEntry() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/docs/" {
			sc.RedirectToDocsIndex(c)
			c.Abort()
			return
		}

		c.Next()
	}
}
