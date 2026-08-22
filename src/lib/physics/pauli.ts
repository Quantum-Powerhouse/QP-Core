import { c, type ComplexMatrix, kron, matAdd, matScale } from "./linalg.ts";

export const PAULI_I: ComplexMatrix = [
  [c(1), c(0)],
  [c(0), c(1)],
];
export const PAULI_X: ComplexMatrix = [
  [c(0), c(1)],
  [c(1), c(0)],
];
export const PAULI_Y: ComplexMatrix = [
  [c(0), c(0, -1)],
  [c(0, 1), c(0)],
];
export const PAULI_Z: ComplexMatrix = [
  [c(1), c(0)],
  [c(0), c(-1)],
];

export type PauliLabel = "I" | "X" | "Y" | "Z";

const PAULI_BY_LABEL: Record<PauliLabel, ComplexMatrix> = {
  I: PAULI_I,
  X: PAULI_X,
  Y: PAULI_Y,
  Z: PAULI_Z,
};

export type PauliTerm = {
  /** Coefficient in Hartree. */
  coefficient: number;
  /** Pauli label per qubit, ordered from the most-significant (highest-index) qubit to qubit 0. */
  paulis: PauliLabel[];
};

export type PauliSum = PauliTerm[];

/** Builds the dense matrix for a single Pauli string, e.g. ["Z", "I"] = Z1 (x) I0. */
export function pauliStringMatrix(paulis: PauliLabel[]): ComplexMatrix {
  return paulis.map((label) => PAULI_BY_LABEL[label]).reduce((acc, m) => kron(acc, m));
}

/** Builds the dense Hermitian matrix for a full weighted sum of Pauli strings. */
export function pauliSumMatrix(sum: PauliSum): ComplexMatrix {
  const dim = 2 ** sum[0].paulis.length;
  let total: ComplexMatrix = Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => c(0)),
  );
  for (const term of sum) {
    total = matAdd(total, matScale(pauliStringMatrix(term.paulis), term.coefficient));
  }
  return total;
}
