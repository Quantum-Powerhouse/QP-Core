import type { Metadata } from "next";
import { Cite, DocTitle, H2, Note, P, SourceLink } from "@/components/docs/DocElements";
import { RESEARCH_REPO_LABEL, researchFileUrl } from "@/lib/research/links";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Research Methodology",
  description: "How the quantum CI/CD regression-testing prior-art research was conducted, verified, and rated for confidence.",
  path: "/research/methodology",
});

export default function MethodologyPage() {
  return (
    <>
      <DocTitle
        eyebrow="Research / Methodology"
        title="How this research was conducted"
        dek="Four independent, parallel research passes, each required to open primary sources directly rather than trust search-result snippets."
      />

      <H2>The primary-source rule</H2>
      <P>
        No claim in this research is based on a search-result snippet alone. Every entry in the claims table
        and evidence record traces to a source that was actually opened and read: an official GitHub
        repository (README, CI workflow YAML, release history), an arXiv paper (abstract and, where needed,
        full text), or an independently-resolved DOI record (e.g. a Zenodo software deposit). Where a source
        could not be opened or a claim could not be confirmed, it is marked{" "}
        <strong className="text-foreground">UNVERIFIED</strong> or{" "}
        <strong className="text-foreground">NOT FOUND AFTER SEARCH</strong>, explicitly distinguished from a
        claim that was actively checked and found false.
      </P>

      <H2>Four parallel research threads</H2>
      <P>The twelve original claims were grouped into four independent verification passes:</P>
      <ol className="mb-4 flex list-decimal flex-col gap-2 pl-6 text-muted">
        <li>MQT QCEC and MQT Debugger, official repositories, CI configuration, and associated papers.</li>
        <li>The 31% practitioner statistic and the two originally-alleged arXiv papers.</li>
        <li>Q-Trace / other quantum debugging systems, bug/fault corpora, and state-aware or autonomous testing tooling.</li>
        <li>GitHub and PyPI search for pytest plugins, GitHub Actions products, and cross-SDK/version regression tooling.</li>
      </ol>
      <P>
        Each thread logged every search query it ran and what it returned, the full log is preserved in{" "}
        <SourceLink href={researchFileUrl("research/research_log.md")}>research_log.md</SourceLink> in the
        GitHub repository.
      </P>

      <H2>Status categories</H2>
      <P>Every claim was assigned one of five statuses:</P>
      <ul className="mb-4 flex flex-col gap-2 pl-6 text-muted [&>li]:list-disc">
        <li><strong className="text-foreground">Confirmed</strong>, verified directly against a primary source with no material ambiguity.</li>
        <li><strong className="text-foreground">Partially confirmed</strong>, a primary source was verified, but either the original claim referenced something not independently confirmable (e.g. unsupplied arXiv IDs), or the finding only partially supports/contradicts the original framing.</li>
        <li><strong className="text-foreground">Unverified</strong>, a claim that could not be checked against any primary source.</li>
        <li><strong className="text-foreground">False / contradicted</strong>, actively checked and found not to hold as originally stated.</li>
        <li><strong className="text-foreground">Not found after search</strong>, a reasonably broad search turned up nothing, but this is explicitly treated as absence of evidence, not proof of non-existence.</li>
      </ul>

      <H2>Confidence ratings</H2>
      <P>
        <strong className="text-foreground">High confidence</strong> means a primary source was opened and
        directly inspected (repo code/CI YAML, full paper text/abstract, or an independently-resolved DOI
        record) with no material ambiguity in interpretation.{" "}
        <strong className="text-foreground">Medium confidence</strong> means a primary source was opened, but
        either the claim required reconstructing candidates without a pre-given reference to confirm or deny
        against, or the finding is an absence result that a differently-worded search might overturn.
      </P>

      <Note>
        No specific arXiv IDs were ever supplied for the two papers originally cited as evidence for the
        research gap. Rather than guess, this research reconstructed the most material real candidates through
        independent search and marked that reconstruction explicitly as such, see claim C05/C06 in the{" "}
        <SourceLink href="/research/claims">claims table</SourceLink>.
      </Note>

      <H2>Known limitations</H2>
      <P>
        This was an English-language search across arXiv, GitHub, and PyPI. It did not include a systematic
        non-English literature search, direct outreach to authors, or an empirical prototype comparison. These
        and other open items are listed in full in Section 14 of the{" "}
        <SourceLink href="/research/gap-analysis">gap analysis</SourceLink>.
      </P>

      <Cite>Full research log and raw notes: {RESEARCH_REPO_LABEL}, research_log.md, raw_notes.md</Cite>
    </>
  );
}
