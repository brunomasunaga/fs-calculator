APP_NAME := fs-calculator-backend

.PHONY: build run test coverage lint fmt swagger docker-build docker-run

build:
	go build -o bin/server ./cmd/server

run:
	go run ./cmd/server

test:
	go test ./... -race

coverage:
	go test ./... -coverprofile=coverage.out
	go tool cover -func=coverage.out
	go tool cover -html=coverage.out -o coverage.html

lint:
	golangci-lint run

fmt:
	gofmt -w ./cmd ./internal

swagger:
	go run github.com/swaggo/swag/cmd/swag@v1.16.4 init -g cmd/server/main.go -o docs

docker-build:
	docker build -t $(APP_NAME) .

docker-run:
	docker run --rm -p 8080:8080 $(APP_NAME)

