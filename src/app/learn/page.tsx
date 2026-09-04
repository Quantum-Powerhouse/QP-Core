import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Learn Quantum Computing by Playing: a Guided Path",
  description:
    "A four level path through the Quantum Arcade: from one qubit and the Born rule, through entanglement and Bell tests, to algorithms, noise and error correction, every step a real simulation you operate.",
  path: "/learn",
  keywords: ["learn quantum computing", "quantum computing course interactive", "qubit tutorial", "entanglement explained", "Grover algorithm tutorial"],
  ogTitle: "Learn by Playing",
});

const LEVELS: { level: string; title: string; goal: string; steps: { game: string; slug: string; learn: string }[] }[] = [
  {
    level: "Level 1",
    title: "One qubit",
    goal: "Leave knowing what a state is, what a gate does, and why measurement is a question, not a reading.",
    steps: [
      { game: "Gate Mixer", slug: "gate-mixer", learn: "A qubit is an arrow; gates rotate it. Press H twice and watch it come back." },
      { game: "π-Pulse Trainer", slug: "pulse-trainer", learn: "How a NOT gate is made: by calibrating a rotation." },
      { game: "Born Casino", slug: "born-casino", learn: "Probability is fundamental here. You cannot beat it, and that is the lesson." },
      { game: "Measurement Duel", slug: "measurement-duel", learn: "The same state answers Z and X differently. That is complementarity." },
      { game: "State Match", slug: "state-match", learn: "Fidelity: how close two states are, as a steering skill." },
    ],
  },
  {
    level: "Level 2",
    title: "Interference: the engine",
    goal: "See why phase, not probability, is the quantum resource.",
    steps: [
      { game: "Interference Lab", slug: "interference-lab", learn: "Two paths, one phase knob, certainty to impossibility. Every algorithm uses this." },
      { game: "Phase Kickback", slug: "phase-kickback", learn: "The control qubit takes the hit. Deutsch and Grover run on this trick." },
      { game: "Bloch Detective", slug: "bloch-detective", learn: "Read gates off a Bloch sphere by eye." },
    ],
  },
  {
    level: "Level 3",
    title: "Entanglement: no classical story",
    goal: "Experience the thing Einstein called spooky, and measure it.",
    steps: [
      { game: "Entanglement Dial", slug: "entanglement-dial", learn: "Turn two qubits into one inseparable pair; watch qubit A's purity drop to ½." },
      { game: "Entangled Dice", slug: "entangled-dice", learn: "Random each, identical together." },
      { game: "CHSH. Beat the Classical Bound", slug: "chsh-beat-the-classical-bound", learn: "Violate a Bell inequality with your own sampled rounds." },
      { game: "Teleportation Walkthrough", slug: "teleportation-walkthrough", learn: "Move a state without moving matter, and why it can't beat light." },
      { game: "Superdense Coding", slug: "superdense-coding", learn: "Two bits on one qubit, with a pre shared pair." },
      { game: "The Cloning Button", slug: "the-cloning-button", learn: "Why copying is forbidden, the theorem that secures QKD." },
      { game: "The GHZ Game", slug: "the-ghz-game", learn: "Beat a provable 75% classical ceiling every single round." },
    ],
  },
  {
    level: "Level 4",
    title: "Algorithms, noise and error correction",
    goal: "Run the famous algorithms, then see what noise does to them and how error correction answers.",
    steps: [
      { game: "Deutsch's One Question Oracle", slug: "deutsch-s-one-question-oracle", learn: "The first quantum speedup, never wrong in one query." },
      { game: "Grover Searchlight", slug: "grover-searchlight", learn: "Amplitude amplification, and what happens when you over search." },
      { game: "Decoherence Dial", slug: "decoherence-dial", learn: "Coherence bleeding into the environment, on a real density matrix." },
      { game: "Repetition Rescue", slug: "repetition-rescue", learn: "Error correction pays for itself, the road to logical qubits." },
      { game: "BB84. Catch Eve", slug: "bb84-catch-eve", learn: "Physics as security: the eavesdropper leaves fingerprints." },
      { game: "Born Rule Randomness", slug: "born-rule-randomness", learn: "What a quantum random number generator actually is." },
      { game: "Bernstein-Vazirani", slug: "bernstein-vazirani", learn: "A whole secret in one oracle query, certainty from interference." },
      { game: "QFT Period Finder", slug: "qft-period-finder", learn: "The Fourier peaks Shor reads factors from." },
    ],
  },
];

const STEP_COUNT = LEVELS.reduce((n, l) => n + l.steps.length, 0);

export default function LearnPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <p className="mb-2 font-mono text-sm text-accent">Learn</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Learn quantum computing by playing it</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Four levels, {STEP_COUNT} steps, zero slides. Each step links to a live simulation in the arcade; the text tells you
          what to notice. When you can predict the next game before pressing the button, you&apos;ve learned the thing.
        </p>
        <div className="mt-10 flex flex-col gap-8">
          {LEVELS.map((lvl) => (
            <section key={lvl.level} className="glass-panel rounded-xl p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">{lvl.level}</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{lvl.title}</h2>
              <p className="mt-1 text-sm text-muted">{lvl.goal}</p>
              <ol className="mt-4 flex flex-col gap-2">
                {lvl.steps.map((s, i) => (
                  <li key={s.slug} className="flex gap-3 text-sm">
                    <span className="w-5 shrink-0 font-mono text-xs text-muted">{i + 1}.</span>
                    <div>
                      <Link href={`/playground/arcade#${s.slug}`} className="font-medium text-foreground underline-offset-2 hover:text-accent hover:underline">
                        {s.game}
                      </Link>
                      <span className="text-muted">, {s.learn}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          Graduated? Open the <Link href="/lab" className="text-accent">Circuit Lab</Link> and build something the games never showed you. Then read <Link href="/applications" className="text-accent">what it&apos;s actually good for</Link>, so the
          hype never gets you.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
