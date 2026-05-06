# Technical Implementation Plan — fs-calculator

## Project Structure

```
fs-calculator/
├── backend/                  # Go + Gin REST API
│   ├── cmd/
│   │   └── server/
│   │       └── main.go       # Entry point
│   ├── internal/
│   │   ├── controller/       # HTTP handlers (request parsing, response writing)
│   │   │   ├── calculator.go
│   │   │   └── calculator_test.go
│   │   ├── service/          # Business logic (operations, validation)
│   │   │   ├── calculator.go
│   │   │   ├── calculator_test.go
│   │   │   └── interfaces.go
│   │   ├── dto/              # Request/Response structs
│   │   │   └── calculator.go
│   │   └── router/           # Gin router setup + swagger
│   │       └── router.go
│   ├── docs/                 # Generated swagger docs
│   ├── Dockerfile
│   ├── Makefile
│   ├── go.mod
│   ├── go.sum
│   └── README.md
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/              # Axios client + API functions
│   │   │   ├── client.ts
│   │   │   └── calculator.ts
│   │   ├── context/          # React Context for state management
│   │   │   ├── CalculatorContext.tsx
│   │   │   └── __tests__/
│   │   │       └── CalculatorContext.test.tsx
│   │   ├── components/
│   │   │   └── ui/           # Pure, reusable ShadCN components (Button, Card, etc.)
│   │   │       ├── button.tsx
│   │   │       └── card.tsx
│   │   ├── pages/
│   │   │   └── calculator/   # Calculator page + its specific components
│   │   │       ├── Calculator.tsx       # Page root: composes Display + Keypad in Card
│   │   │       ├── Display.tsx          # Calculator display (page-specific)
│   │   │       ├── Keypad.tsx           # Button grid (page-specific)
│   │   │       └── OperationButton.tsx  # Single calculator button (page-specific)
│   │   ├── lib/              # ShadCN utils
│   │   │   └── utils.ts
│   │   ├── styles/
│   │   │   └── global.scss   # Color variables, global styles
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── components.json        # ShadCN config
│   ├── .prettierrc
│   ├── eslint.config.js
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docker-compose.yml
└── README.md
```

---

## API Design

Separate endpoints per operation category. This gives each handler a clean, typed contract — binary operations take two operands, unary operations take one. No optional pointer hacks, better Swagger docs, and easier per-endpoint testing.

### Binary Operations

`POST /api/v1/add`
`POST /api/v1/subtract`
`POST /api/v1/multiply`
`POST /api/v1/divide`
`POST /api/v1/power`

**Request body:**
```json
{
  "operand_a": 10.5,
  "operand_b": 3.2
}
```

**Success response (200):**
```json
{
  "result": 13.7
}
```

### Unary Operations

`POST /api/v1/sqrt`
`POST /api/v1/percentage`

**Request body:**
```json
{
  "operand": 25.0
}
```

**Success response (200):**
```json
{
  "result": 5.0
}
```

### Error response (400):
```json
{
  "error": "division by zero"
}
```

### Utility

`GET /api/v1/health` — Health check.
`GET /swagger/*` — Swagger UI.

---

## Agent Tasks

Each task below is self-contained and can be executed by an independent agent. Dependencies are noted — a task only needs its dependencies' **outputs** to exist, not to run concurrently.

---

### Task 1: Backend — Project Scaffold + Service Layer

**Depends on:** nothing
**Scope:** `backend/` directory

**Steps:**
1. Initialize Go module (`go mod init github.com/brunomasunaga/fs-calculator/backend`).
2. Create `cmd/server/main.go` — minimal placeholder that prints "server starting" (router wiring comes in Task 2).
3. Create `internal/dto/calculator.go`:
   - `BinaryOperationRequest` struct: `OperandA float64`, `OperandB float64` (both required, JSON tags + swagger annotations).
   - `UnaryOperationRequest` struct: `Operand float64` (required).
   - `CalculateResponse` struct: `Result float64`.
   - `ErrorResponse` struct: `Error string`.
4. Create `internal/service/interfaces.go`:
   - `CalculatorService` interface with methods:
     - `Add(a, b float64) float64`
     - `Subtract(a, b float64) float64`
     - `Multiply(a, b float64) float64`
     - `Divide(a, b float64) (float64, error)`
     - `Power(a, b float64) float64`
     - `Sqrt(a float64) (float64, error)`
     - `Percentage(a float64) float64`
5. Create `internal/service/calculator.go`:
   - Implement `calculatorService` struct implementing the interface.
   - Validation: division by zero, sqrt of negative number.
   - Use `math.Pow`, `math.Sqrt` from stdlib.
6. Create `internal/service/calculator_test.go`:
   - Table-driven unit tests covering every operation and every error case.
   - Use `testify/assert`.
7. Create `go.mod` / `go.sum` with dependencies: `gin`, `testify`, `swaggo/swag`, `swaggo/gin-swagger`.

**Output:** A compilable service layer with passing unit tests.

---

### Task 2: Backend — Controller + Router + Swagger + Integration Tests

**Depends on:** Task 1 (needs dto and service interface)
**Scope:** `backend/internal/controller/`, `backend/internal/router/`, `backend/cmd/server/main.go`, `backend/docs/`

**Steps:**
1. Create `internal/controller/calculator.go`:
   - `CalculatorController` struct holding a `service.CalculatorService` interface.
   - `NewCalculatorController(svc service.CalculatorService)` constructor.
   - Separate handler methods: `Add`, `Subtract`, `Multiply`, `Divide`, `Power`, `Sqrt`, `Percentage`.
   - Binary handlers: bind `BinaryOperationRequest`, call corresponding service method, return result.
   - Unary handlers: bind `UnaryOperationRequest`, call corresponding service method, return result.
   - Swagger annotations on each handler (`@Summary`, `@Accept json`, `@Produce json`, `@Param`, `@Success`, `@Failure`, `@Router`).
2. Create `internal/controller/calculator_test.go`:
   - Unit tests using a **mock** service (mock the `CalculatorService` interface).
   - Test per handler: valid request → 200, invalid JSON → 400, service error → 400 (for divide/sqrt).
   - Use `httptest.NewRecorder` + `gin.CreateTestContext`.
3. Create `internal/router/router.go`:
   - `SetupRouter(svc service.CalculatorService) *gin.Engine` function.
   - Register routes:
     - `POST /api/v1/add`
     - `POST /api/v1/subtract`
     - `POST /api/v1/multiply`
     - `POST /api/v1/divide`
     - `POST /api/v1/power`
     - `POST /api/v1/sqrt`
     - `POST /api/v1/percentage`
     - `GET /api/v1/health`
   - Register `/swagger/*any` using gin-swagger.
   - Add CORS middleware (allow frontend origin).
4. Wire up `cmd/server/main.go`:
   - Instantiate service, pass to router, listen on `:8080`.
   - Read port from `PORT` env var with default `8080`.
5. Generate swagger docs with `swag init -g cmd/server/main.go`.
6. Create integration tests (`internal/router/router_integration_test.go`):
   - Spin up the real router (no mocks), send HTTP requests, assert responses.
   - Cover: all operations, division by zero, sqrt of negative, invalid body, missing fields.

**Output:** Fully functional API server with swagger, unit tests (mocked), and integration tests.

---

### Task 3: Backend — Dockerfile + Makefile + README

**Depends on:** Task 1 + Task 2 (needs compilable code)
**Scope:** `backend/Dockerfile`, `backend/Makefile`, `backend/README.md`

**Steps:**
1. Create `backend/Dockerfile`:
   - Multi-stage build: `golang:1.23-alpine` builder → `alpine:3.19` runtime.
   - Copy go.mod/go.sum, download deps, copy source, build binary.
   - Final stage: copy binary, expose 8080, set entrypoint.
2. Create `backend/Makefile` with targets:
   - `build` — compile binary
   - `run` — run locally
   - `test` — run all tests with `-race`
   - `coverage` — run tests with coverage report (HTML + terminal)
   - `lint` — run `golangci-lint`
   - `fmt` — run `gofmt -w`
   - `swagger` — generate swagger docs
   - `docker-build` — build Docker image
   - `docker-run` — run Docker container
3. Create `backend/README.md`:
   - Architecture overview (3-tier: controller → service, no repository needed).
   - Layer responsibilities.
   - Setup instructions (Go 1.23+, `make run`).
   - API examples (curl commands for each endpoint).
   - Test commands.

**Output:** Production-ready Dockerfile, developer-friendly Makefile, clear README.

---

### Task 4: Frontend — Project Scaffold + API Layer + State Management

**Depends on:** nothing (API contract is defined above)
**Scope:** `frontend/` directory

**Steps:**
1. Scaffold Vite + React + TypeScript project (`npm create vite@latest`).
2. Install dependencies:
   - `axios`, `sass`
   - `tailwindcss`, `@tailwindcss/vite`, `postcss`, `autoprefixer`
   - `shadcn` (init with New York style, slate theme)
   - `prettier`, `eslint`, `@typescript-eslint/*`, `eslint-plugin-react-hooks`
   - `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
3. Configure: `tailwind.config.ts`, `tsconfig.json`, `.prettierrc`, `eslint.config.js`, `vitest` in `vite.config.ts`.
4. Create `src/styles/global.scss`: color variables (primary, secondary, accent, background, text), base styles.
5. Create `src/api/client.ts`: Axios instance with `baseURL` from env var `VITE_API_URL` (default `http://localhost:8080`).
6. Create `src/api/calculator.ts`:
   - Separate functions per operation matching the backend endpoints:
     - `add(a: number, b: number): Promise<number>` — POST `/api/v1/add`
     - `subtract(a: number, b: number): Promise<number>` — POST `/api/v1/subtract`
     - `multiply(a: number, b: number): Promise<number>` — POST `/api/v1/multiply`
     - `divide(a: number, b: number): Promise<number>` — POST `/api/v1/divide`
     - `power(a: number, b: number): Promise<number>` — POST `/api/v1/power`
     - `sqrt(a: number): Promise<number>` — POST `/api/v1/sqrt`
     - `percentage(a: number): Promise<number>` — POST `/api/v1/percentage`
   - Types: `BinaryOperationRequest`, `UnaryOperationRequest`, `CalculateResponse`, `ErrorResponse`.
   - A convenience `calculate(operation: string, a: number, b?: number)` dispatcher that routes to the correct function.
7. Create `src/context/CalculatorContext.tsx`:
   - State: `display` (string), `operandA` (number | null), `operation` (string | null), `waitingForOperandB` (bool), `error` (string | null).
   - Actions exposed directly from context (no separate hooks layer — Context API is sufficient for this scope):
     - `inputDigit(digit: string)`, `inputOperation(op: string)`, `inputEquals()`, `inputClear()`, `inputSqrt()`, `inputPercentage()`, `inputDecimal()`.
   - On `inputEquals`: call the API dispatcher, update display with result.
   - Export `CalculatorProvider` component and `useCalculatorContext()` (a typed `useContext` call — not a custom hook, just the standard context consumer pattern).
8. Create unit tests:
   - `src/context/__tests__/CalculatorContext.test.tsx`: test state transitions (digit input, operation selection, equals triggers API call, clear resets). Mock axios.

**Output:** Working state management + API layer with passing tests, no UI yet.

**Why no hooks layer:** A `useCalculator` hook would be a one-liner wrapping `useContext(CalculatorContext)` — it adds indirection with no value. The context already exposes all state and actions. Components consume it directly via `useCalculatorContext()`. If the app grew to need derived state or complex composition, hooks could be introduced then.

---

### Task 5: Frontend — UI Components

**Depends on:** Task 4 (needs context + api layer)
**Scope:** `frontend/src/components/`, `frontend/src/pages/`, `frontend/src/App.tsx`

The frontend follows a clear separation:
- `src/components/ui/` — pure, reusable ShadCN primitives (Button, Card). No business logic. These are generic building blocks usable by any page.
- `src/pages/<page>/` — page-level components that compose UI primitives with business logic (context consumption, event wiring). Each page owns its specific components.

**Steps:**
1. Add ShadCN components: `button`, `card` (via `npx shadcn@latest add button card`). These land in `src/components/ui/`.
2. Create `src/pages/calculator/Display.tsx`:
   - Shows current display value and error messages.
   - Consumes `useCalculatorContext()` for display state.
   - Styled with Tailwind: large font, right-aligned, monospace.
3. Create `src/pages/calculator/OperationButton.tsx`:
   - Button for digits and operations.
   - Props: `label`, `onClick`, `variant` (digit | operation | special).
   - Uses ShadCN `Button` from `components/ui/` with Tailwind classes for grid sizing.
4. Create `src/pages/calculator/Keypad.tsx`:
   - Grid layout (4 columns) with all buttons: 0-9, +, -, ×, ÷, =, C, ., √, %, ^.
   - Consumes `useCalculatorContext()` to wire button clicks to actions.
5. Create `src/pages/calculator/Calculator.tsx`:
   - Composes Display + Keypad inside a ShadCN `Card` from `components/ui/`.
   - Wrapped in `CalculatorProvider`.
   - Responsive: centered on page, max-width for desktop, full-width on mobile.
6. Update `src/App.tsx`: render `<Calculator />` from `pages/calculator/`.
7. Update `src/main.tsx`: import global.scss.

**Output:** Fully functional calculator UI with clean separation between reusable UI primitives and page-specific components.

---

### Task 6: Frontend — Dockerfile + Config + README

**Depends on:** Task 4 + Task 5
**Scope:** `frontend/Dockerfile`, `frontend/package.json` scripts, `frontend/README.md`

**Steps:**
1. Ensure `package.json` scripts:
   - `dev` — `vite` (dev server)
   - `build` — `tsc && vite build`
   - `preview` — `vite preview`
   - `test` — `vitest run`
   - `test:watch` — `vitest`
   - `test:coverage` — `vitest run --coverage`
   - `lint` — `eslint .`
   - `format` — `prettier --write .`
2. Create `frontend/Dockerfile`:
   - Multi-stage: `node:20-alpine` builder → `nginx:alpine` runtime.
   - Build stage: install deps, build, copy to nginx.
   - Use a custom `nginx.conf` to proxy `/api` to backend and serve SPA (fallback to index.html).
3. Create `frontend/nginx.conf`: SPA routing + API proxy.
4. Create `frontend/README.md`:
   - Architecture (state in Context consumed directly — no hooks layer; `components/ui/` for reusable ShadCN primitives, `pages/calculator/` for page-specific components; API calls separated in `api/`).
   - Setup instructions.
   - Available scripts.
   - Tech stack rationale.

**Output:** Production Dockerfile with nginx, complete npm scripts, clear README.

---

### Task 7: Root — Docker Compose + Root README

**Depends on:** Task 3 + Task 6 (needs both Dockerfiles)
**Scope:** root `docker-compose.yml`, root `README.md`

**Steps:**
1. Create `docker-compose.yml`:
   - Service `backend`: build `./backend`, port `8080:8080`.
   - Service `frontend`: build `./frontend`, port `3000:80`, depends_on `backend`.
   - Network: default bridge is fine.
2. Create root `README.md`:
   - Project overview.
   - Quick start: `docker-compose up --build`.
   - Architecture diagram (text-based).
   - API examples with curl for each endpoint.
   - **Trade-offs & API Design Decisions** section:
     - Why one endpoint per operation instead of a single `/calculate` endpoint:
       - Pro: each handler has a typed, unambiguous contract (binary ops require two operands, unary require one — no optional fields or pointer hacks).
       - Pro: Swagger docs are self-describing per endpoint — consumers see exactly what each route expects.
       - Pro: easier to test, maintain, and extend independently (add a new operation = add a new route + handler, no switch/case growth).
       - Pro: per-endpoint middleware/rate-limiting is trivial if needed later.
       - Trade-off: more routes and slight boilerplate, but the service layer is shared so logic isn't duplicated.
       - Trade-off: a single-endpoint approach would be simpler for a generic "evaluate expression" use case, but this is a fixed set of operations where explicit contracts win.
     - Why POST for all operations (not GET):
       - Operations have side-effect-like semantics (compute something from a body), and POST avoids query-string encoding of floats.
     - Why REST over RPC-style or WebSocket:
       - Stateless calculator with simple request/response — REST is the natural fit. No need for persistent connections or streaming.
   - Other design decisions:
     - No database needed (stateless calculator).
     - Context API over Redux (appropriate for this scale).
     - ShadCN for consistent, accessible components.
   - Layout/design rationale.

**Output:** One-command deployment, comprehensive root README.

---

## Execution Order (Parallelism)

```
Phase 1 (parallel):  Task 1  |  Task 4
Phase 2 (parallel):  Task 2  |  Task 5
Phase 3 (parallel):  Task 3  |  Task 6
Phase 4:             Task 7
```

Tasks 1-3 (backend) and Tasks 4-6 (frontend) are fully independent tracks that can run in parallel. Task 7 ties them together at the end.

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| One endpoint per operation | Clean typed contracts — binary ops get two required operands, unary ops get one. No optional pointer hacks. Swagger docs are self-describing per endpoint. Each handler is small and independently testable. |
| Separate `BinaryOperationRequest` / `UnaryOperationRequest` DTOs | Type-safe request shapes. No ambiguity about which fields are required. |
| Service returns `error` not HTTP status | Controller maps domain errors to HTTP codes — keeps service layer transport-agnostic. |
| Context API over Redux (no hooks layer) | Redux is overkill for a single-feature app. Context exposes state + actions directly — no need for a separate hooks layer that would just wrap `useContext`. |
| `components/ui/` vs `pages/<page>/` split | ShadCN primitives are generic and reusable. Page-specific components (Display, Keypad) compose those primitives with business logic and belong to the page that owns them. |
| Axios over fetch | Cleaner error handling, interceptors, request/response typing. |
| ShadCN + Tailwind | Pre-built accessible components + utility-first CSS. No runtime overhead. |
| Multi-stage Docker builds | Minimal image size (~15MB backend, ~25MB frontend). |
| CORS in backend | Simplest approach for dev. Nginx proxy handles it in production Docker setup. |
