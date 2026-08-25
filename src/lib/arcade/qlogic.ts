/**
 * Quantum Arcade engine, pure logic, no React, built entirely on the site's
 * from-scratch physics stack (src/lib/physics/*). Every number a game shows
 * comes from a real statevector/density-matrix computation or a clearly
 * labeled analytic textbook formula. No made-up results.
 *
 * Tested by tests/arcade.test.mjs.
 */

import { c, cAdd, cMul, cScale, cConj, type Complex, type ComplexMatrix } from "../physics/linalg.ts";
import {
  applyCNOT,
  applySingleQubitGate,
  applyRY,
  zeroState,
  type Statevector,
} from "../physics/statevector.ts";
import { probabilitiesOf, sampleMeasurement } from "../physics/measurement.ts";
import { reducedDensityMatrixQubit0, purity } from "../physics/entanglement.ts";

export type Rand = () => number;

// ---------------------------------------------------------------------------
// Gates
// ---------------------------------------------------------------------------

const S2 = 1 / Math.SQRT2;

export const GATE_H: ComplexMatrix = [
  [c(S2), c(S2)],
  [c(S2), c(-S2)],
];
export const GATE_X: ComplexMatrix = [
  [c(0), c(1)],
  [c(1), c(0)],
];
export const GATE_Y: ComplexMatrix = [
  [c(0), c(0, -1)],
  [c(0, 1), c(0)],
];
export const GATE_Z: ComplexMatrix = [
  [c(1), c(0)],
  [c(0), c(-1)],
];
export const GATE_S: ComplexMatrix = [
  [c(1), c(0)],
  [c(0), c(0, 1)],
];
export const GATE_T: ComplexMatrix = [
  [c(1), c(0)],
  [c(0), c(S2, S2)],
];

export function rzGate(phi: number): ComplexMatrix {
  return [
    [c(Math.cos(phi / 2), -Math.sin(phi / 2)), c(0)],
    [c(0), c(Math.cos(phi / 2), Math.sin(phi / 2))],
  ];
}

export function ryGate(theta: number): ComplexMatrix {
  const ct = Math.cos(theta / 2);
  const st = Math.sin(theta / 2);
  return [
    [c(ct), c(-st)],
    [c(st), c(ct)],
  ];
}

export const NAMED_GATES: Record<string, ComplexMatrix> = {
  H: GATE_H,
  X: GATE_X,
  Y: GATE_Y,
  Z: GATE_Z,
  S: GATE_S,
  T: GATE_T,
};

// ---------------------------------------------------------------------------
// Single-qubit helpers
// ---------------------------------------------------------------------------

/** Bloch vector (x, y, z) of a single-qubit pure state. */
export function blochOf(state: Statevector): { x: number; y: number; z: number } {
  const [a, b] = state;
  const abConj = cMul(cConj(a), b);
  return {
    x: 2 * abConj.re,
    y: 2 * abConj.im,
    z: a.re * a.re + a.im * a.im - (b.re * b.re + b.im * b.im),
  };
}

/** |⟨a|b⟩|² fidelity between two pure single-qubit states. */
export function fidelity(sa: Statevector, sb: Statevector): number {
  let inner: Complex = c(0);
  for (let i = 0; i < sa.length; i++) inner = cAdd(inner, cMul(cConj(sa[i]), sb[i]));
  return inner.re * inner.re + inner.im * inner.im;
}

/** State from Bloch angles: cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩. */
export function stateFromAngles(theta: number, phi: number): Statevector {
  return [c(Math.cos(theta / 2)), cScale(c(Math.cos(phi), Math.sin(phi)), Math.sin(theta / 2))];
}

// ---------------------------------------------------------------------------
// Grover search (n qubits, one marked item)
// ---------------------------------------------------------------------------

export function groverInit(numQubits: number): Statevector {
  let s = zeroState(numQubits);
  for (let q = 0; q < numQubits; q++) s = applySingleQubitGate(s, GATE_H, q);
  return s;
}

/** One Grover iteration: phase-flip the marked index, then invert about the mean. */
export function groverStep(state: Statevector, marked: number): Statevector {
  const flipped = state.map((amp, i) => (i === marked ? cScale(amp, -1) : amp));
  let meanRe = 0;
  let meanIm = 0;
  for (const amp of flipped) {
    meanRe += amp.re;
    meanIm += amp.im;
  }
  meanRe /= flipped.length;
  meanIm /= flipped.length;
  return flipped.map((amp) => c(2 * meanRe - amp.re, 2 * meanIm - amp.im));
}

export function groverOptimalIterations(numQubits: number): number {
  return Math.round((Math.PI / 4) * Math.sqrt(2 ** numQubits));
}

// ---------------------------------------------------------------------------
// Interference (Mach-Zehnder-style, computed with real gates: H · RZ(φ) · H)
// ---------------------------------------------------------------------------

export function interferenceProbabilities(phi: number): number[] {
  let s = zeroState(1);
  s = applySingleQubitGate(s, GATE_H, 0);
  s = applySingleQubitGate(s, rzGate(phi), 0);
  s = applySingleQubitGate(s, GATE_H, 0);
  return probabilitiesOf(s);
}

// ---------------------------------------------------------------------------
// Bell pairs & CHSH
// ---------------------------------------------------------------------------

export function bellState(): Statevector {
  let s = zeroState(2);
  s = applySingleQubitGate(s, GATE_H, 0);
  s = applyCNOT(s, 0, 1);
  return s;
}

/**
 * Sample one CHSH round on a real Bell pair: rotate each side's measurement
 * basis by RY(-2·angle) and sample the joint outcome. Returns ±1 per side.
 */
export function chshSample(angleA: number, angleB: number, rand: Rand): { a: 1 | -1; b: 1 | -1 } {
  let s = bellState();
  s = applyRY(s, -2 * angleA, 0);
  s = applyRY(s, -2 * angleB, 1);
  const probs = probabilitiesOf(s);
  let r = rand();
  let outcome = 0;
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) {
      outcome = i;
      break;
    }
  }
  return { a: outcome & 1 ? -1 : 1, b: outcome & 2 ? -1 : 1 };
}

/** The four CHSH measurement settings that maximize |S| for the Bell state. */
export const CHSH_ANGLES = { a0: 0, a1: Math.PI / 4, b0: Math.PI / 8, b1: -Math.PI / 8 };

// ---------------------------------------------------------------------------
// Entanglement dial: RY(θ) on qubit 0 then CNOT, product ↔ Bell.
// ---------------------------------------------------------------------------

export function entangleDial(theta: number): { probs: number[]; purityOfA: number } {
  let s = zeroState(2);
  s = applyRY(s, theta, 0);
  s = applyCNOT(s, 0, 1);
  return { probs: probabilitiesOf(s), purityOfA: purity(reducedDensityMatrixQubit0(s)) };
}

// ---------------------------------------------------------------------------
// Deutsch's problem (1 query decides constant vs balanced, for real)
// ---------------------------------------------------------------------------

export type DeutschOracle = "const0" | "const1" | "identity" | "negation";

/** Runs the actual Deutsch circuit; measurement of qubit 0 gives the answer. */
export function deutschRun(oracle: DeutschOracle): { pConstant: number } {
  // |0⟩|1⟩ → H⊗H → U_f → H on q0. q0=|0⟩ ⇔ constant.
  let s = zeroState(2);
  s = applySingleQubitGate(s, GATE_X, 1);
  s = applySingleQubitGate(s, GATE_H, 0);
  s = applySingleQubitGate(s, GATE_H, 1);
  if (oracle === "const1") s = applySingleQubitGate(s, GATE_X, 1);
  if (oracle === "identity") s = applyCNOT(s, 0, 1);
  if (oracle === "negation") {
    s = applyCNOT(s, 0, 1);
    s = applySingleQubitGate(s, GATE_X, 1);
  }
  s = applySingleQubitGate(s, GATE_H, 0);
  const probs = probabilitiesOf(s);
  // P(q0 = 0) = P(|00⟩) + P(|01⟩)  (qubit 0 is the low bit in this encoding)
  return { pConstant: probs[0] + probs[2] };
}

// ---------------------------------------------------------------------------
// Tunneling (labeled analytic model, not a simulation)
// ---------------------------------------------------------------------------

/** Idealized rectangular-barrier transmission ~ e^(-2κL), κ = √(V−E) in scaled units. */
export function tunnelingTransmission(energy: number, barrier: number, width: number): number {
  if (energy >= barrier) return 1;
  const kappa = Math.sqrt(barrier - energy);
  return Math.exp(-2 * kappa * width);
}

// ---------------------------------------------------------------------------
// BB84 key exchange
// ---------------------------------------------------------------------------

export type BB84Round = {
  aliceBit: 0 | 1;
  aliceBasis: 0 | 1;
  bobBasis: 0 | 1;
  bobBit: 0 | 1;
  sifted: boolean;
  intercepted: boolean;
};

export function bb84Round(eveActive: boolean, rand: Rand): BB84Round {
  const aliceBit = rand() < 0.5 ? 0 : 1;
  const aliceBasis = rand() < 0.5 ? 0 : 1;
  const bobBasis = rand() < 0.5 ? 0 : 1;
  let bitInFlight: 0 | 1 = aliceBit;
  let intercepted = false;
  if (eveActive) {
    const eveBasis = rand() < 0.5 ? 0 : 1;
    intercepted = true;
    if (eveBasis !== aliceBasis) bitInFlight = rand() < 0.5 ? 0 : 1; // Eve's wrong-basis measurement scrambles it
  }
  const bobBit: 0 | 1 = bobBasis === aliceBasis ? bitInFlight : rand() < 0.5 ? 0 : 1;
  return { aliceBit, aliceBasis, bobBasis, bobBit, sifted: aliceBasis === bobBasis, intercepted };
}

/** QBER over sifted rounds: errors / sifted. ~25% signals an eavesdropper. */
export function bb84Qber(rounds: BB84Round[]): { sifted: number; errors: number; qber: number } {
  let sifted = 0;
  let errors = 0;
  for (const r of rounds) {
    if (!r.sifted) continue;
    sifted++;
    if (r.aliceBit !== r.bobBit) errors++;
  }
  return { sifted, errors, qber: sifted === 0 ? 0 : errors / sifted };
}

// ---------------------------------------------------------------------------
// Repetition code (3-qubit bit-flip)
// ---------------------------------------------------------------------------

export function repetitionRound(flipProbability: number, rand: Rand): {
  flips: boolean[];
  corrected: boolean;
} {
  const flips = [rand() < flipProbability, rand() < flipProbability, rand() < flipProbability];
  const flipped = flips.filter(Boolean).length;
  return { flips, corrected: flipped <= 1 }; // majority vote survives ≤1 flip
}

// ---------------------------------------------------------------------------
// Sampling helpers
// ---------------------------------------------------------------------------

/** n real Born-rule samples of |+⟩, a genuine quantum-model RNG. */
export function sampleRandomBits(n: number): number[] {
  const bits: number[] = [];
  for (let i = 0; i < n; i++) {
    let s = zeroState(1);
    s = applySingleQubitGate(s, GATE_H, 0);
    bits.push(sampleMeasurement(s).outcomeIndex);
  }
  return bits;
}

/** Shannon entropy (bits) of an empirical 0/1 distribution. */
export function bitEntropy(bits: number[]): number {
  if (bits.length === 0) return 0;
  const p1 = bits.reduce((a, b) => a + b, 0) / bits.length;
  const p0 = 1 - p1;
  const term = (p: number) => (p === 0 ? 0 : -p * Math.log2(p));
  return term(p0) + term(p1);
}

// ---------------------------------------------------------------------------
// Teleportation (the real 2-qubit-message + entangled-pair pipeline, 3 qubits)
// ---------------------------------------------------------------------------

export type TeleportStage = { label: string; state: Statevector };

export function teleportationStages(theta: number, phi: number): TeleportStage[] {
  // q0 = message, q1 = Alice's half, q2 = Bob's half.
  const msg = stateFromAngles(theta, phi);
  let s: Statevector = Array.from({ length: 8 }, (_, i) => {
    // |ψ⟩ ⊗ |00⟩ with qubit 0 as the lowest bit
    if ((i & 6) !== 0) return c(0);
    return msg[i & 1];
  });
  const stages: TeleportStage[] = [{ label: "Message ⊗ |00⟩", state: [...s] }];
  s = applySingleQubitGate(s, GATE_H, 1);
  s = applyCNOT(s, 1, 2);
  stages.push({ label: "Entangle q1, q2 (Bell pair)", state: [...s] });
  s = applyCNOT(s, 0, 1);
  s = applySingleQubitGate(s, GATE_H, 0);
  stages.push({ label: "Bell basis rotate message", state: [...s] });
  return stages;
}

// ---------------------------------------------------------------------------
// QAOA on MaxCut (4-node ring), depth p = 1, built from the gate set.
// ---------------------------------------------------------------------------

export const MAXCUT_EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0]];

/** ZZ(γ) = exp(-i γ Z⊗Z / 2) on (i, j): CNOT · RZ(γ) on j · CNOT. */
function applyZZ(state: Statevector, i: number, j: number, gamma: number): Statevector {
  let s = applyCNOT(state, i, j);
  s = applySingleQubitGate(s, rzGate(gamma), j);
  return applyCNOT(s, i, j);
}

export function qaoaMaxCut(gamma: number, beta: number): { probs: number[]; expectedCut: number; bestCut: number; bestProb: number } {
  const n = 4;
  let s = zeroState(n);
  for (let q = 0; q < n; q++) s = applySingleQubitGate(s, GATE_H, q);
  for (const [i, j] of MAXCUT_EDGES) s = applyZZ(s, i, j, 2 * gamma);
  // mixer RX(2β) = H · RZ(2β) · H
  for (let q = 0; q < n; q++) {
    s = applySingleQubitGate(s, GATE_H, q);
    s = applySingleQubitGate(s, rzGate(2 * beta), q);
    s = applySingleQubitGate(s, GATE_H, q);
  }
  const probs = probabilitiesOf(s);
  let expectedCut = 0;
  let bestCut = 0;
  let bestProb = 0;
  for (let b = 0; b < probs.length; b++) {
    let cut = 0;
    for (const [i, j] of MAXCUT_EDGES) if (((b >> i) & 1) !== ((b >> j) & 1)) cut++;
    expectedCut += probs[b] * cut;
    if (cut > bestCut) bestCut = cut;
  }
  for (let b = 0; b < probs.length; b++) {
    let cut = 0;
    for (const [i, j] of MAXCUT_EDGES) if (((b >> i) & 1) !== ((b >> j) & 1)) cut++;
    if (cut === bestCut) bestProb += probs[b];
  }
  return { probs, expectedCut, bestCut, bestProb };
}

// ---------------------------------------------------------------------------
// Quantum walk vs classical random walk on a line, direct amplitude
// evolution of the Hadamard coined walk (a genuine quantum dynamics
// computation, not a drawing).
// ---------------------------------------------------------------------------

export function quantumWalk(steps: number): number[] {
  const size = 2 * steps + 1;
  const center = steps;
  // amplitudes per position for coin states |L⟩ (0) and |R⟩ (1)
  let re = [new Float64Array(size), new Float64Array(size)];
  let im = [new Float64Array(size), new Float64Array(size)];
  // symmetric start: (|L⟩ + i|R⟩)/√2 at the center
  re[0][center] = Math.SQRT1_2;
  im[1][center] = Math.SQRT1_2;
  for (let t = 0; t < steps; t++) {
    const nre = [new Float64Array(size), new Float64Array(size)];
    const nim = [new Float64Array(size), new Float64Array(size)];
    for (let x = 0; x < size; x++) {
      // Hadamard coin
      const lRe = Math.SQRT1_2 * (re[0][x] + re[1][x]);
      const lIm = Math.SQRT1_2 * (im[0][x] + im[1][x]);
      const rRe = Math.SQRT1_2 * (re[0][x] - re[1][x]);
      const rIm = Math.SQRT1_2 * (im[0][x] - im[1][x]);
      // shift: L moves left, R moves right
      if (x > 0) { nre[0][x - 1] += lRe; nim[0][x - 1] += lIm; }
      if (x < size - 1) { nre[1][x + 1] += rRe; nim[1][x + 1] += rIm; }
    }
    re = nre;
    im = nim;
  }
  const probs: number[] = [];
  for (let x = 0; x < size; x++) probs.push(re[0][x] ** 2 + im[0][x] ** 2 + re[1][x] ** 2 + im[1][x] ** 2);
  return probs;
}

export function classicalWalk(steps: number): number[] {
  const size = 2 * steps + 1;
  let p = new Float64Array(size);
  p[steps] = 1;
  for (let t = 0; t < steps; t++) {
    const q = new Float64Array(size);
    for (let x = 0; x < size; x++) {
      if (p[x] === 0) continue;
      if (x > 0) q[x - 1] += p[x] / 2;
      if (x < size - 1) q[x + 1] += p[x] / 2;
    }
    p = q;
  }
  return Array.from(p);
}

/** Standard deviation of position for a distribution indexed from -steps..steps. */
export function walkSpread(probs: number[]): number {
  const steps = (probs.length - 1) / 2;
  let mean = 0;
  for (let x = 0; x < probs.length; x++) mean += probs[x] * (x - steps);
  let v = 0;
  for (let x = 0; x < probs.length; x++) v += probs[x] * (x - steps - mean) ** 2;
  return Math.sqrt(v);
}
