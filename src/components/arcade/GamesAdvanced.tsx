"use client";

import { useMemo, useState } from "react";
import { probabilitiesOf } from "@/lib/physics/measurement";
import {
  bb84Qber,
  bb84Round,
  bitEntropy,
  deutschRun,
  groverInit,
  groverOptimalIterations,
  groverStep,
  repetitionRound,
  sampleRandomBits,
  tunnelingTransmission,
  type BB84Round,
  type DeutschOracle,
} from "@/lib/arcade/qlogic";
import { zeroDensityMatrix, applyUnitary, applyDepolarizing1Q, embedSingleQubitOperator } from "@/lib/physics/densityMatrix";
import { GATE_H } from "@/lib/arcade/qlogic";
import { ArcadeButton, GameCard, ProbBars, Slider, Stat } from "@/components/arcade/kit";
import { useQuantumEventBus } from "@/components/quantum/QuantumEventProvider";

/* 15 ─ Grover Searchlight: amplitude amplification you can overdo. */
export function GroverSearchlight() {
  const bus = useQuantumEventBus();
  const N_QUBITS = 3;
  const [marked, setMarked] = useState(5);
  const [state, setState] = useState(() => groverInit(N_QUBITS));
  const [iters, setIters] = useState(0);
  const probs = probabilitiesOf(state);
  const optimal = groverOptimalIterations(N_QUBITS);
  const reset = (m: number) => {
    setMarked(m);
    setState(groverInit(N_QUBITS));
    setIters(0);
  };
  return (
    <GameCard title="Grover Searchlight" tag="game" computes="a real 3-qubit statevector; each press applies the actual oracle phase flip + inversion about the mean">
      <p className="text-muted">
        Eight drawers, one prize. Classically you open ~4. Grover finds it in {optimal} iterations, and if you keep
        going past the sweet spot, the amplitude rotates <em>away</em> again. Try over searching.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">prize in drawer:</span>
        {Array.from({ length: 8 }, (_, i) => (
          <ArcadeButton key={i} primary={marked === i} onClick={() => reset(i)}>
            {i}
          </ArcadeButton>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <ArcadeButton
          primary
          onClick={() => {
            const nextState = groverStep(state, marked);
            const p = probabilitiesOf(nextState)[marked];
            const nextIters = iters + 1;
            setState(nextState);
            setIters(nextIters);
            bus.emit("ARCADE_RESULT", {
              game: "Grover",
              value: p,
              summary: `Grover iteration ${nextIters}: the prize drawer is at ${(p * 100).toFixed(1)}%${nextIters > optimal ? ", over rotated, it's falling now" : nextIters === optimal ? ", that's the sweet spot" : ""}.`,
            });
          }}
        >
          Grover iteration
        </ArcadeButton>
        <ArcadeButton onClick={() => reset(marked)}>reset</ArcadeButton>
        <Stat label="iterations" value={`${iters} / ${optimal} optimal`} accent={iters === optimal} />
      </div>
      <ProbBars probs={probs} />
      {iters > optimal && <p className="font-mono text-xs text-[#78660f]">over rotated, the searchlight swung past the prize</p>}
    </GameCard>
  );
}

/* 16 ─ Deutsch's oracle: one query, guaranteed answer. */
export function DeutschGame() {
  const bus = useQuantumEventBus();
  const [secret, setSecret] = useState<DeutschOracle | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const pick = () => {
    const options: DeutschOracle[] = ["const0", "const1", "identity", "negation"];
    setSecret(options[Math.floor(Math.random() * 4)]);
    setVerdict(null);
  };
  const query = () => {
    if (!secret) return;
    const { pConstant } = deutschRun(secret);
    const isConstant = pConstant > 0.5;
    bus.emit("ARCADE_RESULT", {
      game: "Deutsch",
      value: pConstant,
      summary: `Deutsch circuit: one query, verdict ${isConstant ? "constant" : "balanced"}, and it was right.`,
    });
    setVerdict(
      `circuit says: ${isConstant ? "CONSTANT" : "BALANCED"} (P = ${pConstant.toFixed(2)}), truth: ${secret} (${
        secret.startsWith("const") ? "constant" : "balanced"
      }) ${isConstant === secret.startsWith("const") ? "✓" : "✗"}`,
    );
  };
  return (
    <GameCard title="Deutsch's One Question Oracle" tag="game" computes="the full Deutsch circuit runs on a real 2-qubit statevector; the verdict is read from its output probabilities">
      <p className="text-muted">
        A mystery coin function: constant (same answer always) or balanced (half and half). Classically you must ask
        twice. The Deutsch circuit asks <em>once</em>, and is never wrong.
      </p>
      <div className="flex items-center gap-2">
        <ArcadeButton primary onClick={pick}>
          draw a secret function
        </ArcadeButton>
        <ArcadeButton onClick={query} disabled={!secret}>
          ask the oracle (1 query)
        </ArcadeButton>
      </div>
      {secret && !verdict && <p className="font-mono text-xs text-muted">secret drawn, one query allowed…</p>}
      {verdict && <p className="font-mono text-xs text-accent">{verdict}</p>}
    </GameCard>
  );
}

/* 17 ─ Quantum RNG with entropy meter. */
export function QuantumRng() {
  const [bits, setBits] = useState<number[]>([]);
  const entropy = useMemo(() => bitEntropy(bits), [bits]);
  const ones = bits.reduce((a, b) => a + b, 0);
  return (
    <GameCard title="Born Rule Randomness" tag="lab" computes="each bit is an inverse CDF sample of a real H|0⟩ statevector, the randomness is Born rule sampling">
      <p className="text-muted">
        Hardware quantum RNGs sell exactly this: prepare |+⟩, measure, repeat. Sample away, entropy should hug 1
        bit/bit.
      </p>
      <div className="flex items-center gap-2">
        <ArcadeButton primary onClick={() => setBits((b) => [...b, ...sampleRandomBits(64)])}>
          sample 64 bits
        </ArcadeButton>
        <ArcadeButton onClick={() => setBits([])}>reset</ArcadeButton>
        <Stat label="bits" value={String(bits.length)} />
        <Stat label="entropy" value={`${entropy.toFixed(4)} b/bit`} accent={entropy > 0.99} />
      </div>
      {bits.length > 0 && (
        <>
          <ProbBars probs={[(bits.length - ones) / bits.length, ones / bits.length]} labels={["0s", "1s"]} />
          <p className="break-all font-mono text-xs leading-relaxed text-muted">{bits.slice(-256).join("")}</p>
        </>
      )}
    </GameCard>
  );
}

/* 18 ─ Decoherence Dial: watch quantumness leak away. */
export function DecoherenceDial() {
  const [p, setP] = useState(0);
  const { coherence, purityVal } = useMemo(() => {
    let rho = zeroDensityMatrix(1);
    rho = applyUnitary(rho, embedSingleQubitOperator(GATE_H, 0, 1)); // |+⟩⟨+|
    rho = applyDepolarizing1Q(rho, 0, p, 1);
    const off = rho[0][1];
    const pur = rho[0][0].re * rho[0][0].re + rho[1][1].re * rho[1][1].re + 2 * (off.re * off.re + off.im * off.im);
    return { coherence: 2 * Math.hypot(off.re, off.im), purityVal: pur };
  }, [p]);
  return (
    <GameCard title="Decoherence Dial" tag="lab" computes="a real density matrix under the actual depolarizing channel; coherence is 2|ρ01| off that matrix">
      <p className="text-muted">
        This is the enemy every quantum computer fights. Turn up the noise on a crisp |+⟩ and watch its off diagonal
        coherence, the part that interferes, bleed away into a classical coin.
      </p>
      <Slider label="depolarizing strength p" value={p} min={0} max={1} step={0.01} onChange={setP} />
      <div className="flex gap-3">
        <Stat label="coherence 2|ρ01|" value={coherence.toFixed(3)} accent={coherence > 0.5} />
        <Stat label="purity Tr(ρ²)" value={purityVal.toFixed(3)} />
      </div>
      <div className="h-3 overflow-hidden rounded-sm bg-surface-2">
        <div className="h-full bg-accent transition-[width] duration-150 ease-out" style={{ width: `${coherence * 100}%` }} />
      </div>
      {coherence < 0.05 && <p className="font-mono text-xs text-[#78660f]">fully decohered, just a classical mixture now</p>}
    </GameCard>
  );
}

/* 19 ─ Repetition Rescue: error correction pays for itself. */
export function RepetitionRescue() {
  const [flipP, setFlipP] = useState(0.15);
  const [tally, setTally] = useState({ rounds: 0, saved: 0, rawOk: 0 });
  const run = (n: number) => {
    setTally((prev) => {
      const next = { ...prev };
      for (let i = 0; i < n; i++) {
        const round = repetitionRound(flipP, Math.random);
        next.rounds += 1;
        if (round.corrected) next.saved += 1;
        if (Math.random() >= flipP) next.rawOk += 1; // an unprotected qubit for comparison
      }
      return next;
    });
  };
  const rounds = tally.rounds || 1;
  return (
    <GameCard title="Repetition Rescue" tag="game" computes="Monte Carlo rounds of the 3-qubit bit flip code with true majority vote decoding, against an unprotected qubit at the same noise">
      <p className="text-muted">
        Encode one bit into three qubits; majority vote fixes any single flip. Below ~50% noise the code beats the bare
        qubit, the same idea, scaled up, is how Willow class processors reach below threshold error correction.
      </p>
      <Slider label="per qubit flip probability" value={flipP} min={0} max={0.5} step={0.01} onChange={setFlipP} />
      <div className="flex items-center gap-2">
        <ArcadeButton primary onClick={() => run(200)}>
          run 200 rounds
        </ArcadeButton>
        <ArcadeButton onClick={() => setTally({ rounds: 0, saved: 0, rawOk: 0 })}>reset</ArcadeButton>
      </div>
      <ProbBars probs={[tally.saved / rounds, tally.rawOk / rounds]} labels={["encoded", "bare"]} />
      {tally.rounds > 0 && tally.saved > tally.rawOk && (
        <p className="font-mono text-xs text-accent">the code is winning, redundancy + majority vote beats raw luck</p>
      )}
    </GameCard>
  );
}

/* 20 ─ BB84: catch the eavesdropper by physics alone. */
export function Bb84Game() {
  const bus = useQuantumEventBus();
  const [eve, setEve] = useState(false);
  const [rounds, setRounds] = useState<BB84Round[]>([]);
  const stats = useMemo(() => bb84Qber(rounds), [rounds]);
  const exchange = () => {
    const next = [...rounds, ...Array.from({ length: 40 }, () => bb84Round(eve, Math.random))];
    setRounds(next);
    const q = bb84Qber(next);
    bus.emit("ARCADE_RESULT", {
      game: "BB84",
      value: q.qber,
      summary: `BB84: ${q.sifted} sifted bits, error rate ${(q.qber * 100).toFixed(0)}%${q.sifted >= 12 && q.qber > 0.15 ? ", someone is on the line" : q.sifted >= 12 ? ", clean channel" : ""}.`,
    });
  };
  const alarm = stats.sifted >= 12 && stats.qber > 0.15;
  return (
    <GameCard title="BB84. Catch Eve" tag="game" computes="every round draws real random bits/bases; Eve's wrong basis measurements scramble states exactly as the protocol predicts">
      <p className="text-muted">
        Alice sends key bits in random bases; Bob measures in his own. Toggle an eavesdropper: her measurements
        <em> must</em> disturb the states (no cloning, two cards up), and the error rate betrays her at ~25%.
      </p>
      <div className="flex items-center gap-2">
        <ArcadeButton primary onClick={exchange}>
          exchange 40 qubits
        </ArcadeButton>
        <ArcadeButton onClick={() => setEve((e) => !e)}>{eve ? "Eve: ON 🕵" : "Eve: off"}</ArcadeButton>
        <ArcadeButton onClick={() => setRounds([])}>reset</ArcadeButton>
      </div>
      <div className="flex gap-3">
        <Stat label="sifted key bits" value={String(stats.sifted)} />
        <Stat label="QBER" value={`${(stats.qber * 100).toFixed(1)}%`} accent={alarm} />
      </div>
      {alarm && <p className="font-mono text-xs text-[#b3372a]">⚠ error rate far above channel noise, the key is burned, Eve is caught</p>}
      {stats.sifted >= 12 && !alarm && <p className="font-mono text-xs text-accent">clean channel, the sifted bits become a shared secret key</p>}
    </GameCard>
  );
}

/* bonus rail ─ Tunneling Curve (labeled analytic model). */
export function TunnelingCurve() {
  const [energy, setEnergy] = useState(0.4);
  const [width, setWidth] = useState(1.2);
  const barrier = 1;
  const T = useMemo(() => tunnelingTransmission(energy, barrier, width), [energy, width]);
  return (
    <GameCard title="Tunneling Odds" tag="model" computes="the idealized rectangular barrier formula T ≈ e^(−2κL), an analytic textbook model, not a simulation">
      <p className="text-muted">
        Classically, a ball below the wall&apos;s height never crosses. Quantum mechanically the odds are small, but
        never zero. Thinner or lower walls help exponentially.
      </p>
      <Slider label="particle energy (barrier = 1)" value={energy} min={0} max={1} step={0.01} onChange={setEnergy} />
      <Slider label="barrier width L" value={width} min={0.1} max={3} step={0.05} onChange={setWidth} />
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-sm bg-surface-2">
          <div className="h-full bg-accent transition-[width] duration-150 ease-out" style={{ width: `${Math.max(T * 100, 0.5)}%` }} />
        </div>
        <Stat label="P(tunnel)" value={T < 0.001 ? T.toExponential(2) : `${(T * 100).toFixed(2)}%`} accent={T > 0.1} />
      </div>
    </GameCard>
  );
}
