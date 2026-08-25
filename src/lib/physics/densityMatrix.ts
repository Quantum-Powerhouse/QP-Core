import {
  c,
  type ComplexMatrix,
  dagger,
  kron,
  matAdd,
  matMul,
  matScale,
} from "./linalg.ts";
import { PAULI_I, PAULI_X, PAULI_Y, PAULI_Z, pauliStringMatrix, type PauliLabel } from "./pauli.ts";

export function zeroDensityMatrix(numQubits: number): ComplexMatrix {
  const dim = 2 ** numQubits;
  const rho: ComplexMatrix = Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => c(0)),
  );
  rho[0][0] = c(1);
  return rho;
}

/** Embeds a single-qubit 2x2 operator into the full numQubits-qubit space (I elsewhere). */
export function embedSingleQubitOperator(
  op: ComplexMatrix,
  qubit: number,
  numQubits: number,
): ComplexMatrix {
  let result: ComplexMatrix = qubit === numQubits - 1 ? op : PAULI_I;
  for (let q = numQubits - 2; q >= 0; q--) {
    const factor = q === qubit ? op : PAULI_I;
    result = kron(result, factor);
  }
  return result;
}

/** Dense matrix for a CNOT gate, consistent with statevector.ts's bit convention (bit k = qubit k). */
export function cnotMatrix(control: number, target: number, numQubits: number): ComplexMatrix {
  const dim = 2 ** numQubits;
  const m: ComplexMatrix = Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => c(0)),
  );
  for (let j = 0; j < dim; j++) {
    const controlBit = (j >> control) & 1;
    const i = controlBit === 1 ? j ^ (1 << target) : j;
    m[i][j] = c(1);
  }
  return m;
}

export function ryMatrix(theta: number): ComplexMatrix {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [
    [c(cos), c(-sin)],
    [c(sin), c(cos)],
  ];
}

/** rho -> U rho U dagger */
export function applyUnitary(rho: ComplexMatrix, u: ComplexMatrix): ComplexMatrix {
  return matMul(matMul(u, rho), dagger(u));
}

/** Standard single-qubit depolarizing channel: rho -> (1-p)rho + (p/3)(XrhoX + YrhoY + ZrhoZ). */
export function applyDepolarizing1Q(
  rho: ComplexMatrix,
  qubit: number,
  p: number,
  numQubits: number,
): ComplexMatrix {
  if (p <= 0) return rho;
  const paulis = [PAULI_X, PAULI_Y, PAULI_Z].map((op) => embedSingleQubitOperator(op, qubit, numQubits));
  let out = matScale(rho, 1 - p);
  for (const P of paulis) {
    out = matAdd(out, matScale(applyUnitary(rho, P), p / 3));
  }
  return out;
}

const ONE_QUBIT_LABELS: PauliLabel[] = ["I", "X", "Y", "Z"];

/**
 * Two-qubit depolarizing channel applied to the full (2-qubit) system:
 * rho -> (1-p)rho + (p/15) * sum over the 15 non-identity two-qubit Pauli
 * strings P of P rho P-dagger.
 */
export function applyDepolarizing2Q(rho: ComplexMatrix, p: number): ComplexMatrix {
  if (p <= 0) return rho;
  let out = matScale(rho, 1 - p);
  for (const a of ONE_QUBIT_LABELS) {
    for (const b of ONE_QUBIT_LABELS) {
      if (a === "I" && b === "I") continue;
      const P = pauliStringMatrix([a, b]);
      out = matAdd(out, matScale(applyUnitary(rho, P), p / 15));
    }
  }
  return out;
}

/** Tr(H rho), real part only (imaginary part is ~0 for a valid Hermitian H and density matrix). */
export function expectationValue(rho: ComplexMatrix, h: ComplexMatrix): number {
  const hRho = matMul(h, rho);
  let trace = 0;
  for (let i = 0; i < hRho.length; i++) trace += hRho[i][i].re;
  return trace;
}
