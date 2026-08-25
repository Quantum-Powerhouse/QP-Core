"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  amplitudeTable,
  blochOfQubit,
  diagonalProbabilities,
  GATE_INFO,
  PRESETS,
  purityOf,
  runIdeal,
  runNoisy,
  sampleShots,
  toOpenQASM,
  type Circuit,
  type GateName,
  type GateOp,
} from "@/lib/lab/circuit";
import { probabilitiesOf } from "@/lib/physics/measurement";
import { ArcadeButton, BlochDial, Slider, Stat } from "@/components/arcade/kit";
import { useQuantumEventBus } from "@/components/quantum/QuantumEventProvider";

const MAX_QUBITS = 5;
const MAX_OPS = 24;
const GATES: GateName[] = ["H", "X", "Y", "Z", "S", "T", "RX", "RY", "RZ", "CNOT", "CZ", "SWAP"];

/**
 * The Circuit Lab: build a circuit gate by gate, watch the exact statevector
 * (amplitudes, phases, per-qubit Bloch vectors), dial in depolarizing noise
 * and watch the density matrix lose purity, sample shots, and export
 * OpenQASM straight into the site's transpiler. Every number recomputes from
 * the engine on every change, there is no cached or drawn result.
 */
export function CircuitLab() {
  const bus = useQuantumEventBus();
  const [circuit, setCircuit] = useState<Circuit>(PRESETS[0].circuit);
  const [pending, setPending] = useState<GateName>("H");
  const [theta, setTheta] = useState(Math.PI / 2);
  const [pickedQ, setPickedQ] = useState<number | null>(null);
  const [noise, setNoise] = useState({ p1: 0, p2: 0 });
  const [shots, setShots] = useState<number[] | null>(null);
  const [copied, setCopied] = useState(false);

  const n = circuit.numQubits;
  const state = useMemo(() => runIdeal(circuit), [circuit]);
  const probs = useMemo(() => probabilitiesOf(state), [state]);
  const table = useMemo(() => amplitudeTable(state, n), [state, n]);
  const blochs = useMemo(() => Array.from({ length: n }, (_, k) => blochOfQubit(state, k, n)), [state, n]);
  const noisy = useMemo(() => (noise.p1 > 0 || noise.p2 > 0 ? runNoisy(circuit, noise) : null), [circuit, noise]);
  const noisyProbs = useMemo(() => (noisy ? diagonalProbabilities(noisy) : null), [noisy]);
  const purity = useMemo(() => (noisy ? purityOf(noisy) : 1), [noisy]);
  const qasm = useMemo(() => toOpenQASM(circuit), [circuit]);
  const info = GATE_INFO[pending];

  const setOps = (ops: GateOp[]) => {
    setCircuit((c) => ({ ...c, ops }));
    setShots(null);
  };

  const placeOn = (q: number) => {
    if (circuit.ops.length >= MAX_OPS) return;
    if (info.arity === 1) {
      setOps([...circuit.ops, { gate: pending, q, ...(info.param ? { theta } : {}) }]);
      return;
    }
    // two-qubit: first click picks the control/first, second the target/second
    if (pickedQ === null) {
      setPickedQ(q);
      return;
    }
    if (pickedQ === q) {
      setPickedQ(null);
      return;
    }
    const op: GateOp = pending === "SWAP" ? { gate: "SWAP", q: pickedQ, q2: q } : { gate: pending, q, q2: pickedQ };
    setOps([...circuit.ops, op]);
    setPickedQ(null);
  };

  const setQubits = (count: number) => {
    setCircuit({ numQubits: count, ops: circuit.ops.filter((o) => o.q < count && (o.q2 ?? 0) < count) });
    setPickedQ(null);
    setShots(null);
  };

  const runShots = () => {
    const source = noisyProbs ?? probs;
    const counts = sampleShots(source, 1024);
    setShots(counts);
    const top = counts.indexOf(Math.max(...counts));
    bus.emit("ARCADE_RESULT", {
      game: "Circuit Lab",
      value: counts[top] / 1024,
      summary: `Lab: 1024 shots on ${n} qubits, |${top.toString(2).padStart(n, "0")}⟩ came up ${((counts[top] / 1024) * 100).toFixed(1)}%${noisy ? ` with purity ${purity.toFixed(3)} under noise` : ""}.`,
    });
  };

  const copyQasm = async () => {
    try {
      await navigator.clipboard.writeText(qasm);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked, the text is visible below anyway */
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── builder ─────────────────────────────────────────────────── */}
      <section className="glass-panel rounded-xl p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Build</h2>
            <p className="mt-1 text-sm text-muted">Pick a gate, then click a wire. Two qubit gates: click control, then target.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted">qubits</span>
            {Array.from({ length: MAX_QUBITS }, (_, i) => i + 1).map((k) => (
              <ArcadeButton key={k} primary={n === k} onClick={() => setQubits(k)}>
                {k}
              </ArcadeButton>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {GATES.map((g) => (
            <ArcadeButton
              key={g}
              primary={pending === g}
              onClick={() => {
                setPending(g);
                setPickedQ(null);
              }}
            >
              {GATE_INFO[g].label}
            </ArcadeButton>
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] text-muted">{info.blurb}</p>
        {info.param && (
          <div className="mt-2 max-w-sm">
            <Slider label="θ for the next rotation" value={theta} min={0} max={2 * Math.PI} step={0.01} onChange={setTheta} format={(v) => `${v.toFixed(2)} rad · ${((v / Math.PI) * 180).toFixed(0)}°`} />
          </div>
        )}

        {/* wires */}
        <div className="mt-5 overflow-x-auto">
          <div className="flex min-w-[520px] flex-col gap-2">
            {Array.from({ length: n }, (_, q) => (
              <div key={q} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => placeOn(q)}
                  className={`w-14 shrink-0 rounded-md border px-2 py-1 font-mono text-xs transition-colors duration-150 ease-out ${
                    pickedQ === q ? "border-accent bg-accent/15 text-accent" : "border-border text-foreground hover:border-accent/60"
                  }`}
                  aria-label={`place ${pending} on qubit ${q}`}
                >
                  q{q} ▸
                </button>
                <div className="relative h-9 flex-1 rounded bg-surface/40">
                  <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-border" />
                  <div className="absolute inset-0 flex items-center gap-1 px-2">
                    {circuit.ops.map((op, i) => {
                      const involved = op.q === q || op.q2 === q;
                      if (!involved) return <span key={i} className="inline-block w-9 shrink-0" />;
                      const isControl = (op.gate === "CNOT" || op.gate === "CZ") && op.q2 === q;
                      return (
                        <button
                          key={i}
                          type="button"
                          title="remove"
                          onClick={() => setOps(circuit.ops.filter((_, j) => j !== i))}
                          className={`inline-flex h-7 w-9 shrink-0 items-center justify-center rounded border font-mono text-[10px] transition-colors duration-150 ease-out hover:border-[#ff6b6b] ${
                            isControl ? "border-accent-2 text-accent-2" : "border-accent bg-background/80 text-accent"
                          }`}
                        >
                          {isControl ? "●" : op.gate === "SWAP" ? "×" : op.gate}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">presets:</span>
          {PRESETS.map((p) => (
            <ArcadeButton
              key={p.name}
              onClick={() => {
                setCircuit(p.circuit);
                setPickedQ(null);
                setShots(null);
              }}
            >
              {p.name}
            </ArcadeButton>
          ))}
          <ArcadeButton onClick={() => setOps([])}>clear</ArcadeButton>
          <span className="ml-auto font-mono text-[11px] text-muted">
            {circuit.ops.length}/{MAX_OPS} gates
          </span>
        </div>
      </section>

      {/* ── state ───────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-panel rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground">Exact state</h2>
          <p className="mt-1 text-sm text-muted">The full statevector, amplitude, phase, probability for every basis state.</p>
          <div className="mt-3 flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
            {table.map((row) => (
              <div key={row.label} className="flex items-center gap-2 font-mono text-xs">
                <span className="w-16 shrink-0 text-muted">{row.label}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-sm bg-surface-2">
                  <div className="h-full bg-accent transition-[width] duration-200 ease-out" style={{ width: `${row.prob * 100}%` }} />
                </div>
                <span className="w-12 text-right text-foreground">{(row.prob * 100).toFixed(1)}%</span>
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full border border-border"
                  title={`phase ${((row.phase * 180) / Math.PI).toFixed(0)}°`}
                  style={{ background: row.prob > 1e-9 ? `conic-gradient(from ${-row.phase}rad, var(--accent) 0 12%, transparent 12%)` : "transparent" }}
                />
                <span className="w-24 text-right text-muted">{row.re.toFixed(3)}{row.im >= 0 ? "+" : "−"}{Math.abs(row.im).toFixed(3)}i</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground">Each qubit alone</h2>
          <p className="mt-1 text-sm text-muted">Reduced Bloch vectors. Entangled qubits shrink toward the center, information has left the individual.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {blochs.map((b, k) => {
              const len = Math.hypot(b.x, b.y, b.z);
              return (
                <div key={k} className="flex flex-col items-center gap-1">
                  <BlochDial x={b.x} z={b.z} size={84} />
                  <span className="font-mono text-[10px] text-muted">
                    q{k} · |r|={len.toFixed(2)} {len < 0.2 ? "· mixed" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── noise + shots ───────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass-panel rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground">Noise</h2>
          <p className="mt-1 text-sm text-muted">A depolarizing channel after every gate, exact density matrix, the same model the VQE suite&apos;s ZNE uses.</p>
          <div className="mt-3 flex flex-col gap-2">
            <Slider label="1-qubit gate error p₁" value={noise.p1} min={0} max={0.2} step={0.005} onChange={(v) => setNoise((s) => ({ ...s, p1: v }))} format={(v) => `${(v * 100).toFixed(1)}%`} />
            <Slider label="2-qubit gate error p₂" value={noise.p2} min={0} max={0.3} step={0.005} onChange={(v) => setNoise((s) => ({ ...s, p2: v }))} format={(v) => `${(v * 100).toFixed(1)}%`} />
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <Stat label="purity Tr(ρ²)" value={purity.toFixed(4)} accent={purity > 0.95} />
            <Stat label="gates" value={String(circuit.ops.length)} />
          </div>
          {noisyProbs && (
            <div className="mt-3 flex flex-col gap-1">
              {noisyProbs.map((p, i) => (
                <div key={i} className="flex items-center gap-2 font-mono text-xs">
                  <span className="w-16 shrink-0 text-muted">|{i.toString(2).padStart(n, "0")}⟩</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-sm bg-surface-2">
                    <div className="h-full bg-[#f59e0b] transition-[width] duration-200 ease-out" style={{ width: `${p * 100}%` }} />
                  </div>
                  <span className="w-12 text-right text-foreground">{(p * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-panel rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground">Measure</h2>
          <p className="mt-1 text-sm text-muted">1024 real shots sampled from the {noisy ? "noisy" : "ideal"} distribution. The randomness comes from the physics.</p>
          <div className="mt-3 flex items-center gap-2">
            <ArcadeButton primary onClick={runShots}>
              run 1024 shots
            </ArcadeButton>
            {shots && <Stat label="distinct outcomes" value={String(shots.filter((c) => c > 0).length)} />}
          </div>
          {shots && (
            <div className="mt-3 flex flex-col gap-1">
              {shots.map((cnt, i) => (
                <div key={i} className="flex items-center gap-2 font-mono text-xs">
                  <span className="w-16 shrink-0 text-muted">|{i.toString(2).padStart(n, "0")}⟩</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-sm bg-surface-2">
                    <div className="h-full bg-accent-2 transition-[width] duration-200 ease-out" style={{ width: `${(cnt / 1024) * 100}%` }} />
                  </div>
                  <span className="w-12 text-right text-foreground">{cnt}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── export ──────────────────────────────────────────────────── */}
      <section className="glass-panel rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">OpenQASM 2.0</h2>
            <p className="mt-1 text-sm text-muted">
              Your circuit as code. Paste it into the{" "}
              <Link href="/playground/qp-core" className="text-accent">transpiler</Link> to compile it to Amazon Braket IR.
            </p>
          </div>
          <ArcadeButton onClick={copyQasm}>{copied ? "copied ✓" : "copy"}</ArcadeButton>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-foreground">{qasm}</pre>
      </section>
    </div>
  );
}
