import type { Metadata } from "next";
import Link from "next/link";
import { getResearchStats } from "@/lib/research/stats";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "The Paper: Is There a Gap in CI/CD Regression Testing for Quantum Software?",
  description:
    "The research record as a citable paper: abstract, PDF, BibTeX and CITATION.cff, archived as a GitHub release with Zenodo DOI archival pending. A primary source verified prior art study of 14 claims and 22 systems, with the companion tool it produced.",
  path: "/research/paper",
  keywords: ["quantum software regression testing paper", "quantum CI/CD prior art", "pytest-qequiv", "citable quantum research", "quantum software engineering preprint"],
  ogTitle: "The Paper",
});

const RELEASE = "https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research/releases/tag/v1.1.1";
const PDF = "https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research/releases/download/v1.1.1/quantum-cicd-gap-study.pdf";

const BIBTEX = `@misc{sadeqi2026quantumcicd,
  author       = {Sadeqi, Said Mohaddes},
  title        = {Is there a genuine gap in CI/CD regression testing for quantum software?
                  A primary source verified prior art study},
  year         = {2026},
  month        = aug,
  version      = {1.1.1},
  howpublished = {Research record and paper, GitHub release v1.1.1},
  url          = {${RELEASE}},
  note         = {Companion tool: pytest-qequiv. DOI via Zenodo archival pending.}
}`;

export default function PaperPage() {
  const stats = getResearchStats();
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">Research · the paper</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Is there a genuine gap in CI/CD regression testing for quantum software?
      </h1>
      <p className="mt-2 font-mono text-sm text-muted">A primary source verified prior art study · Said Mohaddes Sadeqi · v1.1.1, August 2026</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={PDF} className="rounded-full bg-accent px-4 py-2 font-mono text-xs font-semibold text-[#211603]" target="_blank" rel="noopener noreferrer">
          PDF (GitHub release v1.1.1) ↗
        </a>
        <a href={RELEASE} className="rounded-full border border-border px-4 py-2 font-mono text-xs text-foreground hover:border-accent/60" target="_blank" rel="noopener noreferrer">
          release &amp; research record ↗
        </a>
        <a href="https://github.com/sadeqisaidmohaddes-star/pytest-qequiv" className="rounded-full border border-border px-4 py-2 font-mono text-xs text-foreground hover:border-accent/60" target="_blank" rel="noopener noreferrer">
          companion tool: pytest-qequiv ↗
        </a>
      </div>

      <section className="glass-panel mt-8 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Abstract</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This study asks whether an open source, pytest native infrastructure that runs quantum software projects across
          SDK versions and SDKs and automatically detects regressions or circuit equivalence failures already exists.
          Starting from a hypothesis that none did, {stats.totalClaims} claims were checked against primary sources,           official repositories, raw CI configurations, arXiv full texts and DOI records, that were opened and
          inspected rather than accepted from search snippets; {stats.priorArtSystems} prior art systems were
          catalogued. The evidence does not support the original hypothesis: cross-<em>version</em> regression testing
          with CI output exists (QUTest, 2026, Qiskit only); a pytest native harness across eight SDKs exists for{" "}
          <em>benchmarking</em> (Benchpress) but detects nothing; pytest equivalence plugins exist but are immature; and
          a bug corpus (Bugs4Q) exists, contrary to the starting assumption. The narrowest defensible gap is a
          pytest native, cross SDK, automated equivalence/regression detection framework packaged as reusable CI
          tooling, addressed by the companion tool released with this record. Two starting assumptions found false
          are reported as such; limitations are stated.
        </p>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="glass-panel rounded-xl p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">How to cite</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-[10.5px] leading-relaxed text-foreground">{BIBTEX}</pre>
          <p className="mt-2 font-mono text-[11px] text-muted">
            A <code>CITATION.cff</code> in the repository lets GitHub generate APA/BibTeX directly.
          </p>
        </section>
        <section className="glass-panel rounded-xl p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Archival status</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <li><span className="text-accent">✓</span> Versioned GitHub release with the PDF attached and <code>CITATION.cff</code> + <code>.zenodo.json</code> in the tree.</li>
            <li><span className="text-[#f59e0b]">○</span> Zenodo DOI: the repository is prepared for Zenodo&apos;s GitHub archival; the DOI is minted when the owner enables the integration and re publishes the release. Until then this page shows no DOI rather than a placeholder.</li>
            <li><span className="text-[#f59e0b]">○</span> arXiv: not submitted at the check date. The paper states its limitations (English language search, no empirical prototype comparison) that a reviewer would ask about first.</li>
          </ul>
        </section>
      </div>

      <section className="glass-panel mt-6 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">What the paper is generated from</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The PDF is rendered from the research record: the{" "}
          <Link href="/research/claims" className="text-accent">claims table</Link>, the{" "}
          <Link href="/research/prior-art" className="text-accent">prior art matrix</Link>, the{" "}
          <Link href="/research/gap-analysis" className="text-accent">gap analysis</Link> and the{" "}
          <Link href="/research/sources" className="text-accent">sources list</Link> are the source of truth, and
          continuous integration fails if the rendered claims drift from <code>evidence.json</code>. Every reference in
          the paper was opened during the study.
        </p>
      </section>
    </>
  );
}
