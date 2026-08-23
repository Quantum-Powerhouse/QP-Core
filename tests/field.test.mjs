/**
 * Field content integrity: every claim must carry a valid status, an ISO
 * month, and an http(s) source — and must not use hype phrasing. Same
 * discipline the research validator applies to evidence.json.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { FIELD_STATUS_LABEL } from "../src/lib/field/types.ts";
import { HARDWARE_MILESTONES, HARDWARE_ROADMAPS, HARDWARE_STATE } from "../src/lib/field/hardware.ts";
import { PQC_STANDARDS, PQC_THREAT, RSA_ESTIMATES } from "../src/lib/field/pqc.ts";
import { CAREER_FACTS, CAREER_ROLES, EMPLOYERS } from "../src/lib/field/careers.ts";
import { TIMELINE_OPTIMISTS, TIMELINE_SKEPTICS } from "../src/lib/field/timeline.ts";
import { FIRST_SOLVED } from "../src/lib/field/firstSolved.ts";
import { NETWORKING } from "../src/lib/field/networking.ts";
import { SENSING } from "../src/lib/field/sensing.ts";
import { STRATEGIES } from "../src/lib/field/strategies.ts";
import { TOOLING } from "../src/lib/field/tooling.ts";
import { OPEN_PROBLEMS } from "../src/lib/field/openProblems.ts";

const ALL = [
  ...HARDWARE_MILESTONES,
  ...HARDWARE_ROADMAPS,
  ...PQC_STANDARDS,
  ...PQC_THREAT,
  ...RSA_ESTIMATES,
  ...CAREER_FACTS,
  ...TIMELINE_OPTIMISTS,
  ...TIMELINE_SKEPTICS,
  ...FIRST_SOLVED,
  ...NETWORKING,
  ...SENSING,
  ...STRATEGIES,
  ...TOOLING,
  ...OPEN_PROBLEMS,
];

const HYPE = [/revolutioni[sz]e/i, /change the world/i, /take over/i, /game[- ]changer/i, /limitless/i, /unprecedented power/i];

const isHttp = (u) => /^https?:\/\/\S+$/.test(u);

test("every field claim has a valid status, date, body, and http source", () => {
  assert.ok(ALL.length >= 25, `expected a substantial record, got ${ALL.length}`);
  const ids = new Set();
  for (const c of ALL) {
    assert.ok(c.id && !ids.has(c.id), `duplicate/missing id ${c.id}`);
    ids.add(c.id);
    assert.ok(Object.hasOwn(FIELD_STATUS_LABEL, c.status), `${c.id}: bad status ${c.status}`);
    assert.match(c.date, /^\d{4}-\d{2}$/, `${c.id}: date must be YYYY-MM`);
    assert.ok(c.body.length > 80, `${c.id}: body too short to be a claim`);
    assert.ok(isHttp(c.source.url), `${c.id}: source url must be http(s)`);
    assert.ok(c.source.label.length > 3, `${c.id}: source needs a label`);
    if (c.also) assert.ok(isHttp(c.also.url), `${c.id}: secondary source url must be http(s)`);
  }
});

test("no hype phrasing anywhere in field content", () => {
  for (const c of ALL) {
    for (const re of HYPE) assert.ok(!re.test(c.title) && !re.test(c.body), `${c.id}: hype phrasing matched ${re}`);
  }
});

test("roadmap entries are tagged as projections, never as verified", () => {
  for (const c of HARDWARE_ROADMAPS) assert.equal(c.status, "projection", `${c.id} must be a projection`);
});

test("timeline entries are opinions or projections — never presented as results", () => {
  for (const c of [...TIMELINE_OPTIMISTS, ...TIMELINE_SKEPTICS]) {
    assert.ok(c.status === "opinion" || c.status === "projection", `${c.id}: timeline claims are opinions/projections, got ${c.status}`);
  }
});

test("the three hardware state lines say exactly what is and isn't achieved", () => {
  assert.equal(HARDWARE_STATE.length, 3);
  assert.equal(HARDWARE_STATE[2].achieved, false, "a useful fault-tolerant machine must be marked not achieved");
  assert.ok(HARDWARE_STATE[0].achieved && HARDWARE_STATE[1].achieved);
});

test("RSA estimates fall monotonically in qubits over time", () => {
  const years = RSA_ESTIMATES.map((r) => Number(r.date.slice(0, 4)));
  for (let i = 1; i < years.length; i++) assert.ok(years[i] > years[i - 1], "estimates must be chronological");
  assert.match(RSA_ESTIMATES[0].qubits, /10⁹|billion/);
  assert.match(RSA_ESTIMATES[1].qubits, /20 million/);
  assert.match(RSA_ESTIMATES[2].qubits, /fewer than 1 million/);
});

test("career roles each link to proof on this site or a public repo; employers have official urls", () => {
  assert.equal(CAREER_ROLES.length, 7);
  for (const r of CAREER_ROLES) {
    assert.ok(r.proof.length >= 1, `${r.role}: needs proof`);
    for (const p of r.proof) assert.ok(p.href.startsWith("/") || isHttp(p.href), `${r.role}: bad proof href ${p.href}`);
  }
  for (const e of EMPLOYERS) assert.ok(isHttp(e.url), `${e.name}: bad url`);
});

test("preprints are labeled as preprints, never as verified results", () => {
  for (const c of [...NETWORKING, ...SENSING]) {
    if (/preprint/i.test(c.body)) assert.equal(c.status, "preprint", `${c.id} mentions a preprint but is tagged ${c.status}`);
  }
});

test("legislation in progress and roadmap missions are projections", () => {
  for (const c of STRATEGIES) {
    if (/in progress|not yet law|planned for|mission is a target/i.test(c.body)) {
      assert.equal(c.status, "projection", `${c.id} describes a plan but is tagged ${c.status}`);
    }
  }
});

test("every open problem names its framing paper on arXiv", () => {
  for (const c of OPEN_PROBLEMS) assert.ok(/arxiv\.org/.test(c.source.url), `${c.id} should cite the arXiv paper that framed it`);
});
