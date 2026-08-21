"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

/**
 * QPIT's motion layer: a spring-tethered cursor follower.
 *
 * Model: the cursor holds an invisible tether; QPIT hangs ~90px below it and
 * is dragged around by spring physics (lag, overshoot, settle). Horizontal
 * velocity swings it like a pendulum around the tether attachment point.
 * After a few idle seconds — or on touch devices / reduced motion — QPIT
 * returns to its dock in the bottom-right corner.
 *
 * Performance: cursor tracking writes framer-motion MotionValues directly and
 * the tether path is updated via a ref inside useAnimationFrame — zero React
 * re-renders per pointer move. The only state transitions are dock ↔ roam.
 */

const TETHER_DROP = 92; // px QPIT hangs below the cursor
const IDLE_DOCK_MS = 3500; // return home after this much cursor stillness
const EDGE_MARGIN = 56; // keep QPIT this far inside the viewport

const FOLLOW_SPRING = { stiffness: 110, damping: 13, mass: 0.9 };
const SWING_SPRING = { stiffness: 170, damping: 9, mass: 0.8 }; // underdamped → playful overshoot

export type QpitMode = "docked" | "roaming";

const emptySubscribe = () => () => {};
/** False during SSR and hydration, true after — QPIT is client-only chrome. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

function dockPosition(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: window.innerWidth - EDGE_MARGIN - 24,
    y: window.innerHeight - EDGE_MARGIN - 28,
  };
}

export function QpitPhysics({
  interactive,
  onModeChange,
  children,
}: {
  /** false → permanently docked (touch devices, prefers-reduced-motion). */
  interactive: boolean;
  onModeChange?: (mode: QpitMode) => void;
  children: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const [mode, setMode] = useState<QpitMode>("docked");
  const modeRef = useRef<QpitMode>("docked");
  const lastMoveAtRef = useRef(0);
  const cursorRef = useRef({ x: 0, y: 0 });
  const tetherRef = useRef<SVGPathElement>(null);
  const tetherSvgRef = useRef<SVGSVGElement>(null);

  // Raw target the springs chase. Initialized to 0,0 so the server render and
  // the first client render agree (no window access before hydration); the
  // mount effect below jumps everything to the dock before QPIT scales in.
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, FOLLOW_SPRING);
  const y = useSpring(targetY, FOLLOW_SPRING);

  // Pendulum swing from horizontal velocity, springed for wobble + settle.
  const vx = useVelocity(x);
  const swingTarget = useTransform(vx, [-1400, 1400], [26, -26], { clamp: true });
  const rotate = useSpring(swingTarget, SWING_SPRING);

  const setModeSafe = useCallback(
    (next: QpitMode) => {
      if (modeRef.current === next) return;
      modeRef.current = next;
      setMode(next);
      onModeChange?.(next);
    },
    [onModeChange],
  );

  // Snap the target to the dock (springs animate the trip home).
  const goHome = useCallback(() => {
    const dock = dockPosition();
    targetX.set(dock.x);
    targetY.set(dock.y);
    setModeSafe("docked");
  }, [targetX, targetY, setModeSafe]);

  // Place QPIT at its dock instantly on mount (post-hydration, pre-entrance).
  useEffect(() => {
    const dock = dockPosition();
    targetX.jump(dock.x);
    targetY.jump(dock.y);
    x.jump(dock.x);
    y.jump(dock.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    if (!interactive) {
      goHome();
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      lastMoveAtRef.current = performance.now();
      cursorRef.current = { x: event.clientX, y: event.clientY };
      const maxX = window.innerWidth - EDGE_MARGIN;
      const maxY = window.innerHeight - EDGE_MARGIN;
      targetX.set(Math.min(maxX, Math.max(EDGE_MARGIN, event.clientX)));
      targetY.set(Math.min(maxY, Math.max(EDGE_MARGIN, event.clientY + TETHER_DROP)));
      setModeSafe("roaming");
    };
    const onLeave = () => goHome();
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
  }, [interactive, goHome, setModeSafe, targetX, targetY]);

  // Idle timeout + tether path, both off the React render path.
  useAnimationFrame(() => {
    if (modeRef.current === "roaming" && performance.now() - lastMoveAtRef.current > IDLE_DOCK_MS) {
      goHome();
    }

    const path = tetherRef.current;
    const svg = tetherSvgRef.current;
    if (!path || !svg) return;
    if (modeRef.current !== "roaming") {
      svg.style.opacity = "0";
      return;
    }
    svg.style.opacity = "1";
    const { x: cx, y: cy } = cursorRef.current;
    const px = x.get();
    const py = y.get() - 34; // attach to QPIT's top edge
    // Slack sags the tether; taut tethers straighten out.
    const dist = Math.hypot(px - cx, py - cy);
    const sag = Math.max(0, TETHER_DROP - dist) * 0.6 + 8;
    path.setAttribute("d", `M ${cx} ${cy} Q ${(cx + px) / 2} ${(cy + py) / 2 + sag} ${px} ${py}`);
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
      <motion.div
        className="fixed left-0 top-0 z-40"
        style={{
          x,
          y,
          rotate,
          transformOrigin: "50% -58px", // swing around the tether attachment above
          pointerEvents: mode === "roaming" ? "none" : undefined,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.4 }}
      >
        {/* Children are centered on the physics point. */}
        <div className="-translate-x-1/2 -translate-y-1/2">{children}</div>
      </motion.div>
    </>
  );
}
