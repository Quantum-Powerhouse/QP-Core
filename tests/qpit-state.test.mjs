/**
 * Unit tests for QPIT's emotional state machine and special-event gating
 * (src/lib/quantum/qpitState.ts). node --test with native type stripping.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advanceEmotion,
  maybeSuperposition,
  maybeTunnelHome,
  chattiness,
  QPIT_PARAMS,
  SURPRISE_CURSOR_SPEED,
  EXCITED_CURSOR_SPEED,
  SURPRISED_DURATION_MS,
  ORBIT_WINDING_RAD,
  BORED_AFTER_MS,
  SLEEP_AFTER_MS,
  MIN_DWELL_MS,
  SPECIAL_COOLDOWN_MS,
  SESSION_WARMUP_MS,
  TUNNEL_MIN_CURSOR_SPEED,
} from "../src/lib/quantum/qpitState.ts";

const base = (over = {}) => ({
  now: 100_000,
  mode: "roaming",
  cursorSpeed: 0,
  msSinceMove: 0,
  winding: 0,
  ...over,
});

const at = (emotion, since) => ({ emotion, since });

test("every emotion has a complete params entry", () => {
  const emotions = ["IDLE", "CURIOUS", "EXCITED", "SURPRISED", "ORBITING", "BORED", "SLEEPING"];
  for (const e of emotions) {
    const p = QPIT_PARAMS[e];
    assert.ok(p, `missing params for ${e}`);
    for (const k of ["stiffness", "damping", "noise", "swingGain", "breatheAmp", "breatheHz", "glow"]) {
      assert.equal(typeof p[k], "number", `${e}.${k} must be a number`);
    }
    assert.ok(p.stiffness > 0 && p.damping > 0, `${e} spring must be positive`);
  }
});

test("activity ladder: idle → curious → excited by cursor speed", () => {
  const idle = at("IDLE", 0);
  assert.equal(advanceEmotion(idle, base({ cursorSpeed: 50 })).emotion, "IDLE");
  assert.equal(advanceEmotion(idle, base({ cursorSpeed: 400 })).emotion, "CURIOUS");
  assert.equal(advanceEmotion(idle, base({ cursorSpeed: EXCITED_CURSOR_SPEED + 1 })).emotion, "EXCITED");
});

test("a cursor spike surprises QPIT, which decays to CURIOUS after its duration", () => {
  const s1 = advanceEmotion(at("IDLE", 0), base({ cursorSpeed: SURPRISE_CURSOR_SPEED + 1 }));
  assert.equal(s1.emotion, "SURPRISED");
  // sticky within duration
  const held = advanceEmotion(s1, base({ now: s1.since + SURPRISED_DURATION_MS - 1 }));
  assert.equal(held, s1, "SURPRISED must be sticky until its duration elapses");
  const after = advanceEmotion(s1, base({ now: s1.since + SURPRISED_DURATION_MS + 1 }));
  assert.equal(after.emotion, "CURIOUS");
});

test("stillness leads to BORED then SLEEPING; movement wakes with a surprise", () => {
  const idle = at("IDLE", 0);
  assert.equal(advanceEmotion(idle, base({ mode: "docked", msSinceMove: BORED_AFTER_MS + 1 })).emotion, "BORED");
  assert.equal(advanceEmotion(idle, base({ mode: "docked", msSinceMove: SLEEP_AFTER_MS + 1 })).emotion, "SLEEPING");
  const sleeping = at("SLEEPING", 0);
  assert.equal(advanceEmotion(sleeping, base({ mode: "docked", msSinceMove: 50 })).emotion, "SURPRISED");
});

test("hysteresis: no emotion change before the minimum dwell", () => {
  const curious = at("CURIOUS", 100_000 - MIN_DWELL_MS + 100);
  const out = advanceEmotion(curious, base({ cursorSpeed: 0 }));
  assert.equal(out, curious, "must hold CURIOUS during dwell window");
});

test("winding the cursor around QPIT enters ORBITING, decay exits it", () => {
  const idle = at("IDLE", 0);
  const orbiting = advanceEmotion(idle, base({ winding: ORBIT_WINDING_RAD + 0.1 }));
  assert.equal(orbiting.emotion, "ORBITING");
  const still = advanceEmotion(orbiting, base({ now: 200_000, winding: ORBIT_WINDING_RAD }));
  assert.equal(still.emotion, "ORBITING");
  const exited = advanceEmotion(orbiting, base({ now: 200_000, winding: 0.1 }));
  assert.equal(exited.emotion, "IDLE");
});

test("superposition: eligible only when calm, roaming, warmed up, and off cooldown", () => {
  const idle = at("IDLE", 0);
  const inputs = base({ now: 200_000 });
  const always = () => 0; // rand below any chance threshold
  assert.equal(maybeSuperposition(idle, inputs, 0, 0, always), true);
  // cooldown blocks
  assert.equal(maybeSuperposition(idle, inputs, inputs.now - SPECIAL_COOLDOWN_MS + 1, 0, always), false);
  // session warmup blocks
  assert.equal(maybeSuperposition(idle, inputs, 0, inputs.now - SESSION_WARMUP_MS + 1, always), false);
  // wrong emotion blocks
  assert.equal(maybeSuperposition(at("EXCITED", 0), inputs, 0, 0, always), false);
  // docked blocks
  assert.equal(maybeSuperposition(idle, base({ now: 200_000, mode: "docked" }), 0, 0, always), false);
  // unlucky rand blocks
  assert.equal(maybeSuperposition(idle, inputs, 0, 0, () => 0.999), false);
});

test("tunnel-home: needs speed, cooldown, and luck", () => {
  const now = 500_000;
  assert.equal(maybeTunnelHome(TUNNEL_MIN_CURSOR_SPEED + 1, now, 0, () => 0), true);
  assert.equal(maybeTunnelHome(TUNNEL_MIN_CURSOR_SPEED - 1, now, 0, () => 0), false);
  assert.equal(maybeTunnelHome(9999, now, now - SPECIAL_COOLDOWN_MS + 1, () => 0), false);
  assert.equal(maybeTunnelHome(9999, now, 0, () => 0.99), false);
});

test("chattiness: reading silences QPIT; pokes embolden; ignoring quiets; bounded", () => {
  assert.equal(chattiness({ msSinceScroll: 500, sessionPokes: 10, ignoredHovers: 0 }), 0);
  const base_ = chattiness({ msSinceScroll: 60_000, sessionPokes: 0, ignoredHovers: 0 });
  const poked = chattiness({ msSinceScroll: 60_000, sessionPokes: 5, ignoredHovers: 0 });
  const ignored = chattiness({ msSinceScroll: 60_000, sessionPokes: 0, ignoredHovers: 10 });
  assert.ok(poked > base_, "pokes should raise chattiness");
  assert.ok(ignored < base_, "being ignored should lower chattiness");
  assert.ok(chattiness({ msSinceScroll: 60_000, sessionPokes: 100, ignoredHovers: 0 }) <= 1.4);
  assert.ok(chattiness({ msSinceScroll: 60_000, sessionPokes: 0, ignoredHovers: 100 }) >= 0.3);
});

// --- new specials: black hole, entanglement, wormhole ---

import {
  maybeBlackHole,
  maybeEntangle,
  maybeWormhole,
  BLACKHOLE_MIN_SHAKES,
  WORMHOLE_MIN_PET_SPEED,
} from "../src/lib/quantum/qpitState.ts";

test("black hole: needs enough shakes, cooldown, and luck", () => {
  const now = 600_000;
  assert.equal(maybeBlackHole(BLACKHOLE_MIN_SHAKES, now, 0, () => 0), true);
  assert.equal(maybeBlackHole(BLACKHOLE_MIN_SHAKES - 1, now, 0, () => 0), false);
  assert.equal(maybeBlackHole(10, now, now - SPECIAL_COOLDOWN_MS + 1, () => 0), false);
  assert.equal(maybeBlackHole(10, now, 0, () => 0.99), false);
});

test("entanglement: calm + roaming + warmed up + off cooldown", () => {
  const idle = at("IDLE", 0);
  const inputs = base({ now: 600_000 });
  assert.equal(maybeEntangle(idle, inputs, 0, 0, () => 0), true);
  assert.equal(maybeEntangle(at("EXCITED", 0), inputs, 0, 0, () => 0), false);
  assert.equal(maybeEntangle(idle, base({ now: 600_000, mode: "docked" }), 0, 0, () => 0), false);
  assert.equal(maybeEntangle(idle, inputs, inputs.now - SPECIAL_COOLDOWN_MS + 1, 0, () => 0), false);
  assert.equal(maybeEntangle(idle, inputs, 0, inputs.now - SESSION_WARMUP_MS + 1, () => 0), false);
  assert.equal(maybeEntangle(idle, inputs, 0, 0, () => 0.99), false);
});

test("wormhole: needs momentum, roaming, an awake QPIT, cooldown, and luck", () => {
  const idle = at("IDLE", 0);
  const inputs = base({ now: 600_000 });
  const spd = WORMHOLE_MIN_PET_SPEED + 1;
  assert.equal(maybeWormhole(spd, idle, inputs, 0, 0, () => 0), true);
  assert.equal(maybeWormhole(WORMHOLE_MIN_PET_SPEED - 1, idle, inputs, 0, 0, () => 0), false);
  assert.equal(maybeWormhole(spd, at("SLEEPING", 0), inputs, 0, 0, () => 0), false);
  assert.equal(maybeWormhole(spd, idle, base({ now: 600_000, mode: "docked" }), 0, 0, () => 0), false);
  assert.equal(maybeWormhole(spd, idle, inputs, inputs.now - SPECIAL_COOLDOWN_MS + 1, 0, () => 0), false);
  assert.equal(maybeWormhole(spd, idle, inputs, 0, 0, () => 0.99), false);
});
