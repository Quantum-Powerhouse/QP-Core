import { h2AnsatzGates, H2_NUM_QUBITS, type AnsatzGate } from "./h2Ansatz.ts";
import { h2ElectronicHamiltonianMatrix, h2NuclearRepulsion } from "./h2Hamiltonian.ts";
import {
  applyDepolarizing1Q,
  applyDepolarizing2Q,
  applyUnitary,
  cnotMatrix,
  embedSingleQubitOperator,
  expectationValue as densityExpectationValue,
  ryMatrix,
  zeroDensityMatrix,
} from "./densityMatrix.ts";
import { type ComplexMatrix, richardsonExtrapolateToZero } from "./linalg.ts";
import { PAULI_X } from "./pauli.ts";
import { energyAtTheta } from "./vqe.ts";

type PhysicalGate = { unitary: ComplexMatrix; qubits: number[] };

/** Builds the ansatz as a list of executable unitaries, forward or reversed+inverted (for folding). */
function ansatzPhysicalGates(theta: number, reverse: boolean): PhysicalGate[] {
  const gates: AnsatzGate[] = h2AnsatzGates();
  const ordered = reverse ? [...gates].reverse() : gates;

  return ordered.map((gate): PhysicalGate => {
    if (gate.kind === "X") {
      return { unitary: embedSingleQubitOperator(PAULI_X, gate.qubit, H2_NUM_QUBITS), qubits: [gate.qubit] };
    }
    if (gate.kind === "CNOT") {
      return { unitary: cnotMatrix(gate.control, gate.target, H2_NUM_QUBITS), qubits: [gate.control, gate.target] };
    }
    const effectiveTheta = reverse ? -theta : theta;
    return { unitary: embedSingleQubitOperator(ryMatrix(effectiveTheta), gate.qubit, H2_NUM_QUBITS), qubits: [gate.qubit] };
  });
}

export type GateErrorRates = {
  /** Depolarizing probability applied after each single-qubit gate. */
  singleQubit: number;
  /** Depolarizing probability applied after each two-qubit (CNOT) gate. */
  twoQubit: number;
};

/**
 * Runs the folded, noisy ansatz circuit (global folding: U -> U (U dagger U)^k,
 * giving noise scale factor lambda = 2k+1) and returns the noisy energy estimate.
 */
export function noisyEnergyAtScale(theta: number, foldK: number, errorRates: GateErrorRates): number {
  let rho = zeroDensityMatrix(H2_NUM_QUBITS);

  const applySequence = (gates: PhysicalGate[]) => {
    for (const gate of gates) {
      rho = applyUnitary(rho, gate.unitary);
      if (gate.qubits.length === 1) {
        rho = applyDepolarizing1Q(rho, gate.qubits[0], errorRates.singleQubit, H2_NUM_QUBITS);
      } else {
        rho = applyDepolarizing2Q(rho, errorRates.twoQubit);
      }
    }
  };

  applySequence(ansatzPhysicalGates(theta, false));
  for (let k = 0; k < foldK; k++) {
    applySequence(ansatzPhysicalGates(theta, true));
    applySequence(ansatzPhysicalGates(theta, false));
  }

  const hMatrix = h2ElectronicHamiltonianMatrix();
  return densityExpectationValue(rho, hMatrix) + h2NuclearRepulsion();
}

export type ZneNoisePoint = { lambda: number; energyHartree: number };

export type ZneResult = {
  theta: number;
  errorRates: GateErrorRates;
  noiselessEnergyHartree: number;
  points: ZneNoisePoint[];
  linearExtrapolationHartree: number;
  quadraticExtrapolationHartree: number;
};

/** Zero-noise extrapolation over noise scale factors lambda = 1, 3, 5 (global folding, k = 0, 1, 2). */
export function runZne(theta: number, errorRates: GateErrorRates): ZneResult {
  const points: ZneNoisePoint[] = [0, 1, 2].map((k) => ({
    lambda: 2 * k + 1,
    energyHartree: noisyEnergyAtScale(theta, k, errorRates),
  }));

  const linearExtrapolationHartree = richardsonExtrapolateToZero(
    points.slice(0, 2).map((p) => ({ x: p.lambda, y: p.energyHartree })),
  );
  const quadraticExtrapolationHartree = richardsonExtrapolateToZero(
    points.map((p) => ({ x: p.lambda, y: p.energyHartree })),
  );

  return {
    theta,
    errorRates,
    noiselessEnergyHartree: energyAtTheta(theta),
    points,
    linearExtrapolationHartree,
    quadraticExtrapolationHartree,
  };
}
