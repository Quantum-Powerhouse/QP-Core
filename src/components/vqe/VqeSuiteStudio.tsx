"use client";

import { useMemo, useState } from "react";
import { AnsatzCircuitDiagram } from "@/components/vqe/AnsatzCircuitDiagram";
import { ConvergenceChart } from "@/components/vqe/ConvergenceChart";
import { HamiltonianPanel } from "@/components/vqe/HamiltonianPanel";
import { QSphere } from "@/components/vqe/QSphere";
import { StatevectorExplorer } from "@/components/vqe/StatevectorExplorer";
import { VqeStepThrough } from "@/components/vqe/VqeStepThrough";
import { useQuantumEventBus } from "@/components/quantum/QuantumEventProvider";
import { ZneChart } from "@/components/vqe/ZneChart";
import { runVqe, type VqeResult } from "@/lib/physics/vqe";
import { runZne, type ZneResult } from "@/lib/physics/zne";

type TabId = "convergence" | "step-through" | "statevector" | "qsphere" | "zne";

const TABS: { id: TabId; label: string }[] = [
  { id: "convergence", label: "Convergence" },
  { id: "step-through", label: "Step by Step" },
  { id: "statevector", label: "Statevector" },
  { id: "qsphere", label: "QSphere" },
  { id: "zne", label: "Error Mitigation (ZNE)" },
];

const DEFAULT_SINGLE_QUBIT_RATE = 0.002;
const DEFAULT_TWO_QUBIT_RATE = 0.02;

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 font-mono text-xs text-muted">
      <span>
        {label}: <span className="text-accent">{(value * 100).toFixed(2)}%</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-[#a06b1f]"
      />
    </label>
  );
}

export function VqeSuiteStudio() {
  const [tab, setTab] = useState<TabId>("convergence");
  const [vqeResult, setVqeResult] = useState<VqeResult | null>(null);
  const [zneResult, setZneResult] = useState<ZneResult | null>(null);
  const [singleQubitRate, setSingleQubitRate] = useState(DEFAULT_SINGLE_QUBIT_RATE);
  const [twoQubitRate, setTwoQubitRate] = useState(DEFAULT_TWO_QUBIT_RATE);
  const eventBus = useQuantumEventBus();

  const defaultVqe = useMemo(() => runVqe({ iterations: 40 }), []);
  const activeVqe = vqeResult ?? defaultVqe;

  function handleRunVqe() {
    eventBus.emit("VQE_STARTED", {});
    const next = runVqe({ iterations: 40 });
    for (const point of next.trajectory) {
      eventBus.emit("VQE_ITERATION", { iteration: point.iteration, energyHartree: point.energyHartree });
    }
    eventBus.emit("VQE_CONVERGED", {
      finalEnergyHartree: next.finalEnergyHartree,
      exactGroundEnergyHartree: next.exactGroundEnergyHartree,
    });
    setVqeResult(next);
  }

  function handleRunZne() {
    const next = runZne(activeVqe.finalTheta, { singleQubit: singleQubitRate, twoQubit: twoQubitRate });
    for (const point of next.points) {
      eventBus.emit("NOISE_APPLIED", { lambda: point.lambda, energyHartree: point.energyHartree });
    }
    setZneResult(next);
  }

  return (
    <section id="vqe-suite" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-sm text-accent">Live Tool</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">VQE Suite</h2>
          <p className="mt-3 max-w-2xl text-muted">
            A real variational quantum eigensolver for H<sub>2</sub>, simulated in the browser:
            an exact statevector simulator, the parameter shift optimizer, and a
            density matrix error mitigation pipeline, no backend required.
          </p>
        </div>
      </div>

      <HamiltonianPanel />

      <div className="mb-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted">Ansatz circuit</p>
        <AnsatzCircuitDiagram />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-surface/70 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border bg-surface-2/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-xs text-muted">h2-vqe-zne, zsh</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border px-4 pt-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-t-md border-x border-t px-4 py-2 font-mono text-xs transition-colors ${
                tab === t.id ? "border-border bg-surface text-accent" : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "convergence" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-muted">
                  H<sub>2</sub> (STO-3G, R = 0.75 Å) · O&apos;Malley et al., Phys. Rev. X 6, 031007 (2016)
                </p>
                <button
                  onClick={handleRunVqe}
                  className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-[#faf8f3] transition-opacity hover:opacity-90"
                >
                  Run ▸ VQE
                </button>
              </div>
              <ConvergenceChart trajectory={activeVqe.trajectory} exactEnergyHartree={activeVqe.exactGroundEnergyHartree} />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Iterations" value={String(activeVqe.trajectory.length - 1)} />
                <Stat label="Converged θ" value={activeVqe.finalTheta.toFixed(4)} />
                <Stat label="VQE Energy" value={`${activeVqe.finalEnergyHartree.toFixed(6)} Ha`} />
                <Stat
                  label="Error vs. exact"
                  value={`${Math.abs((activeVqe.finalEnergyHartree - activeVqe.exactGroundEnergyHartree) * 1000).toFixed(4)} mHa`}
                />
              </div>
            </div>
          )}

          {tab === "step-through" && <VqeStepThrough />}

          {tab === "statevector" && <StatevectorExplorer theta={activeVqe.finalTheta} />}

          {tab === "qsphere" && <QSphere theta={activeVqe.finalTheta} />}

          {tab === "zne" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap gap-6">
                  <Slider label="Single qubit gate error" value={singleQubitRate} onChange={setSingleQubitRate} min={0} max={0.02} step={0.0005} />
                  <Slider label="Two qubit (CNOT) gate error" value={twoQubitRate} onChange={setTwoQubitRate} min={0} max={0.08} step={0.002} />
                </div>
                <button
                  onClick={handleRunZne}
                  className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-[#faf8f3] transition-opacity hover:opacity-90"
                >
                  Run ▸ ZNE
                </button>
              </div>

              {zneResult ? (
                <>
                  <ZneChart result={zneResult} />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Stat label="Raw (λ=1) error" value={`${Math.abs((zneResult.points[0].energyHartree - zneResult.noiselessEnergyHartree) * 1000).toFixed(3)} mHa`} />
                    <Stat label="Linear extrap. error" value={`${Math.abs((zneResult.linearExtrapolationHartree - zneResult.noiselessEnergyHartree) * 1000).toFixed(3)} mHa`} />
                    <Stat label="Quadratic extrap. error" value={`${Math.abs((zneResult.quadraticExtrapolationHartree - zneResult.noiselessEnergyHartree) * 1000).toFixed(3)} mHa`} />
                    <Stat label="Chemical accuracy" value="1.600 mHa" />
                  </div>
                </>
              ) : (
                <p className="px-1 py-8 text-center font-mono text-sm text-muted">
                  {"// run ZNE to fold the ansatz circuit and Richardson extrapolate to the zero noise limit"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
