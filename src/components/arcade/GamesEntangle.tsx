"use client";

import { useMemo, useState } from "react";
import {
  applyCNOT,
  applySingleQubitGate,
  zeroState,
  type Statevector,
} from "@/lib/physics/statevector";
import { probabilitiesOf } from "@/lib/physics/measurement";
import {
  bellState,
  chshSample,
  CHSH_ANGLES,
  entangleDial,
  GATE_H,
  GATE_X,
  GATE_Z,
  teleportationStages,
} from "@/lib/arcade/qlogic";
import { ArcadeButton, GameCard, ProbBars, Slider, Stat } from "@/components/arcade/kit";
import { useQuantumEventBus } from "@/components/quantum/QuantumEventProvider";

/* 8 ─ Entanglement Dial: slide from product state to Bell pair. */
export function EntanglementDial() {
  const [theta, setTheta] = useState(Math.PI / 2);
  const { probs, purityOfA } = useMemo(() => entangleDial(theta), [theta]);
  const entangled = purityOfA < 0.55;
  return (
    <GameCard title="Entanglement Dial" tag="lab" computes="RY(θ)+CNOT on a real 2-qubit statevector; purity Tr(ρ²) of the actual reduced density matrix">
      <p className="text-muted">
        Turn one knob from &ldquo;two separate qubits&rdquo; to &ldquo;one inseparable pair.&rdquo; Watch qubit A&apos;s
        purity drop to ½ — alone, it becomes a pure coin flip, because the information lives in the <em>pair</em>.
      </p>
      <Slider label="entangling angle θ" value={theta} min={0} max={Math.PI} step={0.01} onChange={setTheta} />
      <ProbBars probs={probs} labels={["|00⟩", "|01⟩", "|10⟩", "|11⟩"]} />
      <div className="flex gap-3">
        <Stat label="purity of qubit A" value={purityOfA.toFixed(3)} accent={entangled} />
        {entangled && <p className="self-center font-mono text-xs text-accent">maximally entangled territory</p>}
      </div>
    </GameCard>
  );
}

/* 9 ─ CHSH: beat the classical bound with sampled Bell-pair rounds. */
export function ChshGame() {
  const bus = useQuantumEventBus();
  const [stats, setStats] = useState({ n: 0, e00: 0, e01: 0, e10: 0, e11: 0 });
  const run = (rounds: number) => {
    {
      const next = { ...stats };
      const settings: [keyof Omit<typeof next, "n">, number, number][] = [
        ["e00", CHSH_ANGLES.a0, CHSH_ANGLES.b0],
        ["e01", CHSH_ANGLES.a0, CHSH_ANGLES.b1],
        ["e10", CHSH_ANGLES.a1, CHSH_ANGLES.b0],
        ["e11", CHSH_ANGLES.a1, CHSH_ANGLES.b1],
      ];
      for (let i = 0; i < rounds; i++) {
        for (const [key, a, b] of settings) {
          const { a: ra, b: rb } = chshSample(a, b, Math.random);
          next[key] += ra * rb;
        }
        next.n += 1;
      }
      const nn = next.n || 1;
      const S = next.e00 / nn + next.e01 / nn + next.e10 / nn - next.e11 / nn;
      setStats(next);
      bus.emit("ARCADE_RESULT", {
        game: "CHSH",
        value: S,
        summary: `CHSH S = ${S.toFixed(2)} after ${next.n} rounds — ${Math.abs(S) > 2 ? "past the classical bound of 2" : "still under the classical bound; more rounds"}.`,
      });
    }
  };
  const n = stats.n || 1;
  const S = stats.e00 / n + stats.e01 / n + stats.e10 / n - stats.e11 / n;
  const beating = stats.n >= 30 && Math.abs(S) > 2;
  return (
    <GameCard title="CHSH — Beat the Classical Bound" tag="game" computes="every round rotates a real Bell state's measurement bases and samples the joint outcome; S is estimated from those samples only">
      <p className="text-muted">
        Classical physics caps |S| at 2. A Bell pair reaches 2√2 ≈ 2.83. Collect rounds and watch your sampled S
        climb past what any local hidden-variable story allows.
      </p>
      <div className="flex gap-2">
        <ArcadeButton primary onClick={() => run(25)}>
          run 25 rounds
        </ArcadeButton>
        <ArcadeButton onClick={() => setStats({ n: 0, e00: 0, e01: 0, e10: 0, e11: 0 })}>reset</ArcadeButton>
      </div>
      <div className="flex items-center gap-3">
        <Stat label="rounds" value={String(stats.n)} />
        <Stat label="S (sampled)" value={stats.n ? S.toFixed(3) : "—"} accent={beating} />
        <Stat label="quantum max" value="2.828" />
      </div>
      {beating && <p className="font-mono text-xs text-accent">|S| &gt; 2 — Bell inequality violated in your browser (in simulation, and in every real lab that has tried).</p>}
    </GameCard>
  );
}

/* 10 ─ Teleportation, stage by stage, amplitudes on display. */
export function TeleportSteps() {
  const [theta, setTheta] = useState(1.1);
  const [phi, setPhi] = useState(0.7);
  const [stage, setStage] = useState(0);
  const stages = useMemo(() => teleportationStages(theta, phi), [theta, phi]);
  const current = stages[Math.min(stage, stages.length - 1)];
  const probs = probabilitiesOf(current.state);
  return (
    <GameCard title="Teleportation Walkthrough" tag="demo" computes="the real 3-qubit statevector at each protocol stage; bars are its live probabilities">
      <p className="text-muted">
        A message qubit, an entangled pair, and two classical bits — the state moves without any qubit traveling.
        Step through the actual amplitudes.
      </p>
      <div className="flex flex-col gap-2">
        <Slider label="message θ" value={theta} min={0} max={Math.PI} step={0.01} onChange={setTheta} />
        <Slider label="message φ" value={phi} min={0} max={2 * Math.PI} step={0.01} onChange={setPhi} />
      </div>
      <div className="flex items-center gap-2">
        {stages.map((s, i) => (
          <ArcadeButton key={s.label} primary={i === stage} onClick={() => setStage(i)}>
            {i + 1}
          </ArcadeButton>
        ))}
        <span className="font-mono text-xs text-muted">{current.label}</span>
      </div>
      <ProbBars probs={probs} />
      {stage === stages.length - 1 && (
        <p className="font-mono text-xs text-muted">
          Next, Alice measures q0 and q1 and phones Bob two classical bits; his conditional X/Z fix reconstructs the
          message exactly. No cloning happened — Alice&apos;s copy is gone.
        </p>
      )}
    </GameCard>
  );
}

/* 11 ─ Superdense coding: 2 classical bits ride on 1 qubit. */
export function SuperdenseCoding() {
  const [bits, setBits] = useState<[0 | 1, 0 | 1]>([0, 0]);
  const decoded = useMemo(() => {
    let s: Statevector = bellState();
    if (bits[1] === 1) s = applySingleQubitGate(s, GATE_X, 0); // bit 2 → X
    if (bits[0] === 1) s = applySingleQubitGate(s, GATE_Z, 0); // bit 1 → Z
    s = applyCNOT(s, 0, 1);
    s = applySingleQubitGate(s, GATE_H, 0);
    return probabilitiesOf(s);
  }, [bits]);
  return (
    <GameCard title="Superdense Coding" tag="demo" computes="encode on a real Bell pair (I/X/Z/XZ), decode with CNOT+H — the bars are the decoded statevector">
      <p className="text-muted">
        Share a Bell pair in advance, and one qubit can carry <em>two</em> classical bits. Pick the bits; the decoder
        lands on the matching basis state with certainty.
      </p>
      <div className="flex items-center gap-2">
        {[0, 1].map((i) => (
          <ArcadeButton
            key={i}
            primary
            onClick={() =>
              setBits((b) => {
                const next: [0 | 1, 0 | 1] = [...b];
                next[i] = next[i] === 0 ? 1 : 0;
                return next;
              })
            }
          >
            bit {i + 1}: {bits[i]}
          </ArcadeButton>
        ))}
        <span className="font-mono text-xs text-muted">sending &ldquo;{bits[0]}{bits[1]}&rdquo;</span>
      </div>
      <ProbBars probs={decoded} labels={["decode 00", "decode 01", "decode 10", "decode 11"]} />
    </GameCard>
  );
}

/* 12 ─ No-cloning: the button that cannot work. */
export function NoCloning() {
  const [attempts, setAttempts] = useState(0);
  return (
    <GameCard title="The Cloning Button" tag="game" computes="nothing — that is the point; the linearity argument below is the whole result">
      <p className="text-muted">One button. It copies an unknown qubit. Try it.</p>
      <ArcadeButton primary onClick={() => setAttempts((a) => a + 1)}>
        clone the qubit
      </ArcadeButton>
      {attempts > 0 && (
        <div className="flex flex-col gap-2 font-mono text-xs text-muted">
          <p className="text-accent">Refused ({attempts}×). Not stubbornness — mathematics:</p>
          <p>
            A cloner must send |0⟩|0⟩→|0⟩|0⟩ and |1⟩|0⟩→|1⟩|1⟩. Linearity then forces (|0⟩+|1⟩)|0⟩ →
            |00⟩+|11⟩ — an entangled pair, <em>not</em> two copies (|0⟩+|1⟩)(|0⟩+|1⟩). No unitary machine can do it.
            This impossibility is what makes quantum key distribution (two cards down) secure.
          </p>
        </div>
      )}
    </GameCard>
  );
}

/* 13 ─ Phase kickback: the control qubit takes the hit. */
export function PhaseKickback() {
  const [kicked, setKicked] = useState(false);
  const { before, after } = useMemo(() => {
    let s = zeroState(2);
    s = applySingleQubitGate(s, GATE_H, 0); // control in |+⟩
    s = applySingleQubitGate(s, GATE_X, 1);
    s = applySingleQubitGate(s, GATE_H, 1); // target in |−⟩
    const pre = probabilitiesOf(applySingleQubitGate(s, GATE_H, 0)); // read control in X basis
    let k = applyCNOT(s, 0, 1);
    k = applySingleQubitGate(k, GATE_H, 0);
    return { before: pre, after: probabilitiesOf(k) };
  }, []);
  const shown = kicked ? after : before;
  const controlP0 = shown[0] + shown[2];
  return (
    <GameCard title="Phase Kickback" tag="demo" computes="a real CNOT on |+⟩⊗|−⟩; the control's X-basis probabilities are read from the actual state">
      <p className="text-muted">
        CNOT is supposed to change the <em>target</em>. Put the target in |−⟩ and fire: the target shrugs — the{" "}
        <em>control</em> flips from |+⟩ to |−⟩. This backwards kick powers Deutsch, Grover, and phase estimation.
      </p>
      <ArcadeButton primary onClick={() => setKicked((k) => !k)}>
        {kicked ? "reset" : "fire CNOT"}
      </ArcadeButton>
      <ProbBars probs={[controlP0, 1 - controlP0]} labels={["ctrl |+⟩", "ctrl |−⟩"]} />
      {kicked && <p className="font-mono text-xs text-accent">The control took the phase. Nothing touched it directly.</p>}
    </GameCard>
  );
}

/* 14 ─ Entangled dice: correlations without communication. */
export function EntangledDice() {
  const [rolls, setRolls] = useState<{ a: number; b: number }[]>([]);
  const roll = () => {
    const { a, b } = chshSample(0, 0, Math.random); // same basis → perfect correlation
    setRolls((r) => [...r.slice(-9), { a: a === 1 ? 0 : 1, b: b === 1 ? 0 : 1 }]);
  };
  const agree = rolls.length > 0 && rolls.every((r) => r.a === r.b);
  return (
    <GameCard title="Entangled Dice" tag="demo" computes="each roll samples a real Bell state in matching bases — agreement is computed, not scripted">
      <p className="text-muted">
        Two dice, one wavefunction. Each roll is individually 50/50 random — and they <em>always</em> agree. Randomness
        and perfect correlation, at the same time.
      </p>
      <div className="flex items-center gap-2">
        <ArcadeButton primary onClick={roll}>
          roll the pair
        </ArcadeButton>
        <ArcadeButton onClick={() => setRolls([])}>reset</ArcadeButton>
        {rolls.length > 1 && (
          <Stat label={`agreement (${rolls.length})`} value={agree ? "100%" : "!"} accent={agree} />
        )}
      </div>
      <div className="flex gap-1 font-mono text-sm">
        {rolls.map((r, i) => (
          <span key={i} className="rounded border border-border/60 bg-surface/40 px-1.5 py-0.5 text-accent">
            {r.a}
            {r.b}
          </span>
        ))}
      </div>
    </GameCard>
  );
}
