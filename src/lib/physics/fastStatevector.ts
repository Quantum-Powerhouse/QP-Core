/**
 * Fast statevector kernel: split Float64Array (re, im) with in-place gates.
 *
 * The readable engine (statevector.ts) allocates an object per amplitude,  * fine for teaching and for the 2-4 qubit games, but it hits a wall around
 * 14 qubits. This kernel keeps the same semantics (qubit 0 = least
 * significant bit) on flat typed arrays and mutates in place, so 20+ qubits
 * fit in memory and run in well under a second. Used by the scaling
 * benchmark and cross-checked against the readable engine in
 * tests/physics.test.mjs.
 */

export type FastState = { n: number; re: Float64Array; im: Float64Array };

export function fastZero(n: number): FastState {
  const dim = 1 << n;
  const re = new Float64Array(dim);
  re[0] = 1;
  return { n, re, im: new Float64Array(dim) };
}

/** Apply a 2×2 unitary [[a,b],[c,d]] (as re/im parts) to `qubit`, in place. */
export function fastApply1Q(
  s: FastState,
  qubit: number,
  aRe: number, aIm: number, bRe: number, bIm: number,
  cRe: number, cIm: number, dRe: number, dIm: number,
): void {
  const { re, im } = s;
  const stride = 1 << qubit;
  const dim = re.length;
  for (let base = 0; base < dim; base += stride << 1) {
    for (let i = base; i < base + stride; i++) {
      const j = i + stride;
      const xr = re[i], xi = im[i], yr = re[j], yi = im[j];
      re[i] = aRe * xr - aIm * xi + bRe * yr - bIm * yi;
      im[i] = aRe * xi + aIm * xr + bRe * yi + bIm * yr;
      re[j] = cRe * xr - cIm * xi + dRe * yr - dIm * yi;
      im[j] = cRe * xi + cIm * xr + dRe * yi + dIm * yr;
    }
  }
}

const S2 = Math.SQRT1_2;
export function fastH(s: FastState, qubit: number): void {
  fastApply1Q(s, qubit, S2, 0, S2, 0, S2, 0, -S2, 0);
}

export function fastX(s: FastState, qubit: number): void {
  fastApply1Q(s, qubit, 0, 0, 1, 0, 1, 0, 0, 0);
}

export function fastRY(s: FastState, theta: number, qubit: number): void {
  const ct = Math.cos(theta / 2), st = Math.sin(theta / 2);
  fastApply1Q(s, qubit, ct, 0, -st, 0, st, 0, ct, 0);
}

export function fastCNOT(s: FastState, control: number, target: number): void {
  const { re, im } = s;
  const cBit = 1 << control;
  const tBit = 1 << target;
  const dim = re.length;
  for (let i = 0; i < dim; i++) {
    if ((i & cBit) && !(i & tBit)) {
      const j = i | tBit;
      const r = re[i], m = im[i];
      re[i] = re[j]; im[i] = im[j];
      re[j] = r; im[j] = m;
    }
  }
}

export function fastProbabilities(s: FastState): Float64Array {
  const { re, im } = s;
  const out = new Float64Array(re.length);
  for (let i = 0; i < re.length; i++) out[i] = re[i] * re[i] + im[i] * im[i];
  return out;
}

export function fastNorm(s: FastState): number {
  let acc = 0;
  for (let i = 0; i < s.re.length; i++) acc += s.re[i] * s.re[i] + s.im[i] * s.im[i];
  return acc;
}
