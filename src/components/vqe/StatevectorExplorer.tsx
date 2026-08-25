"use client";

import { useMemo, useState } from "react";
import { useQuantumEventBus } from "@/components/quantum/QuantumEventProvider";
import { RepresentsTag } from "@/components/quantum/RepresentsTag";
import { reducedDensityMatrixQubit0, purity } from "@/lib/physics/entanglement";
import { probabilitiesOf, sampleMeasurement } from "@/lib/physics/measurement";
import { runH2AnsatzStatevector } from "@/lib/physics/vqe";

/** Basis index = 2*q1 + q0 (see src/lib/physics/statevector.ts's bit convention). */
const BASIS_LABELS = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];

export function StatevectorExplorer({ theta }: { theta: number }) {
  const eventBus = useQuantumEventBus();
  const [measuredIndex, setMeasuredIndex] = useState<number | null>(null);

  const state = useMemo(() => runH2AnsatzStatevector(theta), [theta]);
  const probabilities = useMemo(() => probabilitiesOf(state), [state]);
  const reducedPurity = useMemo(() => purity(reducedDensityMatrixQubit0(state)), [state]);

  function handleMeasure() {
    const result = sampleMeasurement(state);
    setMeasuredIndex(result.outcomeIndex);
    eventBus.emit("MEASUREMENT", result);
  }

  return (
    <div className="flex flex-col gap-4">
      <RepresentsTag docsHref="/docs/vqe-suite/state-representations-and-measurement">
        the complex amplitudes of the current VQE state |ψ(θ)⟩ = Σ αᵢ|i⟩, what measurement probabilities come
        from, not a probability distribution by itself
      </RepresentsTag>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-3 py-2">Basis</th>
              <th className="px-3 py-2">Amplitude</th>
              <th className="px-3 py-2">|amplitude|</th>
              <th className="px-3 py-2">Probability</th>
              <th className="px-3 py-2">Phase</th>
            </tr>
          </thead>
          <tbody>
            {state.map((amp, i) => {
              const magnitude = Math.hypot(amp.re, amp.im);
              const phaseDeg = magnitude > 1e-9 ? (Math.atan2(amp.im, amp.re) * 180) / Math.PI : 0;
              const isMeasured = measuredIndex === i;
              const isDimmed = measuredIndex !== null && !isMeasured;
              return (
                <tr
                  key={i}
                  className={`border-b border-border/60 transition-opacity ${isDimmed ? "opacity-30" : ""} ${isMeasured ? "bg-accent/10" : ""}`}
                >
                  <td className="px-3 py-2 text-foreground">{BASIS_LABELS[i]}</td>
                  <td className="px-3 py-2 text-muted">
                    {amp.re.toFixed(4)} {amp.im >= 0 ? "+" : "−"} {Math.abs(amp.im).toFixed(4)}i
                  </td>
                  <td className="px-3 py-2 text-muted">{magnitude.toFixed(4)}</td>
                  <td className="px-3 py-2 text-accent">{(probabilities[i] * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2 text-muted">{phaseDeg.toFixed(0)}°</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="font-mono text-xs text-muted">
        Reduced state purity Tr(ρ₀²) = <span className="text-foreground">{reducedPurity.toFixed(4)}</span>, 1.0000
        means qubit 0 is unentangled from qubit 1 (a product state); lower values mean more entanglement between
        them. This ansatz&apos;s amplitudes are always real, so phase here only ever reads 0° or 180°.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleMeasure}
          className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-[#211603] transition-opacity hover:opacity-90"
        >
          Measure ▸
        </button>
        {measuredIndex !== null && (
          <>
            <span className="font-mono text-xs text-accent">Measured: {BASIS_LABELS[measuredIndex]}</span>
            <button
              onClick={() => setMeasuredIndex(null)}
              className="rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:text-foreground"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
