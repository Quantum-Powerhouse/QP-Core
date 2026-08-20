import type { Metadata } from "next";
import { Cite, DocTitle, P } from "@/components/docs/DocElements";
import { TIMELINE } from "@/lib/research/timeline";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Research Timeline",
  description: "The real, git-commit-derived timeline of the quantum CI/CD regression-testing research and its publication.",
  path: "/research/timeline",
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function TimelinePage() {
  return (
    <>
      <DocTitle
        eyebrow="Research / Timeline"
        title="How this actually happened"
        dek="Every entry below is a real commit in one of the two repositories this project spans, with its exact timestamp and hash — not an estimated or rounded date."
      />

      <P>
        Re-derive this list yourself at any time with <code>git log --pretty=format:&quot;%h|%ad|%s&quot; --date=iso-strict</code>{" "}
        in either repository.
      </P>

      <ol className="relative flex flex-col gap-8 border-l border-border pl-6">
        {TIMELINE.map((entry) => (
          <li key={entry.commit} className="relative">
            <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-accent" />
            <p className="font-mono text-[11px] text-muted">{formatDate(entry.date)}</p>
            <h2 className="mt-1 text-base font-semibold text-foreground">{entry.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{entry.description}</p>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-mono text-[11px] text-accent hover:text-foreground"
            >
              {entry.repo} @ {entry.commit}
            </a>
          </li>
        ))}
      </ol>

      <Cite>All timestamps sourced directly from `git log` in quantum-cicd-research and QP-Core.</Cite>
    </>
  );
}
