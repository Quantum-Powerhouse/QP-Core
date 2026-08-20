"use client";

import { useId, useState } from "react";

export function ExpandableCard({
  header,
  summary,
  children,
  defaultOpen = false,
}: {
  header: React.ReactNode;
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="rounded-xl border border-border bg-surface/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          {header}
          {!open && <p className="mt-2 text-sm leading-relaxed text-muted">{summary}</p>}
        </div>
        <span
          aria-hidden="true"
          className={`mt-1 shrink-0 font-mono text-sm text-muted transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        id={panelId}
        className="grid overflow-hidden px-5 transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0">
          <div className="border-t border-border/60 pb-5 pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
