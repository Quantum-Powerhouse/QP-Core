"use client";

import { useState } from "react";
import { applyCNOT, applySingleQubitGate, zeroState } from "@/lib/physics/statevector";
import { GATE_H } from "@/lib/arcade/qlogic";
import { fastCNOT, fastH, fastZero } from "@/lib/physics/fastStatevector";
import { ArcadeButton, GameCard, Stat } from "@/components/arcade/kit";

type Row = { qubits: number; ms: number | null; fastMs: number; gates: number };

/**
 * Live scaling benchmark of the in-browser statevector engine: for n qubits,
 * apply one layer of Hadamards plus a CNOT chain and time it. Real numbers
 * from the visitor's own machine, the direct way to show the 2^n wall.
 */
export function EngineBenchmark() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setRows([]);
    const out: Row[] = [];
    let readableDone = false;
    for (let n = 4; n <= 22; n += 2) {
      await new Promise((r) => setTimeout(r, 0)); // yield so the UI paints each row
      const gates = 2 * n - 1;
      // readable engine (object per amplitude), stops once it gets slow
      let ms: number | null = null;
      if (!readableDone) {
        const t0 = performance.now();
        let s = zeroState(n);
        for (let q = 0; q < n; q++) s = applySingleQubitGate(s, GATE_H, q);
        for (let q = 0; q < n - 1; q++) s = applyCNOT(s, q, q + 1);
        ms = performance.now() - t0;
        if (ms > 1500) readableDone = true;
      }
      // typed-array kernel
      const t1 = performance.now();
      const f = fastZero(n);
      for (let q = 0; q < n; q++) fastH(f, q);
      for (let q = 0; q < n - 1; q++) fastCNOT(f, q, q + 1);
      const fastMs = performance.now() - t1;
      out.push({ qubits: n, ms, fastMs, gates });
      setRows([...out]);
      if (fastMs > 4000) break; // don't freeze phones
    }
    setRunning(false);
  };

  const maxMs = Math.max(1, ...rows.map((r) => Math.max(r.ms ?? 0, r.fastMs)));
  return (
    <GameCard title="Engine Scaling Benchmark" tag="bench" computes="wall-clock time on your device for 2^n amplitudes (one H layer + a CNOT chain): the readable object-per-amplitude engine vs the Float64Array kernel">
      <p className="text-muted">
        The 2ⁿ wall, measured live: every extra qubit doubles the amplitudes. Grey is the readable teaching engine
        behind the games; cyan is the typed-array kernel, same physics, flat memory, in-place gates, which is how
        the browser reaches 20+ qubits.
      </p>
      <div className="flex items-center gap-2">
        <ArcadeButton primary onClick={run} disabled={running}>
          {running ? "running…" : "run benchmark"}
        </ArcadeButton>
        {rows.length > 0 && <Stat label="largest" value={`${rows[rows.length - 1].qubits} qubits · ${(2 ** rows[rows.length - 1].qubits).toLocaleString()} amplitudes`} accent />}
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => {
          const fmt = (v: number) => (v < 1 ? `${(v * 1000).toFixed(0)} µs` : `${v.toFixed(1)} ms`);
          return (
            <div key={r.qubits} className="flex items-center gap-2 font-mono text-xs">
              <span className="w-16 text-muted">{r.qubits} qubits</span>
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="h-2 overflow-hidden rounded-sm bg-surface-2">
                  <div className="h-full bg-muted/60 transition-[width] duration-300 ease-out" style={{ width: r.ms === null ? "0%" : `${Math.max(1, (r.ms / maxMs) * 100)}%` }} />
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-surface-2">
                  <div className="h-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${Math.max(1, (r.fastMs / maxMs) * 100)}%` }} />
                </div>
              </div>
              <span className="w-20 text-right text-muted">{r.ms === null ? "n/a" : fmt(r.ms)}</span>
              <span className="w-20 text-right text-accent">{fmt(r.fastMs)}</span>
            </div>
          );
        })}
      </div>
    </GameCard>
  );
}
