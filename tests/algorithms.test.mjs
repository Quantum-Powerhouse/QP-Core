/**
 * The three algorithm demonstrations must earn their claims numerically:
 * Bernstein and Vazirani lands all probability on the secret, the GHZ
 * quantum strategy wins every referee case with certainty while the best
 * classical strategy wins exactly three of four, and the QFT spectrum
 * peaks read back the period.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bernsteinVazirani,
  GHZ_CASES,
  ghzClassicalBest,
  ghzQuantumRound,
  ghzQuantumWinProbability,
  qftPeriodProbs,
  periodFromSpectrum,
} from "../src/lib/arcade/qalgos.ts";

test("Bernstein and Vazirani recovers any secret with probability 1 in one query", () => {
  for (const n of [3, 5, 7]) {
    for (const secret of [0, 1, (1 << n) - 1, 0b101 & ((1 << n) - 1)]) {
      const probs = bernsteinVazirani(secret, n);
      assert.ok(Math.abs(probs[secret] - 1) < 1e-9, `n=${n} s=${secret}: P=${probs[secret]}`);
      const total = probs.reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(total - 1) < 1e-9, "probabilities must sum to 1");
    }
  }
});

test("the best classical GHZ strategy wins exactly 3 of 4 cases", () => {
  assert.equal(ghzClassicalBest(), 3);
});

test("the quantum GHZ strategy wins every case with probability 1", () => {
  for (const c of GHZ_CASES) {
    const p = ghzQuantumWinProbability(c);
    assert.ok(Math.abs(p - 1) < 1e-9, `case ${c.r}${c.s}${c.t}: win probability ${p}`);
  }
});

test("sampled GHZ rounds only ever produce winning answers", () => {
  let x = 12345;
  const rand = () => {
    x = (x * 48271) % 2147483647;
    return x / 2147483647;
  };
  for (let i = 0; i < 200; i++) {
    const c = GHZ_CASES[i % 4];
    const round = ghzQuantumRound(c, rand);
    assert.ok(round.win, `round ${i} lost on case ${c.r}${c.s}${c.t}`);
  }
});

test("the QFT spectrum has exact peaks at multiples of N/r when r divides N", () => {
  const n = 6;
  const N = 1 << n;
  for (const r of [2, 4, 8]) {
    const probs = qftPeriodProbs(r, n);
    const spacing = N / r;
    for (let k = 0; k < N; k++) {
      const expected = k % spacing === 0 ? 1 / r : 0;
      assert.ok(Math.abs(probs[k] - expected) < 1e-9, `r=${r} k=${k}: ${probs[k]} vs ${expected}`);
    }
    assert.equal(periodFromSpectrum(probs), r);
  }
});

test("non dividing periods still concentrate weight near multiples of N/r", () => {
  const n = 6;
  const N = 1 << n;
  const r = 5;
  const probs = qftPeriodProbs(r, n);
  const near = probs.reduce((sum, p, k) => {
    const frac = (k * r) / N;
    const dist = Math.abs(frac - Math.round(frac));
    return dist < 0.25 ? sum + p : sum;
  }, 0);
  assert.ok(near > 0.85, `expected concentration near peaks, got ${near}`);
});
