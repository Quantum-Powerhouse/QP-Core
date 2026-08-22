import { cMul, cConj, cAdd, c, type Complex } from "./linalg.ts";
import type { Statevector } from "./statevector.ts";

export type ReducedDensityMatrix = {
  /** rho[a][b], a,b in {0,1} for qubit 0. */
  rho: [[Complex, Complex], [Complex, Complex]];
};

/**
 * Partial trace over qubit 1 of a 2-qubit pure state, giving the reduced
 * density matrix for qubit 0: rho_0[a][b] = sum_q1 state[2*q1+a] * conj(state[2*q1+b]).
 * General formula for any 2-qubit statevector — not special-cased to the H2
 * ansatz — using the same bit convention as src/lib/physics/statevector.ts
 * (bit k of the basis index is qubit k).
 */
export function reducedDensityMatrixQubit0(state: Statevector): ReducedDensityMatrix {
  const amplitude = (q1: number, q0: number) => state[2 * q1 + q0];

  const entry = (a: number, b: number): Complex => {
    let sum = c(0);
    for (const q1 of [0, 1]) {
      sum = cAdd(sum, cMul(amplitude(q1, a), cConj(amplitude(q1, b))));
    }
    return sum;
  };

  return {
    rho: [
      [entry(0, 0), entry(0, 1)],
      [entry(1, 0), entry(1, 1)],
    ],
  };
}

/** Tr(rho^2) for a 2x2 density matrix — 1 for a pure (unentangled) reduced state, down to 0.5 for maximally mixed. */
export function purity({ rho }: ReducedDensityMatrix): number {
  // Tr(rho^2) = sum_{a,b} rho[a][b] * rho[b][a] = sum_{a,b} |rho[a][b]|^2 (rho is Hermitian, so rho[b][a] = conj(rho[a][b])).
  let total = 0;
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const entry = rho[a][b];
      total += entry.re * entry.re + entry.im * entry.im;
    }
  }
  return total;
}
