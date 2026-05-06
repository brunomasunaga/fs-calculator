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
make docker-build
make docker-run
```

## API examples

Addition:

```bash
curl -X POST http://localhost:8080/api/v1/add \
  -H "Content-Type: application/json" \
  -d '{"operand_a":10.5,"operand_b":3.2}'
```

Subtraction:

```bash
curl -X POST http://localhost:8080/api/v1/subtract \
  -H "Content-Type: application/json" \
  -d '{"operand_a":10.5,"operand_b":3.2}'
```

Multiplication:

```bash
curl -X POST http://localhost:8080/api/v1/multiply \
  -H "Content-Type: application/json" \
  -d '{"operand_a":10.5,"operand_b":3.2}'
```

Division:

```bash
curl -X POST http://localhost:8080/api/v1/divide \
  -H "Content-Type: application/json" \
  -d '{"operand_a":10.5,"operand_b":3.2}'
```

Power:

```bash
curl -X POST http://localhost:8080/api/v1/power \
  -H "Content-Type: application/json" \
  -d '{"operand_a":2,"operand_b":3}'
```

Square root:

```bash
curl -X POST http://localhost:8080/api/v1/sqrt \
  -H "Content-Type: application/json" \
  -d '{"operand":25}'
```

Percentage:

```bash
curl -X POST http://localhost:8080/api/v1/percentage \
  -H "Content-Type: application/json" \
  -d '{"operand":25}'
```

Health check:

```bash
curl http://localhost:8080/api/v1/health
```
