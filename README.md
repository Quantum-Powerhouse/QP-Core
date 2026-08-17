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
- `src/components/TranspilerTerminal.tsx` — the interactive QASM → Braket IR terminal
- `src/components/ProjectHighlights.tsx` — quantum mechanics / Qiskit project cards (edit `src/lib/projects.ts`)

## Deploy

Deploy on [Vercel](https://vercel.com/new) or any Node host that supports
Next.js. Remember to set `NEXT_PUBLIC_TRANSPILER_API_URL` in the deployment's
environment variables.
