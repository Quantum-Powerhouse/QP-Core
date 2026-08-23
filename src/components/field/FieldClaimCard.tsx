import { FIELD_CHECKED_ON, FIELD_STATUS_LABEL, type FieldClaim, type FieldStatus } from "@/lib/field/types";

const STATUS_TONE: Record<FieldStatus, string> = {
  verified: "border-accent/60 text-accent",
  "vendor-reported": "border-[#2dd4bf]/60 text-[#2dd4bf]",
  projection: "border-[#f59e0b]/60 text-[#f59e0b]",
  opinion: "border-[var(--accent-2)]/70 text-[var(--accent-2)]",
  estimate: "border-muted/70 text-muted",
  contested: "border-[#ff6b6b]/60 text-[#ff6b6b]",
  preprint: "border-[#c084fc]/60 text-[#c084fc]",
};

/** One claim, one status, one source — the site's citation pattern, reused. */
export function FieldClaimCard({ claim }: { claim: FieldClaim }) {
  return (
    <article id={claim.id} className="glass-panel flex scroll-mt-24 flex-col gap-3 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-snug text-foreground">{claim.title}</h3>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_TONE[claim.status]}`}>
          {FIELD_STATUS_LABEL[claim.status]}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted">{claim.body}</p>
      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 pt-2 font-mono text-[11px] text-muted">
        <span>{claim.date}</span>
        <a href={claim.source.url} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-2 hover:underline">
          {claim.source.label} ↗
        </a>
        {claim.also && (
          <a href={claim.also.url} target="_blank" rel="noopener noreferrer" className="text-accent/80 underline-offset-2 hover:underline">
            {claim.also.label} ↗
          </a>
        )}
        <span className="ml-auto">checked {FIELD_CHECKED_ON}</span>
      </footer>
    </article>
  );
}

export function StatusLegend() {
  return (
    <ul className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider">
      {(Object.keys(FIELD_STATUS_LABEL) as FieldStatus[]).map((s) => (
        <li key={s} className={`rounded-full border px-2 py-0.5 ${STATUS_TONE[s]}`}>
          {FIELD_STATUS_LABEL[s]}
        </li>
      ))}
    </ul>
  );
}
