"use client";

import type { ReactNode } from "react";

/**
 * Shared UI kit for the Quantum Arcade. Every game renders inside a GameCard
 * with an honesty tag stating exactly what computes it — same disclosure
 * convention as the rest of the site.
 */

export function GameCard({
  title,
  tag,
  computes,
  children,
}: {
  title: string;
  /** short category chip, e.g. "game", "lab", "demo" */
  tag: string;
  /** honesty line: what actually computes the numbers shown */
  computes: string;
  children: ReactNode;
}) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (
    <section id={slug} className="glass-panel flex scroll-mt-24 flex-col gap-4 rounded-xl p-5">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <span className="rounded-full border border-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
          {tag}
        </span>
      </header>
      <div className="flex flex-col gap-3 text-sm">{children}</div>
      <footer className="border-t border-border/60 pt-2 font-mono text-[11px] leading-relaxed text-muted">
        Computes: {computes}
      </footer>
    </section>
  );
}

export function ProbBars({ probs, labels }: { probs: number[]; labels?: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {probs.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-14 shrink-0 font-mono text-xs text-muted">
            {labels?.[i] ?? `|${i.toString(2).padStart(Math.ceil(Math.log2(probs.length || 2)), "0")}⟩`}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-sm bg-surface-2">
            <div
              className="h-full rounded-sm bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, p * 100)).toFixed(1)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-mono text-xs text-foreground">{(p * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

/** A 2D Bloch dial: circle = the X–Z great circle, arrow = the state's (x, z). */
export function BlochDial({ x, z, size = 96 }: { x: number; z: number; size?: number }) {
  const cx = size / 2;
  const r = size / 2 - 6;
  const tipX = cx + x * r;
  const tipY = cx - z * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border)" strokeWidth="1" />
      <line x1={cx} y1={6} x2={cx} y2={size - 6} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
      <line x1={6} y1={cx} x2={size - 6} y2={cx} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 4" />
      <text x={cx} y={12} textAnchor="middle" className="fill-[var(--muted)]" fontSize="8" fontFamily="monospace">
        |0⟩
      </text>
      <text x={cx} y={size - 4} textAnchor="middle" className="fill-[var(--muted)]" fontSize="8" fontFamily="monospace">
        |1⟩
      </text>
      <line
        x1={cx}
        y1={cx}
        x2={tipX}
        y2={tipY}
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all duration-300 ease-out"
      />
      <circle cx={tipX} cy={tipY} r="3" fill="var(--accent)" className="transition-all duration-300 ease-out" />
    </svg>
  );
}

export function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col rounded-lg border border-border/60 bg-surface/40 px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</span>
      <span className={`font-mono text-lg ${accent ? "text-accent" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

export function ArcadeButton({
  onClick,
  children,
  primary = false,
  disabled = false,
}: {
  onClick: () => void;
  children: ReactNode;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        primary
          ? "rounded-lg bg-accent px-3 py-1.5 font-mono text-xs font-semibold text-[#041014] transition-transform duration-100 ease-out enabled:active:scale-[0.97] disabled:opacity-40"
          : "rounded-lg border border-border bg-surface/60 px-3 py-1.5 font-mono text-xs text-foreground transition-colors duration-150 ease-out hover:border-accent/60 enabled:active:scale-[0.97] disabled:opacity-40"
      }
    >
      {children}
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between font-mono text-xs text-muted">
        <span>{label}</span>
        <span className="text-foreground">{format ? format(value) : value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-[var(--accent)]"
      />
    </label>
  );
}
