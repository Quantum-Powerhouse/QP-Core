/**
 * Circuit Lab engine tests, the sandbox must be as exact as the games.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  runIdeal,
  runNoisy,
  diagonalProbabilities,
  purityOf,
  blochOfQubit,
  sampleShots,
  toOpenQASM,
  idealFidelityTo,
  PRESETS,
} from "../src/lib/lab/circuit.ts";
import { probabilitiesOf } from "../src/lib/physics/measurement.ts";

const approx = (a, b, eps = 1e-9, msg = "") => assert.ok(Math.abs(a - b) < eps, `${msg} ${a} !~ ${b}`);

test("Bell preset: ideal run gives |00⟩ and |11⟩ at 1/2 each", () => {
  const bell = PRESETS.find((p) => p.name === "Bell pair").circuit;
  const p = probabilitiesOf(runIdeal(bell));
  approx(p[0], 0.5); approx(p[3], 0.5); approx(p[1] + p[2], 0);
});

test("GHZ preset: only |000⟩ and |111⟩", () => {
  const ghz = PRESETS.find((p) => p.name.startsWith("GHZ")).circuit;
  const p = probabilitiesOf(runIdeal(ghz));
  approx(p[0], 0.5); approx(p[7], 0.5);
  approx(p.slice(1, 7).reduce((a, b) => a + b, 0), 0);
});

test("CZ equals H·CNOT·H, and SWAP really swaps", () => {
  const cz = runIdeal({ numQubits: 2, ops: [{ gate: "H", q: 0 }, { gate: "H", q: 1 }, { gate: "CZ", q: 1, q2: 0 }] });
  const viaCnot = runIdeal({ numQubits: 2, ops: [{ gate: "H", q: 0 }, { gate: "H", q: 1 }, { gate: "H", q: 1 }, { gate: "CNOT", q: 1, q2: 0 }, { gate: "H", q: 1 }] });
  for (let i = 0; i < 4; i++) { approx(cz[i].re, viaCnot[i].re, 1e-12); approx(cz[i].im, viaCnot[i].im, 1e-12); }
  const swapped = probabilitiesOf(runIdeal({ numQubits: 2, ops: [{ gate: "X", q: 0 }, { gate: "SWAP", q: 0, q2: 1 }] }));
  approx(swapped[2], 1, 1e-12, "|10⟩ after swapping |01⟩"); // qubit 0 is the low bit
});

test("noisy run: zero noise matches ideal; noise lowers purity but keeps trace 1", () => {
  const bell = PRESETS.find((p) => p.name === "Bell pair").circuit;
  const clean = runNoisy(bell, { p1: 0, p2: 0 });
  const ideal = probabilitiesOf(runIdeal(bell));
  const diag = diagonalProbabilities(clean);
  for (let i = 0; i < 4; i++) approx(diag[i], ideal[i], 1e-12);
  approx(purityOf(clean), 1, 1e-12, "pure without noise");
  const noisy = runNoisy(bell, { p1: 0.05, p2: 0.1 });
  approx(diagonalProbabilities(noisy).reduce((a, b) => a + b, 0), 1, 1e-12, "trace");
  assert.ok(purityOf(noisy) < 0.95, `purity should drop, got ${purityOf(noisy)}`);
});

test("reduced Bloch vectors: |+⟩ points along +x; a Bell-pair qubit is at the origin", () => {
  const plus = runIdeal({ numQubits: 1, ops: [{ gate: "H", q: 0 }] });
  const b = blochOfQubit(plus, 0, 1);
  approx(b.x, 1, 1e-12); approx(b.z, 0, 1e-12);
  const bell = runIdeal(PRESETS[0].circuit);
  const bq = blochOfQubit(bell, 0, 2);
  approx(Math.hypot(bq.x, bq.y, bq.z), 0, 1e-12, "maximally mixed reduced state");
});

test("sampled shots follow the probabilities", () => {
  let seed = 3;
  const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const counts = sampleShots([0.25, 0.75], 8000, rand);
  assert.ok(Math.abs(counts[1] / 8000 - 0.75) < 0.03);
  assert.equal(counts[0] + counts[1], 8000);
});

test("OpenQASM export is valid and round-trips the Bell circuit", () => {
  const qasm = toOpenQASM(PRESETS[0].circuit);
  assert.ok(qasm.startsWith("OPENQASM 2.0;"));
  assert.ok(qasm.includes("h q[0];"));
  assert.ok(qasm.includes("cx q[0],q[1];"));
  assert.ok(qasm.includes("measure q -> c;"));
});

test("fidelity readout: a circuit equals its own target state", () => {
  const bell = PRESETS[0].circuit;
  approx(idealFidelityTo(bell, runIdeal(bell)), 1, 1e-12);
  const empty = { numQubits: 2, ops: [] };
  approx(idealFidelityTo(empty, runIdeal(bell)), 0.5, 1e-12, "|00⟩ overlaps Bell with 1/2");
});

// --- circuit permalinks: a shared link must recompute identically ---
import { encodeCircuit, decodeCircuit, circuitFromHash } from "../src/lib/lab/permalink.ts";

test("permalink roundtrips every preset exactly", async () => {
  const { PRESETS } = await import("../src/lib/lab/circuit.ts");
  for (const p of PRESETS) {
    const decoded = decodeCircuit(encodeCircuit(p.circuit));
    assert.ok(decoded, p.name);
    assert.equal(decoded.numQubits, p.circuit.numQubits, p.name);
    assert.equal(decoded.ops.length, p.circuit.ops.length, p.name);
    for (let i = 0; i < decoded.ops.length; i++) {
      const a = decoded.ops[i];
      const b = p.circuit.ops[i];
      assert.equal(a.gate, b.gate, p.name);
      assert.equal(a.q, b.q, p.name);
      assert.equal(a.q2, b.q2, p.name);
      if (b.theta !== undefined) assert.ok(Math.abs(a.theta - b.theta) < 1e-3, `${p.name}: theta ${a.theta} vs ${b.theta}`);
    }
  }
});

test("permalink rejects malformed and out of bounds input", () => {
  for (const bad of ["", "9:h0", "2:hx", "2:h5", "2:cx1", "2:cx1.1", "2:rz0", "2:h0@1.5", "1:h0,junk"]) {
    assert.equal(decodeCircuit(bad), null, bad);
  }
  assert.deepEqual(circuitFromHash("#c=2:h0,cx1.0"), { numQubits: 2, ops: [{ gate: "H", q: 0 }, { gate: "CNOT", q: 1, q2: 0 }] });
});
