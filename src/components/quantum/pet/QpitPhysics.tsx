"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import {
  advanceEmotion,
  maybeAmbientBlackHole,
  maybeBlackHole,
  maybeEntangle,
  maybeSuperposition,
  maybeTunnelHome,
  maybeWormhole,
  QPIT_PARAMS,
  SPECIAL_COOLDOWN_MS,
  type QpitEmotion,
  type QpitEmotionState,
  type QpitSpecial,
  ANGER_POKES,
  ANGER_WINDOW_MS,
} from "@/lib/quantum/qpitState";

/**
 * QPIT's motion layer: an emotion-driven, spring-tethered cursor follower.
 *
 * The position is integrated by hand (semi-implicit Euler) so the spring
 * stiffness, damping, stochastic jitter, swing response, and breathing can
 * all change live with QPIT's emotional state, something a fixed spring
 * config can't do. Pendulum swing derives from horizontal velocity; squash &
 * stretch derive from speed; a sagging SVG tether links cursor to creature.
 *
 * Special moments (superposition ghosts, tunneling home) are rare,
 * cooldown-gated visual metaphors, creative quantum flavor, not physics
 * claims.
 *
 * Performance: pointer handling and the whole integrator write styles
 * directly to refs inside one rAF loop, zero React re-renders per frame.
 * React state only changes on dock/roam transitions and rare specials.
 */

const TETHER_DROP = 150;
const IDLE_DOCK_MS = 3500;
const EDGE_MARGIN = 56;
const SWING_MAX_DEG = 30;
const EMOTION_TICK_MS = 150;
const TRAIL_LEN = 3;
const TRAIL_MIN_SPEED = 1100;

const EMOTION_TETHER: Record<QpitEmotion, { stroke: string; opacity: number }> = {
  ANGRY: { stroke: "#a33327", opacity: 0.55 },
  IDLE: { stroke: "var(--accent)", opacity: 0.35 },
  CURIOUS: { stroke: "var(--accent)", opacity: 0.45 },
  EXCITED: { stroke: "var(--accent-2)", opacity: 0.6 },
  SURPRISED: { stroke: "#78660f", opacity: 0.7 },
  ORBITING: { stroke: "var(--accent-2)", opacity: 0.5 },
  BORED: { stroke: "var(--accent)", opacity: 0.22 },
  SLEEPING: { stroke: "var(--accent)", opacity: 0.12 },
};

export type QpitMode = "docked" | "roaming";

/** Imperative handle for the UI layer: drag-and-fling, and forcing a moment. */
export type QpitControl = {
  grab: (x: number, y: number) => void;
  drag: (x: number, y: number) => void;
  release: (vx: number, vy: number) => void;
  trigger: (kind: QpitSpecial) => boolean;
};

const emptySubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function dockPosition(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: window.innerWidth - EDGE_MARGIN - 34,
    y: window.innerHeight - EDGE_MARGIN - 40,
  };
}

const wrapAngle = (a: number) => {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
};

export function QpitPhysics({
  interactive,
  reduceMotion,
  pokeSignal,
  celebrateSignal = 0,
  visualRef,
  onModeChange,
  onEmotionChange,
  onSpecialStart,
  onSpecial,
  onAnomalyHover,
  controlRef,
  children,
}: {
  /** false → permanently docked (touch devices, prefers-reduced-motion). */
  interactive: boolean;
  /** true → minimal motion: no jitter, trails, or special moments. */
  reduceMotion: boolean;
  /** increment to give QPIT a little hop (poke reaction). */
  pokeSignal: number;
  /** increment for a celebratory hop + spin (e.g. VQE converged). */
  celebrateSignal?: number;
  /** optional shared visual state; the physics writes gaze + position into it. */
  visualRef?: React.MutableRefObject<{ gazeX: number; gazeY: number; petX: number; petY: number }>;
  onModeChange?: (mode: QpitMode) => void;
  onEmotionChange?: (next: QpitEmotion, prev: QpitEmotion) => void;
  /** fires when a special moment begins (e.g. the anomaly appears). */
  onSpecialStart?: (kind: QpitSpecial) => void;
  /** fires when the user hovers the black-hole anomaly. */
  onAnomalyHover?: () => void;
  /** receives the imperative control handle once mounted. */
  controlRef?: React.MutableRefObject<QpitControl | null>;
  /** fires when a special moment completes. */
  onSpecial?: (kind: QpitSpecial) => void;
  children: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const [mode, setMode] = useState<QpitMode>("docked");
  const [ghosts, setGhosts] = useState<{ x: number; y: number } | null>(null);
  const [anomaly, setAnomaly] = useState<{ x: number; y: number } | null>(null);
  const [twin, setTwin] = useState<{ x: number; y: number } | null>(null);
  const [portals, setPortals] = useState<{ a: { x: number; y: number }; b: { x: number; y: number } } | null>(null);

  // --- refs: everything the rAF loop touches ------------------------------
  const bodyRef = useRef<HTMLDivElement>(null);
  const legsRef = useRef<HTMLDivElement>(null);
  const tetherRef = useRef<SVGPathElement>(null);
  const tetherSvgRef = useRef<SVGSVGElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const modeRef = useRef<QpitMode>("docked");
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const thetaRef = useRef({ a: 0, v: 0 }); // swing angle (deg) + angular velocity
  const cursorRef = useRef({ x: 0, y: 0 });
  const cursorSpeedRef = useRef(0);
  const lastMoveAtRef = useRef(0);
  const lastCursorAngleRef = useRef<number | null>(null);
  const windingRef = useRef(0);
  const emotionRef = useRef<QpitEmotionState>({ emotion: "IDLE", since: 0 });
  const lastEmotionTickRef = useRef(0);
  const lastSpecialAtRef = useRef(0);
  const sessionStartRef = useRef(0);
  const specialRef = useRef<{
    kind: QpitSpecial;
    phase: number;
    until: number;
    data?: { ax: number; ay: number; bx: number; by: number };
  } | null>(null);
  const shakeCountRef = useRef(0);
  const lastBlackHoleAtRef = useRef(0);
  const grabRef = useRef({ active: false, offX: 0, offY: 0, tx: 0, ty: 0, vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0 });
  const flungRef = useRef(false);
  const lastVxSignRef = useRef(0);
  const lastShakeAtRef = useRef(0);
  const trailSampleAtRef = useRef(0);
  const trailBufRef = useRef<{ x: number; y: number }[]>([]);
  const lastTimeRef = useRef<number | null>(null);
  const randRef = useRef(Math.random);

  const setModeSafe = useCallback(
    (next: QpitMode) => {
      if (modeRef.current === next) return;
      modeRef.current = next;
      setMode(next);
      onModeChange?.(next);
    },
    [onModeChange],
  );

  const goHome = useCallback(() => {
    const dock = dockPosition();
    targetRef.current.x = dock.x;
    targetRef.current.y = dock.y;
    setModeSafe("docked");
  }, [setModeSafe]);

  // Dock instantly on mount (post-hydration, before the entrance scales in).
  useEffect(() => {
    const dock = dockPosition();
    posRef.current = { ...dock };
    targetRef.current = { ...dock };
    sessionStartRef.current = performance.now();
    lastMoveAtRef.current = performance.now();
    emotionRef.current = { emotion: "IDLE", since: performance.now() };
    // First special becomes eligible ~30s after mount (not a full cooldown).
    lastSpecialAtRef.current = performance.now() - (SPECIAL_COOLDOWN_MS - 30_000);
  }, []);

  // Poke → a small upward hop with recoil.
  const pokeSeen = useRef(pokeSignal);
  const pokeTimesRef = useRef<number[]>([]);
  const flingHeatRef = useRef(0);
  useEffect(() => {
    if (pokeSignal === pokeSeen.current) return;
    pokeSeen.current = pokeSignal;
    pokeTimesRef.current.push(performance.now());
    velRef.current.y -= 420;
    thetaRef.current.v += (randRef.current() < 0.5 ? -1 : 1) * 260;
  }, [pokeSignal]);

  // Celebration (e.g. VQE converged) → a bigger hop and a joyful spin.
  const celebrateSeen = useRef(celebrateSignal);
  useEffect(() => {
    if (celebrateSignal === celebrateSeen.current) return;
    celebrateSeen.current = celebrateSignal;
    velRef.current.y -= 540;
    thetaRef.current.v += 430;
  }, [celebrateSignal]);

  // Opens the anomaly a little away from QPIT, off to one side.
  const triggerBlackHole = useCallback(
    (now: number) => {
      lastBlackHoleAtRef.current = now;
      lastSpecialAtRef.current = now;
      const side = randRef.current() < 0.5 ? -1 : 1;
      const axp = Math.min(window.innerWidth - 110, Math.max(110, posRef.current.x + side * 200));
      const ayp = Math.min(window.innerHeight - 110, Math.max(110, posRef.current.y - 60 + randRef.current() * 120));
      specialRef.current = { kind: "BLACKHOLE", phase: 0, until: now + 3600, data: { ax: axp, ay: ayp, bx: 0, by: 0 } };
      setAnomaly({ x: axp, y: ayp });
      onSpecialStart?.("BLACKHOLE");
    },
    [onSpecialStart],
  );

  const startSuperposition = useCallback((now: number) => {
    lastSpecialAtRef.current = now;
    specialRef.current = { kind: "SUPERPOSITION", phase: 0, until: now + 1150 };
    setGhosts({ x: posRef.current.x, y: posRef.current.y });
  }, []);

  const startEntangle = useCallback((now: number): boolean => {
    const pos = posRef.current;
    const candidates: { x: number; y: number }[] = [];
    for (const el of document.querySelectorAll('a[href^="/"], [data-qpit]')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > window.innerHeight) continue;
      const cx2 = r.left + r.width / 2;
      const cy2 = r.top + r.height / 2;
      if (Math.hypot(cx2 - pos.x, cy2 - pos.y) > 260) candidates.push({ x: cx2, y: cy2 });
    }
    if (candidates.length === 0) return false;
    const pick = candidates[Math.min(candidates.length - 1, Math.floor(randRef.current() * candidates.length))];
    lastSpecialAtRef.current = now;
    specialRef.current = { kind: "ENTANGLE", phase: 0, until: now + 1800 };
    setTwin(pick);
    return true;
  }, []);

  const startWormhole = useCallback((now: number) => {
    const pos = posRef.current;
    const vel = velRef.current;
    const spd = Math.hypot(vel.x, vel.y);
    const ang = randRef.current() * Math.PI * 2;
    const dx = spd > 40 ? vel.x / spd : Math.cos(ang);
    const dy = spd > 40 ? vel.y / spd : Math.sin(ang);
    const axp = Math.min(window.innerWidth - 80, Math.max(80, pos.x + dx * 130));
    const ayp = Math.min(window.innerHeight - 80, Math.max(80, pos.y + dy * 130));
    let bxp = 0;
    let byp = 0;
    for (let tries = 0; tries < 8; tries++) {
      bxp = 90 + randRef.current() * (window.innerWidth - 180);
      byp = 90 + randRef.current() * (window.innerHeight - 180);
      if (Math.hypot(bxp - axp, byp - ayp) > 320) break;
    }
    lastSpecialAtRef.current = now;
    specialRef.current = { kind: "WORMHOLE", phase: 0, until: now + 900, data: { ax: axp, ay: ayp, bx: bxp, by: byp } };
    targetRef.current.x = axp;
    targetRef.current.y = ayp;
    setModeSafe("roaming");
    setPortals({ a: { x: axp, y: ayp }, b: { x: bxp, y: byp } });
  }, [setModeSafe]);

  // Imperative control for the UI layer: grab-and-fling, and forced moments.
  useEffect(() => {
    if (!controlRef) return;
    controlRef.current = {
      grab: (x, y) => {
        const g = grabRef.current;
        g.active = true;
        g.offX = x - posRef.current.x;
        g.offY = y - posRef.current.y;
        g.tx = posRef.current.x;
        g.ty = posRef.current.y;
        g.lastX = x;
        g.lastY = y;
        g.lastT = performance.now();
        g.vx = 0;
        g.vy = 0;
        flungRef.current = false;
      },
      drag: (x, y) => {
        const g = grabRef.current;
        if (!g.active) return;
        const now = performance.now();
        const dt = Math.max(8, now - g.lastT) / 1000;
        g.vx = g.vx * 0.5 + ((x - g.lastX) / dt) * 0.5;
        g.vy = g.vy * 0.5 + ((y - g.lastY) / dt) * 0.5;
        g.lastX = x;
        g.lastY = y;
        g.lastT = now;
        g.tx = x - g.offX;
        g.ty = y - g.offY;
      },
      release: (vx, vy) => {
        const g = grabRef.current;
        if (!g.active) return;
        g.active = false;
        const ux = Number.isFinite(vx) ? vx : g.vx;
        const uy = Number.isFinite(vy) ? vy : g.vy;
        const cap = 2600;
        velRef.current.x = Math.max(-cap, Math.min(cap, ux));
        velRef.current.y = Math.max(-cap, Math.min(cap, uy));
        flungRef.current = true;
        if (Math.hypot(velRef.current.x, velRef.current.y) > 1400) {
          flingHeatRef.current = Math.min(1, flingHeatRef.current + 0.45);
        }
        lastMoveAtRef.current = performance.now();
        setModeSafe("roaming");
      },
      trigger: (kind) => {
        if (specialRef.current) return false;
        const now = performance.now();
        if (kind === "BLACKHOLE") {
          triggerBlackHole(now);
          return true;
        }
        if (kind === "SUPERPOSITION") {
          startSuperposition(now);
          return true;
        }
        if (kind === "WORMHOLE") {
          startWormhole(now);
          return true;
        }
        if (kind === "ENTANGLE") return startEntangle(now);
        if (kind === "TUNNEL") {
          lastSpecialAtRef.current = now;
          specialRef.current = { kind: "TUNNEL", phase: 0, until: now + 220 };
          goHome();
          return true;
        }
        return false;
      },
    };
    return () => {
      controlRef.current = null;
    };
  }, [controlRef, triggerBlackHole, startSuperposition, startWormhole, startEntangle, goHome, setModeSafe]);

  // Touch devices have no pointermove stream: taps and scrolls count as
  // activity so QPIT wakes, floats, and reacts instead of dozing off.
  useEffect(() => {
    if (interactive) return;
    const onActivity = () => {
      lastMoveAtRef.current = performance.now();
    };
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("scroll", onActivity, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("scroll", onActivity);
    };
  }, [interactive]);

  // --- pointer wiring -----------------------------------------------------
  useEffect(() => {
    if (!interactive) {
      goHome();
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const now = performance.now();
      const prev = cursorRef.current;
      const dt = Math.max(1, now - lastMoveAtRef.current);
      const distMoved = Math.hypot(event.clientX - prev.x, event.clientY - prev.y);
      const inst = Math.min(6000, (distMoved / dt) * 1000);
      cursorSpeedRef.current = cursorSpeedRef.current * 0.7 + inst * 0.3;
      lastMoveAtRef.current = now;
      cursorRef.current = { x: event.clientX, y: event.clientY };

      // Shake detection: fast horizontal direction reversals summon anomalies.
      const moveDx = event.clientX - prev.x;
      const vxSign = Math.sign(moveDx);
      if (vxSign !== 0) {
        if (
          lastVxSignRef.current !== 0 &&
          vxSign !== lastVxSignRef.current &&
          cursorSpeedRef.current > 700
        ) {
          if (now - lastShakeAtRef.current > 1200) shakeCountRef.current = 0;
          shakeCountRef.current += 1;
          lastShakeAtRef.current = now;
          if (
            !reduceMotion &&
            modeRef.current === "roaming" &&
            !specialRef.current &&
            maybeBlackHole(shakeCountRef.current, now, lastBlackHoleAtRef.current, randRef.current)
          ) {
            shakeCountRef.current = 0;
            triggerBlackHole(now);
          }
        }
        lastVxSignRef.current = vxSign;
      }

      // Winding: how far the cursor has circled around QPIT (nearby only).
      const dx = event.clientX - posRef.current.x;
      const dy = event.clientY - posRef.current.y;
      if (Math.hypot(dx, dy) < 280) {
        const ang = Math.atan2(dy, dx);
        if (lastCursorAngleRef.current !== null) {
          windingRef.current += wrapAngle(ang - lastCursorAngleRef.current);
        }
        lastCursorAngleRef.current = ang;
      } else {
        lastCursorAngleRef.current = null;
      }

      // During a wormhole transit, a grab, or a fling, the cursor doesn't own the target.
      if (specialRef.current?.kind !== "WORMHOLE" && !grabRef.current.active && !flungRef.current) {
        const maxX = window.innerWidth - EDGE_MARGIN;
        const maxY = window.innerHeight - EDGE_MARGIN;
        targetRef.current.x = Math.min(maxX, Math.max(EDGE_MARGIN, event.clientX));
        targetRef.current.y = Math.min(maxY, Math.max(EDGE_MARGIN, event.clientY + TETHER_DROP));
      }
      setModeSafe("roaming");
    };

    const onLeave = () => {
      // Rarely, a fast exit makes QPIT tunnel home instead of springing.
      const now = performance.now();
      if (
        !reduceMotion &&
        modeRef.current === "roaming" &&
        !specialRef.current &&
        maybeTunnelHome(cursorSpeedRef.current, now, lastSpecialAtRef.current, randRef.current)
      ) {
        lastSpecialAtRef.current = now;
        specialRef.current = { kind: "TUNNEL", phase: 0, until: now + 220 };
      }
      goHome();
    };
    const onResize = () => {
      if (modeRef.current === "docked") goHome();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [interactive, reduceMotion, goHome, setModeSafe, triggerBlackHole]);

  // --- the one loop: physics, emotion, tether, trail, specials ------------
  useAnimationFrame((t) => {
    const now = performance.now();
    const last = lastTimeRef.current ?? t;
    const dt = Math.min(1 / 30, Math.max(0.001, (t - last) / 1000));
    lastTimeRef.current = t;

    const body = bodyRef.current;
    if (!body) return;

    const pos = posRef.current;
    const vel = velRef.current;
    const target = targetRef.current;
    const emotion = emotionRef.current.emotion;
    const params = QPIT_PARAMS[emotion];

    // Idle → drift home.
    if (modeRef.current === "roaming" && now - lastMoveAtRef.current > IDLE_DOCK_MS && !grabRef.current.active && !flungRef.current) {
      goHome();
    }

    // Cursor-speed decay when the mouse is still; winding decay always.
    if (now - lastMoveAtRef.current > 120) {
      cursorSpeedRef.current *= Math.exp(-dt * 3);
    }
    windingRef.current *= Math.exp(-dt / 2.5);

    // Emotion tick (throttled) + ambient specials.
    if (now - lastEmotionTickRef.current > EMOTION_TICK_MS) {
      lastEmotionTickRef.current = now;
      pokeTimesRef.current = pokeTimesRef.current.filter((t) => now - t < ANGER_WINDOW_MS);
      flingHeatRef.current *= 0.93;
      const inputs = {
        now,
        mode: modeRef.current,
        cursorSpeed: cursorSpeedRef.current,
        msSinceMove: now - lastMoveAtRef.current,
        winding: windingRef.current,
        annoyance: pokeTimesRef.current.length / ANGER_POKES + flingHeatRef.current,
      };
      const next = advanceEmotion(emotionRef.current, inputs);
      if (next !== emotionRef.current) {
        const prev = emotionRef.current.emotion;
        emotionRef.current = next;
        // Surprise recoil: dart away from the cursor, then recover.
        if ((next.emotion === "SURPRISED" || next.emotion === "ANGRY") && !reduceMotion) {
          const dx = pos.x - cursorRef.current.x;
          const dy = pos.y - cursorRef.current.y;
          const d = Math.hypot(dx, dy) || 1;
          vel.x += (dx / d) * 520;
          vel.y += (dy / d) * 520;
        }
        const tether = EMOTION_TETHER[next.emotion];
        tetherRef.current?.setAttribute("stroke", tether.stroke);
        tetherRef.current?.setAttribute("stroke-opacity", String(tether.opacity));
        onEmotionChange?.(next.emotion, prev);
      }
      if (
        !reduceMotion &&
        !specialRef.current &&
        maybeSuperposition(emotionRef.current, inputs, lastSpecialAtRef.current, sessionStartRef.current, randRef.current)
      ) {
        startSuperposition(now);
      }

      // Entanglement: pair up with a distant on-page link, pulse in sync.
      if (
        !reduceMotion &&
        !specialRef.current &&
        maybeEntangle(emotionRef.current, inputs, lastSpecialAtRef.current, sessionStartRef.current, randRef.current)
      ) {
        startEntangle(now);
      }

      // Wormhole: a portal pair opens; QPIT dives in and exits far away.
      const petSpeedNow = Math.hypot(vel.x, vel.y);
      if (
        !reduceMotion &&
        !specialRef.current &&
        maybeWormhole(petSpeedNow, emotionRef.current, inputs, lastSpecialAtRef.current, sessionStartRef.current, randRef.current)
      ) {
        startWormhole(now);
      }

      // Black holes also open unprovoked now and then.
      if (
        !reduceMotion &&
        !specialRef.current &&
        maybeAmbientBlackHole(inputs, lastBlackHoleAtRef.current, sessionStartRef.current, randRef.current)
      ) {
        triggerBlackHole(now);
      }
    }

    // Special progression.
    let special = specialRef.current;
    // Wormhole entry is distance-triggered, not just time-triggered.
    if (special?.kind === "WORMHOLE" && special.phase === 0 && special.data) {
      const dEntry = Math.hypot(pos.x - special.data.ax, pos.y - special.data.ay);
      if (dEntry < 26) special.until = now - 1; // arrived, advance now
    }
    if (special && now > special.until) {
      if (special.kind === "TUNNEL" && special.phase === 0) {
        // Mid-tunnel: jump home instantly, then flicker back in.
        const dock = dockPosition();
        posRef.current = { ...dock };
        targetRef.current = { ...dock };
        velRef.current = { x: 0, y: 0 };
        specialRef.current = { kind: "TUNNEL", phase: 1, until: now + 220 };
      } else if (special.kind === "BLACKHOLE" && special.phase === 0 && special.data) {
        // Escape: a hard shove away from the anomaly, which begins to collapse.
        const dx = pos.x - special.data.ax;
        const dy = pos.y - special.data.ay;
        const d = Math.hypot(dx, dy) || 1;
        vel.x += (dx / d) * 760;
        vel.y += (dy / d) * 760;
        specialRef.current = { ...special, phase: 1, until: now + 1300 };
      } else if (special.kind === "WORMHOLE" && special.phase === 0 && special.data) {
        // Transit: vanish at portal A, reappear at portal B with momentum kept.
        posRef.current = { x: special.data.bx, y: special.data.by };
        velRef.current = { x: vel.x * 0.5, y: vel.y * 0.5 };
        specialRef.current = { ...special, phase: 1, until: now + 180 };
      } else if (special.kind === "WORMHOLE" && special.phase === 1) {
        // Exit settle: portals collapse; the cursor owns the target again.
        const maxX = window.innerWidth - EDGE_MARGIN;
        const maxY = window.innerHeight - EDGE_MARGIN;
        targetRef.current.x = Math.min(maxX, Math.max(EDGE_MARGIN, cursorRef.current.x));
        targetRef.current.y = Math.min(maxY, Math.max(EDGE_MARGIN, cursorRef.current.y + TETHER_DROP));
        specialRef.current = { ...special, phase: 2, until: now + 420 };
        setPortals(null);
      } else {
        if (special.kind === "SUPERPOSITION") setGhosts(null);
        if (special.kind === "BLACKHOLE") setAnomaly(null);
        if (special.kind === "ENTANGLE") setTwin(null);
        specialRef.current = null;
        onSpecial?.(special.kind);
      }
      special = specialRef.current;
    }

    // --- integrate position (semi-implicit Euler, per-emotion params) ---
    const noise = reduceMotion ? 0 : params.noise;
    const nx = noise ? (randRef.current() - 0.5) * noise * 900 : 0;
    const ny = noise ? (randRef.current() - 0.5) * noise * 900 : 0;
    // Idle micro-wander: while docked and content, QPIT drifts on a slow
    // Lissajous path around its dock, alive, not twitchy.
    let wanderX = 0;
    let wanderY = 0;
    if (
      !reduceMotion &&
      modeRef.current === "docked" &&
      (emotion === "IDLE" || emotion === "CURIOUS")
    ) {
      const amp = interactive ? 1 : 1.9; // phones get a bigger float
      wanderX = 8 * amp * Math.sin(t * 0.00042);
      wanderY = 6 * amp * Math.sin(t * 0.00031 + 1.3);
    }
    let ax = params.stiffness * (target.x + wanderX - pos.x) - params.damping * vel.x + nx;
    let ay = params.stiffness * (target.y + wanderY - pos.y) - params.damping * vel.y + ny;

    // Black-hole pull: an inverse-square-ish tug toward the anomaly, capped so
    // the tether visibly strains but QPIT never actually falls in.
    if (special?.kind === "BLACKHOLE" && special.phase === 0 && special.data) {
      const dx = special.data.ax - pos.x;
      const dy = special.data.ay - pos.y;
      const d = Math.hypot(dx, dy) || 1;
      const pull = Math.min(1700, 3.2e7 / (d * d + 3000));
      ax += (dx / d) * pull;
      ay += (dy / d) * pull;
    }

    const grab = grabRef.current;
    if (grab.active) {
      // Held: track the pointer 1:1 (respecting the grab offset), remember velocity.
      pos.x = grab.tx;
      pos.y = grab.ty;
      vel.x = grab.vx;
      vel.y = grab.vy;
    } else if (flungRef.current) {
      // Thrown: light drag, rubber-band off the viewport edges, settle -> home.
      vel.x -= vel.x * 1.1 * dt;
      vel.y -= vel.y * 1.1 * dt;
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;
      const minX = EDGE_MARGIN;
      const maxX = window.innerWidth - EDGE_MARGIN;
      const minY = EDGE_MARGIN;
      const maxY = window.innerHeight - EDGE_MARGIN;
      if (pos.x < minX) { pos.x = minX; vel.x = Math.abs(vel.x) * 0.55; }
      if (pos.x > maxX) { pos.x = maxX; vel.x = -Math.abs(vel.x) * 0.55; }
      if (pos.y < minY) { pos.y = minY; vel.y = Math.abs(vel.y) * 0.55; }
      if (pos.y > maxY) { pos.y = maxY; vel.y = -Math.abs(vel.y) * 0.55; }
      if (Math.hypot(vel.x, vel.y) < 60) {
        flungRef.current = false;
        goHome();
      }
    } else {
      vel.x += ax * dt;
      vel.y += ay * dt;
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;
    }

    // --- pendulum swing (own underdamped spring on the angle) ---
    const theta = thetaRef.current;
    const swingTarget = Math.max(
      -SWING_MAX_DEG,
      Math.min(SWING_MAX_DEG, -vel.x * 0.022 * params.swingGain),
    );
    const orbitSpin = emotion === "ORBITING" ? 40 : 0; // gentle celebratory spin
    const aTheta = 180 * (swingTarget - theta.a) - 9 * theta.v;
    theta.v += (aTheta + orbitSpin) * dt * (reduceMotion ? 0.3 : 1);
    theta.a += theta.v * dt;

    // --- squash & stretch + breathing ---
    const speed = Math.hypot(vel.x, vel.y);
    const s = reduceMotion ? 0 : Math.min(0.22, speed / 2600);
    let sx = 1;
    let sy = 1;
    if (Math.abs(vel.x) >= Math.abs(vel.y)) {
      sx = 1 + s;
      sy = 1 - 0.55 * s;
    } else {
      sy = 1 + s;
      sx = 1 - 0.55 * s;
    }
    if (speed < 60 && params.breatheAmp > 0 && !reduceMotion) {
      const breathe = params.breatheAmp * Math.sin((t / 1000) * params.breatheHz * Math.PI * 2);
      sx += breathe;
      sy += breathe;
    }

    // Pseudo-depth: lower on the page reads as slightly nearer.
    if (!reduceMotion && typeof window !== "undefined") {
      const depth = 0.94 + 0.12 * Math.min(1, Math.max(0, pos.y / window.innerHeight));
      sx *= depth;
      sy *= depth;
    }

    // Gaze: look along the velocity when moving, else toward the cursor.
    if (visualRef?.current) {
      visualRef.current.petX = pos.x;
      visualRef.current.petY = pos.y;
      const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
      if (speed > 90) {
        visualRef.current.gazeX = clamp1(vel.x / 900);
        visualRef.current.gazeY = clamp1(vel.y / 900);
      } else if (modeRef.current === "roaming") {
        visualRef.current.gazeX = clamp1((cursorRef.current.x - pos.x) / 260);
        visualRef.current.gazeY = clamp1((cursorRef.current.y - pos.y) / 260);
      } else {
        visualRef.current.gazeX *= 0.98;
        visualRef.current.gazeY *= 0.98;
      }
    }

    // --- special-moment visuals on the body ---
    let opacity = 1;
    if (special?.kind === "TUNNEL") {
      const flicker = 0.35 + 0.65 * Math.abs(Math.sin(now / 24));
      opacity = flicker;
      sy *= 0.55;
      sx *= 1.3;
    } else if (special?.kind === "WORMHOLE") {
      if (special.phase === 0) {
        // Anticipation: lean into the dive, compressing slightly.
        sx *= 1.12;
        sy *= 0.9;
      } else if (special.phase === 1) {
        opacity = 0; // in transit between portals
      } else {
        // Fade back in over the settle window.
        const settled = 1 - Math.min(1, (special.until - now) / 420);
        opacity = 0.4 + 0.6 * settled;
      }
    } else if (special?.kind === "ENTANGLE") {
      // Sync pulse, the twin's CSS pulse runs at the same ~4Hz.
      const pulse = 1 + 0.07 * Math.sin(now / 40);
      sx *= pulse;
      sy *= pulse;
    } else if (special?.kind === "BLACKHOLE" && special.phase === 0 && special.data) {
      // Strain: stretch along the pull direction.
      const d = Math.hypot(special.data.ax - pos.x, special.data.ay - pos.y);
      const strain = Math.min(0.18, 60 / (d + 40));
      sx *= 1 + strain;
      sy *= 1 - 0.5 * strain;
    }

    body.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${theta.a}deg) scale(${sx}, ${sy})`;
    // Crawl mode: fast, mostly horizontal scooting low on the page grows six ink legs.
    if (legsRef.current) {
      const crawling =
        !reduceMotion &&
        modeRef.current === "roaming" &&
        speed > 240 &&
        Math.abs(vel.x) > Math.abs(vel.y) * 1.3 &&
        pos.y > window.innerHeight * 0.55;
      legsRef.current.style.opacity = crawling ? "1" : "0";
      legsRef.current.style.transform = `translateX(-50%) scaleX(${vel.x < 0 ? -1 : 1})`;
    }
    body.style.opacity = String(opacity);

    // --- tether ---
    const path = tetherRef.current;
    const svg = tetherSvgRef.current;
    if (path && svg) {
      if (
        modeRef.current !== "roaming" ||
        special?.kind === "TUNNEL" ||
        (special?.kind === "WORMHOLE" && special.phase === 1)
      ) {
        svg.style.opacity = "0";
      } else {
        svg.style.opacity = "1";
        const { x: cx, y: cy } = cursorRef.current;
        const px = pos.x;
        const py = pos.y - 34;
        const dist = Math.hypot(px - cx, py - cy);
        const sag = Math.max(0, TETHER_DROP - dist) * 0.6 + 8;
        let midX = (cx + px) / 2;
        let midY = (cy + py) / 2 + sag;
        // Gravitational lensing, loosely: the tether bows toward the anomaly.
        if (special?.kind === "BLACKHOLE" && special.phase === 0 && special.data) {
          midX += (special.data.ax - midX) * 0.35;
          midY += (special.data.ay - midY) * 0.35;
        }
        path.setAttribute("d", `M ${cx} ${cy} Q ${midX} ${midY} ${px} ${py}`);
        // Dash flow speeds up with motion, the tether feels energized.
        path.setAttribute("stroke-dashoffset", String(-(t / 1000) * (20 + speed * 0.15)));
      }
    }

    // --- speed trail (3 fading ghosts, sampled every ~45ms) ---
    if (!reduceMotion && speed > TRAIL_MIN_SPEED && now - trailSampleAtRef.current > 45) {
      trailSampleAtRef.current = now;
      trailBufRef.current.unshift({ x: pos.x, y: pos.y });
      trailBufRef.current.length = Math.min(trailBufRef.current.length, TRAIL_LEN);
    }
    for (let i = 0; i < TRAIL_LEN; i++) {
      const node = trailRefs.current[i];
      if (!node) continue;
      const sample = trailBufRef.current[i];
      const show = sample && speed > TRAIL_MIN_SPEED * 0.7 && !reduceMotion;
      node.style.opacity = show ? String(0.16 * (1 - i / TRAIL_LEN)) : "0";
      if (sample) node.style.transform = `translate3d(${sample.x}px, ${sample.y}px, 0)`;
    }
  });

  if (!hydrated) return null;

  return (
    <>
      <svg
        ref={tetherSvgRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 h-full w-full transition-opacity duration-300"
        style={{ opacity: 0 }}
      >
        <path
          ref={tetherRef}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.35"
          strokeDasharray="1 5"
        />
      </svg>

      {/* speed-trail ghosts */}
      {Array.from({ length: TRAIL_LEN }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-30 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            opacity: 0,
            background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 70%)",
          }}
        />
      ))}

      {/* superposition ghosts, two faint possible positions, then collapse */}
      {ghosts && (
        <>
          {[
            { dx: -38, dy: -26 },
            { dx: 38, dy: 22 },
          ].map((g, i) => (
            <motion.div
              key={i}
              aria-hidden
              className="pointer-events-none fixed left-0 top-0 z-30 h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px]"
              style={{
                background:
                  i === 0
                    ? "radial-gradient(circle, color-mix(in srgb, var(--accent) 45%, transparent) 0%, transparent 72%)"
                    : "radial-gradient(circle, color-mix(in srgb, var(--accent-2) 45%, transparent) 0%, transparent 72%)",
                x: ghosts.x + g.dx,
                y: ghosts.y + g.dy,
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.7, 0.55, 0], scale: [0.6, 1, 1, 0.4] }}
              transition={{ duration: 1.15, times: [0, 0.25, 0.75, 1] }}
            />
          ))}
        </>
      )}

      {/* black-hole anomaly, a lensed look: photon ring around a true-black
          core, with a wide accretion disk stretched out to both sides.
          Hoverable on purpose: QPIT explains what it (metaphorically) is. */}
      {anomaly && (
        <motion.div
          aria-hidden
          className="fixed left-0 top-0 -z-[5] -translate-x-1/2 -translate-y-1/2 cursor-help opacity-90"
          style={{ x: anomaly.x, y: anomaly.y }}
          onPointerEnter={() => onAnomalyHover?.()}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* accretion disk: stretched far to both sides, seen edge-on */}
          <div
            className="absolute left-1/2 top-1/2 h-[150px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
            style={{
              transform: "translate(-50%, -50%) scaleY(0.28)",
              border: "3px solid transparent",
              background:
                "linear-gradient(90deg, color-mix(in srgb, #46617c 75%, transparent), color-mix(in srgb, #9fb4cc 90%, transparent), color-mix(in srgb, #46617c 75%, transparent)) border-box",
              WebkitMask: "linear-gradient(#fff 0 0) padding box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              filter: "blur(1px)",
              animation: "qpit-spin 2.6s linear infinite",
            }}
          />
          {/* photon ring: thin, bright, hugging the shadow */}
          <div
            className="h-[150px] w-[150px] rounded-full"
            style={{
              border: "1.5px solid #9fb4cc",
              boxShadow:
                "0 0 14px rgba(70, 97, 124, 0.35), inset 0 0 10px rgba(70, 97, 124, 0.25)",
            }}
          />
          {/* the shadow: fully black */}
          <div
            className="absolute left-1/2 top-1/2 h-[126px] w-[126px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, #000 0%, #000 68%, transparent 85%)" }}
          />
        </motion.div>
      )}

      {/* entanglement twin, a distant particle pulsing in sync with QPIT */}
      {twin && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-30 -translate-x-1/2 -translate-y-1/2"
          style={{ x: twin.x, y: twin.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
          transition={{ duration: 1.8, times: [0, 0.15, 0.85, 1] }}
        >
          <div
            className="h-5 w-5 rounded-full"
            style={{
              background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 85%, white) 0%, transparent 70%)",
              animation: "qpit-twin 0.25s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              border: "1px solid color-mix(in srgb, var(--accent) 50%, transparent)",
              animation: "qpit-twin 0.25s ease-in-out infinite alternate-reverse",
            }}
          />
        </motion.div>
      )}

      {/* wormhole portals, entry (blue) and exit (green) rings */}
      {portals &&
        [
          { p: portals.a, color: "var(--accent)" },
          { p: portals.b, color: "var(--accent-2)" },
        ].map((portal, i) => (
          <motion.div
            key={i}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-30 -translate-x-1/2 -translate-y-1/2"
            style={{ x: portal.p.x, y: portal.p.y }}
            initial={{ opacity: 0, scale: 0.2, rotate: -60 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="h-[46px] w-[46px] rounded-full"
              style={{
                border: `1.5px solid color-mix(in srgb, ${portal.color} 75%, transparent)`,
                boxShadow: `0 0 14px color-mix(in srgb, ${portal.color} 40%, transparent), inset 0 0 10px color-mix(in srgb, ${portal.color} 30%, transparent)`,
                animation: "qpit-spin 1.6s linear infinite",
                borderStyle: "dashed",
              }}
            />
          </motion.div>
        ))}

      {/* Outer div: transform/opacity owned exclusively by the rAF integrator. */}
      <div
        ref={bodyRef}
        className="fixed left-0 top-0 z-40"
        style={{
          transformOrigin: "50% -58px",
          pointerEvents: mode === "roaming" ? "none" : undefined,
        }}
      >
        {/* Inner wrapper: framer owns only the one-time entrance. */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.4 }}
        >
          <div className="-translate-x-1/2 -translate-y-1/2">{children}</div>
        </motion.div>
        {/* six ink legs; the loop shows them only while scuttling low across the page */}
        <div ref={legsRef} className="qpit-legs" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ ["--leg" as string]: i }} />
          ))}
        </div>
      </div>
    </>
  );
}
