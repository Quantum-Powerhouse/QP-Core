"use client";

import { useState } from "react";
import { applyCNOT, applySingleQubitGate, zeroState } from "@/lib/physics/statevector";
import { GATE_H } from "@/lib/arcade/qlogic";
import { ArcadeButton, GameCard, Stat } from "@/components/arcade/kit";

type Row = { qubits: number; ms: number; gates: number; gatesPerSec: number };

/**
 * Live scaling benchmark of the in-browser statevector engine: for n qubits,
 * apply one layer of Hadamards plus a CNOT chain and time it. Real numbers
 * from the visitor's own machine — the honest way to show the 2^n wall.
 */
export function EngineBenchmark() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setRows([]);
    const out: Row[] = [];
    for (let n = 4; n <= 16; n += 2) {
      await new Promise((r) => setTimeout(r, 0)); // yield so the UI paints each row
      const t0 = performance.now();
      let s = zeroState(n);
      for (let q = 0; q < n; q++) s = applySingleQubitGate(s, GATE_H, q);
      for (let q = 0; q < n - 1; q++) s = applyCNOT(s, q, q + 1);
      const ms = performance.now() - t0;
      const gates = 2 * n - 1;
      out.push({ qubits: n, ms, gates, gatesPerSec: gates / (ms / 1000) });
      setRows([...out]);
      if (ms > 2500) break; // don't freeze phones
    }
    setRunning(false);
  };

  const maxMs = Math.max(1, ...rows.map((r) => r.ms));
  return (
    <GameCard title="Engine Scaling Benchmark" tag="bench" computes="wall-clock time of the real statevector engine on your device for 2^n amplitudes — one H layer + a CNOT chain per n">
      <p className="text-muted">
        The 2ⁿ wall, measured live: every extra qubit doubles the amplitudes. This is the same engine behind every game
        here, running on <em>your</em> CPU. (Plain JavaScript complex arrays — no WebGPU, no workers. Yet.)
      </p>
      <div className="flex items-center gap-2">
        <ArcadeButton primary onClick={run} disabled={running}>
          {running ? "running…" : "run benchmark"}
        </ArcadeButton>
        {rows.length > 0 && <Stat label="largest" value={`${rows[rows.length - 1].qubits} qubits · ${(2 ** rows[rows.length - 1].qubits).toLocaleString()} amplitudes`} accent />}
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div key={r.qubits} className="flex items-center gap-2 font-mono text-xs">
            <span className="w-16 text-muted">{r.qubits} qubits</span>
            <div className="h-3 flex-1 overflow-hidden rounded-sm bg-surface-2">
              <div className="h-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${Math.max(1.5, (r.ms / maxMs) * 100)}%` }} />
            </div>
            <span className="w-24 text-right text-foreground">{r.ms < 1 ? `${(r.ms * 1000).toFixed(0)} µs` : `${r.ms.toFixed(1)} ms`}</span>
            <span className="w-28 text-right text-muted">{Math.round(r.gatesPerSec).toLocaleString()} gates/s</span>
          </div>
        ))}
      </div>
    </GameCard>
  );
}
