# FS Calculator ![Go](https://img.shields.io/badge/go-1.24+-00ADD8?style=flat&logo=go&logoColor=white) ![React](https://img.shields.io/badge/react-19-61DAFB?style=flat&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/vite-8-646CFF?style=flat&logo=vite&logoColor=white) ![Docker](https://img.shields.io/badge/docker-dev%20stack-2496ED?style=flat&logo=docker&logoColor=white)

## ⚡ The solution
> FS Calculator is a full-stack arithmetic application with a Go REST API, a React client, and a Docker-first development workflow with hot reload on both sides.

The repository is split into two applications:

- **Backend**: a Gin-based API that exposes health, docs, and versioned operation endpoints.
- **Frontend**: a React + Vite single-page application that handles calculator state, user input, and API communication.

Core stack:

- **Backend**: Go, Gin, Swaggo, Air
- **Frontend**: React, TypeScript, Vite, Vitest, Axios, Tailwind, SCSS
- **Tooling**: Docker Compose for the default hot-reload workflow

The codebase follows a pragmatic layered design:

- **Presentation layer**:
  - **Concern**: receives HTTP requests, validates payloads, and returns consistent responses.
  - **Components**: Gin router, operations controller, health controller, Swagger controller.

- **Service layer**:
  - **Concern**: applies operation rules and returns domain-level errors without transport concerns.
  - **Components**: `OperationsService`.

- **Client layer**:
  - **Concern**: renders the calculator UI, manages interaction flow, and calls backend operations.
  - **Components**: React pages, context state, API client helpers.

#### 🏗️ Backend architecture standards
```text
+-----------------------------+
| internal/app                |
| composition root            |
| wires dependencies          |
+-----------------------------+
               |
               v
+-----------------------------+
| internal/router             |
| registers routes            |
| applies middleware          |
+-----------------------------+
               |
               v
+-----------------------------+
| internal/controller/...     |
| owns HTTP contracts         |
| validates input             |
| writes responses            |
+-----------------------------+
               |
               v
+-----------------------------+
| internal/service            |
| owns business rules         |
| returns results / errors    |
| has no transport concerns   |
+-----------------------------+
```

The backend follows a small set of rules:

- `internal/app` is the composition root. It should wire dependencies together, but not contain request handling or business logic.
- `internal/router` should define routes and middleware only. It should not implement validation or business rules.
- `internal/controller/...` should translate between HTTP and the domain: bind requests, validate transport-level input, call services, and write responses.
- `internal/service` should contain business behavior and domain errors. It should not depend on Gin, HTTP response types, or transport details.
- Dependency direction should stay one-way: app -> router/controller -> service. Lower layers should not import higher layers.

#### 📁 Folder structure
```text
sezzle-calculator/              # root
├── backend/
│   ├── cmd/server/             # backend entrypoint
│   ├── docs/                   # generated Swagger docs
│   ├── internal/
│   │   ├── app/                # composition root / dependency wiring
│   │   ├── config/             # env-based config loading
│   │   ├── controller/         # HTTP adapters
│   │   │   └── operations/     # operation handlers and request/response contracts
│   │   ├── router/             # route registration
│   │   └── service/            # operation business logic
│   ├── Dockerfile              # backend dev image
│   └── Makefile                # backend commands
├── frontend/
│   ├── public/                 # static assets
│   ├── src/
│   │   ├── api/                # HTTP client helpers and tests
│   │   ├── components/         # shared UI primitives
│   │   ├── context/            # calculator state management
│   │   ├── pages/calculator/   # calculator screen and controls
│   │   ├── styles/             # global styles
│   │   └── test/               # frontend test setup
│   ├── Dockerfile              # frontend dev image
│   └── package.json            # frontend scripts and dependencies
├── docker-compose.yml          # default hot-reload development stack
└── README.md                   # repository guide
```

## 🎯 The approach

1. Keep the API contract explicit with one endpoint per operation instead of a generic evaluator.
2. Use manual dependency wiring in Go so construction stays visible and easy to extend.
3. Keep HTTP contracts close to the operations controller instead of sharing a generic DTO package.
4. Use a Docker-first workflow so backend and frontend can run with the same entrypoint.
5. Preserve fast iteration with `air` on the backend and Vite HMR on the frontend.
6. Cover controller, service, routing, config, and integration paths with automated tests.

## 🤔 Trade-offs and decisions

1. **Versioned operation routes**: the API uses `/v1/operations/...` so future versions can evolve without breaking clients.
2. **Separate operation endpoints**: this adds more handlers, but keeps Swagger contracts and validation straightforward.
3. **Pragmatic layering over strict hexagonal design**: the project uses dependency injection and explicit wiring without adding extra port abstractions that would not pay off yet.
4. **Docker as the default development flow**: this avoids local tool mismatch, at the cost of Vite polling for reliable file watching in mounted volumes.
5. **No persistence layer**: the app is intentionally stateless, so introducing repositories or a database would only add noise.

## 🔧 Potential improvements

1. Add request logging and structured metrics for backend observability.
2. Introduce frontend end-to-end tests against the running Docker stack.
3. Expand calculator history or memory features if the UI grows beyond a single-screen flow.
4. Add CI checks for lint, tests, Swagger generation, and coverage thresholds.
5. If the backend gains more adapters, move toward consumer-owned ports for stricter dependency inversion.

## 🪛 Setting up

### 1. Install dependencies
Make sure these are available on your machine:

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Optional local tooling:

- Go `1.25+` for running the backend outside Docker
- Node.js `20+` and npm for running the frontend outside Docker
- `golangci-lint` if you want to use the backend lint command locally

### 2. Start the development stack

From the repository root:

```bash
docker compose up --build
```

This is the default workflow. It starts:

- the **backend** on `http://localhost:8080`
- the **frontend** on `http://localhost:3000`

The stack uses bind mounts plus Docker-managed caches:

- Go source changes trigger rebuild/restart through `air`
- frontend changes trigger Vite hot reload
- Go module cache, Go build cache, and `node_modules` stay in Docker volumes

### 3. Environment variables

The backend reads:

| Variable | Description |
| :--- | :--- |
| `PORT` | API port. Defaults to `8080` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist. Defaults to `http://localhost:3000,http://localhost:5173` |

The frontend dev server uses:

| Variable | Description |
| :--- | :--- |
| `VITE_PROXY_TARGET` | Backend target for Vite proxy. In Docker, it uses `http://backend:8080` |
| `VITE_API_URL` | Optional frontend base URL override when you want the browser client to bypass the Vite proxy |

## ▶️ Running the applications without Docker

### Backend

From `backend/`:

```bash
make run
```

### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:3000`.

By default, the UI calls `/v1/operations/...` and relies on the Vite proxy to forward requests to the backend. It also proxies `/health` and `/docs`.

`VITE_PROXY_TARGET` controls the proxy destination. In Docker it points to `http://backend:8080`.

`VITE_API_URL` can be set when you want the browser to call a backend directly instead of using the local proxy.

## 📃 Documentation

Once the backend is running, the available endpoints include:

- Health: `GET http://localhost:8080/health`
- Swagger UI: `GET http://localhost:8080/docs`
- Operations:
  - `POST /v1/operations/add`
  - `POST /v1/operations/subtract`
  - `POST /v1/operations/multiply`
  - `POST /v1/operations/divide`
  - `POST /v1/operations/power`
  - `POST /v1/operations/sqrt`
  - `POST /v1/operations/percentage`

Example:

```bash
curl -X POST http://localhost:8080/v1/operations/percentage \
  -H "Content-Type: application/json" \
  -d '{"operand_a":50,"operand_b":90}'
```

Response:

```json
{
  "result": 45
}
```

## 🧪 Running tests

### Backend

From `backend/`:

```bash
make test
make coverage
```

You can also run:

```bash
go run github.com/golangci/golangci-lint/cmd/golangci-lint@v1.64.8 run
```

Other useful backend commands:

```bash
make build
make fmt
make generate-docs
```

### Frontend

From `frontend/`:

```bash
npm test
npm run test:coverage
npm run lint
```

Other useful frontend commands:

```bash
npm run build
npm run test:watch
npm run format
```

## 🧩 Frontend design choices

1. **Context API over Redux**: the app has a single focused calculator flow, so extra state tooling would add indirection without clear benefit.
2. **Axios over fetch**: request helpers and error handling stay centralized and easier to evolve.
3. **Tailwind plus SCSS**: layout utilities are fast to work with, while global tokens and theme styling stay in one place.
4. **Small UI primitive layer**: button and card primitives keep calculator-specific components focused on behavior.
