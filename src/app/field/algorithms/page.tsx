import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { ALGORITHMS } from "@/lib/field/algorithms";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "The Algorithm Ledger: Which Quantum Speedups Are Proven",
  description:
    "Shor, Grover and the BBBV optimality bound, HHL with its read out conditions, Tang's dequantization, quantum simulation, VQE and QAOA's narrow guarantee, every claim read from its paper, three of them running live on this site.",
  path: "/field/algorithms",
  keywords: ["quantum algorithms proven speedups", "Shor factoring polynomial time", "Grover square root optimal", "HHL fine print", "dequantization Ewin Tang", "QAOA guarantee"],
  ogTitle: "The Algorithm Ledger",
});

export default function AlgorithmsPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · algorithms</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The algorithm ledger</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        What is actually proven, in which model, with the fine print kept. Each entry was read from the paper it
        cites, and the ones that fit in a browser run on this site: Grover in the{" "}
        <Link href="/playground/arcade#grover-searchlight" className="text-accent">arcade</Link>, VQE in the{" "}
        <Link href="/playground/vqe-suite" className="text-accent">suite</Link>, QAOA on a{" "}
        <Link href="/playground/arcade#qaoa-maxcut" className="text-accent">four node ring</Link>, and the Fourier
        interference behind Shor in the{" "}
        <Link href="/playground/arcade#qft-period-finder" className="text-accent">period finder</Link>.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The ledger</h2>
      <div className="mt-4 flex flex-col gap-4">
        {ALGORITHMS.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/field/open-problems" className="text-accent underline-offset-2 hover:underline">Open problems, where the proofs run out</Link></li>
          <li><Link href="/field/first-solved" className="text-accent underline-offset-2 hover:underline">What gets solved first</Link></li>
          <li><Link href="/field/pqc" className="text-accent underline-offset-2 hover:underline">Post quantum cryptography, Shor&apos;s consequence</Link></li>
          <li><Link href="/glossary" className="text-accent underline-offset-2 hover:underline">Glossary</Link></li>
        </ul>
      </section>
    </>
  );
}
