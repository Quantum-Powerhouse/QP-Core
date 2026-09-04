/**
 * Unit tests for the Quantum Arcade engine (src/lib/arcade/qlogic.ts).
 * Every game's math is checked against known quantum-mechanics results.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bellState,
  bb84Qber,
  bb84Round,
  bitEntropy,
  blochOf,
  chshSample,
  CHSH_ANGLES,
  deutschRun,
  entangleDial,
  fidelity,
  groverInit,
  groverOptimalIterations,
  groverStep,
  interferenceProbabilities,
  repetitionRound,
  stateFromAngles,
  tunnelingTransmission,
} from "../src/lib/arcade/qlogic.ts";
import { probabilitiesOf } from "../src/lib/physics/measurement.ts";

const близко = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);
const approx = близко;

test("blochOf maps |0⟩, |1⟩, |+⟩ to the right poles", () => {
  approx(blochOf(stateFromAngles(0, 0)).z, 1);
  approx(blochOf(stateFromAngles(Math.PI, 0)).z, -1);
  const plus = blochOf(stateFromAngles(Math.PI / 2, 0));
  approx(plus.x, 1);
  approx(plus.z, 0);
});

test("fidelity: identical states 1, orthogonal states 0", () => {
  const a = stateFromAngles(0.7, 1.1);
  approx(fidelity(a, a), 1);
  approx(fidelity(stateFromAngles(0, 0), stateFromAngles(Math.PI, 0)), 0);
});

test("interference fringes: φ=0 certain, φ=π impossible", () => {
  approx(interferenceProbabilities(0)[0], 1);
  approx(interferenceProbabilities(Math.PI)[0], 0);
  approx(interferenceProbabilities(Math.PI / 2)[0], 0.5);
});

test("Grover on 3 qubits: optimal iterations concentrate the marked amplitude", () => {
  const marked = 5;
  let s = groverInit(3);
  const uniform = probabilitiesOf(s);
  approx(uniform[marked], 1 / 8);
  const optimal = groverOptimalIterations(3);
  assert.equal(optimal, 2);
  for (let i = 0; i < optimal; i++) s = groverStep(s, marked);
  const probs = probabilitiesOf(s);
  assert.ok(probs[marked] > 0.9, `marked prob ${probs[marked]} should exceed 0.9`);
  // over-rotation must reduce it again
  let over = groverStep(s, marked);
  over = groverStep(over, marked);
  assert.ok(probabilitiesOf(over)[marked] < probs[marked]);
});

test("Bell state: only |00⟩ and |11⟩, equally", () => {
  const probs = probabilitiesOf(bellState());
  approx(probs[0], 0.5);
  approx(probs[3], 0.5);
  approx(probs[1] + probs[2], 0);
});

test("CHSH with optimal angles: sampled S approaches 2√2, beyond classical 2", () => {
  // deterministic LCG so the test is reproducible
  let seed = 42;
  const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const settings = [
    [CHSH_ANGLES.a0, CHSH_ANGLES.b0, 1],
    [CHSH_ANGLES.a0, CHSH_ANGLES.b1, 1],
    [CHSH_ANGLES.a1, CHSH_ANGLES.b0, 1],
    [CHSH_ANGLES.a1, CHSH_ANGLES.b1, -1],
  ];
  const N = 4000;
  let S = 0;
  for (const [a, b, sign] of settings) {
    let e = 0;
    for (let i = 0; i < N; i++) {
      const r = chshSample(a, b, rand);
      e += r.a * r.b;
    }
    S += (sign * e) / N;
  }
  assert.ok(S > 2.6, `sampled S=${S} should clearly exceed the classical bound 2`);
  assert.ok(S <= 2 * Math.SQRT2 + 0.1, `S=${S} must respect the Tsirelson bound`);
});

test("entangleDial: θ=0 leaves qubit A pure; θ=π/2 makes it maximally mixed", () => {
  approx(entangleDial(0).purityOfA, 1);
  approx(entangleDial(Math.PI / 2).purityOfA, 0.5, 1e-6);
});

test("Deutsch circuit is always right in one query", () => {
  approx(deutschRun("const0").pConstant, 1, 1e-9);
  approx(deutschRun("const1").pConstant, 1, 1e-9);
  approx(deutschRun("identity").pConstant, 0, 1e-9);
  approx(deutschRun("negation").pConstant, 0, 1e-9);
});

test("tunneling: opaque thick barriers, transparent above-barrier", () => {
  assert.equal(tunnelingTransmission(1.2, 1, 1), 1);
  assert.ok(tunnelingTransmission(0.1, 1, 3) < 0.01);
  assert.ok(tunnelingTransmission(0.9, 1, 0.2) > 0.8);
});

test("BB84: clean channel has zero QBER; Eve pushes it toward 25%", () => {
  let seed = 7;
  const rand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const clean = Array.from({ length: 600 }, () => bb84Round(false, rand));
  assert.equal(bb84Qber(clean).errors, 0);
  const tapped = Array.from({ length: 2000 }, () => bb84Round(true, rand));
  const q = bb84Qber(tapped).qber;
  assert.ok(q > 0.15 && q < 0.35, `QBER with Eve was ${q}, expected ≈0.25`);
});

test("repetition code survives any single flip, fails on majorities", () => {
  assert.equal(repetitionRound(0, () => 0.99).corrected, true);
  // force exactly one flip
  let calls = 0;
  const oneFlip = () => (calls++ === 0 ? 0 : 0.99);
  assert.equal(repetitionRound(0.5, oneFlip).corrected, true);
  assert.equal(repetitionRound(1, () => 0).corrected, false);
});

test("bitEntropy: fair bits ≈1, constant bits = 0", () => {
  approx(bitEntropy([0, 1, 0, 1, 0, 1, 0, 1]), 1);
  approx(bitEntropy([1, 1, 1, 1]), 0);
});

// --- frontier games ---
import { qaoaMaxCut, quantumWalk, classicalWalk, walkSpread } from "../src/lib/arcade/qlogic.ts";

test("QAOA at γ=β=0 is the uniform superposition with ⟨cut⟩ = 2 on the 4-ring", () => {
  const r = qaoaMaxCut(0, 0);
  approx(r.expectedCut, 2, 1e-9);
  assert.equal(r.bestCut, 4);
  for (const p of r.probs) approx(p, 1 / 16, 1e-9);
});

test("QAOA has a parameter region that beats random guessing", () => {
  let best = 0;
  for (let g = 0; g <= Math.PI; g += 0.1) for (let b = 0; b <= Math.PI / 2; b += 0.1) best = Math.max(best, qaoaMaxCut(g, b).expectedCut);
  assert.ok(best > 2.8, `best ⟨cut⟩ ${best} should clearly exceed the random baseline 2`);
});

test("quantum walk spreads ballistically, classical diffusively", () => {
  const t = 40;
  const q = quantumWalk(t);
  const cl = classicalWalk(t);
  approx(q.reduce((a, b) => a + b, 0), 1, 1e-9, "quantum walk normalized");
  approx(cl.reduce((a, b) => a + b, 0), 1, 1e-9, "classical walk normalized");
  const ratio = walkSpread(q) / walkSpread(cl);
  assert.ok(ratio > 2, `quantum/classical spread ratio ${ratio} should exceed 2 at t=${t}`);
  assert.ok(Math.abs(walkSpread(cl) - Math.sqrt(t)) < 0.5, "classical σ ≈ √t");
});

// --- copy integrity: counts must be computed, never hand typed ---
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ARCADE_GAME_COUNT } from "../src/components/arcade/manifest.ts";

function walkSrc(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkSrc(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

test("no page copy contains a spelled out game or system count", () => {
  const offenders = [];
  for (const f of walkSrc("src")) {
    if (/Twenty[ -](one|two|three|four|five|six|seven|plus)/i.test(readFileSync(f, "utf-8"))) offenders.push(f);
  }
  assert.deepEqual(offenders, [], `spelled out counts found in: ${offenders.join(", ")}`);
});

test("the manifest count matches the exported game components", () => {
  const games = ["GamesBasics", "GamesEntangle", "GamesAdvanced", "GamesFrontier", "GamesAlgorithms"]
    .map((n) => readFileSync(join("src/components/arcade", `${n}.tsx`), "utf-8"))
    .flatMap((t) => t.match(/^export function [A-Z]/gm) ?? []).length;
  assert.equal(games, ARCADE_GAME_COUNT, `manifest ${ARCADE_GAME_COUNT} vs components ${games}`);
});

test("the generated index matches the GameCard titles in each file", async () => {
  const { ARCADE_INDEX } = await import("../src/components/arcade/manifest.ts");
  const fileFor = {
    "One qubit, no mercy": "GamesBasics",
    "Entanglement & protocols": "GamesEntangle",
    "Algorithms, noise & spies": "GamesAdvanced",
    "The frontier": "GamesFrontier",
    "The algorithm wing": "GamesAlgorithms",
  };
  let total = 0;
  for (const group of ARCADE_INDEX) {
    const src = readFileSync(join("src/components/arcade", `${fileFor[group.section]}.tsx`), "utf-8");
    for (const title of group.titles) {
      assert.ok(src.includes(`title="${title}"`), `${group.section}: title ${title} missing from source`);
      total++;
    }
  }
  assert.equal(total, ARCADE_GAME_COUNT, `index lists ${total}, manifest says ${ARCADE_GAME_COUNT}`);
});
