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
- `src/lib/physics/fastStatevector.ts` — a Float64Array kernel (in-place gates, flat memory) that
  reaches 20+ qubits in the browser; cross-checked against the readable engine in tests and
  raced against it live in the arcade's Engine Scaling Benchmark
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

## The Field — industry state, with receipts

`/field` holds primary-source-verified content written to the research section's
standard: hardware scoreboard (logical qubits, fidelity, code distance — results vs
roadmaps), post-quantum cryptography (NIST standards, the 2030/2035 timeline, Mosca's
inequality, RSA-2048 qubit estimates), what gets solved first, the timeline debate,
and careers. Content is typed data in `src/lib/field/*.ts`; every claim carries a
status (verified / vendor-reported / projection / opinion / estimate / contested),
a YYYY-MM date and an http source, enforced by `tests/field.test.mjs` — which also
rejects hype phrasing. `FIELD_CHECKED_ON` in `src/lib/field/types.ts` is the last
verification date; update it when re-checking sources.

## QPet — the site's quantum companion

QPet is the small interactive character living in the interface (the orb in the
bottom-right corner). Architecture, all under `src/components/quantum/`:

- `pet/QuantumPet.tsx` — the character: reacts to **real** quantum events from the
  site-wide event bus (`src/lib/quantum/events.ts` documents the honesty boundary:
  every event is sourced from an actual computation), greets route changes, and
  responds to hovering links and to being poked.
- `pet/QpitPhysics.tsx` — the motion layer: on fine-pointer devices QPet follows the
  cursor on a spring tether, hangs ~150px below it, swings like a pendulum from
  horizontal velocity, and docks back to the corner after ~3.5s of stillness. The
  position is integrated by hand (semi-implicit Euler) inside one rAF loop with
  direct style writes — zero React re-renders per frame — so every spring parameter
  can change live with emotion. Touch devices and `prefers-reduced-motion` users get
  a calm, permanently docked QPet.
- `src/lib/quantum/qpitState.ts` — the emotional state machine (pure, unit-tested):
  IDLE / CURIOUS / EXCITED / SURPRISED / ORBITING / BORED / SLEEPING, derived from
  cursor speed, idle time, and cursor winding. Each emotion carries physics + visual
  params (`QPet_PARAMS`): spring stiffness/damping, quantum jitter, swing gain,
  breathing, glow. Special moments — superposition ghosts and tunneling home — are
  cooldown-gated controlled randomness (visual metaphors, not physics claims), and a
  chattiness governor keeps QPet quiet while the user reads. To add a behavior: add
  an emotion or moment there, give it params/lines, and the physics and dialogue
  layers pick it up.
- `pet/QpForm.tsx` — the WebGL form (react-three-fiber) whose color/spin/intensity
  encode the last real event.
- `pet/petLines.ts` — event-reaction lines; `src/lib/quantum/qpitContext.ts` —
  route/hover personality (pure logic, unit-tested by `tests/qpit-context.test.mjs`
  via `npm test`, which runs on `node --test` with native type stripping).

Hover context is delegated and scalable: one document-level listener maps any
internal link's `href` through the same route logic — new pages work automatically.
`data-qpit="<section>"` on any element overrides the href-derived context.
`data-qpit-moment="<MOMENT_KEY>"` (optionally with `data-qpit-line="custom text"`)
lets any element stage a scripted QPet line on hover — the API for docs-page beats.

Shake the cursor (3+ fast reversals) to summon the black-hole anomaly — photon
ring, true-black shadow, accretion disk stretched to both sides. Hover it and
QPet explains what it is (honestly: a visual metaphor). Its own 25s cooldown
makes it the one special a visitor can reliably reproduce.

QPet also *works*. Click the docked orb to open the **QPet Console**: a transcript
of what it has said, grounded questions ("what am I looking at?" / "what next?" —
answered from the real route, with a "take me there" link), quantum facts, and
superposition answers that show two candidate lines until you press **measure**,
which collapses them with a genuine Born-rule sample. It **narrates the physics**:
every VQE convergence, transpile, measurement and arcade result (`ARCADE_RESULT`
events) becomes one computed sentence — numbers read from the event payload, never
invented. A *basis* toggle switches playful ↔ rigorous phrasing.

**Grab it**: press and drag the docked orb, let go — QPet flies with your momentum,
rubber-bands off the viewport edges, and springs home. **Moments log** (in the console)
tracks which of the five rare moments you've discovered, with a hint for each.
**`window.QPet`** in the browser console: `QPet.trigger('BLACKHOLE')`, `QPet.say('hi')`,
`QPet.moments()` — for demos and the curious. **Voice commands** (🎤 chip, Web Speech
recognition, opt-in per press): "take me to the Bell test", "what am I looking at",
"measure", "make a black hole" — a deterministic intent parser, no LLM.

**Voice** is opt-in (console toggle, localStorage `qpet.voice`): Web Speech synthesis,
no keys, no network — pitch and rate follow QPet's emotion (`src/lib/quantum/qpetVoice.ts`).

Sound effects are **opt-in** too: a small toggle next to the docked orb enables tiny synthesized
WebAudio cues (`src/lib/quantum/qpitAudio.ts` — poke pop, wormhole warp, black-hole
hum, superposition shimmer). Off by default, preference in localStorage, silent
experience remains first-class.

E2E: `npm run test:e2e` runs Playwright pointer-physics tests (`e2e/qpit.spec.ts`) —
mounting, cursor-follow, dock return, real-mouse and keyboard poke, and proof that
QPet never blocks page clicks. Runs in CI as its own job.

QPet never blocks interaction (pointer-events disabled while roaming), is keyboard
accessible (the docked orb is a button), and never fabricates state — speech lines
describe real events, real routes, and real sections only.

## The Field, the Lab, and the phone menu

- **The Field** (`src/lib/field/*.ts` → `/field/*`): ten sourced sections — hardware scoreboard,
  post-quantum cryptography, what gets solved first, the timeline debate, careers, quantum
  networking, quantum sensing, national strategies, open-source tooling, open problems. Every
  entry is a typed `FieldClaim` with a status (verified / vendor-reported / projection / opinion /
  estimate / contested / preprint), a YYYY-MM date, and an http source; `tests/field.test.mjs`
  fails the build on missing sources, invalid statuses, hype phrasing, roadmaps not tagged as
  projections, preprints not tagged as preprints, and open problems without their framing paper.
- **Circuit Lab** (`src/lib/lab/circuit.ts` → `/lab`): build circuits on up to five qubits;
  exact statevector (amplitudes, phases, per-qubit Bloch vectors), depolarizing noise on an exact
  density matrix, 1024 sampled shots, OpenQASM 2.0 export into the transpiler. Engine is pure and
  unit-tested (`tests/lab.test.mjs`).
- **Phone navigation** (`src/components/MobileNav.tsx`): the header used to hide every link below
  the `sm` breakpoint with nothing in their place. A labelled disclosure menu now lists every
  section; `e2e/mobile-nav.spec.ts` asserts all sections are reachable at 375/390/428 px.

## Deploy

Deploy on [Vercel](https://vercel.com/new) or any Node host that supports
Next.js. Remember to set `NEXT_PUBLIC_TRANSPILER_API_URL` in the deployment's
environment variables.
