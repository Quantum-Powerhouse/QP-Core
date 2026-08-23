import type { Metadata } from "next";
import Link from "next/link";
import { CircuitLab } from "@/components/lab/CircuitLab";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { softwareApplicationSchema } from "@/lib/jsonld";
import { SITE_URL, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Circuit Lab — Build Quantum Circuits and Watch the Exact State",
  description:
    "A real quantum circuit sandbox: place gates on up to 5 qubits, see the exact statevector (amplitudes, phases, per-qubit Bloch vectors), dial in depolarizing noise on an exact density matrix, sample shots, and export OpenQASM to the site's transpiler.",
  path: "/lab",
  keywords: ["quantum circuit simulator browser", "build quantum circuit online", "statevector visualizer", "quantum noise simulator", "OpenQASM export"],
  ogTitle: "Circuit Lab",
});

export default function LabPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <p className="mb-2 font-mono text-sm text-accent">Lab</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Circuit Lab</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          The games teach one idea each. This is the open bench. Build any circuit on up to five qubits and watch the
          exact state answer every change — amplitudes with phases, each qubit&apos;s Bloch vector, the density matrix
          under noise, and real sampled measurements. Nothing here is pre-rendered: the engine runs on every click.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Intuition to form: put a gate in, watch the bars. Add a CNOT and see a qubit&apos;s Bloch arrow shrink to
          nothing — entanglement, measured. Turn up noise and watch purity fall; that is what{" "}
          <Link href="/playground/arcade#repetition-rescue" className="text-accent">error correction</Link> fights and{" "}
          <Link href="/docs/vqe-suite/zero-noise-extrapolation" className="text-accent">ZNE</Link> extrapolates away.
          Start from the{" "}
          <Link href="/learn" className="text-accent">learning path</Link> if the gates are new.
        </p>
        <div className="mt-10">
          <CircuitLab />
        </div>
      </main>
      <SiteFooter />
      <JsonLd
        data={softwareApplicationSchema({
          name: "Circuit Lab",
          description: "An exact in-browser quantum circuit sandbox with statevector, noise (density matrix), sampling and OpenQASM export.",
          applicationCategory: "EducationalApplication",
          url: `${SITE_URL}/lab`,
          keywords: ["quantum circuit", "statevector", "density matrix", "OpenQASM"],
        })}
      />
    </div>
  );
}
