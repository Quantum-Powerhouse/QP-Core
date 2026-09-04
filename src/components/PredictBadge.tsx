"use client";

import { useEffect, useState } from "react";

/** Shows a small check once the matching arcade prediction was answered and
 *  revealed on this browser. Reads localStorage; renders nothing until then. */
export function PredictBadge({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const read = () => {
      try {
        setDone(localStorage.getItem(`predict-${slug}`) === "1");
      } catch {}
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
    };
  }, [slug]);
  if (!done) return null;
  return <span className="ml-2 font-mono text-xs text-accent-2">✓ predicted</span>;
}
