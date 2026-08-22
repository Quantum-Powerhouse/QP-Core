/**
 * The physics engine's own test suite — the numbers the whole site rests on.
 * Runs the real TypeScript modules under node --test (native type stripping).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { c, cMul, cConj } from "../src/lib/physics/linalg.ts";
import { zeroState, applySingleQubitGate, applyCNOT, applyRY } from "../src/lib/physics/statevector.ts";
import { probabilitiesOf, sampleMeasurement } from "../src/lib/physics/measurement.ts";
import { reducedDensityMatrixQubit0, purity } from "../src/lib/physics/entanglement.ts";
import { zeroDensityMatrix, applyUnitary, applyDepolarizing1Q, embedSingleQubitOperator } from "../src/lib/physics/densityMatrix.ts";
import { PAULI_X, PAULI_Y, PAULI_Z, pauliStringMatrix } from "../src/lib/physics/pauli.ts";
import { H2_COEFFICIENTS } from "../src/lib/physics/h2Hamiltonian.ts";
import { exactGroundStateEnergy, energyAtTheta, runVqe } from "../src/lib/physics/vqe.ts";
import { runZne } from "../src/lib/physics/zne.ts";

const approx = (a, b, eps = 1e-9, msg = "") => assert.ok(Math.abs(a - b) < eps, `${msg} ${a} !~ ${b}`);
const S2 = 1 / Math.SQRT2;
const H = [[c(S2), c(S2)], [c(S2), c(-S2)]];

function norm(state) {
  return state.reduce((acc, a) => acc + a.re * a.re + a.im * a.im, 0);
}

test("statevector: gates preserve norm, probabilities sum to 1", () => {
  let s = zeroState(3);
  s = applySingleQubitGate(s, H, 0);
  s = applyRY(s, 1.234, 1);
  s = applyCNOT(s, 0, 2);
  s = applySingleQubitGate(s, H, 2);
  approx(norm(s), 1, 1e-12, "norm");
  approx(probabilitiesOf(s).reduce((a, b) => a + b, 0), 1, 1e-12, "probs");
});

test("H twice is identity; X flips; CNOT entangles from |+0⟩ into a Bell pair", () => {
  let s = applySingleQubitGate(applySingleQubitGate(zeroState(1), H, 0), H, 0);
  approx(probabilitiesOf(s)[0], 1, 1e-12, "HH=I");
  let b = applySingleQubitGate(zeroState(2), H, 0);
  b = applyCNOT(b, 0, 1);
  const p = probabilitiesOf(b);
  approx(p[0], 0.5, 1e-12, "|00>");
  approx(p[3], 0.5, 1e-12, "|11>");
  approx(purity(reducedDensityMatrixQubit0(b)), 0.5, 1e-12, "Bell pair reduced purity");
});

test("Pauli algebra: X² = I, XY = iZ", () => {
  const X = pauliStringMatrix(["X"]);
  const xx = [[c(0), c(0)], [c(0), c(0)]];
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++)
      for (let k = 0; k < 2; k++) {
        const m = cMul(X[i][k], X[k][j]);
        xx[i][j] = c(xx[i][j].re + m.re, xx[i][j].im + m.im);
      }
  approx(xx[0][0].re, 1); approx(xx[1][1].re, 1); approx(xx[0][1].re, 0);
  // XY = iZ → (XY)[0][0] = i
  let xy00 = c(0);
  for (let k = 0; k < 2; k++) { const m = cMul(PAULI_X[0][k], PAULI_Y[k][0]); xy00 = c(xy00.re + m.re, xy00.im + m.im); }
  approx(xy00.im, PAULI_Z[0][0].re, 1e-12, "XY=iZ");
});

test("measurement sampler follows the Born rule statistically", () => {
  const s = applyRY(zeroState(1), 2 * Math.asin(Math.sqrt(0.3)), 0); // P(1)=0.3
  let ones = 0;
  const N = 6000;
  for (let i = 0; i < N; i++) ones += sampleMeasurement(s).outcomeIndex;
  const freq = ones / N;
  assert.ok(Math.abs(freq - 0.3) < 0.03, `sampled P(1)=${freq}, expected 0.3`);
});

test("density matrix: unitary evolution keeps trace 1 and purity 1; depolarizing lowers purity", () => {
  let rho = zeroDensityMatrix(1);
  rho = applyUnitary(rho, embedSingleQubitOperator(H, 0, 1));
  const tr = rho[0][0].re + rho[1][1].re;
  approx(tr, 1, 1e-12, "trace");
  const pur = (m) => {
    let s = 0;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const p = cMul(m[i][j], m[j][i]); s += p.re; }
    return s;
  };
  approx(pur(rho), 1, 1e-12, "pure");
  const noisy = applyDepolarizing1Q(rho, 0, 0.4, 1);
  approx(noisy[0][0].re + noisy[1][1].re, 1, 1e-12, "trace preserved");
  assert.ok(pur(noisy) < 0.9, `purity should drop, got ${pur(noisy)}`);
});

test("H2: exact ground state matches O'Malley et al. to 4 decimals; VQE reaches it", () => {
  const exact = exactGroundStateEnergy();
  approx(exact, -1.1456, 5e-4, "FCI energy (Ha)");
  assert.equal(Object.keys(H2_COEFFICIENTS).length, 6);
  const result = runVqe({ initialTheta: 0.5, iterations: 120, learningRate: 0.4 });
  const err = Math.abs(result.finalEnergyHartree - result.exactGroundEnergyHartree);
  assert.ok(err < 1.6e-3, `VQE error ${err} Ha should be within chemical accuracy (1.6 mHa)`);
  assert.ok(result.trajectory.length > 0);
  // energy landscape is bounded below by the exact energy
  for (const th of [-1, -0.3, 0, 0.2, 0.9]) assert.ok(energyAtTheta(th) >= exact - 1e-9, `E(θ=${th}) below ground state`);
});

test("ZNE: Richardson extrapolation recovers the noiseless energy better than the noisy point", () => {
  const theta = runVqe({ initialTheta: 0.5, iterations: 80, learningRate: 0.4 }).finalTheta;
  const zne = runZne(theta, { singleQubit: 0.01, twoQubit: 0.03 });
  const noiseless = zne.noiselessEnergyHartree;
  const noisiest = zne.points[0].energyHartree; // λ=1 noisy sample
  const quad = zne.quadraticExtrapolationHartree;
  assert.ok(Math.abs(quad - noiseless) < Math.abs(noisiest - noiseless), `extrapolation (${quad}) should beat raw noisy (${noisiest}) toward ${noiseless}`);
});

test("complex helpers: conjugate and product are consistent", () => {
  const z = c(0.3, -0.7);
  const zz = cMul(z, cConj(z));
  approx(zz.re, 0.58, 1e-12);
  approx(zz.im, 0, 1e-12);
});
