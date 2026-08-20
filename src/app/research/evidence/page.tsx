import type { Metadata } from "next";
import { Cite, DocTitle, H2, P, SourceLink } from "@/components/docs/DocElements";
import { ExpandableCard } from "@/components/research/ExpandableCard";
import { StatusBadge } from "@/components/research/StatusBadge";
import type { ClaimStatus } from "@/lib/research/claims";
import { EVIDENCE } from "@/lib/research/evidence";
import { RESEARCH_REPO_LABEL, researchFileUrl } from "@/lib/research/links";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Evidence",
  description: "The structured evidence record behind the quantum CI/CD regression-testing research, grouped by verification status as expandable detail cards.",
  path: "/research/evidence",
});

const GROUPS: { status: ClaimStatus; heading: string; intro: string }[] = [
  {
    status: "confirmed",
    heading: "Verified findings",
    intro: "Actively checked against a primary source and confirmed to hold as stated.",
  },
  {
    status: "partial",
    heading: "Partially verified findings",
    intro: "A primary source was opened, but the original claim was only partly confirmable — commonly because no specific reference was supplied to check against, or because the finding cuts both for and against the original framing.",
  },
  {
    status: "false",
    heading: "False / contradicted findings",
    intro: "Actively checked and found not to hold as originally stated.",
  },
  {
    status: "not_found",
    heading: "Not found after search",
    intro: "A reasonably broad search turned up nothing. Treated as absence of evidence, not proof of non-existence.",
  },
];

export default function EvidencePage() {
  return (
    <>
      <DocTitle
        eyebrow="Research / Evidence"
        title="Evidence"
        dek="Every structured evidence record, grouped by verification status so verified, partial, false, and not-found findings are never mixed together. Expand a card for the full evidence, source, and notes."
      />

      <P>
        This page mirrors <SourceLink href={researchFileUrl("research/evidence.json")}>evidence.json</SourceLink>,
        the machine-readable record in the GitHub repository. For a clean list of every URL opened during this
        research — including sources that failed to load — see{" "}
        <SourceLink href="/research/sources">Sources</SourceLink>.
      </P>

      {GROUPS.map((group) => {
        const items = EVIDENCE.filter((e) => e.status === group.status);
        if (items.length === 0) return null;
        return (
          <section key={group.status}>
            <H2>{group.heading}</H2>
            <P>{group.intro}</P>
            <div className="mb-8 flex flex-col gap-3">
              {items.map((item) => (
                <ExpandableCard
                  key={item.claim}
                  header={
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <StatusBadge status={item.status} />
                      <h3 className="text-sm font-semibold text-foreground">{item.claim}</h3>
                    </div>
                  }
                  summary={item.evidence}
                >
                  <p className="mb-3 text-sm leading-relaxed text-muted">{item.evidence}</p>
                  <p className="mb-1 font-mono text-[11px] text-muted/70">{item.sourceTitle}</p>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-accent hover:text-foreground"
                  >
                    {item.sourceUrl}
                  </a>
                  <p className="mt-2 border-t border-border/60 pt-2 text-xs leading-relaxed text-muted/80">{item.notes}</p>
                </ExpandableCard>
              ))}
            </div>
          </section>
        );
      })}

      <Cite>Machine-readable source: research/evidence.json in {RESEARCH_REPO_LABEL}</Cite>
    </>
  );
}
