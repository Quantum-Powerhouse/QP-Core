"use client";

import { useMemo, useState } from "react";
import {
  bernsteinVazirani,
  GHZ_CASES,
  ghzClassicalBest,
  ghzQuantumRound,
  qftPeriodProbs,
  periodFromSpectrum,
} from "@/lib/arcade/qalgos";
import { ArcadeButton, GameCard, Slider, Stat } from "@/components/arcade/kit";

function Spectrum({ probs, height = 70 }: { probs: number[]; height?: number }) {
  const w = 240;
  const max = Math.max(...probs, 1e-9);
  const bw = w / probs.length;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" aria-hidden>
      {probs.map((p, k) => (
        <rect
          key={k}
          x={k * bw}
          y={height - (p / max) * (height - 4)}
          width={Math.max(0.8, bw - 0.6)}
          height={(p / max) * (height - 4)}
          fill={p > max * 0.4 ? "var(--accent)" : "var(--muted)"}
          opacity={p > max * 0.4 ? 1 : 0.45}
        />
      ))}
    </svg>
  );
}

/* 24 ─ Bernstein and Vazirani: the whole secret in one question. */
export function BernsteinVazirani() {
  const n = 5;
  const [secret, setSecret] = useState(0b10110);
  const probs = useMemo(() => bernsteinVazirani(secret, n), [secret]);
  const found = probs.indexOf(Math.max(...probs));
  return (
    <GameCard title="Bernstein-Vazirani" tag="game" computes="H^5, a real phase oracle (−1)^(s·x), H^5 on a 32 amplitude statevector; the bars are its exact output distribution">
      <p className="text-muted">
        The oracle hides a 5 bit string s and will only answer dot products s·x. Classically you need 5 questions, one
        per bit. The quantum circuit asks one question in superposition and the interference writes the whole secret
        into the output register.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <ArcadeButton onClick={() => setSecret(Math.floor(Math.random() * 32))}>hide a new secret</ArcadeButton>
        <span className="font-mono text-xs text-muted">s = {secret.toString(2).padStart(n, "0")}</span>
      </div>
      <Spectrum probs={probs} />
      <div className="flex flex-wrap gap-3">
        <Stat label="read out" value={found.toString(2).padStart(n, "0")} accent />
        <Stat label="P(correct)" value={`${(probs[secret] * 100).toFixed(1)}%`} accent />
        <Stat label="queries" value="1 vs 5 classical" />
      </div>
      <p className="font-mono text-xs text-muted">every run reads the secret perfectly; that certainty is interference, not luck</p>
    </GameCard>
  );
}

/* 25 ─ The GHZ game: beat 75% without saying a word. */
export function GhzGame() {
  const [tally, setTally] = useState({ played: 0, won: 0 });
  const [last, setLast] = useState<{ c: (typeof GHZ_CASES)[number]; a: number; b: number; d: number; win: boolean } | null>(null);
  const classicalBest = useMemo(() => ghzClassicalBest(), []);
  const play = () => {
    const c = GHZ_CASES[Math.floor(Math.random() * GHZ_CASES.length)];
    const r = ghzQuantumRound(c, Math.random);
    setLast({ c, ...r });
    setTally((t) => ({ played: t.played + 1, won: t.won + (r.win ? 1 : 0) }));
  };
  return (
    <GameCard title="The GHZ Game" tag="game" computes="a real (|000⟩+|111⟩)/√2 statevector, X or Y basis change per player, one inverse CDF sample per round; the classical 3 of 4 bound is brute forced over all 64 strategies">
      <p className="text-muted">
        Three players share an entangled triple and cannot communicate. The referee hands out bits r, s, t and the
        answers must XOR to r OR s OR t. The best any classical team can do is win {classicalBest} of 4 cases (75%).
        The quantum team wins every round.
      </p>
      <ArcadeButton primary onClick={play}>play a round</ArcadeButton>
      {last && (
        <p className="font-mono text-xs text-muted">
          case {last.c.r}{last.c.s}{last.c.t} → answers {last.a}{last.b}{last.d} → {last.win ? "win" : "loss"}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Stat label="quantum wins" value={tally.played ? `${tally.won} / ${tally.played}` : "0 / 0"} accent={tally.played > 0} />
        <Stat label="classical ceiling" value="75%" />
      </div>
      {tally.played >= 8 && tally.won === tally.played && (
        <p className="font-mono text-xs text-accent">past the classical ceiling; no shared coin flips can do this</p>
      )}
    </GameCard>
  );
}

/* 26 ─ The spectrum Shor reads: period finding by Fourier interference. */
export function QftPeriodFinder() {
  const n = 6;
  const [period, setPeriod] = useState(4);
  const probs = useMemo(() => qftPeriodProbs(period, n), [period]);
  const read = useMemo(() => periodFromSpectrum(probs), [probs]);
  return (
    <GameCard title="QFT Period Finder" tag="lab" computes="a uniform superposition over x ≡ 0 (mod r) pushed through the exact 64 point discrete Fourier transform; the peaks are computed amplitudes">
      <p className="text-muted">
        Shor&apos;s algorithm never sees the factors directly. It hides a period r in a register, applies the quantum
        Fourier transform, and reads the period off the interference peaks, spaced 2ⁿ/r apart. Slide r and watch the
        spectrum answer.
      </p>
      <Slider label="hidden period r" value={period} min={2} max={8} step={1} onChange={setPeriod} format={(v) => String(v)} />
      <Spectrum probs={probs} />
      <div className="flex flex-wrap gap-3">
        <Stat label="peak spacing" value={`${(64 / period).toFixed(1)}`} />
        <Stat label="period read from spectrum" value={String(read)} accent={read === period} />
      </div>
      <p className="font-mono text-xs text-muted">
        when r divides 64 the peaks are exact; other r values smear, which is why Shor finishes with continued
        fractions
      </p>
    </GameCard>
  );
}
