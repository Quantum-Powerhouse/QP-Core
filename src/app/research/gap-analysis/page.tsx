import type { Metadata } from "next";
import { Cite, DocTitle, H2, Note, P, SourceLink } from "@/components/docs/DocElements";
import { SynthesisNote } from "@/components/research/StatusBadge";
import { researchFileUrl } from "@/lib/research/links";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Gap Analysis & Conclusions",
  description: "Our synthesis of what's novel in quantum CI/CD regression testing, what isn't, and the narrowest defensible research gap, built on the verified evidence, clearly marked as interpretation.",
  path: "/research/gap-analysis",
});

export default function GapAnalysisPage() {
  return (
    <>
      <DocTitle
        eyebrow="Research / Gap Analysis"
        title="Gap analysis & conclusions"
        dek="Written last, after every claim in the claims table and evidence record was checked. It does not protect the original hypothesis, where the evidence contradicts it, that is stated plainly."
      />

      <SynthesisNote>
        Everything on this page is our own interpretation of the verified evidence documented on the{" "}
        <SourceLink href="/research/claims">claims</SourceLink>,{" "}
        <SourceLink href="/research/prior-art">prior art</SourceLink>, and{" "}
        <SourceLink href="/research/evidence">evidence</SourceLink> pages, not itself an independently
        verified primary source fact. Treat the conclusions below as reasoning built on top of that evidence,
        open to revision if new prior art surfaces.
      </SynthesisNote>

      <H2>1. What already exists?</H2>
      <P>Active prior art exists across five layers:</P>
      <ul className="mb-4 flex flex-col gap-2 pl-6 text-muted [&>li]:list-disc">
        <li><strong className="text-foreground">Equivalence checking</strong> of individual circuit pairs (MQT QCEC), mature, citable, widely usable.</li>
        <li><strong className="text-foreground">Single run assertion based debugging</strong> (MQT Debugger, CUDA-Q assertions, Proq, Bloq/AutoBloq), several independent implementations.</li>
        <li><strong className="text-foreground">SDK internal version tier CI</strong> (Qiskit&apos;s official CI template), real, reusable, actively used across ~8 Qiskit ecosystem repos.</li>
        <li><strong className="text-foreground">Cross Qiskit version regression testing with CI compatible output</strong> (QUTest, May 2026), published and working, though not pytest native and Qiskit only.</li>
        <li><strong className="text-foreground">Bug corpora and cross version reproducibility studies</strong> (Bugs4Q + its 21-Qiskit version replication study), already used for exactly this kind of cross version regression analysis.</li>
        <li><strong className="text-foreground">Immature pytest plugins</strong> with cross framework (not cross version) equivalence assertions, real but young, unadopted.</li>
        <li><strong className="text-foreground">A single SDK transpiler regression pilot</strong> (&ldquo;cart,&rdquo; June 2026) finding ~38% of real transpiler bug fixes are invisible to equivalence oracles.</li>
      </ul>

      <H2>2-5. What do MQT QCEC, MQT Debugger, quantum testing frameworks, and existing quantum CI/CD each solve?</H2>
      <P>
        <strong className="text-foreground">MQT QCEC</strong> solves the algorithmic core of pairwise circuit
        equivalence checking, not orchestration, CI/CD packaging, cross version execution, or cross SDK
        testing. <strong className="text-foreground">MQT Debugger</strong> solves assertion driven fault
        localization within one execution of one program, not cross run or CI level regression detection.{" "}
        <strong className="text-foreground">pytest-quantum / qtest-quantum</strong> solve framework to framework
        (Qiskit↔Cirq↔pytket) equivalence assertions inside pytest, the pytest native piece has (immature)
        precedent, but neither executes the same test across multiple <em>versions</em> of one SDK.{" "}
        <strong className="text-foreground">Qiskit&apos;s official CI template</strong> solves &ldquo;run my
        existing tests against latest/dev/minimum Qiskit&rdquo; as reusable GitHub Actions, but only reports
        pass/fail of tests already written; it does not diff behavior between versions.
      </P>

      <H2>6-8. Does the proposed infrastructure already exist?</H2>
      <P>
        <strong className="text-foreground">Not as a unified, adopted product.</strong> No single system is
        simultaneously pytest native, cross version, cross SDK, and automated in its regression/equivalence
        detection. QUTest covers cross version + CI output but explicitly rejects pytest and is Qiskit only.{" "}
        <strong className="text-foreground">Cross version</strong> regression testing exists in at least two
        independent 2026 efforts (QUTest; the Bugs4Q replication study).{" "}
        <strong className="text-foreground">Cross SDK</strong> regression/equivalence testing does not, no
        working tool of any kind was found. No single bug corpus is a universal standard, but real,
        citable, actively used corpora exist, the &ldquo;no corpus exists&rdquo; framing is false.
      </P>

      <H2>9-10. Does the 31% statistic exist, and do the alleged papers support the gap?</H2>
      <P>
        <strong className="text-foreground">Yes, the 31% statistic is confirmed</strong> with exact provenance
        (Zappin et al., arXiv:2506.17306, Finding 2, p. 18), but it measures practitioner adoption/awareness
        of testing tools, not the existence or absence of relevant tooling; it is evidence of unmet need, not
        proof of a gap. No specific arXiv IDs were ever supplied for the &ldquo;two papers&rdquo; originally
        cited as evidence for the gap, that claim is unverified as stated. Independent search surfaced QUTest,
        which <strong className="text-foreground">partially contradicts</strong> rather than supports the
        original framing, since it already implements a meaningful chunk of the proposed system.
      </P>

      <H2>11. What part of the proposed idea is novel, if any?</H2>
      <P>The narrowest defensible novel combination, not found anywhere in this research:</P>
      <ul className="mb-4 flex flex-col gap-2 pl-6 text-muted [&>li]:list-disc">
        <li><strong className="text-foreground">pytest native</strong> test discovery and fixtures (some precedent exists, e.g. pytest-quantum)</li>
        <li><strong className="text-foreground">cross SDK</strong> (Qiskit vs Cirq vs PennyLane, not just cross version within Qiskit), no precedent found anywhere</li>
        <li><strong className="text-foreground">automated regression/equivalence detection</strong> (not hand written assertions) as the comparison mechanism</li>
        <li><strong className="text-foreground">packaged as reusable, drop in GitHub Actions tooling</strong> for arbitrary third party quantum projects (not internal only CI, not a bespoke research pilot)</li>
      </ul>
      <P>
        No system in this research combines all four. The strongest partial overlaps are QUTest (3 of 4,
        missing pytest + cross SDK) and pytest-quantum (2 of 4, missing cross version + automated detection).
      </P>

      <H2>12. What parts are NOT novel and should be removed from the thesis/product claim?</H2>
      <ul className="mb-4 flex flex-col gap-2 pl-6 text-muted [&>li]:list-disc">
        <li>&ldquo;No one does equivalence checking for quantum circuits&rdquo;, false, MQT QCEC solves this well.</li>
        <li>&ldquo;No one does quantum program debugging&rdquo;, false, MQT Debugger and several assertion based tools exist.</li>
        <li>&ldquo;No bug corpus exists for quantum software&rdquo;, false, Bugs4Q and others exist and are actively used.</li>
        <li>&ldquo;No one does cross Qiskit version regression testing&rdquo;, false as of May/June 2026 (QUTest, cart, the Bugs4Q replication study).</li>
        <li>&ldquo;No one has built quantum aware CI/CD in GitHub Actions&rdquo;, false, Qiskit&apos;s own ecosystem template is real and reusable.</li>
        <li>Any claim built on &ldquo;two arXiv papers proving the gap&rdquo; with unverified/unsupplied IDs, must be replaced with the papers actually verified here.</li>
      </ul>

      <H2>13. The narrowest defensible research gap</H2>
      <Note>
        A pytest native, <strong>cross SDK</strong> (not merely cross version) automated regression/equivalence detection
        framework for quantum software, packaged as reusable GitHub Actions tooling for third party projects,         using existing components (e.g. MQT QCEC as an equivalence checking engine, Bugs4Q style corpora as a
        validation fixture) rather than reinventing them.
      </Note>
      <P>
        This is materially narrower than the original framing. The original framing is largely already
        addressed piecewise: Qiskit&apos;s CI template handles version matrix execution; QUTest handles
        cross version behavioral drift with CI output; pytest-quantum handles pytest native cross framework
        equivalence. What is not addressed anywhere is the{" "}
        <strong className="text-foreground">cross SDK, automated detection, pytest native, reusable packaging</strong>{" "}
        combination specifically. The state aware / autonomous agent angle remains open, but it is the
        least load bearing part of the idea (no adjacent prior art at all, positive or negative) and should be
        treated as a possible <em>extension</em>, not the primary thesis.
      </P>

      <H2>14. What evidence would still be required before a publication quality novelty claim?</H2>
      <ul className="mb-4 flex flex-col gap-2 pl-6 text-muted [&>li]:list-disc">
        <li>Direct confirmation or retraction of the originally cited &ldquo;two arXiv papers&rdquo;, the actual intended IDs, if they exist, were never supplied to this research pass.</li>
        <li>A systematic, non English limited literature search, active Chinese- and German language quantum software engineering research communities may hold unindexed prior art.</li>
        <li>Citation graph tracing from QUTest and the &ldquo;cart&rdquo; pilot, both are very recent and may have follow up versions or related work sections that further narrow or widen the gap.</li>
        <li>DOI resolver verified checks of the QCEC and Bugs4Q journal citations (currently verified only via repo citation blocks / citing papers).</li>
        <li>An adoption/usage audit (download counts, dependent repos, citation counts) for QUTest, cart, pytest-quantum, and qtest-quantum.</li>
        <li>A working prototype comparison: run the same test suite against two SDK versions of two different quantum SDKs and confirm no existing tool does this end to end.</li>
      </ul>

      <H2>Recommendation</H2>
      <SynthesisNote>
        <P>
          The evidence does <strong>not</strong> support the original framing of the research gap as stated.
          Multiple substantial pieces of the proposed system already exist, some published within the last
          three months of this research date. The 31% statistic is real but was being used, in the original
          framing, to imply an evidentiary gap in tooling when it actually measures a gap in practitioner
          adoption/awareness, a different claim. The &ldquo;two arXiv papers&rdquo; as originally referenced
          could not be verified at all.
        </P>
        <P>
          The idea is not dead, but it must be reframed narrowly around the cross SDK + automated detection +
          pytest native + reusable packaging combination identified in Section 13, explicitly positioned as
          building on, not competing with. MQT QCEC, Bugs4Q, and QUTest.
        </P>
      </SynthesisNote>

      <Cite>Full document with inline evidence citations: research/gap_analysis.md in the GitHub repository</Cite>
      <P>
        <SourceLink href={researchFileUrl("research/gap_analysis.md")}>research/gap_analysis.md</SourceLink>
      </P>
    </>
  );
}
