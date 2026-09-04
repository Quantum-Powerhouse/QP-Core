import type { Metadata } from "next";
import Link from "next/link";
import { getResearchStats } from "@/lib/research/stats";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Replication: Rerun This Study, or Break It",
  description:
    "The full recipe to reproduce the quantum CI/CD gap study: the machine readable evidence record, the decision rules that assigned every verdict, and the exact counterexamples that would falsify each major claim.",
  path: "/research/replication",
  keywords: ["reproduce quantum research", "falsifiability software study", "evidence record JSON", "replication pack", "quantum CI/CD study"],
  ogTitle: "Replication",
});

const EVIDENCE_RAW = "https://raw.githubusercontent.com/sadeqisaidmohaddes-star/quantum-cicd-research/master/research/evidence.json";
const RELEASE = "https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research/releases/tag/v1.1.1";

export default function ReplicationPage() {
  const stats = getResearchStats();
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">Research · replication</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Rerun this study, or break it</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        A study you cannot rerun is an anecdote. This page is the recipe: the machine readable record behind all{" "}
        {stats.totalClaims} claims, the rules that assigned every verdict, and, most usefully, exactly what evidence
        would prove this study wrong. If you find it, open an issue and the record changes.
      </p>

      <section className="glass-panel mt-8 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">The record, machine readable</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Every claim, verdict, source URL and check date lives in one portable JSON file, the same file this site
          renders from and cross checks in CI on every push. Take it, parse it, re open every source.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={EVIDENCE_RAW} className="rounded-full bg-accent px-4 py-2 font-mono text-xs font-semibold text-[#fafaf7]" target="_blank" rel="noopener noreferrer">
            evidence.json (raw) ↗
          </a>
          <a href={RELEASE} className="rounded-full border border-border px-4 py-2 font-mono text-xs text-foreground hover:border-accent/60" target="_blank" rel="noopener noreferrer">
            versioned release ↗
          </a>
          <Link href="/research/claims" className="rounded-full border border-border px-4 py-2 font-mono text-xs text-foreground hover:border-accent/60">
            rendered claims table
          </Link>
        </div>
      </section>

      <section className="glass-panel mt-6 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">The decision rules</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-muted">
          <li>A claim is <strong className="text-foreground">confirmed</strong> only when its primary source was opened directly: the repository, the CI configuration file, the arXiv full text or the DOI record, never a search snippet or an abstract of an abstract.</li>
          <li>A claim of <strong className="text-foreground">absence</strong> (no tool does X) is recorded with the searches that failed to find it, and stays falsifiable by a single counterexample.</li>
          <li>When the evidence contradicted the starting hypothesis, the hypothesis moved, not the evidence. Two starting assumptions are recorded as false.</li>
          <li>Vendor numbers stay labeled vendor reported. Preprints stay labeled preprints. Nothing is promoted by enthusiasm.</li>
        </ul>
      </section>

      <section className="glass-panel mt-6 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">How to falsify it</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The load bearing conclusions, and the single finding that would break each one:
        </p>
        <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-foreground">The surviving gap claim.</strong> Find one tool, released before the
            check date, that is pytest native, works across SDKs, automatically detects equivalence or regression
            failures, and ships as reusable CI packaging, all four at once. One example ends the central claim, and
            the study says so in its own gap analysis.
          </li>
          <li>
            <strong className="text-foreground">Cross version regression testing already exists.</strong> Show that
            QUTest does not do what its paper and repository state, or that the cited CI output is not real.
          </li>
          <li>
            <strong className="text-foreground">Benchpress detects nothing.</strong> Find assertion or detection logic
            in its harness beyond benchmarking, with a file path.
          </li>
          <li>
            <strong className="text-foreground">The corrected bug corpus count.</strong> Produce a resolvable version
            of Bugs4Q with a different entry count than the recorded 36 and 42.
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          Found one? Open an issue on the{" "}
          <a href="https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research/issues" className="text-accent" target="_blank" rel="noopener noreferrer">
            research repository
          </a>
          . The record versions forward; being corrected in public is the point of keeping one.
        </p>
      </section>

      <section className="glass-panel mt-6 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Known limits</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The search was English language, so non English tooling may be underrepresented; one German language
          adjacent result is noted in the record. No empirical prototype comparison has been run yet, the companion
          tool exists but has not been benchmarked head to head against the systems in the prior art matrix. Those
          limits are stated in <Link href="/research/paper" className="text-accent">the paper</Link> too, because a
          reviewer would find them in five minutes anyway.
        </p>
      </section>
    </>
  );
}
