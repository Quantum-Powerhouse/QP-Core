import type { ClaimStatus } from "@/lib/research/claims";
import type { Cell } from "@/lib/research/priorArt";

const STATUS_STYLES: Record<ClaimStatus, string> = {
  confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  partial: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  unverified: "border-[#7a6f5c]/30 bg-[#7a6f5c]/10 text-[#c9bda6]",
  false: "border-red-500/30 bg-red-500/10 text-red-300",
  not_found: "border-[#d9a441]/30 bg-[#d9a441]/10 text-[#e6c47a]",
};

const STATUS_TEXT: Record<ClaimStatus, string> = {
  confirmed: "Confirmed",
  partial: "Partially confirmed",
  unverified: "Unverified",
  false: "False / contradicted",
  not_found: "Not found after search",
};

/**
 * Distinct glyph per status, not just color, so the status still reads
 * correctly for colorblind users and in any UI that strips styling.
 */
const STATUS_GLYPH: Record<ClaimStatus, string> = {
  confirmed: "✓",
  partial: "◐",
  unverified: "?",
  false: "✕",
  not_found: "∅",
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      <span aria-hidden="true">{STATUS_GLYPH[status]}</span>
      {STATUS_TEXT[status]}
    </span>
  );
}

const CELL_STYLES: Record<Cell, string> = {
  YES: "text-emerald-300",
  NO: "text-muted/60",
  PARTIAL: "text-amber-300",
  UNKNOWN: "text-muted/40 italic",
  "N/A": "text-muted/30",
};

export function MatrixCell({ value }: { value: Cell }) {
  return <span className={`font-mono text-xs ${CELL_STYLES[value]}`}>{value}</span>;
}

export function SynthesisNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-lg border border-[#c25e4c]/30 bg-[#c25e4c]/5 px-4 py-3 text-sm leading-relaxed text-[#f3ded6]/90">
      <p className="mb-1 font-mono text-[11px] font-medium uppercase tracking-wide text-[#dfa08c]">
        Our synthesis, not an independently verified source
      </p>
      {children}
    </div>
  );
}
