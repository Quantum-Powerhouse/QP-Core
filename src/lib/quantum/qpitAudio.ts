/**
 * QPIT's voice-box: tiny synthesized cues via WebAudio. No audio assets.
 *
 * Strictly opt-in: nothing is constructed until the user enables sound via
 * the toggle (a user gesture, which also satisfies autoplay policy). The
 * preference persists in localStorage under "qpit.audio". All cues are very
 * short (< 400ms) and very quiet (master gain 0.08), texture, not noise.
 */

const STORAGE_KEY = "qpit.audio";
const MASTER_GAIN = 0.08;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function audioEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAudioEnabled(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* private mode, the toggle still works for this page life */
  }
  if (on) ensureContext();
  else if (ctx && ctx.state === "running") void ctx.suspend();
}

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function ready(): { c: AudioContext; m: GainNode } | null {
  if (!audioEnabled()) return null;
  const c = ensureContext();
  if (!c || !master) return null;
  return { c, m: master };
}

function envOsc(opts: {
  type: OscillatorType;
  from: number;
  to: number;
  dur: number;
  peak?: number;
}): void {
  const r = ready();
  if (!r) return;
  const { c, m } = r;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), t0 + opts.dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(opts.peak ?? 1, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + opts.dur);
  osc.connect(g).connect(m);
  osc.start(t0);
  osc.stop(t0 + opts.dur + 0.02);
}

/** Poke: a bright little pop. */
export function playPop(): void {
  envOsc({ type: "sine", from: 620, to: 180, dur: 0.12 });
}

/** Tunnel / wormhole: a quick downward-then-up warp sweep. */
export function playWarp(): void {
  envOsc({ type: "triangle", from: 340, to: 60, dur: 0.22, peak: 0.9 });
  setTimeout(() => envOsc({ type: "triangle", from: 80, to: 480, dur: 0.18, peak: 0.7 }), 190);
}

/** Black hole: a low, brief gravitational hum swell. */
export function playHum(): void {
  envOsc({ type: "sine", from: 55, to: 38, dur: 0.4, peak: 1 });
  envOsc({ type: "sine", from: 110, to: 76, dur: 0.4, peak: 0.35 });
}

/** Superposition / entanglement: a soft two-tone shimmer. */
export function playShimmer(): void {
  envOsc({ type: "sine", from: 880, to: 660, dur: 0.16, peak: 0.5 });
  setTimeout(() => envOsc({ type: "sine", from: 1108, to: 830, dur: 0.16, peak: 0.4 }), 90);
}
