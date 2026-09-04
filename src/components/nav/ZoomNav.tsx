"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/components/navItems";
import { sampleRandomBits } from "@/lib/arcade/qlogic";

type Phase = "idle" | "collapse" | "think" | "expand";

const COLLAPSE_MS = 340;
const THINK_MS = 800; // the deliberate pause: the qubit "decides" the path
const PUSH_AT_MS = 400; // route loads while it thinks
const EXPAND_MS = 360;

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
  const [hop, setHop] = useState(0);
  const pendingRef = useRef<string | null>(null);
  const arrivedRef = useRef(false);
  const thinkDoneRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  };

  const maybeExpand = useCallback(() => {
    if (arrivedRef.current && thinkDoneRef.current) {
      setPhase("expand");
      timersRef.current.push(setTimeout(() => setPhase("idle"), EXPAND_MS + 40));
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
      setBits(sampleRandomBits(6));
      pendingRef.current = href;
      arrivedRef.current = false;
      thinkDoneRef.current = false;
      clearTimers();
      setPhase("collapse");
      timersRef.current.push(setTimeout(() => setPhase("think"), COLLAPSE_MS));
      timersRef.current.push(setTimeout(() => router.push(href), COLLAPSE_MS + PUSH_AT_MS));
      timersRef.current.push(
        setTimeout(() => {
          thinkDoneRef.current = true;
          maybeExpand();
        }, COLLAPSE_MS + THINK_MS)
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

  // While collapsing or thinking, stream real Born rule bits.
  useEffect(() => {
    if (phase !== "collapse" && phase !== "think") return;
    const iv = setInterval(() => setBits(sampleRandomBits(6)), 72);
    return () => clearInterval(iv);
  }, [phase]);

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
      <div className="zoomnav-root flex min-h-full flex-1 flex-col" data-zoom-phase={phase}>
        {children}
      </div>
      <div className="zoomnav-overlay" data-zoom-phase={phase} style={{ ["--hop" as string]: `${hop}px` }} aria-hidden>
        <div className="zoomnav-mover">
          <div className="zoomnav-orb">
            <span className="font-mono text-sm text-[#fafaf7]">|ψ⟩</span>
          </div>
          <p className="zoomnav-bits font-mono text-[11px] tracking-widest text-muted">
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
