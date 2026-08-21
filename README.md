# QP-Core

The Quantum Powerhouse portfolio site — a dark-themed Next.js app introducing
the organization, showcasing quantum mechanics / Qiskit projects, and hosting
a live **Quantum Transpiler Terminal** that converts OpenQASM 2.0/3.0 circuits
to Amazon Braket IR via a FastAPI backend.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then set NEXT_PUBLIC_TRANSPILER_API_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuring the transpiler backend

The `TranspilerTerminal` component (`src/components/TranspilerTerminal.tsx`)
POSTs to `${NEXT_PUBLIC_TRANSPILER_API_URL}/transpile` on your FastAPI service
hosted on Render:

**Request**

```json
{ "qasm": "<OpenQASM source>", "version": "2.0" }
```

**Response** (either shape works)

```json
{ "braket_ir": { ... } }
```

or

```json
{ "ir": "<string or object>" }
```

Set `NEXT_PUBLIC_TRANSPILER_API_URL` to your Render service URL, e.g.
`https://qp-core-api.onrender.com`, in `.env.local` for local development and
in your hosting provider's environment variables for production. Make sure
the FastAPI backend enables CORS for the site's origin.

## Project structure

- `src/components/Hero.tsx` — intro/about section
- `src/components/TranspilerTerminalStudio.tsx` — the interactive QASM → Braket IR terminal
- `src/components/ProjectHighlights.tsx` — quantum mechanics / Qiskit project cards (edit `src/lib/projects.ts`)
- `src/app/playground/qp-core/` — dedicated, indexable route for the transpiler playground
- `src/lib/seo.ts` — site constants + `buildMetadata()` helper used by every route's `generateMetadata`/`metadata`
- `src/lib/jsonld.ts` + `src/components/JsonLd.tsx` — JSON-LD schema builders (Person, WebSite, SoftwareApplication, TechArticle)
- `src/lib/routes.ts` — single source of truth for real routes, consumed by `src/app/sitemap.ts`
- `src/app/sitemap.ts`, `src/app/robots.ts` — generated sitemap/robots
- `src/app/opengraph-image.tsx` (and per-route equivalents) — dynamic OG/Twitter card images via `next/og`
- `src/app/playground/vqe-suite/` — dedicated route for the VQE Suite playground
- `src/lib/physics/` — a real, self-contained quantum chemistry + circuit simulation stack (no backend
  dependency): linear algebra, Pauli operators, the H2 Hamiltonian (O'Malley et al. 2016), a statevector
  simulator, a density-matrix/Kraus-channel simulator, the H2 ansatz circuit, a parameter-shift VQE optimizer,
  and Zero-Noise Extrapolation with Richardson extrapolation
- `src/components/vqe/` — the VQE Suite UI: convergence chart, ZNE chart, ansatz circuit diagram, and the
  tabbed studio component
- `src/app/docs/` — technical documentation: `qp-core/transpiler-pipeline`, `vqe-suite/hamiltonian-and-ansatz`,
  `vqe-suite/zero-noise-extrapolation`, and `api-reference` (see below), each written against real source with
  server-rendered KaTeX math (`src/lib/math.tsx`) and reusable prose components (`src/components/docs/`)
- `public/openapi/quantumflow-api.json` — a static snapshot of the real backend's OpenAPI schema, rendered at
  `/docs/api-reference` via `@scalar/api-reference-react`. Regenerate it from the actual FastAPI app (no server
  needed) whenever `quantumflow-api`'s routes/models change:
  ```bash
  cd quantumflow-api && ./venv/Scripts/python.exe -c "from app.main import app; import json; print(json.dumps(app.openapi()))"
  ```
  When `NEXT_PUBLIC_TRANSPILER_API_URL` is set, that page fetches the **live** spec from
  `${NEXT_PUBLIC_TRANSPILER_API_URL}/openapi.json` instead of this snapshot.

## QPIT — the site's quantum companion

QPIT is the small interactive character living in the interface (the orb in the
bottom-right corner). Architecture, all under `src/components/quantum/`:

- `pet/QuantumPet.tsx` — the character: reacts to **real** quantum events from the
  site-wide event bus (`src/lib/quantum/events.ts` documents the honesty boundary:
  every event is sourced from an actual computation), greets route changes, and
  responds to hovering links and to being poked.
- `pet/QpitPhysics.tsx` — the motion layer: on fine-pointer devices QPIT follows the
  cursor on a spring tether, hangs ~90px below it, swings like a pendulum from
  horizontal velocity, and docks back to the corner after ~3.5s of stillness.
  Cursor tracking writes framer-motion MotionValues directly (zero React re-renders
  per pointer move). Touch devices and `prefers-reduced-motion` users get a calm,
  permanently docked QPIT.
- `pet/QpForm.tsx` — the WebGL form (react-three-fiber) whose color/spin/intensity
  encode the last real event.
- `pet/petLines.ts` — event-reaction lines; `src/lib/quantum/qpitContext.ts` —
  route/hover personality (pure logic, unit-tested by `tests/qpit-context.test.mjs`
  via `npm test`, which runs on `node --test` with native type stripping).

Hover context is delegated and scalable: one document-level listener maps any
internal link's `href` through the same route logic — new pages work automatically.
`data-qpit="<section>"` on any element overrides the href-derived context.

QPIT never blocks interaction (pointer-events disabled while roaming), is keyboard
accessible (the docked orb is a button), and never fabricates state — speech lines
describe real events, real routes, and real sections only.

## Deploy

Deploy on [Vercel](https://vercel.com/new) or any Node host that supports
Next.js. Remember to set `NEXT_PUBLIC_TRANSPILER_API_URL` in the deployment's
environment variables.
