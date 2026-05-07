FROM golang:1.25-alpine

WORKDIR /app

RUN apk add --no-cache git make gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download && \
	CGO_ENABLED=0 go install github.com/air-verse/air@v1.61.7 && \
	CGO_ENABLED=0 go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.64.8

COPY . .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]
