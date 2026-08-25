import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { OPEN_PROBLEMS } from "@/lib/field/openProblems";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Open Problems in Quantum Computing: What Remains Unproven",
  description:
    "The unresolved questions that decide what the hardware is for: BQP versus NP and the polynomial hierarchy, the quantum PCP conjecture, dequantization of claimed speedups, the threshold theorem's noise assumptions, and whether NISQ era devices deliver useful advantage, each with the paper that framed it.",
  path: "/field/open-problems",
  keywords: ["BQP vs NP", "quantum PCP conjecture", "dequantization Tang", "threshold theorem", "NISQ advantage open problem"],
  ogTitle: "Open Problems",
});

export default function OpenProblemsPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · theory</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Open problems</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Every verified result on the{" "}
        <Link href="/field/hardware" className="text-accent">scoreboard</Link> lives inside a theory with holes in it.
        These are the holes, stated as the papers that opened them state them, with no guess about how they close.
        The &ldquo;verified&rdquo; tag here means the problem&apos;s status as open is documented, not that it is solved.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The questions</h2>
      <div className="mt-4 flex flex-col gap-4">
        {OPEN_PROBLEMS.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/applications" className="text-accent underline-offset-2 hover:underline">Applications map, written under these open questions</Link></li>
          <li><Link href="/field/timeline" className="text-accent underline-offset-2 hover:underline">The timeline debate</Link></li>
          <li><Link href="/playground/arcade#grover-searchlight" className="text-accent underline-offset-2 hover:underline">Grover, a provable speedup you can run</Link></li>
          <li><Link href="/lab" className="text-accent underline-offset-2 hover:underline">Circuit Lab, noise versus the threshold, by hand</Link></li>
        </ul>
      </section>
    </>
  );
}
