import type { Metadata } from "next";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { HARDWARE_MILESTONES, HARDWARE_ROADMAPS, HARDWARE_STATE } from "@/lib/field/hardware";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Hardware Scoreboard — Logical Qubits, Fidelity, Code Distance (2023–2026)",
  description:
    "Quantum hardware progress scored the honest way: logical qubits, gate fidelity and code distance. Google Willow, Quantinuum Helios, Harvard/QuEra, Microsoft — verified results separated from vendor roadmaps from IBM, Quantinuum, IonQ and PsiQuantum.",
  path: "/field/hardware",
  keywords: ["logical qubits 2026", "below threshold error correction", "Google Willow", "Quantinuum Helios", "IBM Starling roadmap", "quantum hardware scoreboard"],
  ogTitle: "Hardware Scoreboard",
});

export default function HardwarePage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · hardware</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Hardware scoreboard</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Physical qubit counts are a marketing number. The metrics that predict a useful machine are logical qubits,
        gate fidelity, and how logical error falls with code distance. Results below are tagged by what they are.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <section className="glass-panel mt-8 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Three different sentences</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {HARDWARE_STATE.map((s) => (
            <li key={s.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <span className={`shrink-0 font-mono ${s.achieved ? "text-accent" : "text-[#f59e0b]"}`}>{s.achieved ? "✓ achieved" : "✗ not yet"}</span>
              <span>
                <span className="text-foreground">{s.label}</span> <span className="text-muted">— {s.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mt-12 text-xl font-semibold text-foreground">Milestones, 2023–2026</h2>
      <p className="mt-1 mb-5 text-sm text-muted">Chronological. A vendor blog is a real source for what a vendor measured — it is not peer review, and the tag says so.</p>
      <div className="flex flex-col gap-4">
        {HARDWARE_MILESTONES.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-foreground">Roadmaps — promises with dates</h2>
      <p className="mt-1 mb-5 text-sm text-muted">
        None of these has happened. They are listed because they are the claims the industry will be measured against,
        and because their spread — from IBM&apos;s 200 logical qubits to IonQ&apos;s 80,000 in the same year — is itself
        informative.
      </p>
      <div className="flex flex-col gap-4">
        {HARDWARE_ROADMAPS.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>
    </>
  );
}
