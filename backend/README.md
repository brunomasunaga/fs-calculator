# Backend

Go + Gin service that exposes calculator endpoints. The code is split into a thin HTTP layer and a business layer:

- `internal/controller`: request parsing, validation, and HTTP responses
- `internal/service`: calculator operations and domain errors
- `internal/dto`: request and response payloads
- `internal/router`: route registration, CORS, and Swagger wiring

There is no repository layer because the application is stateless and does not persist data.

## Requirements

- Go 1.25+
- Docker (optional)
- `golangci-lint` for `make lint`

## Run locally

```bash
make run
```

The server listens on `:8080` by default. Override it with `PORT`.

CORS allowed origins are configured with `ALLOWED_ORIGINS` as a comma-separated list. If unset, the backend defaults to:

```text
http://localhost:3000,http://localhost:5173
```

## Hot reload in Docker

```bash
make docker-dev
```

The default Docker setup uses `air` to rebuild and restart the API automatically when Go source files change.

## Build and test

```bash
make build
make test
make coverage
make swagger
```

## Lint and format

```bash
make fmt
make lint
```

## Docker

```bash
make docker-dev
```

That starts the default hot-reload stack through the root `docker-compose.yml`.

## API examples

Addition:

```bash
curl -X POST http://localhost:8080/v1/operations/add \
  -H "Content-Type: application/json" \
  -d '{"operand_a":10.5,"operand_b":3.2}'
```

Subtraction:

```bash
curl -X POST http://localhost:8080/v1/operations/subtract \
  -H "Content-Type: application/json" \
  -d '{"operand_a":10.5,"operand_b":3.2}'
```

Multiplication:

```bash
curl -X POST http://localhost:8080/v1/operations/multiply \
  -H "Content-Type: application/json" \
  -d '{"operand_a":10.5,"operand_b":3.2}'
```

Division:

```bash
curl -X POST http://localhost:8080/v1/operations/divide \
  -H "Content-Type: application/json" \
  -d '{"operand_a":10.5,"operand_b":3.2}'
```

Power:

```bash
curl -X POST http://localhost:8080/v1/operations/power \
  -H "Content-Type: application/json" \
  -d '{"operand_a":2,"operand_b":3}'
```

Square root:

```bash
curl -X POST http://localhost:8080/v1/operations/sqrt \
  -H "Content-Type: application/json" \
  -d '{"operand":25}'
```

Percentage:

```bash
curl -X POST http://localhost:8080/v1/operations/percentage \
  -H "Content-Type: application/json" \
  -d '{"operand":25}'
```

Health check:

```bash
curl http://localhost:8080/health
```
