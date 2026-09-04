"use client";

import { useEffect, useState } from "react";

type Health = { configured: boolean; live: boolean };

/** Tells the truth about the transpiler service next to its call to action:
 *  live, asleep, or not deployed. The mock below is labeled either way. */
export function TranspilerStatusChip() {
  const [health, setHealth] = useState<Health | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/transpile", { method: "GET" })
      .then((r) => r.json())
      .then((h: Health) => {
        if (alive) setHealth(h);
      })
      .catch(() => {
        if (alive) setHealth({ configured: false, live: false });
      });
    return () => {
      alive = false;
    };
  }, []);
  if (health === null) return null;
  const liveNow = health.configured && health.live;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${liveNow ? "bg-accent-2" : "bg-border"}`} />
      {liveNow ? "live service" : "service offline · responses use the labeled mock"}
    </span>
  );
}
