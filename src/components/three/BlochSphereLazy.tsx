"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const BlochSphere = dynamic(() => import("@/components/three/BlochSphere").then((m) => m.BlochSphere), {
  ssr: false,
  loading: () => <Poster />,
});

/** Line art stand in while the interactive sphere loads. No numbers are
 *  shown here because none have been computed yet. */
function Poster() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-xl border border-border bg-surface" aria-hidden>
      <svg viewBox="0 0 120 120" className="h-40 w-40 opacity-60">
        <circle cx="60" cy="60" r="46" fill="none" stroke="var(--muted)" strokeWidth="1" />
        <ellipse cx="60" cy="60" rx="46" ry="14" fill="none" stroke="var(--muted)" strokeWidth="0.8" />
        <ellipse cx="60" cy="60" rx="14" ry="46" fill="none" stroke="var(--muted)" strokeWidth="0.8" />
        <line x1="60" y1="60" x2="88" y2="34" stroke="var(--accent)" strokeWidth="2" />
        <circle cx="88" cy="34" r="3" fill="var(--accent)" />
      </svg>
    </div>
  );
}

/** Mounts the real sphere only when it approaches the viewport. */
export function BlochSphereLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      const id = requestAnimationFrame(() => setNear(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{near ? <BlochSphere /> : <Poster />}</div>;
}
