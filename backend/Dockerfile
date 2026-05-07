# syntax=docker/dockerfile:1.7

FROM golang:1.25-alpine AS dev

WORKDIR /app

RUN apk add --no-cache git make gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download
RUN --mount=type=cache,target=/root/.cache/go-build \
	CGO_ENABLED=0 go install github.com/air-verse/air@v1.61.7

COPY . .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]

FROM dev AS lint

RUN --mount=type=cache,target=/root/.cache/go-build \
	CGO_ENABLED=0 go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.64.8
