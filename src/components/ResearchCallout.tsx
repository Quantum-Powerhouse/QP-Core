import Link from "next/link";
import { getResearchStats } from "@/lib/research/stats";

/**
 * The homepage's research callout states the finding on the homepage.
 * Every number derives from the same data the research pages render.
 */
export function ResearchCallout() {
  const stats = getResearchStats();
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Research · primary-source-verified</p>
        <h2 className="mt-2 max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
          Is there a genuine gap in CI/CD regression testing for quantum software?
        </h2>
        <div className="mt-5 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="text-sm leading-relaxed text-muted">
            <p>
              The finding was narrower than the hypothesis. Cross-<em>version</em> regression testing already exists
              (QUTest, 2026, Qiskit only). Pytest-native cross-SDK harnesses exist for <em>benchmarking</em> (IBM&apos;s
              Benchpress, eight SDKs) but detect nothing. Pytest plugins that assert equivalence exist but are immature
              and not cross-version. No tool combined pytest-native, cross-SDK, automated equivalence or regression
              detection, and reusable CI packaging.
            </p>
            <p className="mt-3">
              The one gap that survived became a tool,{" "}
              <a href="https://github.com/sadeqisaidmohaddes-star/pytest-qequiv" className="text-accent" target="_blank" rel="noopener noreferrer">
                pytest-qequiv
              </a>,
              cross-SDK unitary equivalence assertions for Qiskit, Cirq and Braket with endianness normalization.
              The study also corrected two of its own starting assumptions in public (a bug corpus does exist; the
              31% adoption statistic is N = 26).
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/research/gap-analysis" className="rounded-full bg-accent px-4 py-2 font-mono text-xs font-semibold text-[#041014]">
                read the gap analysis
              </Link>
              <Link href="/research/paper" className="rounded-full border border-border px-4 py-2 font-mono text-xs text-foreground hover:border-accent/60">
                the paper &amp; how to cite
              </Link>
              <Link href="/research/claims" className="rounded-full border border-border px-4 py-2 font-mono text-xs text-foreground hover:border-accent/60">
                claims table
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 self-start">
            {[
              { v: String(stats.totalClaims), l: "claims, each with a verdict" },
              { v: String(stats.priorArtSystems), l: "prior-art systems inspected" },
              { v: String(stats.uniqueSourcesLinked), l: "primary sources linked" },
              { v: String(stats.claimsByStatus.false), l: "starting assumptions found false" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col">
                <dd className="font-mono text-3xl text-accent">{s.v}</dd>
                <dt className="mt-1 text-xs leading-snug text-muted">{s.l}</dt>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-5 font-mono text-[11px] text-muted">
          Continuous integration fails the build if a rendered claim ever drifts from the evidence record.
        </p>
      </div>
    </section>
  );
}
