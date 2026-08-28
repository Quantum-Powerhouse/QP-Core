"use client";

import { motion } from "framer-motion";
import type { ClaimStatus } from "@/lib/research/claims";

const ORDER: ClaimStatus[] = ["confirmed", "partial", "false", "not_found", "unverified"];

const LABEL: Record<ClaimStatus, string> = {
  confirmed: "Confirmed",
  partial: "Partially confirmed",
  false: "False / contradicted",
  not_found: "Not found after search",
  unverified: "Unverified",
};

const GLYPH: Record<ClaimStatus, string> = {
  confirmed: "✓",
  partial: "◐",
  false: "✕",
  not_found: "∅",
  unverified: "?",
};

const BAR_COLOR: Record<ClaimStatus, string> = {
  confirmed: "bg-emerald-500/70",
  partial: "bg-amber-500/70",
  false: "bg-red-500/70",
  not_found: "bg-[#20507c]/70",
  unverified: "bg-[#7a6f5c]/70",
};

export function ClaimStatusChart({ counts, total }: { counts: Record<ClaimStatus, number>; total: number }) {
  return (
    <div className="flex flex-col gap-3" role="img" aria-label={`Claim status distribution across ${total} claims`}>
      {ORDER.filter((status) => counts[status] > 0).map((status, i) => {
        const pct = total > 0 ? (counts[status] / total) * 100 : 0;
        return (
          <div key={status} className="flex items-center gap-3">
            <span className="w-40 shrink-0 font-mono text-xs text-muted">
              <span aria-hidden="true" className="mr-1.5">
                {GLYPH[status]}
              </span>
              {LABEL[status]}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className={`h-full rounded-full ${BAR_COLOR[status]}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
              />
            </div>
            <span className="w-6 shrink-0 text-right font-mono text-xs text-foreground">{counts[status]}</span>
          </div>
        );
      })}
    </div>
  );
}
