/**
 * QPet Console intents must be complete and grounded: every section has a
 * "what am I looking at" description and a next step pointing at a real route.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LOOKING_AT,
  NEXT_STEP,
  QUANTUM_FACTS,
  SUPERPOSED_ANSWERS,
  sectionForPath,
} from "../src/lib/quantum/qpitContext.ts";

const SECTIONS = ["home", "research", "claims", "evidence", "sources", "gap-analysis", "prior art", "methodology", "docs", "playground", "unknown"];

test("every section has a looking-at description and a next step", () => {
  for (const s of SECTIONS) {
    assert.ok(LOOKING_AT[s]?.length > 20, `LOOKING_AT missing for ${s}`);
    assert.ok(NEXT_STEP[s]?.line.length > 5, `NEXT_STEP line missing for ${s}`);
    assert.ok(NEXT_STEP[s].href.startsWith("/"), `NEXT_STEP href must be internal for ${s}`);
  }
});

test("next-step routes resolve to known sections (no dead links)", () => {
  for (const s of SECTIONS) {
    const target = sectionForPath(NEXT_STEP[s].href);
    assert.notEqual(target, "unknown", `NEXT_STEP for ${s} points at unknown route ${NEXT_STEP[s].href}`);
  }
});

test("superposed answers carry valid Born weights", () => {
  for (const [key, ans] of Object.entries(SUPERPOSED_ANSWERS)) {
    assert.ok(ans.pA > 0 && ans.pA < 1, `${key}: pA must be strictly between 0 and 1`);
    assert.ok(ans.a && ans.b, `${key}: both branches need text`);
  }
});

test("quantum facts are short enough to voice and non-empty", () => {
  assert.ok(QUANTUM_FACTS.length >= 5);
  for (const f of QUANTUM_FACTS) assert.ok(f.length < 140, `fact too long to voice: ${f}`);
});

import { parseVoiceCommand } from "../src/lib/quantum/qpitContext.ts";

test("voice commands: navigation phrases resolve to real routes", () => {
  assert.deepEqual(parseVoiceCommand("QPet, take me to the arcade").intent, "navigate");
  assert.equal(parseVoiceCommand("take me to the bell test").href, "/playground/arcade#chsh-beat-the-classical-bound");
  assert.equal(parseVoiceCommand("open the research").href, "/research");
  assert.equal(parseVoiceCommand("show me grover").href, "/playground/arcade#grover-searchlight");
  assert.equal(parseVoiceCommand("go home").href, "/");
});

test("voice commands: questions, measurement, summons, unknown", () => {
  assert.equal(parseVoiceCommand("what am I looking at").intent, "looking");
  assert.equal(parseVoiceCommand("what should I do next").intent, "next");
  assert.equal(parseVoiceCommand("tell me a quantum fact").intent, "fact");
  assert.equal(parseVoiceCommand("measure it").intent, "measure");
  const s = parseVoiceCommand("make a black hole");
  assert.equal(s.intent, "summon");
  assert.equal(s.kind, "BLACKHOLE");
  assert.equal(parseVoiceCommand("open a wormhole").kind, "WORMHOLE");
  assert.equal(parseVoiceCommand("blorp frobnicate").intent, "unknown");
  assert.equal(parseVoiceCommand("").intent, "unknown");
});
