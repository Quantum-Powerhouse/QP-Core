"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/components/navItems";

type Phase = "idle" | "collapse" | "travel" | "expand";

/**
 * Zoom navigation: on a desktop pointer, an internal navigation collapses the
 * current page into a qubit sphere, hops toward the destination's place in the
 * nav order, and the new page expands back out of the sphere. Content is
 * untouched; this is presentation only. Phones, reduced motion, hash links,
 * modified clicks and external links all navigate instantly as before.
 */
export function ZoomNav({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const [hop, setHop] = useState(0);
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const from = section(pathname);
      const to = section(destPath);
      const delta = from >= 0 && to >= 0 ? to - from : 1;
      setHop(Math.max(-140, Math.min(140, delta * 46)));
      setLabel(NAV_ITEMS[to]?.label ?? destPath.split("/").filter(Boolean)[0] ?? "home");
      pendingRef.current = href;
      setPhase("collapse");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setPhase("travel");
        router.push(href);
      }, 240);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  // The route arrived: expand the new page out of the sphere.
  useEffect(() => {
    if (pendingRef.current && pendingRef.current.split("#")[0] === pathname) {
      pendingRef.current = null;
      setPhase("expand");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPhase("idle"), 320);
    }
  }, [pathname]);

  // Safety: never leave the page stuck small.
  useEffect(() => {
    if (phase === "idle") return;
    const guard = setTimeout(() => {
      pendingRef.current = null;
      setPhase("idle");
    }, 2000);
    return () => clearTimeout(guard);
  }, [phase]);

  return (
    <>
      <div className="zoomnav-root flex min-h-full flex-1 flex-col" data-zoom-phase={phase}>
        {children}
      </div>
      <div className="zoomnav-overlay" data-zoom-phase={phase} style={{ ["--hop" as string]: `${hop}px` }} aria-hidden>
        <div className="zoomnav-orb">
          <span className="font-mono text-sm text-[#fafaf7]">|ψ⟩</span>
        </div>
        <p className="zoomnav-label font-mono text-xs text-muted">{label}</p>
      </div>
    </>
  );
}
