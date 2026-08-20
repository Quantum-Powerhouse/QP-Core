"use client";

import { useEffect, useState } from "react";

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** Returns null while unknown (avoids an SSR/hydration flash), then true/false once checked client-side. */
export function useWebglSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Deliberately deferred to an effect: detection must run after hydration so the
    // server-rendered fallback and the client's first paint match, then this updates
    // to the real client-only value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(detectWebGL());
  }, []);

  return supported;
}
