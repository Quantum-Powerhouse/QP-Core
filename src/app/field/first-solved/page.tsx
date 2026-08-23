import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { FIRST_SOLVED, FIRST_SOLVED_TIERS } from "@/lib/field/firstSolved";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "What Gets Solved First: Quantum Applications by Evidence",
  description:
    "By expert consensus (Hoefler/Häner/Troyer, CACM 2023; Microsoft resource estimates) the first practical quantum advantage lands in chemistry and materials via hybrid workflows, not general optimization or AI. Sourced, with the hype separated out.",
  path: "/field/first-solved",
  keywords: ["quantum advantage chemistry", "what will quantum computers solve first", "quantum optimization hype", "Hoefler Troyer quantum advantage"],
  ogTitle: "What Gets Solved First",
});

export default function FirstSolvedPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · applications</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What gets solved first</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        The expert answer is narrower and more technical than the popular one: simulating quantum systems,         molecules and materials, through hybrid quantum-classical workflows, because nature is the problem class
        where the speedup is exponential and the input is small. The rest is sorted below by the strength of its
        evidence. The longer, sourced map is on the{" "}
        <Link href="/applications" className="text-accent">applications page</Link>.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {FIRST_SOLVED.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {FIRST_SOLVED_TIERS.map((t, i) => (
          <section key={t.tier} className="glass-panel rounded-xl p-5">
            <h2 className={`font-mono text-xs uppercase tracking-widest ${i === 0 ? "text-accent" : i === 1 ? "text-[#f59e0b]" : "text-[#ff6b6b]"}`}>{t.tier}</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              {t.items.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted">
        Want to feel the credible case rather than read it: the{" "}
        <Link href="/playground/vqe-suite" className="text-accent">VQE suite</Link> solves H₂ to chemical accuracy in
        your browser, the same idea the 2029 roadmaps intend to run at a million physical qubits.
      </p>
      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/applications" className="text-accent underline-offset-2 hover:underline">The full applications map</Link></li>
          <li><Link href="/field/open-problems" className="text-accent underline-offset-2 hover:underline">Why ML advantage is unproven: dequantization</Link></li>
          <li><Link href="/playground/vqe-suite" className="text-accent underline-offset-2 hover:underline">Run a real molecule</Link></li>
        </ul>
      </section>
    </>
  );
}
