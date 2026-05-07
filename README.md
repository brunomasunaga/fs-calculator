# Full-Stack Calculator ![Go](https://img.shields.io/badge/go-1.25+-00ADD8?style=flat&logo=go&logoColor=white) ![React](https://img.shields.io/badge/react-19-61DAFB?style=flat&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/vite-8-646CFF?style=flat&logo=vite&logoColor=white) ![Docker](https://img.shields.io/badge/docker-dev%20stack-2496ED?style=flat&logo=docker&logoColor=white)

## ⚡ The solution
> This is a full-stack system to implement a basic operations calculator.

The repository is split into two applications:

- **Backend**: a Go Rest API that exposes the operation endpoints.
- **Frontend**: a React single-page application that handles calculator state, user input, and API communication.

Core stack:

- **Backend**: Go, Gin, Swaggo, Air
- **Frontend**: React, TypeScript, Vite, Vitest, Axios, Zustand, Tailwind, SCSS
- **Tooling**: Docker Compose for executing both Frontend and Backend as a full-stack application with support for hot-reload in development environment

#### 🏗️ Backend code architecture
```text
+-----------------------------+
| GIN ROUTER                  |
| (internal/router)           |
| requests entry point        |
+-----------------------------+
               |
               v
+-----------------------------+
| CONTROLLER                  |
| (internal/controller/...)   |
| owns HTTP contracts         |
| validates input             |
| writes responses            |
+-----------------------------+
               |
               v
+-----------------------------+
| SERVICE                     |
| (internal/service)          |
| owns business rules         |
| returns results / errors    |
+-----------------------------+
```

#### 🧩 Frontend code architecture
```text
+----------------------------------+
| PAGE                             |
| (pages/calculator)               |
| owns screen composition          |
| renders display + keypad         |
+----------------------------------+
               |
               v
+----------------------------------+
| COMPONENTS                       |
| (pages/calculator/components     |
|  + components/ui)                |
| owns UI primitives               |
| triggers user actions            |
+----------------------------------+
               |
               v
+----------------------------------+
| ZUSTAND STORE                    |
| (store/calculator/store)         |
| owns interaction flow            |
| exposes actions/selectors        |
+----------------------------------+
               |
               v
+----------------------------------+
| STATE HELPERS                    |
| (store/calculator/state)         |
| owns input transitions           |
| formats display state            |
+----------------------------------+
               |
               v
+----------------------------------+
| API SERVICES                     |
| (services/operations)            |
| calls backend operations         |
| normalizes client errors         |
+----------------------------------+
```

#### 📁 Folder structure
```text
fs-calculator/                 # root
├── backend/
│   ├── cmd/server/            # backend entrypoint
│   ├── docs/                  # generated Swagger docs
│   ├── internal/
│   │   ├── app/               # composition root / dependency wiring
│   │   ├── config/            # env-based config loading
│   │   ├── controller/        # HTTP adapters
│   │   │   └── operations/    # operation handlers and request/response contracts
│   │   ├── router/            # route registration
│   │   └── service/           # operation business logic
│   ├── Dockerfile             # backend dev image
│   └── Makefile               # backend commands
├── frontend/
│   ├── public/                # static assets
│   ├── src/
│   │   ├── components/        # shared UI primitives
│   │   ├── lib/               # frontend utilities
│   │   ├── pages/calculator/  # calculator screen, controls, and display helpers
│   │   ├── services/          # Axios client and operation API calls
│   │   ├── store/calculator/  # Zustand store, operation mapping, and pure state helpers
│   │   ├── styles/            # global styles
│   │   └── test/              # frontend test setup
│   ├── Dockerfile             # frontend dev image
│   └── package.json           # frontend scripts and dependencies
├── docker-compose.yml         # default hot-reload development stack
└── README.md                  # repository guide
```

## 🤔 Trade-offs, assumptions and decisions

1. **Separate operation endpoints**: this adds more handlers, but keeps Swagger contracts and validation straightforward. Also it moves away from the option of building an "expression evaluator", which defeats the purpose of the basic operations calculator.
2. **Pragmatic layering over strict hexagonal design**: the project uses dependency injection and explicit wiring without adding extra port abstractions that would not pay off yet. The code can evolve to an hexagonal architecture easily if it grows.
3. **Zustand over Context or Redux**: the calculator has a focused interaction model, so a small store is enough without Redux overhead.
4. **String-based entry state**: the UI stores input as text so intermediate values like `-` and `0.` are valid while the user is typing.
5. **No persistence layer**: the app is intentionally stateless, so introducing repositories or a database would only add noise.


## 🎨 Frontend design choices

1. **shadcn/ui structure**: the frontend keeps reusable UI primitives under `src/components/ui`, following the shadcn-style component organization configured in `components.json`.
2. **Tailwind for layout utilities**: component spacing, sizing, responsive behavior, and common visual states use Tailwind classes so UI changes stay close to the markup.
3. **SCSS for global visual tokens**: `src/styles/global.scss` owns global theme variables and application-level styling that should not live inside individual components.
4. **macOS Calculator visual reference**: the UI intentionally follows the compact, tactile calculator pattern from the macOS calculator, with a display-first layout and grouped operation buttons.

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

## 📃 API Documentation

The API is documented with Swagger. Once the backend is running, documentation and examples are available at [http://localhost:8080/docs](http://localhost:8080/docs).

To test the API directly, you can do a curl like the example below:

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

From Docker, after the stack is running:

```bash
docker compose exec backend make test
docker compose exec backend make coverage
```

The backend coverage command writes:

- `backend/coverage.out`
- `backend/coverage.html`

### Frontend

From `frontend/`:

```bash
npm test
npm run test:coverage
```

From Docker, after the stack is running:

```bash
docker compose exec frontend npm test
docker compose exec frontend npm run test:coverage
```

The frontend coverage command writes the HTML report to:

- `frontend/coverage/index.html`

## 🧰 Available commands

### Backend

From `backend/`:

```bash
make build          # compile the backend binary into backend/bin/server
make run            # run the backend API locally with go run
make test           # run the backend test suite with the race detector
make coverage       # generate backend coverage.out and coverage.html
make lint           # run golangci-lint
make fmt            # format backend Go code with gofmt
make generate-docs  # regenerate Swagger files under backend/docs
```

### Frontend

From `frontend/`:

```bash
npm run dev            # start the Vite development server
npm run build          # type-check and build the production frontend bundle
npm run lint           # run ESLint across the frontend
npm test               # run the frontend test suite once
npm run test:watch     # run Vitest in watch mode
npm run test:coverage  # run tests with coverage and write frontend/coverage
npm run format         # format frontend files with Prettier
```
