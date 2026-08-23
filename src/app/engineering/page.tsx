import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Engineering Decisions — The Hard Parts and the Calls Made",
  description:
    "The real tradeoffs behind Quantum Powerhouse: a from-scratch TypeScript physics engine instead of a JavaScript Qiskit, objects versus typed arrays at the 2ⁿ wall, exact density matrices for noise, parameter-shift gradients, a Python transpiler service (no Rust), evidence-integrity CI, the pet's honesty boundary, and the bugs CI caught that a laptop never would.",
  path: "/engineering",
  keywords: ["engineering decisions quantum simulator", "statevector typed arrays performance", "parameter shift rule", "evidence integrity CI", "quantum software engineering tradeoffs"],
  ogTitle: "Engineering Decisions",
});

const DECISIONS: { title: string; problem: string; call: string; cost: string; proof: { label: string; href: string } }[] = [
  {
    title: "Write the physics from scratch in TypeScript",
    problem: "The browser needed a statevector simulator, a density-matrix simulator, a variational optimizer and error mitigation. No maintained JavaScript port of Qiskit exists, and shipping a Python service for every interaction would make every demo a network call.",
    call: "A small, readable engine (complex linear algebra, gates, CNOT, Kraus channels, parameter-shift VQE, Richardson-extrapolated ZNE) written against the textbook, with the H₂ Hamiltonian coefficients taken from O'Malley et al. 2016 and checked against exact diagonalization.",
    cost: "Every primitive had to be tested against known results (Bell-pair purity ½, VQE within chemical accuracy, ZNE beating the raw noisy point) — a test suite that now runs in CI. The upside is the site's core promise: nothing renders that didn't compute, and the engine is small enough to read.",
    proof: { label: "tests/physics.test.mjs", href: "https://github.com/Quantum-Powerhouse/QP-Core/blob/main/tests/physics.test.mjs" },
  },
  {
    title: "Readable objects for teaching, typed arrays for scale",
    problem: "One complex-number object per amplitude is clear to read and fine for 2–5 qubit games, but 2ⁿ objects hit a wall around 14 qubits.",
    call: "Keep the readable engine for every game, and add a second Float64Array kernel (split re/im, in-place gates) for the scaling benchmark — cross-checked against the readable engine on random circuits to 1e-10.",
    cost: "Two engines to keep in agreement, enforced by a test. The benchmark on the arcade runs both live on the visitor's machine, which is the honest way to show the 2ⁿ wall rather than describe it.",
    proof: { label: "Engine Scaling Benchmark", href: "/playground/arcade#engine-scaling-benchmark" },
  },
  {
    title: "Exact density matrices for noise, not stochastic sampling",
    problem: "Noise could be modeled by sampling Pauli errors (cheap, noisy numbers) or by evolving the full density matrix under a depolarizing channel (exact, 4ⁿ memory).",
    call: "Exact density matrices everywhere noise appears — the ZNE panel, the Decoherence Dial, the Circuit Lab — so purity and coherence are computed values, not estimates with error bars.",
    cost: "It caps noisy circuits at five qubits in the browser. For a teaching site that is the right trade: a visitor turning a noise slider sees a smooth, exact curve rather than Monte-Carlo jitter.",
    proof: { label: "Circuit Lab — noise panel", href: "/lab" },
  },
  {
    title: "Parameter-shift gradients for the VQE",
    problem: "Finite differences are simpler but introduce a step-size error; the parameter-shift rule gives the exact gradient for rotation gates.",
    call: "Parameter-shift. The convergence curve on the VQE suite is therefore an exact gradient descent, and the final energy matches full diagonalization to the precision shown.",
    cost: "Two energy evaluations per parameter per step instead of one — irrelevant at two qubits, and the correctness is worth more than the speed.",
    proof: { label: "docs: Hamiltonian and ansatz", href: "/docs/vqe-suite/hamiltonian-and-ansatz" },
  },
  {
    title: "A Python transpiler service — and a false keyword removed",
    problem: "OpenQASM → Amazon Braket IR needs Qiskit's parser and the Braket provider; that stack is Python and far too heavy for edge functions.",
    call: "A FastAPI service (Python, Qiskit, qiskit-braket-provider) with an honest mock on the site when the service is down: the mock's Braket IR is labeled mock: true while its circuit metrics are still computed from the real QASM. During this write-up an SEO keyword claiming a 'Rust quantum compiler pass' was found on two pages. There is no Rust in the project; the keyword was removed.",
    cost: "A second deployment to keep alive, and the site has to degrade honestly when it isn't. The real-hardware lane lives in the same service so the whole 'leaves the browser' path is one codebase.",
    proof: { label: "docs: transpiler pipeline", href: "/docs/qp-core/transpiler-pipeline" },
  },
  {
    title: "Make honesty mechanical: evidence-integrity CI",
    problem: "Research claims drift: a status changes in one file and not another, a number gets retyped, a source link rots.",
    call: "The research record lives in two representations (a portable evidence.json and typed TypeScript the site renders) and a validator cross-checks them on every push — IDs, statuses, source URLs. The Field section gets the same treatment plus a hype-phrase blocklist and rules like 'roadmaps must be tagged projection' and 'preprints must be tagged preprint'.",
    cost: "Adding a claim means touching two files and satisfying a test. That friction is the point.",
    proof: { label: "scripts/validate-research.mjs", href: "https://github.com/Quantum-Powerhouse/QP-Core/blob/main/scripts/validate-research.mjs" },
  },
  {
    title: "The pet's honesty boundary",
    problem: "A talking companion is a temptation to invent: it could easily 'explain' physics it hasn't computed.",
    call: "QPet can only say three kinds of things: lines about real routes and sections, lines about its own emotional state machine, and narration of real engine events with the numbers read from the event payload. No language model. Its collapses are genuine Born-rule samples.",
    cost: "It is less 'magical' than an LLM chatbot would be, and that is deliberate — a pet that invents a Hamiltonian would break the site's one rule.",
    proof: { label: "lib/quantum/events.ts — the documented boundary", href: "https://github.com/Quantum-Powerhouse/QP-Core/blob/main/src/lib/quantum/events.ts" },
  },
  {
    title: "What CI caught that a laptop never would",
    problem: "Two real defects shipped past local testing: while roaming, the pet's body ignored pointer events so a real mouse click could never poke it (programmatic clicks had masked this); and the phone menu's close-on-route-change effect fired on mount, racing a fast tap on slow devices.",
    call: "A headed Playwright job in CI on every push — real pointer events, real hydration timing, phone viewports at 375/390/428 px.",
    cost: "Roughly three extra minutes per CI run and one flaky-timing lesson (never run e2e concurrently with next build — they share .next). Both bugs were found by the job, not by me.",
    proof: { label: "e2e/ on GitHub", href: "https://github.com/Quantum-Powerhouse/QP-Core/tree/main/e2e" },
  },
  {
    title: "Deployment: the known wart",
    problem: "Pushing to GitHub runs CI but does not deploy: the Vercel project has no Git integration, so production updates are manual CLI deploys.",
    call: "Documented, not hidden. Every deploy in the history was a deliberate CLI action after a green CI run; the fix is a one-minute dashboard change that requires the owner's account.",
    cost: "A human in the loop between 'green' and 'live'. Honest about it here rather than pretending the pipeline is fully automatic.",
    proof: { label: "README — Deploy", href: "https://github.com/Quantum-Powerhouse/QP-Core#deploy" },
  },
];

export default function EngineeringPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <p className="mb-2 font-mono text-sm text-accent">Engineering</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Decisions, and what they cost</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          A showcase hides its tradeoffs. This page lists the ones that shaped the site — the problem, the call, what
          it cost, and where you can check it. One entry documents a false claim found and removed during this
          write-up, because that is what the site&apos;s standard demands.
        </p>
        <div className="mt-10 flex flex-col gap-6">
          {DECISIONS.map((d, i) => (
            <section key={d.title} className="glass-panel rounded-xl p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted">decision {String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{d.title}</h2>
              <dl className="mt-3 grid gap-3 text-sm leading-relaxed sm:grid-cols-[5rem_1fr]">
                <dt className="font-mono text-xs uppercase tracking-wider text-accent">problem</dt>
                <dd className="text-muted">{d.problem}</dd>
                <dt className="font-mono text-xs uppercase tracking-wider text-accent">the call</dt>
                <dd className="text-foreground">{d.call}</dd>
                <dt className="font-mono text-xs uppercase tracking-wider text-accent">the cost</dt>
                <dd className="text-muted">{d.cost}</dd>
                <dt className="font-mono text-xs uppercase tracking-wider text-accent">check it</dt>
                <dd>
                  {d.proof.href.startsWith("/") ? (
                    <Link href={d.proof.href} className="font-mono text-xs text-accent underline-offset-2 hover:underline">{d.proof.label}</Link>
                  ) : (
                    <a href={d.proof.href} className="font-mono text-xs text-accent underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">{d.proof.label} ↗</a>
                  )}
                </dd>
              </dl>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          Who made these calls: <Link href="/builder" className="text-accent">the builder</Link>. What they were made for:{" "}
          <Link href="/research/paper" className="text-accent">the paper</Link>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
