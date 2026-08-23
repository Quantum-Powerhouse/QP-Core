/**
 * Unit tests for QPIT's pure contextual logic (src/lib/quantum/qpitContext.ts).
 * Runs on node --test with native TypeScript type stripping, same mechanism
 * scripts/validate-research.mjs relies on. No test framework dependency.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  sectionForPath,
  greetingForPath,
  hoverSectionFor,
  hoverLineFor,
  pickLine,
  POKE_LINES,
} from "../src/lib/quantum/qpitContext.ts";

test("sectionForPath maps routes to sections", () => {
  assert.equal(sectionForPath("/"), "home");
  assert.equal(sectionForPath("/research"), "research");
  assert.equal(sectionForPath("/research/"), "research");
  assert.equal(sectionForPath("/research/evidence"), "evidence");
  assert.equal(sectionForPath("/research/claims"), "claims");
  assert.equal(sectionForPath("/research/gap-analysis"), "gap-analysis");
  assert.equal(sectionForPath("/research/prior-art"), "prior-art");
  assert.equal(sectionForPath("/docs"), "docs");
  assert.equal(sectionForPath("/docs/vqe-suite/hamiltonian-and-ansatz"), "docs");
  assert.equal(sectionForPath("/playground/qp-core"), "playground");
  assert.equal(sectionForPath("/playground/vqe-suite?tab=zne"), "playground");
  assert.equal(sectionForPath("/no-such-page"), "unknown");
});

test("sectionForPath does not treat prefixes of longer segments as matches", () => {
  assert.equal(sectionForPath("/researcher"), "unknown");
  assert.equal(sectionForPath("/docsify"), "unknown");
});

test("greetingForPath returns a line for every real section", () => {
  for (const path of ["/", "/research", "/research/evidence", "/docs", "/playground/qp-core"]) {
    const line = greetingForPath(path, () => 0);
    assert.equal(typeof line, "string");
    assert.ok(line.length > 0, `expected a greeting for ${path}`);
  }
});

test("pickLine is deterministic under an injected RNG and safe on empty input", () => {
  const lines = ["a", "b", "c"];
  assert.equal(pickLine(lines, () => 0), "a");
  assert.equal(pickLine(lines, () => 0.99), "c");
  assert.equal(pickLine([], () => 0.5), null);
});

test("hoverSectionFor maps internal links through route logic", () => {
  assert.equal(hoverSectionFor("/research/evidence"), "evidence");
  assert.equal(hoverSectionFor("/playground/vqe-suite"), "playground");
  assert.equal(hoverSectionFor("/no-such-page"), null, "unknown internal routes give no hover line");
});

test("hoverSectionFor ignores external and anchor links", () => {
  assert.equal(hoverSectionFor("https://github.com/Quantum-Powerhouse/QP-Core"), null);
  assert.equal(hoverSectionFor("#projects"), null);
  assert.equal(hoverSectionFor(null), null);
});

test("data-qpit overrides the href-derived section", () => {
  assert.equal(hoverSectionFor("/docs", "evidence"), "evidence");
  assert.equal(hoverSectionFor(null, "playground"), "playground");
  assert.equal(hoverSectionFor(null, "not-a-real-section"), null);
});

test("hoverLineFor returns a line for sections with hover copy", () => {
  assert.equal(typeof hoverLineFor("evidence", () => 0), "string");
  assert.equal(hoverLineFor("unknown", () => 0), null);
});

test("poke lines exist and are short enough for the bubble", () => {
  assert.ok(POKE_LINES.length >= 3);
  for (const line of POKE_LINES) {
    assert.ok(line.length <= 60, `poke line too long: "${line}"`);
  }
});
