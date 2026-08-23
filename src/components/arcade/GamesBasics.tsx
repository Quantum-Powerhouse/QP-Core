"use client";

import { useCallback, useMemo, useState } from "react";
import {
  applySingleQubitGate,
  applyRY,
  zeroState,
  type Statevector,
} from "@/lib/physics/statevector";
import { probabilitiesOf, sampleMeasurement } from "@/lib/physics/measurement";
import {
  blochOf,
  fidelity,
  GATE_H,
  interferenceProbabilities,
  NAMED_GATES,
  stateFromAngles,
} from "@/lib/arcade/qlogic";
import { ArcadeButton, BlochDial, GameCard, ProbBars, Slider, Stat } from "@/components/arcade/kit";

/* 1 ─ Gate Mixer: press gates, watch a real statevector move. */
export function GateMixer() {
  const [state, setState] = useState<Statevector>(() => zeroState(1));
  const [history, setHistory] = useState<string[]>([]);
  const bloch = blochOf(state);
  const probs = probabilitiesOf(state);
  const press = (name: string) => {
    setState((s) => applySingleQubitGate(s, NAMED_GATES[name], 0));
    setHistory((h) => [...h.slice(-11), name]);
  };
  return (
    <GameCard title="Gate Mixer" tag="lab" computes="one real statevector; every button multiplies it by that gate's actual 2×2 unitary">
      <div className="flex flex-wrap gap-2">
        {Object.keys(NAMED_GATES).map((g) => (
          <ArcadeButton key={g} onClick={() => press(g)}>
            {g}
          </ArcadeButton>
        ))}
        <ArcadeButton
          onClick={() => {
            setState(zeroState(1));
            setHistory([]);
          }}
        >
          reset
        </ArcadeButton>
      </div>
      <div className="flex items-center gap-4">
        <BlochDial x={bloch.x} z={bloch.z} />
        <div className="flex-1">
          <ProbBars probs={probs} labels={["|0⟩", "|1⟩"]} />
          <p className="mt-2 font-mono text-xs text-muted">{history.length ? history.join(" · ") : "apply a gate…"}</p>
        </div>
      </div>
    </GameCard>
  );
}

/* 2 ─ State Match: dial θ/φ to reach a hidden target state. */
export function StateMatch() {
  const [target, setTarget] = useState(() => ({
    theta: Math.random() * Math.PI,
    phi: Math.random() * 2 * Math.PI,
  }));
  const [theta, setTheta] = useState(Math.PI / 2);
  const [phi, setPhi] = useState(0);
  const yours = useMemo(() => stateFromAngles(theta, phi), [theta, phi]);
  const goal = useMemo(() => stateFromAngles(target.theta, target.phi), [target]);
  const f = fidelity(yours, goal);
  const won = f >= 0.99;
  const gb = blochOf(goal);
  const yb = blochOf(yours);
  return (
    <GameCard title="State Match" tag="game" computes="|⟨target|yours⟩|² between two real single-qubit states">
      <p className="text-muted">A hidden state is drawn. Steer yours (cyan) onto the ghost (dim), fidelity ≥ 99% wins.</p>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="opacity-35">
            <BlochDial x={gb.x} z={gb.z} />
          </div>
          <div className="absolute inset-0">
            <BlochDial x={yb.x} z={yb.z} />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Slider label="θ" value={theta} min={0} max={Math.PI} step={0.01} onChange={setTheta} />
          <Slider label="φ" value={phi} min={0} max={2 * Math.PI} step={0.01} onChange={setPhi} />
          <div className="flex items-center gap-3">
            <Stat label="fidelity" value={`${(f * 100).toFixed(1)}%`} accent={won} />
            {won && (
              <ArcadeButton
                primary
                onClick={() => setTarget({ theta: Math.random() * Math.PI, phi: Math.random() * 2 * Math.PI })}
              >
                matched! next →
              </ArcadeButton>
            )}
          </div>
        </div>
      </div>
    </GameCard>
  );
}

/* 3 ─ Born Casino: bet against the Born rule with real collapses. */
export function BornCasino() {
  const [theta, setTheta] = useState(Math.PI / 3);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [last, setLast] = useState<string | null>(null);
  const probs = useMemo(() => probabilitiesOf(applyRY(zeroState(1), theta, 0)), [theta]);
  const guess = (g: 0 | 1) => {
    const result = sampleMeasurement(applyRY(zeroState(1), theta, 0)).outcomeIndex;
    const hit = result === g;
    setLast(`collapsed to |${result}⟩, ${hit ? "you called it" : "missed"}`);
    setStreak((s) => {
      const next = hit ? s + 1 : 0;
      setBest((b) => Math.max(b, next));
      return next;
    });
  };
  return (
    <GameCard title="Born Casino" tag="game" computes="a fresh statevector each round; the collapse is an inverse-CDF sample of |amplitude|²">
      <p className="text-muted">Set the odds with θ, then call the collapse. Long streaks get exponentially unlikely, that is the Born rule doing its job.</p>
      <Slider label="θ (sets P(|1⟩) = sin²(θ/2))" value={theta} min={0} max={Math.PI} step={0.01} onChange={setTheta} />
      <ProbBars probs={probs} labels={["|0⟩", "|1⟩"]} />
      <div className="flex items-center gap-2">
        <ArcadeButton primary onClick={() => guess(0)}>
          call |0⟩
        </ArcadeButton>
        <ArcadeButton primary onClick={() => guess(1)}>
          call |1⟩
        </ArcadeButton>
        <Stat label="streak" value={String(streak)} accent={streak >= 3} />
        <Stat label="best" value={String(best)} />
      </div>
      {last && <p className="font-mono text-xs text-accent">{last}</p>}
    </GameCard>
  );
}

/* 4 ─ Rabi Trainer: land the pulse exactly on |1⟩. */
export function RabiTrainer() {
  const [theta, setTheta] = useState(1.2);
  const p1 = useMemo(() => probabilitiesOf(applyRY(zeroState(1), theta, 0))[1], [theta]);
  const perfect = p1 >= 0.999;
  return (
    <GameCard title="π-Pulse Trainer" tag="game" computes="P(|1⟩) from RY(θ) applied to a real statevector, the textbook sin²(θ/2)">
      <p className="text-muted">
        Drive the qubit with a rotation pulse. A perfect <span className="font-mono">π</span> pulse lands the whole amplitude on |1⟩, this is exactly how real qubits get flipped.
      </p>
      <Slider label="pulse angle θ" value={theta} min={0} max={2 * Math.PI} step={0.005} onChange={setTheta} format={(v) => `${v.toFixed(3)} rad`} />
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-sm bg-surface-2">
          <div className="h-full bg-accent transition-[width] duration-150 ease-out" style={{ width: `${p1 * 100}%` }} />
        </div>
        <Stat label="P(|1⟩)" value={`${(p1 * 100).toFixed(2)}%`} accent={perfect} />
      </div>
      {perfect && <p className="font-mono text-xs text-accent">π-pulse achieved, that is a NOT gate, built from calibration.</p>}
    </GameCard>
  );
}

/* 5 ─ Interference Lab: one phase knob, fringes appear. */
export function InterferenceLab() {
  const [phi, setPhi] = useState(0);
  const probs = useMemo(() => interferenceProbabilities(phi), [phi]);
  return (
    <GameCard title="Interference Lab" tag="lab" computes="H · RZ(φ) · H on a real statevector, the fringe is computed, not drawn">
      <p className="text-muted">
        Split one qubit onto two paths (H), twist the phase between them, recombine (H). The output probability swings from certain to impossible, with nothing removed, only phase.
      </p>
      <Slider label="path phase φ" value={phi} min={0} max={2 * Math.PI} step={0.01} onChange={setPhi} format={(v) => `${((v / Math.PI) * 180).toFixed(0)}°`} />
      <ProbBars probs={probs} labels={["|0⟩", "|1⟩"]} />
      <svg viewBox="0 0 200 44" className="w-full" aria-hidden>
        {Array.from({ length: 100 }, (_, i) => {
          const x = (i / 99) * 2 * Math.PI;
          const p = Math.cos(x / 2) ** 2;
          return <circle key={i} cx={(i / 99) * 196 + 2} cy={40 - p * 36} r="1" fill="var(--accent)" opacity="0.5" />;
        })}
        <circle cx={(phi / (2 * Math.PI)) * 196 + 2} cy={40 - probs[0] * 36} r="3.5" fill="var(--accent-2)" />
      </svg>
    </GameCard>
  );
}

/* 6 ─ Measurement Duel: same state, different questions, different answers. */
export function MeasurementDuel() {
  const [counts, setCounts] = useState<{ z: [number, number]; x: [number, number] }>({ z: [0, 0], x: [0, 0] });
  const prepared = useMemo(() => applyRY(zeroState(1), Math.PI / 2, 0), []); // |+⟩
  const shoot = useCallback(
    (basis: "z" | "x", shots: number) => {
      setCounts((prev) => {
        const next = { z: [...prev.z] as [number, number], x: [...prev.x] as [number, number] };
        for (let i = 0; i < shots; i++) {
          const s = basis === "x" ? applySingleQubitGate(prepared, GATE_H, 0) : prepared;
          next[basis][sampleMeasurement(s).outcomeIndex]++;
        }
        return next;
      });
    },
    [prepared],
  );
  const total = (pair: [number, number]) => pair[0] + pair[1] || 1;
  return (
    <GameCard title="Measurement Duel" tag="lab" computes="20 real sampled shots per press on the same |+⟩ state, only the measurement basis differs">
      <p className="text-muted">
        One fixed state, two questions. Ask in Z: pure coin-flip. Ask in X: dead certain. The state didn&apos;t change, your question did.
      </p>
      <div className="flex gap-2">
        <ArcadeButton primary onClick={() => shoot("z", 20)}>
          measure 20× in Z
        </ArcadeButton>
        <ArcadeButton primary onClick={() => shoot("x", 20)}>
          measure 20× in X
        </ArcadeButton>
        <ArcadeButton onClick={() => setCounts({ z: [0, 0], x: [0, 0] })}>reset</ArcadeButton>
      </div>
      <ProbBars probs={[counts.z[0] / total(counts.z), counts.z[1] / total(counts.z)]} labels={["Z→0", "Z→1"]} />
      <ProbBars probs={[counts.x[0] / total(counts.x), counts.x[1] / total(counts.x)]} labels={["X→+", "X→−"]} />
    </GameCard>
  );
}

/* 7 ─ Bloch Quiz: which gate was applied? Real sim behind the curtain. */
const QUIZ_GATES = ["H", "X", "Z"] as const;
export function BlochQuiz() {
  const [round, setRound] = useState(() => newQuizRound());
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [reveal, setReveal] = useState<string | null>(null);
  function newQuizRound() {
    const startPlus = Math.random() < 0.5;
    const answer = QUIZ_GATES[Math.floor(Math.random() * QUIZ_GATES.length)];
    let before = zeroState(1);
    if (startPlus) before = applySingleQubitGate(before, GATE_H, 0);
    const after = applySingleQubitGate(before, NAMED_GATES[answer], 0);
    return { before, after, answer };
  }
  const guess = (g: string) => {
    const right = g === round.answer;
    setScore((s) => ({ right: s.right + (right ? 1 : 0), total: s.total + 1 }));
    setReveal(right ? `right, it was ${round.answer}` : `no, it was ${round.answer}`);
    setTimeout(() => {
      setReveal(null);
      setRound(newQuizRound());
    }, 1100);
  };
  const b = blochOf(round.before);
  const a = blochOf(round.after);
  return (
    <GameCard title="Bloch Detective" tag="game" computes="each round applies the secret gate's real unitary; both dials are computed Bloch vectors">
      <p className="text-muted">Before and after. Which gate did it?</p>
      <div className="flex items-center gap-2">
        <BlochDial x={b.x} z={b.z} size={80} />
        <span className="font-mono text-muted">→</span>
        <BlochDial x={a.x} z={a.z} size={80} />
        <div className="ml-auto flex flex-col gap-1.5">
          {QUIZ_GATES.map((g) => (
            <ArcadeButton key={g} onClick={() => guess(g)} disabled={reveal !== null}>
              {g}
            </ArcadeButton>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Stat label="score" value={`${score.right}/${score.total}`} accent={score.right > 0} />
        {reveal && <p className="font-mono text-xs text-accent">{reveal}</p>}
      </div>
    </GameCard>
  );
}
