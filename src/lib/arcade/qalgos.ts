/**
 * Three algorithm demonstrations computed from real amplitudes:
 * Bernstein and Vazirani's one query secret, the GHZ game, and the
 * Fourier spectrum that Shor's period finding reads its answer from.
 * No canned outcomes anywhere; every number falls out of the arrays.
 */

type Rand = () => number;

function popcount(x: number): number {
  let c = 0;
  while (x) {
    c += x & 1;
    x >>= 1;
  }
  return c;
}

/** In place Hadamard transform on a real amplitude array of length 2^n. */
function hadamardAll(amps: Float64Array, n: number): void {
  const N = 1 << n;
  const s = Math.SQRT1_2;
  for (let bit = 0; bit < n; bit++) {
    const step = 1 << bit;
    for (let i = 0; i < N; i++) {
      if ((i & step) === 0) {
        const a = amps[i];
        const b = amps[i + step];
        amps[i] = (a + b) * s;
        amps[i + step] = (a - b) * s;
      }
    }
  }
}

/**
 * Bernstein and Vazirani: H^n, phase oracle (-1)^(s·x), H^n.
 * Returns the output probability distribution; all weight lands on the secret.
 */
export function bernsteinVazirani(secret: number, n: number): number[] {
  const N = 1 << n;
  const amps = new Float64Array(N).fill(1 / Math.sqrt(N));
  for (let x = 0; x < N; x++) {
    if (popcount(x & secret) & 1) amps[x] = -amps[x];
  }
  hadamardAll(amps, n);
  return Array.from(amps, (a) => a * a);
}

export type GhzCase = { r: number; s: number; t: number };
/** The four referee cases with r ⊕ s ⊕ t = 0. */
export const GHZ_CASES: GhzCase[] = [
  { r: 0, s: 0, t: 0 },
  { r: 0, s: 1, t: 1 },
  { r: 1, s: 0, t: 1 },
  { r: 1, s: 1, t: 0 },
];

/** Winning condition: answers XOR to (r OR s OR t). */
export function ghzWins(c: GhzCase, a: number, b: number, d: number): boolean {
  return ((a ^ b ^ d) & 1) === (c.r | c.s | c.t);
}

/**
 * Best deterministic classical strategy, found by brute force over all 64
 * strategies (each player maps their bit to an answer bit). Returns the
 * maximum number of the four cases that any strategy wins.
 */
export function ghzClassicalBest(): number {
  let best = 0;
  for (let strat = 0; strat < 64; strat++) {
    const ans = (player: number, bit: number) => (strat >> (player * 2 + bit)) & 1;
    let wins = 0;
    for (const c of GHZ_CASES) {
      if (ghzWins(c, ans(0, c.r), ans(1, c.s), ans(2, c.t))) wins++;
    }
    if (wins > best) best = wins;
  }
  return best;
}

/**
 * One quantum round of the GHZ game: build (|000> + |111>)/sqrt 2 as complex
 * amplitudes, measure each player in X (input 0) or Y (input 1) by applying
 * the corresponding basis change, then take one inverse CDF sample.
 */
export function ghzQuantumRound(c: GhzCase, rand: Rand): { a: number; b: number; d: number; win: boolean } {
  const re = new Float64Array(8);
  const im = new Float64Array(8);
  re[0] = Math.SQRT1_2;
  re[7] = Math.SQRT1_2;
  const s = Math.SQRT1_2;
  // X basis: H. Y basis: H after S dagger, i.e. rows (1, -i) and (1, i) over sqrt 2.
  const applyBasis = (qubit: number, input: number) => {
    const step = 1 << qubit;
    for (let i = 0; i < 8; i++) {
      if ((i & step) === 0) {
        const j = i + step;
        const ar = re[i];
        const ai = im[i];
        const br = re[j];
        const bi = im[j];
        if (input === 0) {
          re[i] = (ar + br) * s;
          im[i] = (ai + bi) * s;
          re[j] = (ar - br) * s;
          im[j] = (ai - bi) * s;
        } else {
          // (a - i b) / sqrt 2  and  (a + i b) / sqrt 2
          re[i] = (ar + bi) * s;
          im[i] = (ai - br) * s;
          re[j] = (ar - bi) * s;
          im[j] = (ai + br) * s;
        }
      }
    }
  };
  applyBasis(0, c.r);
  applyBasis(1, c.s);
  applyBasis(2, c.t);
  let u = rand();
  let outcome = 7;
  for (let i = 0; i < 8; i++) {
    const p = re[i] * re[i] + im[i] * im[i];
    if (u < p) {
      outcome = i;
      break;
    }
    u -= p;
  }
  const a = outcome & 1;
  const b = (outcome >> 1) & 1;
  const d = (outcome >> 2) & 1;
  return { a, b, d, win: ghzWins(c, a, b, d) };
}

/** Exact win probability of the quantum strategy for one case (sum over winning outcomes). */
export function ghzQuantumWinProbability(c: GhzCase): number {
  let total = 0;
  const trials = 1; // computed exactly below, no sampling
  void trials;
  const re = new Float64Array(8);
  const im = new Float64Array(8);
  re[0] = Math.SQRT1_2;
  re[7] = Math.SQRT1_2;
  const s = Math.SQRT1_2;
  const applyBasis = (qubit: number, input: number) => {
    const step = 1 << qubit;
    for (let i = 0; i < 8; i++) {
      if ((i & step) === 0) {
        const j = i + step;
        const ar = re[i];
        const ai = im[i];
        const br = re[j];
        const bi = im[j];
        if (input === 0) {
          re[i] = (ar + br) * s;
          im[i] = (ai + bi) * s;
          re[j] = (ar - br) * s;
          im[j] = (ai - bi) * s;
        } else {
          re[i] = (ar + bi) * s;
          im[i] = (ai - br) * s;
          re[j] = (ar - bi) * s;
          im[j] = (ai + br) * s;
        }
      }
    }
  };
  applyBasis(0, c.r);
  applyBasis(1, c.s);
  applyBasis(2, c.t);
  for (let i = 0; i < 8; i++) {
    const a = i & 1;
    const b = (i >> 1) & 1;
    const d = (i >> 2) & 1;
    if (ghzWins(c, a, b, d)) total += re[i] * re[i] + im[i] * im[i];
  }
  return total;
}

/**
 * The spectrum Shor's algorithm reads: a uniform superposition over
 * x ≡ 0 (mod period) pushed through the exact discrete Fourier transform
 * on n qubits. Peaks land at multiples of 2^n / period.
 */
export function qftPeriodProbs(period: number, n: number): number[] {
  const N = 1 << n;
  const support: number[] = [];
  for (let x = 0; x < N; x += period) support.push(x);
  const a = 1 / Math.sqrt(support.length);
  const probs = new Array<number>(N);
  const norm = 1 / Math.sqrt(N);
  for (let k = 0; k < N; k++) {
    let sr = 0;
    let si = 0;
    for (const x of support) {
      const ang = (2 * Math.PI * x * k) / N;
      sr += a * Math.cos(ang);
      si += a * Math.sin(ang);
    }
    sr *= norm;
    si *= norm;
    probs[k] = sr * sr + si * si;
  }
  return probs;
}

/** Read the period back off the spectrum: N divided by the spacing of the two tallest peaks. */
export function periodFromSpectrum(probs: number[]): number {
  const N = probs.length;
  let first = -1;
  let second = -1;
  const threshold = Math.max(...probs) * 0.5;
  for (let k = 0; k < N; k++) {
    if (probs[k] >= threshold) {
      if (first < 0) first = k;
      else if (second < 0 && k > first) {
        second = k;
        break;
      }
    }
  }
  if (second < 0) return 1;
  return Math.round(N / (second - first));
}
