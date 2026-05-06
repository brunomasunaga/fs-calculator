# FS Calculator

Full-stack calculator application with a Go API and a React frontend.

## Quick start

```bash
docker compose up --build
```

This is the default Docker workflow and it is hot-reload oriented:

- backend runs through `air` and rebuilds/restarts on Go file changes
- frontend runs the Vite dev server with polling enabled for Docker-mounted files
- source code is bind-mounted into both containers
- Go module/build caches and frontend `node_modules` stay in Docker volumes

After the containers start:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Docs: `http://localhost:8080/docs/index.html`

The backend CORS allowlist is configured through `ALLOWED_ORIGINS`. The default Docker setup uses:

```text
http://localhost:3000,http://localhost:5173
```

## Architecture

```text
Frontend (React + Context + Axios)
        |
        v
Backend API (Gin controllers)
        |
        v
Calculator service layer
```

- The frontend owns presentation, user input, and state transitions.
- The backend owns validation, operation handling, and HTTP responses.
- The service layer stays transport-agnostic and returns domain errors.
- There is no repository or database because the application is stateless.

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
  -d '{"operand_a":50,"operand_b":90}'
```

Health check:

```bash
curl http://localhost:8080/health
```

## Trade-offs and API design

### One endpoint per operation

Why this was chosen:

- Binary and unary operations have different request shapes, so separate endpoints keep the contract explicit.
- Swagger stays self-describing because each route documents exactly one payload type.
- Testing stays small and focused because handlers do not need a large `switch` over mixed operation types.
- Adding a new operation is localized to one route, one handler, and one service method.

Trade-offs:

- There are more routes and a bit more boilerplate than a single `/calculate` endpoint.
- A generic expression evaluator would fit a different API shape better, but this project has a fixed operation set where explicit contracts are clearer.

### Why `POST` for operations

- The calculator sends structured request bodies.
- Floating-point operands are cleaner in JSON than query strings.
- The interface stays consistent across binary and unary operations.

### Why REST

- The app is request/response driven.
- There is no streaming, collaboration, or server push requirement.
- WebSockets or RPC would add complexity without improving the user flow here.

## Other decisions

- Context API over Redux: one feature, one page, low shared-state complexity.
- Axios over `fetch`: simpler error normalization and endpoint helpers.
- ShadCN-style primitives: reusable button/card building blocks without locking the page layout into a generic template.
- Docker bind mounts + cached volumes: fast feedback without reinstalling dependencies on every change.

## Layout and design rationale

- The interface centers the calculator as the only task on screen, which keeps the interaction fast on desktop and mobile.
- Warm neutrals with orange/teal accents make operation controls stand out without falling into the usual dark-calculator visual pattern.
- The display uses a monospace treatment for readability, while the surrounding typography stays more expressive.
