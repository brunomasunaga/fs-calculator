APP_NAME := fs-calculator-backend

.PHONY: build run test coverage lint fmt swagger docker-dev

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

docker-dev:
	docker compose up --build
