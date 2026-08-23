import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { SENSING } from "@/lib/field/sensing";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Quantum Sensing: Clocks, Coherence, and What Ships Today",
  description:
    "The quantum technology already in products: JILA's strontium clock at 8.1 × 10⁻¹⁹ systematic uncertainty, two-minute atomic coherence with 1.5 × 10⁻¹⁸ instability at one second, and a readiness picture for clocks versus gravimeters.",
  path: "/field/sensing",
  keywords: ["quantum sensing", "optical lattice clock", "strontium clock 10^-19", "quantum gravimeter", "atomic coherence"],
  ogTitle: "Quantum Sensing",
});

export default function SensingPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · sensing</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Quantum sensing</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Not computing, measuring. Sensing uses the same fragility that makes qubits hard to compute with (they
        respond to everything) as the signal. It is the branch of quantum technology with commercial products now,
        and the clocks below are the most precise instruments humans have built.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">Records and readiness</h2>
      <div className="mt-4 flex flex-col gap-4">
        {SENSING.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/applications" className="text-accent underline-offset-2 hover:underline">Applications map, sensing as the near-term win</Link></li>
          <li><Link href="/playground/arcade#measurement-duel" className="text-accent underline-offset-2 hover:underline">Measurement Duel, a measurement is a question</Link></li>
          <li><Link href="/field/strategies" className="text-accent underline-offset-2 hover:underline">The UK&apos;s £400m for sensing and navigation</Link></li>
        </ul>
      </section>
    </>
  );
}
