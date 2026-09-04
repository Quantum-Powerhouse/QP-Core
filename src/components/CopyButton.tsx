"use client";

import { useState } from "react";

/** Copies the given text and confirms inline. No clipboard, no drama: the
 *  button says what happened either way. */
export function CopyButton({ text, label = "copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("done");
        } catch {
          setState("failed");
        }
        setTimeout(() => setState("idle"), 1600);
      }}
      className="rounded-full border border-border px-3 py-1 font-mono text-xs text-foreground transition-colors hover:border-accent/60 active:scale-[0.97]"
    >
      {state === "idle" ? label : state === "done" ? "copied" : "copy failed"}
    </button>
  );
}
