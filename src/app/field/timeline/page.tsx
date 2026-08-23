import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { TIMELINE_OPTIMISTS, TIMELINE_SKEPTICS } from "@/lib/field/timeline";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "The Timeline Debate: Named Optimists and Skeptics, Dated",
  description:
    "When will useful quantum computers arrive? Hartmut Neven, IBM, Scott Aaronson vs Jensen Huang, Gil Kalai, Sankar Das Sarma, real quotes with dates and sources, and a record of how lopsided the evidence has become.",
  path: "/field/timeline",
  keywords: ["quantum computing timeline debate", "Aaronson quantum optimistic 2025", "Gil Kalai skeptic", "Jensen Huang quantum 15 30 years", "Neven five years"],
  ogTitle: "The Timeline Debate",
});

export default function TimelinePage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · the debate</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The timeline debate</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Real people, real dates. Two things to hold at once: the <em>results</em> on the{" "}
        <Link href="/field/hardware" className="text-accent">hardware scoreboard</Link>, below-threshold error
        correction, logical qubits beating physical, are verified and no longer seriously disputed; and every
        statement on this page about <em>when</em> useful machines arrive is a prediction or an opinion. The two
        columns are not the same length because the evidence is not symmetric: after 2024-2026, principled
        impossibility skepticism is a minority position, while disagreement about timing and scaling economics is
        live.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Sooner</h2>
          <div className="mt-3 flex flex-col gap-4">
            {TIMELINE_OPTIMISTS.map((c) => (
              <FieldClaimCard key={c.id} claim={c} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#f59e0b]">Later, or never</h2>
          <div className="mt-3 flex flex-col gap-4">
            {TIMELINE_SKEPTICS.map((c) => (
              <FieldClaimCard key={c.id} claim={c} />
            ))}
          </div>
        </section>
      </div>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">What is actually settled, and what isn&apos;t</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
          <li>
            <span className="font-mono text-accent">settled ·</span> Error correction works below threshold on at least two platforms; encoded qubits can outperform physical ones. (Verified results, 2024-2026.)
          </li>
          <li>
            <span className="font-mono text-[#f59e0b]">open ·</span> Whether the 2027-2030 roadmaps land on time, they require scaling by one to two orders of magnitude while holding fidelities.
          </li>
          <li>
            <span className="font-mono text-[#f59e0b]">open ·</span> Which application first shows a reproduced, independently benchmarked advantage (see <Link href="/field/first-solved" className="text-accent">what gets solved first</Link>).
          </li>
          <li>
            <span className="font-mono text-[#ff6b6b]">minority ·</span> That correlated noise forbids scaling in principle (Kalai). Not refuted by theorem; increasingly constrained by experiment.
          </li>
        </ul>
      </section>
      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/field/hardware" className="text-accent underline-offset-2 hover:underline">Hardware scoreboard, the verified results</Link></li>
          <li><Link href="/field/strategies" className="text-accent underline-offset-2 hover:underline">DARPA QBI: utility-scale by 2033?</Link></li>
          <li><Link href="/field/open-problems" className="text-accent underline-offset-2 hover:underline">NISQ advantage, still an open question</Link></li>
        </ul>
      </section>
    </>
  );
}
