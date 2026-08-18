"use client";

import { useState } from "react";
import { useQuantumEventBus } from "@/components/quantum/QuantumEventProvider";
import { RepresentsTag } from "@/components/quantum/RepresentsTag";
import { ConvergenceChart } from "@/components/vqe/ConvergenceChart";
import {
  energyAtTheta,
  exactGroundStateEnergy,
  vqeStep,
  type VqeIterationPoint,
  type VqeStepResult,
} from "@/lib/physics/vqe";

const LEARNING_RATE = 0.4;
const GRADIENT_CONVERGENCE_THRESHOLD = 1e-4;

type Stage = "initialize" | "step" | "converged";

function StagePipeline({ stage }: { stage: Stage }) {
  const steps: { id: string; label: string; active: boolean }[] = [
    { id: "initialize", label: "INITIALIZE", active: stage === "initialize" },
    { id: "prepare", label: "PREPARE", active: stage === "step" },
    { id: "measure", label: "MEASURE", active: stage === "step" },
    { id: "estimate", label: "ESTIMATE", active: stage === "step" },
    { id: "update", label: "UPDATE", active: stage === "step" },
    { id: "repeat-converge", label: stage === "converged" ? "CONVERGED" : "REPEAT", active: stage === "converged" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1">
          <span
            className={`rounded px-2 py-1 ${
              s.active ? "bg-accent/20 text-accent" : "text-muted"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-muted">→</span>}
        </div>
      ))}
    </div>
  );
}

export function VqeStepThrough() {
  const eventBus = useQuantumEventBus();
  const exactEnergy = exactGroundStateEnergy();

  const [theta, setTheta] = useState(0);
  const [trajectory, setTrajectory] = useState<VqeIterationPoint[]>([]);
  const [lastStep, setLastStep] = useState<VqeStepResult | null>(null);
  const [converged, setConverged] = useState(false);

  function handleStep() {
    if (converged) return;

    if (trajectory.length === 0) {
      eventBus.emit("VQE_STARTED", {});
    }

    const step = vqeStep(theta, LEARNING_RATE);
    const iteration = trajectory.length;
    setTrajectory((prev) => [...prev, { iteration, theta, energyHartree: step.energyBefore }]);
    eventBus.emit("VQE_ITERATION", { iteration, energyHartree: step.energyBefore });
    setLastStep(step);
    setTheta(step.nextTheta);

    if (Math.abs(step.gradient) < GRADIENT_CONVERGENCE_THRESHOLD) {
      const finalEnergy = energyAtTheta(step.nextTheta);
      setTrajectory((prev) => [
        ...prev,
        { iteration: iteration + 1, theta: step.nextTheta, energyHartree: finalEnergy },
      ]);
      setConverged(true);
      eventBus.emit("VQE_CONVERGED", {
        finalEnergyHartree: finalEnergy,
        exactGroundEnergyHartree: exactEnergy,
      });
    }
  }

  function handleReset() {
    setTheta(0);
    setTrajectory([]);
    setLastStep(null);
    setConverged(false);
  }

  const stage: Stage = converged ? "converged" : lastStep === null ? "initialize" : "step";
  const finalPoint = trajectory[trajectory.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <RepresentsTag>
        one real parameter-shift-rule gradient step per click — every number below comes from the same
        statevector simulator used by the Convergence tab, evaluated fresh, not replayed from a precomputed run
      </RepresentsTag>

      <StagePipeline stage={stage} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleStep}
          disabled={converged}
          className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-[#04121a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Step ▸
        </button>
        <button
          onClick={handleReset}
          className="rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:text-foreground"
        >
          Reset
        </button>
        <span className="font-mono text-xs text-muted">
          learning rate = {LEARNING_RATE} · iteration {trajectory.length - (converged ? 1 : 0)}
        </span>
      </div>

      {lastStep ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StepStat label="θ (PREPARE)" value={lastStep.theta.toFixed(6)} />
          <StepStat label="E(θ) — MEASURE/ESTIMATE" value={`${lastStep.energyBefore.toFixed(6)} Ha`} />
          <StepStat label="E(θ + π/2)" value={`${lastStep.energyPlusShift.toFixed(6)} Ha`} />
          <StepStat label="E(θ − π/2)" value={`${lastStep.energyMinusShift.toFixed(6)} Ha`} />
          <StepStat label="∇E — UPDATE" value={lastStep.gradient.toExponential(4)} />
          <StepStat label="θ_next = θ − lr·∇E" value={lastStep.nextTheta.toFixed(6)} />
        </div>
      ) : (
        <p className="px-1 py-4 text-center font-mono text-sm text-muted">
          {"// click Step to run one parameter-shift gradient evaluation from θ = 0"}
        </p>
      )}

      {converged && finalPoint && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 font-mono text-xs text-foreground">
          CONVERGED — |∇E| = {Math.abs(lastStep!.gradient).toExponential(3)} {"<"} {GRADIENT_CONVERGENCE_THRESHOLD.toExponential(0)}: no further energy
          decrease expected. Final energy {finalPoint.energyHartree.toFixed(6)} Ha, {Math.abs((finalPoint.energyHartree - exactEnergy) * 1000).toFixed(4)} mHa
          from the exact ground state ({exactEnergy.toFixed(6)} Ha).
        </div>
      )}

      {trajectory.length > 0 && <ConvergenceChart trajectory={trajectory} exactEnergyHartree={exactEnergy} />}
    </div>
  );
}

function StepStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
