FROM golang:1.25-alpine

WORKDIR /app

RUN apk add --no-cache git make gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download && go install github.com/air-verse/air@v1.61.7

COPY . .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]
