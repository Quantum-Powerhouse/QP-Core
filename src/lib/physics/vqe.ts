import { h2AnsatzGates, H2_NUM_QUBITS } from "./h2Ansatz.ts";
import { h2ElectronicHamiltonianMatrix, h2NuclearRepulsion } from "./h2Hamiltonian.ts";
import { jacobiEigenSymmetric } from "./linalg.ts";
import {
  applyCNOT,
  applyRY,
  applyX,
  expectationValue,
  zeroState,
  type Statevector,
} from "./statevector.ts";

/** Runs the H2 ansatz circuit (see h2Ansatz.ts) for a given variational angle theta. */
export function runH2AnsatzStatevector(theta: number): Statevector {
  let state = zeroState(H2_NUM_QUBITS);
  for (const gate of h2AnsatzGates()) {
    if (gate.kind === "X") state = applyX(state, gate.qubit);
    else if (gate.kind === "CNOT") state = applyCNOT(state, gate.control, gate.target);
    else state = applyRY(state, theta, gate.qubit);
  }
  return state;
}

/** Exact ground-state energy (Hartree, including nuclear repulsion) via direct diagonalization. */
export function exactGroundStateEnergy(): number {
  const hMatrix = h2ElectronicHamiltonianMatrix();
  // The H2 Hamiltonian in this basis is real (I, Z, ZZ, YY, XX terms all have
  // real matrix elements here — see h2Hamiltonian.ts docs), so a real
  // symmetric eigensolver is sufficient and exact.
  const real = hMatrix.map((row) => row.map((v) => v.re));
  const { values } = jacobiEigenSymmetric(real);
  return Math.min(...values) + h2NuclearRepulsion();
}

export type VqeIterationPoint = { iteration: number; theta: number; energyHartree: number };

export type VqeResult = {
  trajectory: VqeIterationPoint[];
  finalTheta: number;
  finalEnergyHartree: number;
  exactGroundEnergyHartree: number;
};

export function energyAtTheta(theta: number): number {
  const hMatrix = h2ElectronicHamiltonianMatrix();
  return expectationValue(runH2AnsatzStatevector(theta), hMatrix) + h2NuclearRepulsion();
}

/**
 * Gradient-descent VQE using the exact parameter-shift rule for the single
 * RY(theta) generator: dE/dtheta = [E(theta + pi/2) - E(theta - pi/2)] / 2.
 */
export type VqeStepResult = {
  theta: number;
  energyBefore: number;
  energyPlusShift: number;
  energyMinusShift: number;
  gradient: number;
  nextTheta: number;
};

/**
 * One real parameter-shift-rule gradient-descent step: PREPARE the ansatz at
 * theta, MEASURE/ESTIMATE the energy there and at theta +/- pi/2, then UPDATE
 * theta by the resulting gradient. Every field here is a genuine computed
 * value — used both by runVqe's loop and by the interactive step-through UI.
 */
export function vqeStep(theta: number, learningRate: number): VqeStepResult {
  const energyBefore = energyAtTheta(theta);
  const energyPlusShift = energyAtTheta(theta + Math.PI / 2);
  const energyMinusShift = energyAtTheta(theta - Math.PI / 2);
  const gradient = (energyPlusShift - energyMinusShift) / 2;
  const nextTheta = theta - learningRate * gradient;

  return { theta, energyBefore, energyPlusShift, energyMinusShift, gradient, nextTheta };
}

export function runVqe(options?: {
  initialTheta?: number;
  iterations?: number;
  learningRate?: number;
}): VqeResult {
  const iterations = options?.iterations ?? 25;
  const lr = options?.learningRate ?? 0.4;
  let theta = options?.initialTheta ?? 0;

  const trajectory: VqeIterationPoint[] = [];
  for (let i = 0; i < iterations; i++) {
    const step = vqeStep(theta, lr);
    trajectory.push({ iteration: i, theta, energyHartree: step.energyBefore });
    theta = step.nextTheta;
  }
  const finalEnergy = energyAtTheta(theta);
  trajectory.push({ iteration: iterations, theta, energyHartree: finalEnergy });

  return {
    trajectory,
    finalTheta: theta,
    finalEnergyHartree: finalEnergy,
    exactGroundEnergyHartree: exactGroundStateEnergy(),
  };
}
