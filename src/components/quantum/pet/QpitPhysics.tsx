"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import {
  advanceEmotion,
  maybeSuperposition,
  maybeTunnelHome,
  QPIT_PARAMS,
  type QpitEmotion,
  type QpitEmotionState,
  type QpitSpecial,
} from "@/lib/quantum/qpitState";

/**
 * QPIT's motion layer: an emotion-driven, spring-tethered cursor follower.
 *
 * The position is integrated by hand (semi-implicit Euler) so the spring
 * stiffness, damping, stochastic jitter, swing response, and breathing can
 * all change live with QPIT's emotional state — something a fixed spring
 * config can't do. Pendulum swing derives from horizontal velocity; squash &
 * stretch derive from speed; a sagging SVG tether links cursor to creature.
 *
 * Special moments (superposition ghosts, tunneling home) are rare,
 * cooldown-gated visual metaphors — creative quantum flavor, not physics
 * claims.
 *
 * Performance: pointer handling and the whole integrator write styles
 * directly to refs inside one rAF loop — zero React re-renders per frame.
 * React state only changes on dock/roam transitions and rare specials.
 */

const TETHER_DROP = 92;
const IDLE_DOCK_MS = 3500;
const EDGE_MARGIN = 56;
const SWING_MAX_DEG = 30;
const EMOTION_TICK_MS = 150;
const TRAIL_LEN = 3;
const TRAIL_MIN_SPEED = 1100;

const EMOTION_TETHER: Record<QpitEmotion, { stroke: string; opacity: number }> = {
  IDLE: { stroke: "var(--accent)", opacity: 0.35 },
  CURIOUS: { stroke: "var(--accent)", opacity: 0.45 },
  EXCITED: { stroke: "var(--accent-2)", opacity: 0.6 },
  SURPRISED: { stroke: "#f59e0b", opacity: 0.7 },
  ORBITING: { stroke: "var(--accent-2)", opacity: 0.5 },
  BORED: { stroke: "var(--accent)", opacity: 0.22 },
  SLEEPING: { stroke: "var(--accent)", opacity: 0.12 },
};

export type QpitMode = "docked" | "roaming";

const emptySubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function dockPosition(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: window.innerWidth - EDGE_MARGIN - 24,
    y: window.innerHeight - EDGE_MARGIN - 28,
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
  onModeChange,
  onEmotionChange,
  onSpecial,
  children,
}: {
  /** false → permanently docked (touch devices, prefers-reduced-motion). */
  interactive: boolean;
  /** true → minimal motion: no jitter, trails, or special moments. */
  reduceMotion: boolean;
  /** increment to give QPIT a little hop (poke reaction). */
  pokeSignal: number;
  onModeChange?: (mode: QpitMode) => void;
  onEmotionChange?: (next: QpitEmotion, prev: QpitEmotion) => void;
  onSpecial?: (kind: QpitSpecial) => void;
  children: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const [mode, setMode] = useState<QpitMode>("docked");
  const [ghosts, setGhosts] = useState<{ x: number; y: number } | null>(null);

  // --- refs: everything the rAF loop touches ------------------------------
  const bodyRef = useRef<HTMLDivElement>(null);
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
  const specialRef = useRef<{ kind: QpitSpecial; phase: number; until: number } | null>(null);
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
  }, []);

  // Poke → a small upward hop with recoil.
  const pokeSeen = useRef(pokeSignal);
  useEffect(() => {
    if (pokeSignal === pokeSeen.current) return;
    pokeSeen.current = pokeSignal;
    velRef.current.y -= 420;
    thetaRef.current.v += (randRef.current() < 0.5 ? -1 : 1) * 260;
  }, [pokeSignal]);

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
      const dist = Math.hypot(event.clientX - prev.x, event.clientY - prev.y);
      const inst = Math.min(6000, (dist / dt) * 1000);
      cursorSpeedRef.current = cursorSpeedRef.current * 0.7 + inst * 0.3;
      lastMoveAtRef.current = now;
      cursorRef.current = { x: event.clientX, y: event.clientY };

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

      const maxX = window.innerWidth - EDGE_MARGIN;
      const maxY = window.innerHeight - EDGE_MARGIN;
      targetRef.current.x = Math.min(maxX, Math.max(EDGE_MARGIN, event.clientX));
      targetRef.current.y = Math.min(maxY, Math.max(EDGE_MARGIN, event.clientY + TETHER_DROP));
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
  }, [interactive, reduceMotion, goHome, setModeSafe]);

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
    if (modeRef.current === "roaming" && now - lastMoveAtRef.current > IDLE_DOCK_MS) {
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
      const inputs = {
        now,
        mode: modeRef.current,
        cursorSpeed: cursorSpeedRef.current,
        msSinceMove: now - lastMoveAtRef.current,
        winding: windingRef.current,
      };
      const next = advanceEmotion(emotionRef.current, inputs);
      if (next !== emotionRef.current) {
        const prev = emotionRef.current.emotion;
        emotionRef.current = next;
        // Surprise recoil: dart away from the cursor, then recover.
        if (next.emotion === "SURPRISED" && !reduceMotion) {
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
        lastSpecialAtRef.current = now;
        specialRef.current = { kind: "SUPERPOSITION", phase: 0, until: now + 1150 };
        setGhosts({ x: pos.x, y: pos.y });
      }
    }

    // Special progression.
    const special = specialRef.current;
    if (special && now > special.until) {
      if (special.kind === "TUNNEL" && special.phase === 0) {
        // Mid-tunnel: jump home instantly, then flicker back in.
        const dock = dockPosition();
        posRef.current = { ...dock };
        targetRef.current = { ...dock };
        velRef.current = { x: 0, y: 0 };
        specialRef.current = { kind: "TUNNEL", phase: 1, until: now + 220 };
      } else {
        if (special.kind === "SUPERPOSITION") setGhosts(null);
        specialRef.current = null;
        onSpecial?.(special.kind);
      }
    }

    // --- integrate position (semi-implicit Euler, per-emotion params) ---
    const noise = reduceMotion ? 0 : params.noise;
    const nx = noise ? (randRef.current() - 0.5) * noise * 900 : 0;
    const ny = noise ? (randRef.current() - 0.5) * noise * 900 : 0;
    const ax = params.stiffness * (target.x - pos.x) - params.damping * vel.x + nx;
    const ay = params.stiffness * (target.y - pos.y) - params.damping * vel.y + ny;
    vel.x += ax * dt;
    vel.y += ay * dt;
    pos.x += vel.x * dt;
    pos.y += vel.y * dt;

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

    // --- tunneling flicker (compress + strobe opacity) ---
    let opacity = 1;
    if (special?.kind === "TUNNEL") {
      const flicker = 0.35 + 0.65 * Math.abs(Math.sin(now / 24));
      opacity = flicker;
      sy *= 0.55;
      sx *= 1.3;
    }

    body.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${theta.a}deg) scale(${sx}, ${sy})`;
    body.style.opacity = String(opacity);

    // --- tether ---
    const path = tetherRef.current;
    const svg = tetherSvgRef.current;
    if (path && svg) {
      if (modeRef.current !== "roaming" || special?.kind === "TUNNEL") {
        svg.style.opacity = "0";
      } else {
        svg.style.opacity = "1";
        const { x: cx, y: cy } = cursorRef.current;
        const px = pos.x;
        const py = pos.y - 34;
        const dist = Math.hypot(px - cx, py - cy);
        const sag = Math.max(0, TETHER_DROP - dist) * 0.6 + 8;
        path.setAttribute("d", `M ${cx} ${cy} Q ${(cx + px) / 2} ${(cy + py) / 2 + sag} ${px} ${py}`);
        // Dash flow speeds up with motion — the tether feels energized.
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

      {/* superposition ghosts — two faint possible positions, then collapse */}
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
      </div>
    </>
  );
}
