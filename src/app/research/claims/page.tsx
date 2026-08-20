import type { Metadata } from "next";
import { Cite, DocTitle, P, SourceLink } from "@/components/docs/DocElements";
import { StatusBadge } from "@/components/research/StatusBadge";
import { CLAIMS } from "@/lib/research/claims";
import { researchFileUrl } from "@/lib/research/links";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Claims Table",
  description: "All 13 claims verified in the quantum CI/CD regression-testing research, with status, evidence, source, and confidence.",
  path: "/research/claims",
});

export default function ClaimsPage() {
  return (
    <>
      <DocTitle
        eyebrow="Research / Claims"
        title="Claims table"
        dek="Every claim (C01–C13) from the original research brief, independently verified against primary sources."
      />

      <P>
        Full detail for each claim, including every source URL opened, is in{" "}
        <SourceLink href={researchFileUrl("research/claims.md")}>claims.md</SourceLink>.
      </P>

      <div className="flex flex-col gap-5">
        {CLAIMS.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-surface/60 p-5">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-accent">{c.id}</span>
              <StatusBadge status={c.status} />
              <span className="font-mono text-[11px] text-muted">Confidence: {c.confidence}</span>
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">{c.claim}</h3>
            <p className="mb-3 font-mono text-xs text-muted">{c.statusLabel}</p>
            <p className="mb-3 text-sm leading-relaxed text-muted">{c.evidence}</p>
            <p className="font-mono text-[11px] text-muted/70">Source: {c.source}</p>
          </div>
        ))}
      </div>

      <Cite>Raw table with full per-claim source links: research/claims.md in the GitHub repository</Cite>
    </>
  );
}
