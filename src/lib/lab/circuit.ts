/**
 * Circuit Lab engine, a small, real circuit simulator built on the site's
 * physics stack. A circuit is a list of gate operations on n ≤ 5 qubits; the
 * engine runs it two ways:
 *
 *   - ideal:  exact statevector (src/lib/physics/statevector.ts)
 *   - noisy:  exact density matrix with a depolarizing channel after every
 *             gate (src/lib/physics/densityMatrix.ts), the same channel the
 *             VQE suite's ZNE panel uses
 *
 * Everything a visitor sees in the lab (amplitudes, phases, probabilities,
 * per-qubit Bloch vectors, purity, sampled shots, OpenQASM export) is derived
 * from these two computations. Nothing is drawn from a table.
 *
 * Tested by tests/lab.test.mjs.
 */

import { c, cMul, cConj, matMul, type Complex, type ComplexMatrix } from "../physics/linalg.ts";
import { applyCNOT, applySingleQubitGate, zeroState, type Statevector } from "../physics/statevector.ts";
import { probabilitiesOf } from "../physics/measurement.ts";
import {
  applyDepolarizing1Q,
  applyDepolarizing2Q,
  applyUnitary,
  cnotMatrix,
  embedSingleQubitOperator,
  zeroDensityMatrix,
} from "../physics/densityMatrix.ts";
import { GATE_H, GATE_S, GATE_T, GATE_X, GATE_Y, GATE_Z, rzGate, ryGate } from "../arcade/qlogic.ts";

export type GateName = "H" | "X" | "Y" | "Z" | "S" | "T" | "RX" | "RY" | "RZ" | "CNOT" | "CZ" | "SWAP";

export type GateOp = {
  gate: GateName;
  /** target qubit (or first qubit for two-qubit gates) */
  q: number;
  /** control qubit for CNOT/CZ, second qubit for SWAP */
  q2?: number;
  /** rotation angle in radians for RX/RY/RZ */
  theta?: number;
};

export type Circuit = { numQubits: number; ops: GateOp[] };

export const GATE_INFO: Record<GateName, { label: string; arity: 1 | 2; param: boolean; blurb: string }> = {
  H: { label: "H", arity: 1, param: false, blurb: "Hadamard, puts a basis state into equal superposition." },
  X: { label: "X", arity: 1, param: false, blurb: "Pauli-X, the quantum NOT; flips |0⟩↔|1⟩." },
  Y: { label: "Y", arity: 1, param: false, blurb: "Pauli-Y, a flip with a phase twist." },
  Z: { label: "Z", arity: 1, param: false, blurb: "Pauli-Z, a phase flip on |1⟩; invisible to probabilities, decisive for interference." },
  S: { label: "S", arity: 1, param: false, blurb: "Phase gate, a quarter-turn (√Z)." },
  T: { label: "T", arity: 1, param: false, blurb: "π/8 gate, the non-Clifford ingredient universality needs." },
  RX: { label: "RX", arity: 1, param: true, blurb: "Rotation about X by θ." },
  RY: { label: "RY", arity: 1, param: true, blurb: "Rotation about Y by θ, the VQE ansatz gate." },
  RZ: { label: "RZ", arity: 1, param: true, blurb: "Rotation about Z by θ, a pure phase." },
  CNOT: { label: "CNOT", arity: 2, param: false, blurb: "Controlled-NOT, the entangler." },
  CZ: { label: "CZ", arity: 2, param: false, blurb: "Controlled-Z, symmetric entangler; equals H·CNOT·H on the target." },
  SWAP: { label: "SWAP", arity: 2, param: false, blurb: "Exchange two qubits, three CNOTs in disguise." },
};

const S2 = Math.SQRT1_2;

function rxGate(theta: number): ComplexMatrix {
  const ct = Math.cos(theta / 2);
  const st = Math.sin(theta / 2);
  return [
    [c(ct), c(0, -st)],
    [c(0, -st), c(ct)],
  ];
}

function singleQubitMatrix(op: GateOp): ComplexMatrix {
  switch (op.gate) {
    case "H": return GATE_H;
    case "X": return GATE_X;
    case "Y": return GATE_Y;
    case "Z": return GATE_Z;
    case "S": return GATE_S;
    case "T": return GATE_T;
    case "RX": return rxGate(op.theta ?? 0);
    case "RY": return ryGate(op.theta ?? 0);
    case "RZ": return rzGate(op.theta ?? 0);
    default: throw new Error(`not a single-qubit gate: ${op.gate}`);
  }
}

// ---------------------------------------------------------------------------
// Ideal statevector run
// ---------------------------------------------------------------------------

export function runIdeal(circuit: Circuit): Statevector {
  let s = zeroState(circuit.numQubits);
  for (const op of circuit.ops) {
    if (op.gate === "CNOT") s = applyCNOT(s, op.q2 ?? 0, op.q);
    else if (op.gate === "CZ") {
      s = applySingleQubitGate(s, GATE_H, op.q);
      s = applyCNOT(s, op.q2 ?? 0, op.q);
      s = applySingleQubitGate(s, GATE_H, op.q);
    } else if (op.gate === "SWAP") {
      const a = op.q;
      const b = op.q2 ?? 0;
      s = applyCNOT(s, a, b);
      s = applyCNOT(s, b, a);
      s = applyCNOT(s, a, b);
    } else s = applySingleQubitGate(s, singleQubitMatrix(op), op.q);
  }
  return s;
}

// ---------------------------------------------------------------------------
// Noisy density-matrix run: depolarizing after every gate
// ---------------------------------------------------------------------------

export type NoiseModel = { p1: number; p2: number };

function cnotUnitary(control: number, target: number, n: number): ComplexMatrix {
  return cnotMatrix(control, target, n);
}

export function runNoisy(circuit: Circuit, noise: NoiseModel): ComplexMatrix {
  const n = circuit.numQubits;
  let rho = zeroDensityMatrix(n);
  for (const op of circuit.ops) {
    if (op.gate === "CNOT") {
      rho = applyUnitary(rho, cnotUnitary(op.q2 ?? 0, op.q, n));
      rho = applyDepolarizing2Q(rho, noise.p2);
    } else if (op.gate === "CZ") {
      const h = embedSingleQubitOperator(GATE_H, op.q, n);
      rho = applyUnitary(rho, matMul(h, matMul(cnotUnitary(op.q2 ?? 0, op.q, n), h)));
      rho = applyDepolarizing2Q(rho, noise.p2);
    } else if (op.gate === "SWAP") {
      const a = op.q;
      const b = op.q2 ?? 0;
      const u = matMul(cnotUnitary(a, b, n), matMul(cnotUnitary(b, a, n), cnotUnitary(a, b, n)));
      rho = applyUnitary(rho, u);
      rho = applyDepolarizing2Q(rho, noise.p2);
    } else {
      rho = applyUnitary(rho, embedSingleQubitOperator(singleQubitMatrix(op), op.q, n));
      rho = applyDepolarizing1Q(rho, op.q, noise.p1, n);
    }
  }
  return rho;
}

// ---------------------------------------------------------------------------
// Observables
// ---------------------------------------------------------------------------

export function diagonalProbabilities(rho: ComplexMatrix): number[] {
  return rho.map((row, i) => row[i].re);
}

export function purityOf(rho: ComplexMatrix): number {
  let s = 0;
  const n = rho.length;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += cMul(rho[i][j], rho[j][i]).re;
  return s;
}

/** Reduced single-qubit Bloch vector (x, y, z) of qubit k from a pure state. */
export function blochOfQubit(state: Statevector, k: number, n: number): { x: number; y: number; z: number } {
  // ρ_k = Tr_{others} |ψ⟩⟨ψ|
  const rho = [
    [c(0), c(0)],
    [c(0), c(0)],
  ];
  const bit = 1 << k;
  for (let i = 0; i < state.length; i++) {
    for (let j = 0; j < state.length; j++) {
      if ((i & ~bit) !== (j & ~bit)) continue; // other qubits must match
      const a = (i & bit) ? 1 : 0;
      const b = (j & bit) ? 1 : 0;
      const term = cMul(state[i], cConj(state[j]));
      rho[a][b] = c(rho[a][b].re + term.re, rho[a][b].im + term.im);
    }
  }
  void n;
  return { x: 2 * rho[0][1].re, y: -2 * rho[0][1].im, z: rho[0][0].re - rho[1][1].re };
}

export function amplitudeTable(state: Statevector, n: number): { label: string; re: number; im: number; prob: number; phase: number }[] {
  return state.map((amp, i) => ({
    label: `|${i.toString(2).padStart(n, "0")}⟩`,
    re: amp.re,
    im: amp.im,
    prob: amp.re * amp.re + amp.im * amp.im,
    phase: Math.atan2(amp.im, amp.re),
  }));
}

/** Sample `shots` measurement outcomes from a probability vector (inverse CDF). */
export function sampleShots(probs: number[], shots: number, rand: () => number = Math.random): number[] {
  const counts = new Array<number>(probs.length).fill(0);
  for (let s = 0; s < shots; s++) {
    let r = rand();
    let k = 0;
    for (; k < probs.length - 1; k++) {
      r -= probs[k];
      if (r <= 0) break;
    }
    counts[k]++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// OpenQASM 2.0 export, feeds the site's own transpiler.
// ---------------------------------------------------------------------------

export function toOpenQASM(circuit: Circuit): string {
  const lines = ["OPENQASM 2.0;", 'include "qelib1.inc";', `qreg q[${circuit.numQubits}];`, `creg c[${circuit.numQubits}];`];
  for (const op of circuit.ops) {
    const th = (op.theta ?? 0).toFixed(6);
    switch (op.gate) {
      case "H": case "X": case "Y": case "Z": case "S": case "T":
        lines.push(`${op.gate.toLowerCase()} q[${op.q}];`);
        break;
      case "RX": lines.push(`rx(${th}) q[${op.q}];`); break;
      case "RY": lines.push(`ry(${th}) q[${op.q}];`); break;
      case "RZ": lines.push(`rz(${th}) q[${op.q}];`); break;
      case "CNOT": lines.push(`cx q[${op.q2}],q[${op.q}];`); break;
      case "CZ": lines.push(`cz q[${op.q2}],q[${op.q}];`); break;
      case "SWAP": lines.push(`swap q[${op.q}],q[${op.q2}];`); break;
    }
  }
  lines.push(`measure q -> c;`);
  return lines.join("\n");
}

/** Unitary of the whole ideal circuit (for the fidelity readout against a target). */
export function idealFidelityTo(circuit: Circuit, target: Statevector): number {
  const s = runIdeal(circuit);
  let inner: Complex = c(0);
  for (let i = 0; i < s.length; i++) inner = c(inner.re + (cConj(target[i]).re * s[i].re - cConj(target[i]).im * s[i].im), inner.im + (cConj(target[i]).re * s[i].im + cConj(target[i]).im * s[i].re));
  return inner.re * inner.re + inner.im * inner.im;
}

/** Preset circuits with a stated purpose; all computed live when loaded. */
export const PRESETS: { name: string; why: string; circuit: Circuit }[] = [
  { name: "Bell pair", why: "H then CNOT: the simplest entangled state.", circuit: { numQubits: 2, ops: [{ gate: "H", q: 0 }, { gate: "CNOT", q: 1, q2: 0 }] } },
  { name: "GHZ (3 qubits)", why: "Entanglement across three qubits, all-or-nothing correlations.", circuit: { numQubits: 3, ops: [{ gate: "H", q: 0 }, { gate: "CNOT", q: 1, q2: 0 }, { gate: "CNOT", q: 2, q2: 1 }] } },
  { name: "Interference (H·RZ·H)", why: "Phase is invisible until a second H turns it into probability.", circuit: { numQubits: 1, ops: [{ gate: "H", q: 0 }, { gate: "RZ", q: 0, theta: Math.PI / 2 }, { gate: "H", q: 0 }] } },
  { name: "Phase kickback", why: "CNOT onto |−⟩ kicks a phase back onto the control.", circuit: { numQubits: 2, ops: [{ gate: "H", q: 0 }, { gate: "X", q: 1 }, { gate: "H", q: 1 }, { gate: "CNOT", q: 1, q2: 0 }, { gate: "H", q: 0 }] } },
  { name: "SWAP test of identity", why: "Three CNOTs = one SWAP; probabilities don't change, labels do.", circuit: { numQubits: 2, ops: [{ gate: "X", q: 0 }, { gate: "SWAP", q: 0, q2: 1 }] } },
];

export const SQRT1_2 = S2;
export const probabilitiesOfState = probabilitiesOf;
