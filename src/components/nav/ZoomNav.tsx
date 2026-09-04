"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/components/navItems";


type Phase = "idle" | "collapse" | "think" | "expand";

const FULL = { collapse: 340, think: 800, push: 400, expand: 360 };
const FAST = { collapse: 200, think: 180, push: 120, expand: 240 };
const SEEN_KEY = "zoomnav-seen";

/**
 * Zoom navigation. On a desktop pointer an internal navigation folds the page
 * into a qubit sphere; for most of a second the sphere breathes and streams
 * real Born rule bits (inverse CDF samples of H|0⟩, the same sampler the
 * arcade's RNG uses) as if weighing the path, then the destination expands
 * out of it. About 1.5 s end to end, by design. Phones, reduced motion, hash
 * links and modified clicks navigate instantly.
 */
export function ZoomNav({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const [bits, setBits] = useState<number[]>([]);
  const [amps, setAmps] = useState({ a: 1, b: 0 });
  const [collapsed, setCollapsed] = useState<number | null>(null);
  const thetaRef = useRef(0);
  const [hop, setHop] = useState(0);
  const pendingRef = useRef<string | null>(null);
  const arrivedRef = useRef(false);
  const thinkDoneRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pushedRef = useRef(false);
  const durRef = useRef(FULL);
  const [speed, setSpeed] = useState<"full" | "fast">("full");

  const clearTimers = () => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  };

  const maybeExpand = useCallback(() => {
    if (arrivedRef.current && thinkDoneRef.current) {
      setPhase("expand");
      timersRef.current.push(setTimeout(() => setPhase("idle"), durRef.current.expand + 40));
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const [destPath] = href.split("#");
      if (!destPath || destPath === pathname) return;
      if (!window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)").matches) return;

      e.preventDefault();
      const section = (p: string) => NAV_ITEMS.findIndex((n) => p === n.href || p.startsWith(`${n.href}/`));
      const delta = section(destPath) - section(pathname);
      setHop(Math.max(-150, Math.min(150, (Number.isNaN(delta) ? 1 : delta) * 42)));
      setLabel(NAV_ITEMS[section(destPath)]?.label ?? destPath.split("/").filter(Boolean).pop() ?? "home");
      thetaRef.current = 0;
      setAmps({ a: 1, b: 0 });
      setCollapsed(null);
      pendingRef.current = href;
      arrivedRef.current = false;
      thinkDoneRef.current = false;
      pushedRef.current = false;
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      const d = seen ? FAST : FULL;
      durRef.current = d;
      setSpeed(seen ? "fast" : "full");
      clearTimers();
      setPhase("collapse");
      timersRef.current.push(setTimeout(() => setPhase("think"), d.collapse));
      timersRef.current.push(
        setTimeout(() => {
          pushedRef.current = true;
          router.push(href);
        }, d.collapse + d.push)
      );
      timersRef.current.push(
        setTimeout(() => {
          thinkDoneRef.current = true;
          maybeExpand();
        }, d.collapse + d.think)
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router, maybeExpand]);

  // The route arrived; expand only after the qubit has finished thinking.
  useEffect(() => {
    if (pendingRef.current && pendingRef.current.split("#")[0] === pathname) {
      pendingRef.current = null;
      arrivedRef.current = true;
      maybeExpand();
    }
  }, [pathname, maybeExpand]);

  // While collapsing or thinking: a precessing state, measured for real.
  // theta advances each tick; alpha and beta are its true amplitudes, and
  // every bit shown is a Born rule sample with P(1) = beta squared.
  useEffect(() => {
    if (phase !== "collapse" && phase !== "think") return;
    const iv = setInterval(() => {
      thetaRef.current += 0.42;
      const a = Math.abs(Math.cos(thetaRef.current / 2));
      const b = Math.abs(Math.sin(thetaRef.current / 2));
      setAmps({ a, b });
      const p1 = b * b;
      setBits(Array.from({ length: 6 }, () => (Math.random() < p1 ? 1 : 0)));
    }, 72);
    return () => clearInterval(iv);
  }, [phase]);

  // Arrival is a measurement: collapse the precessing state to one outcome.
  useEffect(() => {
    if (phase !== "expand") return;
    const b = Math.abs(Math.sin(thetaRef.current / 2));
    setCollapsed(Math.random() < b * b ? 1 : 0);
  }, [phase]);

  // Escape or any press skips the pause; the qubit was thinking, not stalling.
  useEffect(() => {
    if (phase !== "collapse" && phase !== "think") return;
    const skip = () => {
      clearTimers();
      const href = pendingRef.current;
      if (href && !pushedRef.current) {
        pushedRef.current = true;
        router.push(href);
      }
      thinkDoneRef.current = true;
      maybeExpand();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", skip);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", skip);
    };
  }, [phase, router, maybeExpand]);

  // Safety: never leave the page stuck small.
  useEffect(() => {
    if (phase === "idle") return;
    const guard = setTimeout(() => {
      pendingRef.current = null;
      clearTimers();
      setPhase("idle");
    }, 3500);
    return () => clearTimeout(guard);
  }, [phase]);

  return (
    <>
      <div className="zoomnav-root flex min-h-full flex-1 flex-col" data-zoom-phase={phase} data-zoom-speed={speed}>
        {children}
      </div>
      <div className="zoomnav-overlay" data-zoom-phase={phase} data-zoom-speed={speed} style={{ ["--hop" as string]: `${hop}px` }} aria-hidden>
        <div className="zoomnav-mover">
          <div className="zoomnav-orb">
            <span className="zoomnav-ring" />
            <div className="zoomnav-bloch">
              <span className="ring-eq" />
              <span className="ring-mer" />
              <span className="precession">
                <span className="arrow" />
              </span>
            </div>
          </div>
          <p className="zoomnav-state font-mono text-xs text-foreground">
            {collapsed === null
              ? `${amps.a.toFixed(2)}|0⟩ + ${amps.b.toFixed(2)}|1⟩`
              : `collapsed to |${collapsed}⟩`}
          </p>
          <p className="zoomnav-bits font-mono text-xs tracking-widest text-muted">
            {bits.map((b, i) => (
              <span key={i} className={b ? "text-accent" : ""}>{b}</span>
            ))}
          </p>
          <p className="font-mono text-xs text-foreground">{label}</p>
        </div>
      </div>
    </>
  );
}
