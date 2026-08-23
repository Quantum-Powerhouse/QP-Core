import type { Metadata } from "next";
import Link from "next/link";
import { Cite, H2, Note, P, SourceLink } from "@/components/docs/DocElements";
import { JsonLd } from "@/components/JsonLd";
import { ClaimStatusChart } from "@/components/research/ClaimStatusChart";
import { ResearchHero } from "@/components/research/ResearchHero";
import { StatusBadge } from "@/components/research/StatusBadge";
import { RESEARCH_REPO_LABEL, RESEARCH_REPO_URL } from "@/lib/research/links";
import { getResearchStats } from "@/lib/research/stats";
import { techArticleSchema } from "@/lib/jsonld";
import { SITE_URL, buildMetadata } from "@/lib/seo";

const DATE_PUBLISHED = "2026-08-20";

export const metadata: Metadata = buildMetadata({
  title: "Research: Is There a Quantum CI/CD Regression-Testing Gap?",
  description:
    "A primary-source-verified investigation into whether a genuine gap exists in open-source CI/CD regression testing for quantum software across SDK versions.",
  path: "/research",
  keywords: [
    "quantum software testing",
    "quantum CI/CD regression testing",
    "MQT QCEC",
    "quantum pytest plugin",
    "quantum software engineering research gap",
  ],
  ogTitle: "Quantum CI/CD Regression-Testing Research",
});

const READ_NEXT: { href: string; title: string; description: string; wide?: boolean }[] = [
  {
    href: "/research/methodology",
    title: "Methodology",
    description: "How the research was conducted: four parallel primary-source verification threads and the confidence-rating rules.",
  },
  {
    href: "/research/claims",
    title: "Claims table",
    description: "All 13 claims (C01. C13), their verification status, evidence, and confidence level.",
  },
  {
    href: "/research/prior-art",
    title: "Prior-art matrix",
    description: "21 systems compared across testing, CI/CD, cross-version, cross-SDK, and more.",
  },
  {
    href: "/research/evidence",
    title: "Evidence",
    description: "The structured evidence record behind every claim, as expandable detail cards.",
  },
  {
    href: "/research/sources",
    title: "Sources",
    description: "A clean index of every source opened during this research, including ones that failed to load.",
  },
  {
    href: "/research/gap-analysis",
    title: "Gap analysis & conclusions",
    description:
      "Our own synthesis of what's novel, what isn't, and the narrowest defensible research gap, clearly marked as interpretation, not additional primary-source fact.",
    wide: true,
  },
];

export default function ResearchOverviewPage() {
  const url = `${SITE_URL}/research`;
  const stats = getResearchStats();

  return (
    <>
      <ResearchHero stats={stats} />

      <Note tone="warning">
        <strong>Status: architecture and implementation are blocked pending human review.</strong> Nothing here
        is a product proposal. This section documents a sustained research effort, last updated{" "}
        <span className="whitespace-nowrap">2026-08-21</span>.
      </Note>

      <H2>The question</H2>
      <P>
        Is there a genuine open research/software gap around CI/CD regression testing for quantum software,         specifically, an open-source pytest/GitHub Actions style infrastructure that runs quantum projects
        across SDK versions and detects regressions or equivalence failures? Several prior claims (MQT QCEC,
        MQT Debugger, a 31% practitioner statistic, two cited arXiv papers, and an assumed absence of bug
        corpora) needed independent verification before that question could be answered.
      </P>

      <H2>Why this matters</H2>
      <P>
        It is easy to build a novelty argument on claims nobody has checked. This research phase set out to
        verify, or reject, every load-bearing claim behind the original thesis, using only primary sources:
        official repositories, arXiv abstracts and full text, and independently-resolved DOI records. Where a
        search-result snippet was the only evidence available, the claim was marked{" "}
        <StatusBadge status="unverified" /> rather than accepted.
      </P>

      <H2>Claim status distribution</H2>
      <P>Computed directly from the {stats.totalClaims} claims in the claims table, not a separately-maintained figure.</P>
      <div className="mb-8 rounded-xl border border-border bg-surface/60 p-5">
        <ClaimStatusChart counts={stats.claimsByStatus} total={stats.totalClaims} />
      </div>

      <H2>Headline findings</H2>
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-surface/60 p-5">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status="false" />
            <p className="font-semibold text-foreground">MQT QCEC and MQT Debugger are real, but narrower than assumed</p>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Both are mature, citable tools, but they solve equivalence checking and single-run assertion
            debugging respectively, not CI/CD orchestration or cross-SDK-version regression testing.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-5">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status="confirmed" />
            <p className="font-semibold text-foreground">The 31% practitioner statistic is real and precisely traceable</p>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            “Only eight of 26 respondents (31%) reported using quantum-specific testing tools”. Zappin et al.,
            arXiv:2506.17306, Finding 2, p. 18. Cite it with its N=26 caveat, not as a field-wide constant.
          </p>
        </div>
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-5">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status="partial" />
            <p className="font-semibold text-foreground">The single most important find: QUTest already exists</p>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            arXiv:2605.19736 (May 2026) already implements cross-Qiskit-version regression testing with
            GitHub Actions-compatible output. This materially narrows any novelty claim, it does not
            eliminate the gap, but it removes a large piece of it.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-5">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status="false" />
            <p className="font-semibold text-foreground">“No bug corpus exists” is false</p>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Bugs4Q is real and “widely used,” and a 2026 replication study already ran it across 21 Qiskit
            versions (77,700 executions), finding reproducibility collapsed from 62.2% to 16.2%, and that
            restoring it needed source-code migration, not just dependency pinning.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 p-5">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge status="not_found" />
            <p className="font-semibold text-foreground">No cross-SDK regression/equivalence tool exists anywhere</p>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Every cross-version or regression-testing artifact found (QUTest, Qiskit’s own CI template, the
            “cart” transpiler pilot) is single-SDK. This is the strongest candidate for a narrow
            novelty, see the Gap Analysis.
          </p>
        </div>
      </div>

      <H2>Read next</H2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {READ_NEXT.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group rounded-xl border border-border bg-surface/60 p-5 transition-colors hover:border-accent/50 ${item.wide ? "sm:col-span-2 lg:col-span-3" : ""}`}
          >
            <h3 className="font-semibold text-foreground group-hover:text-accent">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.description}</p>
          </Link>
        ))}
      </div>

      <H2>Raw artifacts</H2>
      <P>
        This website is a rendering, not the source of truth. Every markdown file, the structured{" "}
        <code>evidence.json</code>, the full search log, and the complete git history of this research live in
        the public GitHub repository:
      </P>
      <P>
        <SourceLink href={RESEARCH_REPO_URL}>{RESEARCH_REPO_LABEL}</SourceLink>
      </P>

      <JsonLd
        data={techArticleSchema({
          headline: "Research: Is There a Quantum CI/CD Regression-Testing Gap?",
          description:
            "A primary-source-verified investigation into whether a genuine gap exists in open-source CI/CD regression testing for quantum software across SDK versions.",
          url,
          datePublished: DATE_PUBLISHED,
        })}
      />
      <Cite>Source of truth: {RESEARCH_REPO_URL}</Cite>
    </>
  );
}
