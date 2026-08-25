"use client";

import { useMemo, useState } from "react";
import { classicalWalk, MAXCUT_EDGES, qaoaMaxCut, quantumWalk, walkSpread } from "@/lib/arcade/qlogic";
import { GameCard, ProbBars, Slider, Stat } from "@/components/arcade/kit";

/* 22 ─ QAOA MaxCut: tune two angles, watch the cut expectation climb. */
export function QaoaMaxCut() {
  const [gamma, setGamma] = useState(0.6);
  const [beta, setBeta] = useState(0.4);
  const r = useMemo(() => qaoaMaxCut(gamma, beta), [gamma, beta]);
  const ratio = r.expectedCut / r.bestCut;
  return (
    <GameCard title="QAOA MaxCut" tag="game" computes="a real 4-qubit QAOA (p=1) circuit: H layer, ZZ(γ) on each edge via CNOT·RZ·CNOT, RX(2β) mixer; cut expectation from the output probabilities">
      <p className="text-muted">
        Cut a 4-node ring into two colors with as many crossing edges as possible (max = {r.bestCut}). QAOA doesn&apos;t
        search, it sculpts a superposition so the good cuts get more amplitude. Find the γ, β sweet spot.
      </p>
      <Slider label="γ (cost angle)" value={gamma} min={0} max={Math.PI} step={0.01} onChange={setGamma} />
      <Slider label="β (mixer angle)" value={beta} min={0} max={Math.PI / 2} step={0.01} onChange={setBeta} />
      <div className="flex flex-wrap gap-3">
        <Stat label="⟨cut⟩" value={r.expectedCut.toFixed(3)} accent={ratio > 0.85} />
        <Stat label="approximation ratio" value={ratio.toFixed(3)} />
        <Stat label="P(optimal cut)" value={`${(r.bestProb * 100).toFixed(1)}%`} accent={r.bestProb > 0.5} />
      </div>
      <p className="font-mono text-[11px] text-muted">edges: {MAXCUT_EDGES.map(([a, b]) => `${a}, ${b}`).join(", ")} · random guess averages 2.0</p>
      {ratio > 0.95 && <p className="font-mono text-xs text-accent">near optimal, this is what a QAOA optimizer hunts for</p>}
    </GameCard>
  );
}

/* 23 ─ Walk race: quantum spreads linearly, classical only as √t. */
export function WalkRace() {
  const [steps, setSteps] = useState(20);
  const q = useMemo(() => quantumWalk(steps), [steps]);
  const cl = useMemo(() => classicalWalk(steps), [steps]);
  const qs = walkSpread(q);
  const cs = walkSpread(cl);
  const max = Math.max(...q, ...cl);
  const w = 240;
  const h = 70;
  const path = (p: number[]) =>
    p.map((v, i) => `${(i / (p.length - 1)) * w},${h - (v / max) * (h - 4)}`).join(" ");
  return (
    <GameCard title="Walk Race" tag="lab" computes="direct amplitude evolution of the Hadamard coined quantum walk vs the exact binomial distribution of a classical random walk">
      <p className="text-muted">
        Same coin, same line. The classical walker wanders ~√t from home. The quantum walker interferes with itself and
        races out ~t, with two peaks and almost nothing in the middle. This ballistic spread is the engine behind
        quantum search speedups.
      </p>
      <Slider label="steps t" value={steps} min={2} max={60} step={1} onChange={setSteps} format={(v) => String(v)} />
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden>
        <polyline points={path(cl)} fill="none" stroke="var(--muted)" strokeWidth="1" />
        <polyline points={path(q)} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      </svg>
      <div className="flex gap-3">
        <Stat label="quantum σ" value={qs.toFixed(2)} accent />
        <Stat label="classical σ" value={cs.toFixed(2)} />
        <Stat label="ratio" value={`${(qs / cs).toFixed(2)}×`} accent={qs / cs > 2} />
      </div>
      <ProbBars probs={[Math.min(1, qs / steps), Math.min(1, cs / steps)]} labels={["q σ/t", "c σ/t"]} />
    </GameCard>
  );
}
