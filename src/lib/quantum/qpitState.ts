/**
 * QPIT's emotional state machine — pure logic, no DOM, no React.
 *
 * Emotions are derived from *real interaction facts* (cursor speed, idle time,
 * cursor winding around QPIT, dock/roam mode) and drive the physics layer:
 * spring stiffness/damping, stochastic jitter, swing gain, breathing, glow.
 * Special events (superposition, tunneling) are visual metaphors — creative
 * interpretations of quantum concepts, not physics claims — and are gated by
 * cooldowns + controlled randomness so they stay rare.
 *
 * Tested by tests/qpit-state.test.mjs.
 */

export type QpitEmotion =
  | "IDLE"
  | "CURIOUS"
  | "EXCITED"
  | "SURPRISED"
  | "ORBITING"
  | "BORED"
  | "SLEEPING";

export type QpitEmotionState = {
  emotion: QpitEmotion;
  /** timestamp (ms) when this emotion was entered */
  since: number;
};

export type QpitInputs = {
  now: number;
  mode: "docked" | "roaming";
  /** cursor speed in px/s (smoothed by caller) */
  cursorSpeed: number;
  /** ms since the cursor last moved */
  msSinceMove: number;
  /** accumulated signed winding (radians) of the cursor around QPIT, decayed by caller */
  winding: number;
};

/** Physics/visual parameters each emotion feeds into the integrator. */
export type QpitParams = {
  /** spring stiffness toward the target (1/s^2 scale) */
  stiffness: number;
  /** damping coefficient (1/s scale) */
  damping: number;
  /** stochastic position jitter amplitude, px — "quantum noise" */
  noise: number;
  /** multiplier on the pendulum swing response */
  swingGain: number;
  /** idle breathing scale amplitude (0 = none) */
  breatheAmp: number;
  /** breathing frequency, Hz */
  breatheHz: number;
  /** glow/intensity multiplier the visual form reads (1 = normal) */
  glow: number;
};

export const QPIT_PARAMS: Record<QpitEmotion, QpitParams> = {
  IDLE:      { stiffness: 90,  damping: 11, noise: 0.4, swingGain: 1.0, breatheAmp: 0.015, breatheHz: 0.22, glow: 1.0 },
  CURIOUS:   { stiffness: 120, damping: 12, noise: 0.6, swingGain: 1.1, breatheAmp: 0.02,  breatheHz: 0.3,  glow: 1.15 },
  EXCITED:   { stiffness: 190, damping: 10, noise: 1.2, swingGain: 1.45, breatheAmp: 0.03, breatheHz: 0.6,  glow: 1.5 },
  SURPRISED: { stiffness: 240, damping: 8,  noise: 2.0, swingGain: 1.7, breatheAmp: 0.0,   breatheHz: 0.0,  glow: 1.6 },
  ORBITING:  { stiffness: 110, damping: 9,  noise: 0.5, swingGain: 1.2, breatheAmp: 0.02,  breatheHz: 0.4,  glow: 1.3 },
  BORED:     { stiffness: 55,  damping: 14, noise: 0.2, swingGain: 0.6, breatheAmp: 0.03,  breatheHz: 0.12, glow: 0.7 },
  SLEEPING:  { stiffness: 40,  damping: 16, noise: 0.0, swingGain: 0.3, breatheAmp: 0.045, breatheHz: 0.08, glow: 0.45 },
};

// Tunable thresholds (exported for tests).
export const SURPRISE_CURSOR_SPEED = 2300; // px/s
export const EXCITED_CURSOR_SPEED = 950;
export const CURIOUS_CURSOR_SPEED = 130;
export const SURPRISED_DURATION_MS = 900;
export const ORBIT_WINDING_RAD = 2.2 * Math.PI * 2; // ~2.2 full circles
export const ORBIT_EXIT_WINDING_RAD = Math.PI;
export const BORED_AFTER_MS = 45_000;
export const SLEEP_AFTER_MS = 120_000;
export const MIN_DWELL_MS = 700; // hysteresis: no thrashing between emotions

/**
 * Advance the emotion given current inputs. Returns the same object when the
 * emotion is unchanged, so callers can cheaply detect transitions.
 */
export function advanceEmotion(state: QpitEmotionState, inputs: QpitInputs): QpitEmotionState {
  const { now, mode, cursorSpeed, msSinceMove, winding } = inputs;
  const held = now - state.since;
  const enter = (emotion: QpitEmotion): QpitEmotionState =>
    state.emotion === emotion ? state : { emotion, since: now };

  // SURPRISED is sticky for its duration, then decays to CURIOUS.
  if (state.emotion === "SURPRISED") {
    if (held < SURPRISED_DURATION_MS) return state;
    return enter("CURIOUS");
  }

  // A sudden cursor spike surprises QPIT from any state (incl. waking it).
  if (cursorSpeed > SURPRISE_CURSOR_SPEED) return enter("SURPRISED");

  // Waking from sleep/boredom on any real movement is also a surprise.
  if ((state.emotion === "SLEEPING" || state.emotion === "BORED") && msSinceMove < 200) {
    return enter("SURPRISED");
  }

  // Hysteresis for everything below.
  if (held < MIN_DWELL_MS) return state;

  // Orbit detection: the cursor has circled QPIT enough.
  if (state.emotion === "ORBITING") {
    if (Math.abs(winding) > ORBIT_EXIT_WINDING_RAD) return state;
    return enter("IDLE");
  }
  if (Math.abs(winding) > ORBIT_WINDING_RAD) return enter("ORBITING");

  // Long stillness → boredom → sleep (any mode; docked is the common case).
  if (msSinceMove > SLEEP_AFTER_MS) return enter("SLEEPING");
  if (msSinceMove > BORED_AFTER_MS) return enter("BORED");

  // Activity ladder while the cursor is moving.
  if (mode === "roaming") {
    if (cursorSpeed > EXCITED_CURSOR_SPEED) return enter("EXCITED");
    if (cursorSpeed > CURIOUS_CURSOR_SPEED) return enter("CURIOUS");
    return enter("IDLE");
  }
  return enter("IDLE");
}

// ---------------------------------------------------------------------------
// Special events — rare, cooldown-gated, controlled randomness.
// ---------------------------------------------------------------------------

export type QpitSpecial = "SUPERPOSITION" | "TUNNEL" | "BLACKHOLE" | "ENTANGLE" | "WORMHOLE";

export const SPECIAL_COOLDOWN_MS = 75_000;
export const SESSION_WARMUP_MS = 20_000;
/** Per-check probability while eligible (checked ~every 150ms). */
export const SUPERPOSITION_CHANCE = 0.002;
export const TUNNEL_MIN_CURSOR_SPEED = 1200;
export const TUNNEL_CHANCE = 0.5;
/** Black hole: violent cursor shaking (fast direction reversals) summons it. */
export const BLACKHOLE_MIN_SHAKES = 4;
export const BLACKHOLE_CHANCE = 0.6;
/** Entanglement / wormhole: ambient per-check chances while eligible. */
export const ENTANGLE_CHANCE = 0.0015;
export const WORMHOLE_CHANCE = 0.0015;
export const WORMHOLE_MIN_PET_SPEED = 420;

export type Rand = () => number;

/** Ambient special: superposition may fire during calm, roaming attention. */
export function maybeSuperposition(
  state: QpitEmotionState,
  inputs: QpitInputs,
  lastSpecialAt: number,
  sessionStartAt: number,
  rand: Rand,
): boolean {
  if (inputs.mode !== "roaming") return false;
  if (state.emotion !== "IDLE" && state.emotion !== "CURIOUS") return false;
  if (inputs.now - sessionStartAt < SESSION_WARMUP_MS) return false;
  if (inputs.now - lastSpecialAt < SPECIAL_COOLDOWN_MS) return false;
  return rand() < SUPERPOSITION_CHANCE;
}

/** Event special: fast pointer exit may make QPIT tunnel home instead of springing. */
export function maybeTunnelHome(
  cursorSpeed: number,
  now: number,
  lastSpecialAt: number,
  rand: Rand,
): boolean {
  if (cursorSpeed < TUNNEL_MIN_CURSOR_SPEED) return false;
  if (now - lastSpecialAt < SPECIAL_COOLDOWN_MS) return false;
  return rand() < TUNNEL_CHANCE;
}

/**
 * Event special: enough rapid cursor direction-reversals ("shaking") may
 * summon a tiny gravitational anomaly that pulls QPIT before it escapes.
 */
export function maybeBlackHole(
  shakeCount: number,
  now: number,
  lastSpecialAt: number,
  rand: Rand,
): boolean {
  if (shakeCount < BLACKHOLE_MIN_SHAKES) return false;
  if (now - lastSpecialAt < SPECIAL_COOLDOWN_MS) return false;
  return rand() < BLACKHOLE_CHANCE;
}

/**
 * Ambient special: while calm and roaming, QPIT may entangle with a distant
 * on-page element — a twin particle appears there and pulses in sync.
 */
export function maybeEntangle(
  state: QpitEmotionState,
  inputs: QpitInputs,
  lastSpecialAt: number,
  sessionStartAt: number,
  rand: Rand,
): boolean {
  if (inputs.mode !== "roaming") return false;
  if (state.emotion !== "IDLE" && state.emotion !== "CURIOUS") return false;
  if (inputs.now - sessionStartAt < SESSION_WARMUP_MS) return false;
  if (inputs.now - lastSpecialAt < SPECIAL_COOLDOWN_MS) return false;
  return rand() < ENTANGLE_CHANCE;
}

/**
 * Ambient special: while moving with some momentum, a wormhole pair may open —
 * QPIT dives into the near portal and exits from the far one.
 */
export function maybeWormhole(
  petSpeed: number,
  state: QpitEmotionState,
  inputs: QpitInputs,
  lastSpecialAt: number,
  sessionStartAt: number,
  rand: Rand,
): boolean {
  if (inputs.mode !== "roaming") return false;
  if (petSpeed < WORMHOLE_MIN_PET_SPEED) return false;
  if (state.emotion === "SLEEPING" || state.emotion === "BORED") return false;
  if (inputs.now - sessionStartAt < SESSION_WARMUP_MS) return false;
  if (inputs.now - lastSpecialAt < SPECIAL_COOLDOWN_MS) return false;
  return rand() < WORMHOLE_CHANCE;
}

// ---------------------------------------------------------------------------
// Dialogue governor — QPIT should know when NOT to talk.
// ---------------------------------------------------------------------------

/**
 * Chattiness multiplier for non-forced lines. Reading (recent scrolling)
 * silences QPIT entirely; repeated pokes make it a little more talkative;
 * being ignored makes it quieter. Bounded so it never becomes spammy.
 */
export function chattiness(opts: {
  msSinceScroll: number;
  sessionPokes: number;
  ignoredHovers: number;
}): number {
  if (opts.msSinceScroll < 2000) return 0; // the user is reading — stay quiet
  const playful = Math.min(0.4, opts.sessionPokes * 0.08);
  const shy = Math.min(0.5, opts.ignoredHovers * 0.05);
  return Math.min(1.4, Math.max(0.3, 1 + playful - shy));
}
