import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { NETWORKING, NETWORKING_CONTEXT } from "@/lib/field/networking";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Quantum Networking — Entanglement Distribution, Sourced",
  description:
    "Verified milestones toward a quantum internet: Micius's 1,203 km satellite link, Harvard/AWS memory nodes over 35 km of Boston fiber, entanglement coexisting with classical traffic on Deutsche Telekom's Berlin network, and 8,235-mode quantum storage in Geneva — with what a repeater network still needs.",
  path: "/field/networking",
  keywords: ["quantum internet", "entanglement distribution", "quantum repeater", "quantum network fiber", "Micius satellite entanglement"],
  ogTitle: "Quantum Networking",
});

export default function NetworkingPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · networking</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Quantum networking</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        A quantum network moves entanglement, not bits — the resource behind{" "}
        <Link href="/field/pqc" className="text-accent">quantum key distribution</Link>, distributed sensing, and
        eventually linking processors. The record below runs from a satellite to a live telecom network; the Bell
        tests these papers report are the same experiment the arcade&apos;s{" "}
        <Link href="/playground/arcade#chsh-beat-the-classical-bound" className="text-accent">CHSH game</Link> lets you sample.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">Milestones, by distance and by ingredient</h2>
      <div className="mt-4 flex flex-col gap-4">
        {NETWORKING.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <section className="glass-panel mt-10 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[#f59e0b]">What is not yet built</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{NETWORKING_CONTEXT.notYet}</p>
      </section>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/field/pqc" className="text-accent underline-offset-2 hover:underline">Post-quantum cryptography — why QKD matters</Link></li>
          <li><Link href="/playground/arcade#entangled-dice" className="text-accent underline-offset-2 hover:underline">Entangled Dice — correlation without communication</Link></li>
          <li><Link href="/field/strategies" className="text-accent underline-offset-2 hover:underline">The UK&apos;s £125m for networking</Link></li>
        </ul>
      </section>
    </>
  );
}
