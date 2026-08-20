import type { Metadata } from "next";
import { Cite, DocTitle, P } from "@/components/docs/DocElements";
import { SOURCE_GROUPS } from "@/lib/research/sources";
import { researchFileUrl } from "@/lib/research/links";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sources",
  description: "Every source opened during the quantum CI/CD regression-testing research, grouped and linked — including sources that failed to load and leads that were never independently verified.",
  path: "/research/sources",
});

export default function SourcesPage() {
  return (
    <>
      <DocTitle
        eyebrow="Research / Sources"
        title="Source index"
        dek="Every source this research actually opened, grouped by kind. Sources that failed to load or were never independently verified are listed too, not hidden."
      />

      <P>
        The full annotated version, with per-claim cross-references, is{" "}
        <a href={researchFileUrl("research/sources.md")} className="font-mono text-xs text-accent hover:text-foreground">
          sources.md
        </a>{" "}
        in the GitHub repository.
      </P>

      <div className="flex flex-col gap-8">
        {SOURCE_GROUPS.map((group) => (
          <section key={group.heading}>
            <h2 className="mb-1 text-lg font-semibold text-foreground">{group.heading}</h2>
            {group.note && <p className="mb-3 text-sm text-muted">{group.note}</p>}
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <li key={item.label} className="rounded-lg border border-border/60 bg-surface/40 px-4 py-2.5">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground transition-colors hover:text-accent"
                    >
                      {item.label}
                      <span aria-hidden="true" className="ml-1.5 text-muted">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <span className="text-sm text-muted">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Cite>Raw index: research/sources.md in the GitHub repository</Cite>
    </>
  );
}
