import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { STRATEGIES } from "@/lib/field/strategies";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "National Quantum Strategies: Money, Dates, and the Referee",
  description:
    "Where public quantum money is going and on what terms: the US National Quantum Initiative reauthorization in progress, the UK's £2.5bn strategy and £2bn 2026 package, the EU Quantum Act planned for 2026, and DARPA's Quantum Benchmarking Initiative with 11 companies in Stage B toward a 2033 utility-scale verdict.",
  path: "/field/strategies",
  keywords: ["National Quantum Initiative Reauthorization", "DARPA Quantum Benchmarking Initiative", "EU Quantum Act", "UK National Quantum Strategy", "quantum funding 2026"],
  ogTitle: "National Quantum Strategies",
});

export default function StrategiesPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · policy</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">National strategies</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Governments fund quantum for the same two reasons the{" "}
        <Link href="/field/pqc" className="text-accent">cryptography section</Link> exists: the threat and the
        prize. The entries below are dated commitments and legislative status, a bill in committee is labeled a
        projection, a signed appropriation a verified fact, plus the one program designed to referee vendor claims.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">Programs and legislation</h2>
      <div className="mt-4 flex flex-col gap-4">
        {STRATEGIES.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/field/timeline" className="text-accent underline-offset-2 hover:underline">The timeline debate, the claims QBI will referee</Link></li>
          <li><Link href="/field/hardware" className="text-accent underline-offset-2 hover:underline">Hardware scoreboard, the QBI Stage B companies&apos; results</Link></li>
          <li><Link href="/field/careers" className="text-accent underline-offset-2 hover:underline">Careers, what this money hires</Link></li>
        </ul>
      </section>
    </>
  );
}
