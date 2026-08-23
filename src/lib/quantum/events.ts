/**
 * Site-wide quantum event bus.
 *
 * Every event here is sourced from a real computation already happening
 * elsewhere in the app (src/lib/physics/*, the transpiler analyzer, or an
 * explicit user-driven UI control), this module never originates quantum
 * data itself. If a future event type can't be sourced truthfully from an
 * existing computation, don't add it; add the real computation first.
 *
 * Rules for consumers (visual/Pet layers built on top of this):
 * - STATE_CHANGED: a user-controlled demo parameter (Bloch sphere sliders),
 *   not a physically simulated evolution. Visual metaphor for "the displayed
 *   state changed."
 * - TRANSPILATION_*: real, mirrors the actual transpile request lifecycle
 *   (src/components/TranspilerTerminalStudio.tsx), including real latency.
 * - VQE_*: real, mirrors the actual parameter-shift optimization trajectory
 *   computed in src/lib/physics/vqe.ts. Iteration events replay real
 *   trajectory points, not a synthetic countdown.
 * - NOISE_APPLIED: real, one event per real noisy-energy sample computed in
 *   src/lib/physics/zne.ts.
 * - MEASUREMENT: real, a genuine inverse-CDF sample over |amplitude|^2
 *   (src/lib/physics/measurement.ts), not a scripted collapse animation.
 * - ERROR: real, surfaces an actual thrown/caught error from one of the
 *   above flows.
 * - USER_INTERACTION: generic, low-frequency; use sparingly for interactions
 *   that don't fit a more specific event.
 * - ARCADE_RESULT: real, a number an arcade game just computed on the
 *   physics stack (a sampled CHSH S, a Grover success probability, a BB84
 *   QBER). The payload is the computed value and a plain-language summary
 *   written by the game that computed it; QPet narrates it verbatim.
 */

export type QuantumEventMap = {
  STATE_CHANGED: { theta: number; phi: number; source: "bloch-demo" };
  TRANSPILATION_STARTED: { qasmVersion: "2.0" | "3.0" };
  TRANSPILATION_FINISHED: { latencyMs: number; mock: boolean; qubitCount: number | null };
  VQE_STARTED: Record<string, never>;
  VQE_ITERATION: { iteration: number; energyHartree: number };
  VQE_CONVERGED: { finalEnergyHartree: number; exactGroundEnergyHartree: number };
  NOISE_APPLIED: { lambda: number; energyHartree: number };
  MEASUREMENT: { outcomeIndex: number; probabilities: number[] };
  ERROR: { scope: "transpile" | "vqe" | "zne"; message: string };
  USER_INTERACTION: { label: string };
  ARCADE_RESULT: { game: string; summary: string; value: number };
};

export type QuantumEventType = keyof QuantumEventMap;

export type QuantumEventOf<T extends QuantumEventType> = {
  type: T;
  detail: QuantumEventMap[T];
  timestamp: number;
};

/**
 * A true discriminated union (one variant per event type), so
 * `switch (event.type)` / `if (event.type === "X")` correctly narrows
 * `event.detail`. A plain generic `QuantumEventOf<QuantumEventType>` would
 * NOT narrow this way. TS would instantiate `detail` as the union of every
 * possible payload regardless of which `type` matched.
 */
export type QuantumEvent = { [K in QuantumEventType]: QuantumEventOf<K> }[QuantumEventType];

type Listener<T extends QuantumEventType> = (event: QuantumEventOf<T>) => void;

/** Thin typed wrapper around EventTarget, no external dependency. */
export class QuantumEventBus {
  private target = new EventTarget();

  emit<T extends QuantumEventType>(type: T, detail: QuantumEventMap[T]): void {
    const event: QuantumEventOf<T> = { type, detail, timestamp: performance.now() };
    this.target.dispatchEvent(new CustomEvent(type, { detail: event }));
  }

  on<T extends QuantumEventType>(type: T, listener: Listener<T>): () => void {
    const handler = (e: Event) => listener((e as CustomEvent<QuantumEventOf<T>>).detail);
    this.target.addEventListener(type, handler);
    return () => this.target.removeEventListener(type, handler);
  }

  /** Subscribe to every event type, useful for a single ambient consumer like the field. */
  onAny(listener: (event: QuantumEvent) => void): () => void {
    const unsubscribers = (Object.keys({
      STATE_CHANGED: 0,
      TRANSPILATION_STARTED: 0,
      TRANSPILATION_FINISHED: 0,
      VQE_STARTED: 0,
      VQE_ITERATION: 0,
      VQE_CONVERGED: 0,
      NOISE_APPLIED: 0,
      MEASUREMENT: 0,
      ERROR: 0,
      USER_INTERACTION: 0,
      ARCADE_RESULT: 0,
    } satisfies Record<QuantumEventType, 0>) as QuantumEventType[]).map((type) =>
      // Safe: `type` ranges over every key of QuantumEventMap here, so this
      // reconstructs exactly the discriminated union `listener` accepts,       // TS just can't see that across the type-erased loop.
      this.on(type, listener as unknown as Listener<typeof type>),
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }
}
