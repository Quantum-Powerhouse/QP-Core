"use client";

import { useState } from "react";

/**
 * "Quantum or not?", eight claims people make about quantum computers,
 * each with a verdict grounded in the applications research on this page.
 * Interactive and a little unkind to hype.
 */
const CLAIMS: { claim: string; verdict: "yes" | "no" | "partly"; why: string }[] = [
  {
    claim: "Quantum computers do ordinary arithmetic faster than classical ones.",
    verdict: "no",
    why: "For most computation there is no quantum speedup at all, anything a quantum computer does can be simulated classically; the difference is cost, and only for special problem structures. A laptop multiplies numbers faster than any quantum processor today.",
  },
  {
    claim: "They can generate video or images faster than GPUs.",
    verdict: "no",
    why: "Quantum generative models exist only as research on tiny, low resolution images (MNIST scale), and basic research on quantum video processing is just beginning. Loading large datasets into qubits is itself the bottleneck.",
  },
  {
    claim: "They will simulate molecules and materials that classical computers can't.",
    verdict: "yes",
    why: "This is the application with the strongest physics behind it, nature is quantum, so simulating strongly correlated electrons is natively efficient. In May 2026 Q-CTRL reported a ~3,000× speedup over optimized classical software on a commercially relevant materials problem on IBM hardware.",
  },
  {
    claim: "They will break today's internet encryption (RSA, elliptic curves).",
    verdict: "yes",
    why: "Shor's algorithm does this in principle; the missing ingredient is a large fault tolerant machine. That is why NIST finalized post quantum standards (ML-KEM, ML-DSA, SLH-DSA) in 2024 and migration has already started, the threat is real enough to act on now.",
  },
  {
    claim: "They give finance an exponential edge in pricing and risk.",
    verdict: "partly",
    why: "Quantum amplitude estimation offers a quadratic (square root) speedup for Monte Carlo, real but fragile: estimates need ~4,700 logical qubits and clock rates ~1,000× today's to merely match classical Monte Carlo, while GPUs keep improving.",
  },
  {
    claim: "They will solve every optimization problem, logistics, scheduling, design.",
    verdict: "partly",
    why: "Hybrid quantum optimization (QAOA, annealing) is being piloted, but rigorous evaluations on prototypical industrial problems show no clear advantage yet over strong classical heuristics. Promising, unproven.",
  },
  {
    claim: "They'll make AI models smarter, faster.",
    verdict: "partly",
    why: "Quantum machine learning is mostly ahead of the evidence: data loading is inefficient, most results are on small or simulated datasets, and even Microsoft places AI workload advantage 5-10 years out. The reverse is already true, classical ML is accelerating quantum simulation.",
  },
  {
    claim: "They'll run the robots that build buildings automatically.",
    verdict: "no",
    why: "Robots are classical control + classical AI. Quantum's only plausible role is behind the scenes on specific optimization sub problems (path planning, structural design search), and the seismic optimization claims circulating are preprints, not peer reviewed results.",
  },
];

const LABEL = { yes: "Yes, real", no: "No, hype", partly: "Partly, promising, unproven" } as const;
const COLOR = { yes: "text-accent border-accent/60", no: "text-[#ff6b6b] border-[#ff6b6b]/60", partly: "text-[#f59e0b] border-[#f59e0b]/60" } as const;

export function MythQuiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<"yes" | "no" | "partly" | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const item = CLAIMS[i];
  const answer = (v: "yes" | "no" | "partly") => {
    if (picked) return;
    setPicked(v);
    setScore((s) => ({ right: s.right + (v === item.verdict ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    setPicked(null);
    setI((n) => (n + 1) % CLAIMS.length);
  };
  return (
    <section className="glass-panel rounded-xl p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">Quantum or not?: call it</h3>
        <span className="font-mono text-xs text-muted">
          {i + 1}/{CLAIMS.length} · score {score.right}/{score.total}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">&ldquo;{item.claim}&rdquo;</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["yes", "partly", "no"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => answer(v)}
            disabled={picked !== null}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors duration-150 ease-out disabled:opacity-70 ${
              picked === v ? COLOR[v] : "border-border text-muted hover:border-accent/60 hover:text-foreground"
            }`}
          >
            {LABEL[v]}
          </button>
        ))}
      </div>
      {picked && (
        <div className="mt-3 flex flex-col gap-2">
          <p className={`font-mono text-xs ${COLOR[item.verdict].split(" ")[0]}`}>
            {picked === item.verdict ? "Correct." : "Not quite."} Verdict: {LABEL[item.verdict]}.
          </p>
          <p className="text-sm leading-relaxed text-muted">{item.why}</p>
          <button type="button" onClick={next} className="self-start font-mono text-xs text-accent underline-offset-2 hover:underline">
            next claim →
          </button>
        </div>
      )}
    </section>
  );
}
