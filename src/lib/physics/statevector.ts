import { c, type Complex, type ComplexMatrix, expectationReal } from "@/lib/physics/linalg";

export type Statevector = Complex[];

/** |0...0> for the given qubit count. Bit convention: bit k of the basis index is qubit k. */
export function zeroState(numQubits: number): Statevector {
  const dim = 2 ** numQubits;
  return Array.from({ length: dim }, (_, i) => (i === 0 ? c(1) : c(0)));
}

function bit(index: number, qubit: number): 0 | 1 {
  return ((index >> qubit) & 1) as 0 | 1;
}

/** Applies an arbitrary single-qubit gate (2x2) to `qubit` of the statevector. */
export function applySingleQubitGate(
  state: Statevector,
  gate: ComplexMatrix,
  qubit: number,
): Statevector {
  const dim = state.length;
  const next = state.slice();
  const seen = new Set<number>();
  for (let i = 0; i < dim; i++) {
    if (seen.has(i)) continue;
    if (bit(i, qubit) === 1) continue;
    const i0 = i;
    const i1 = i | (1 << qubit);
    seen.add(i0);
    seen.add(i1);
    const a0 = state[i0];
    const a1 = state[i1];
    next[i0] = {
      re: gate[0][0].re * a0.re - gate[0][0].im * a0.im + gate[0][1].re * a1.re - gate[0][1].im * a1.im,
      im: gate[0][0].re * a0.im + gate[0][0].im * a0.re + gate[0][1].re * a1.im + gate[0][1].im * a1.re,
    };
    next[i1] = {
      re: gate[1][0].re * a0.re - gate[1][0].im * a0.im + gate[1][1].re * a1.re - gate[1][1].im * a1.im,
      im: gate[1][0].re * a0.im + gate[1][0].im * a0.re + gate[1][1].re * a1.im + gate[1][1].im * a1.re,
    };
  }
  return next;
}

/** Applies a controlled-X (CNOT) gate: flips `target` whenever `control` is |1>. */
export function applyCNOT(state: Statevector, control: number, target: number): Statevector {
  const dim = state.length;
  const next = state.slice();
  const seen = new Set<number>();
  for (let i = 0; i < dim; i++) {
    if (seen.has(i)) continue;
    if (bit(i, control) === 0) continue;
    const iFlipped = i ^ (1 << target);
    seen.add(i);
    seen.add(iFlipped);
    next[i] = state[iFlipped];
    next[iFlipped] = state[i];
  }
  return next;
}

export function applyX(state: Statevector, qubit: number): Statevector {
  const X: ComplexMatrix = [
    [c(0), c(1)],
    [c(1), c(0)],
  ];
  return applySingleQubitGate(state, X, qubit);
}

export function applyRY(state: Statevector, theta: number, qubit: number): Statevector {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  const RY: ComplexMatrix = [
    [c(cos), c(-sin)],
    [c(sin), c(cos)],
  ];
  return applySingleQubitGate(state, RY, qubit);
}

export { expectationReal as expectationValue };
