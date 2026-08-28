import type { Metadata } from "next";
import Link from "next/link";
import { StatusLegend } from "@/components/field/FieldClaimCard";
import { HARDWARE_STATE } from "@/lib/field/hardware";
import { FIELD_CHECKED_ON } from "@/lib/field/types";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "The Field: Quantum Computing's Real State, Sourced",
  description:
    "Hardware scoreboard in logical qubits and fidelities, post quantum cryptography deadlines, what gets solved first, the timeline debate, and careers, every claim tagged verified, projection, opinion or contested, with a primary source.",
  path: "/field",
  keywords: ["quantum computing state 2026", "logical qubits scoreboard", "post quantum cryptography timeline", "quantum computing careers", "quantum timeline debate"],
  ogTitle: "The Field",
});

const SECTIONS = [
  { href: "/field/hardware", title: "Hardware scoreboard", blurb: "Logical qubits, fidelities, code distance, results vs roadmaps, 2023-2026." },
  { href: "/field/pqc", title: "Post quantum cryptography", blurb: "NIST's standards and deadlines, Mosca's inequality, the falling cost of breaking RSA-2048, and what isn't at risk." },
  { href: "/field/first-solved", title: "What gets solved first", blurb: "Chemistry and materials by expert consensus; optimization and ML with caveats; and the problems that aren't quantum." },
  { href: "/field/timeline", title: "The timeline debate", blurb: "Named people, dated quotes, both directions, weighted the way the evidence is." },
  { href: "/field/careers", title: "Careers", blurb: "A ~16,500-person specialist market: roles, employers, degrees, and thin salary data, mapped to what this site already proves." },
  { href: "/field/networking", title: "Quantum networking", blurb: "From a 1,203 km satellite link to entanglement on live Berlin telecom fiber, and the repeater ingredients still being built." },
  { href: "/field/sensing", title: "Quantum sensing", blurb: "Clocks at 8 × 10⁻¹⁹ and two minute coherence: the quantum technology that ships today." },
  { href: "/field/strategies", title: "National strategies", blurb: "US reauthorization in progress, the UK's £2bn, the EU Quantum Act, and DARPA's referee program." },
  { href: "/field/tooling", title: "Open source tooling", blurb: "Qiskit 2.0, OpenQASM 3.1, CUDA-Q, Stim, what an engineer actually installs, with licenses and dates." },
  { href: "/field/open-problems", title: "Open problems", blurb: "BQP vs NP, quantum PCP, dequantization, the threshold theorem's assumptions, NISQ advantage, what remains unproven." },
];

export default function FieldOverviewPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The state of quantum computing, with receipts</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Same rule as the research wing: nothing is asserted that a reader can&apos;t open. Every card carries a status,         a published result is not a vendor announcement is not a roadmap is not an opinion, and the date of the
        underlying document. Last checked {FIELD_CHECKED_ON}.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <section className="glass-panel mt-10 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Where the hardware actually is</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {HARDWARE_STATE.map((s) => (
            <li key={s.label} className="flex gap-3 text-sm">
              <span className={`font-mono ${s.achieved ? "text-accent" : "text-[#996c0a]"}`}>{s.achieved ? "✓ achieved" : "✗ not yet"}</span>
              <span className="text-foreground">{s.label}</span>
              <span className="text-muted">, {s.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="glass-panel group rounded-xl p-5 transition-colors duration-150 ease-out hover:border-accent/60">
            <h3 className="text-base font-semibold text-foreground group-hover:text-accent">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.blurb}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
