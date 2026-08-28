import type { ClaimStatus } from "@/lib/research/claims";
import type { Cell } from "@/lib/research/priorArt";

const STATUS_STYLES: Record<ClaimStatus, string> = {
  confirmed: "border-emerald-500/30 bg-emerald-500/10 text-[#256b3d]",
  partial: "border-amber-500/30 bg-amber-500/10 text-[#7a5608]",
  unverified: "border-[#7a6f5c]/30 bg-[#7a6f5c]/10 text-[#5f574a]",
  false: "border-red-500/30 bg-red-500/10 text-[#9c2b1e]",
  not_found: "border-[#20507c]/30 bg-[#20507c]/10 text-[#2c5170]",
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
  YES: "text-[#256b3d]",
  NO: "text-muted/60",
  PARTIAL: "text-[#7a5608]",
  UNKNOWN: "text-muted/40 italic",
  "N/A": "text-muted/30",
};

export function MatrixCell({ value }: { value: Cell }) {
  return <span className={`font-mono text-xs ${CELL_STYLES[value]}`}>{value}</span>;
}

export function SynthesisNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-lg border border-[#20507c]/30 bg-[#20507c]/5 px-4 py-3 text-sm leading-relaxed text-[#27496b]/90">
      <p className="mb-1 font-mono text-[11px] font-medium uppercase tracking-wide text-[#2f5578]">
        Our synthesis, not an independently verified source
      </p>
      {children}
    </div>
  );
}
