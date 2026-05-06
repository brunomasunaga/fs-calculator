# Frontend

React + TypeScript calculator client built with Vite.

## Architecture

- `src/api`: Axios client and calculator endpoint helpers
- `src/context`: Calculator state and actions exposed through Context API
- `src/components/ui`: reusable UI primitives
- `src/pages/calculator`: page-owned components that wire the UI to the context
- `src/styles/global.scss`: design tokens and global styling

The state lives directly in Context because this app has a single focused feature. A separate hooks abstraction would only wrap `useContext` without adding useful composition.

## Requirements

- Node.js 20+
- npm
- Docker (optional)

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:3000`. By default the app calls `/v1/operations/...` and expects the Vite proxy to forward those requests. `/health` and `/docs` are proxied too. Set `VITE_API_URL` only when you want to bypass the proxy and hit a backend directly.

## Docker

```bash
docker compose up --build
```

The default Docker setup bind-mounts the source tree, runs Vite in dev mode, and proxies `/api` requests to the backend container through `VITE_PROXY_TARGET=http://backend:8080`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm test
npm run test:watch
npm run test:coverage
npm run lint
npm run format
```

## Tech choices

- React + TypeScript: predictable component model with strong typing
- Context API: enough state management for a single calculator flow
- Axios: simpler request helpers and API error mapping
- Tailwind + SCSS: utility-first layout with a small global token layer
- ShadCN-style primitives: consistent, reusable button and card components
