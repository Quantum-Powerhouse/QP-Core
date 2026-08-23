import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { TOOLING } from "@/lib/field/tooling";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Open-Source Quantum Tooling — Qiskit 2.0, OpenQASM 3, CUDA-Q, Stim",
  description:
    "What a quantum software engineer installs, with licenses and release facts from the repositories: Qiskit 2.0 (March 2025), the OpenQASM 3.1 specification, NVIDIA's CUDA-Q, Google's Stim stabilizer simulator, and a dated adoption snapshot.",
  path: "/field/tooling",
  keywords: ["Qiskit 2.0", "OpenQASM 3", "CUDA-Q", "Stim simulator", "quantum SDK comparison", "open source quantum software"],
  ogTitle: "Open-Source Tooling",
});

export default function ToolingPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · tooling</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Open-source tooling</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        The stack behind the{" "}
        <Link href="/field/careers" className="text-accent">software-engineer roles</Link>. This site&apos;s own tools
        sit inside it: the{" "}
        <Link href="/playground/qp-core" className="text-accent">transpiler</Link> speaks OpenQASM and targets
        Braket, the{" "}
        <Link href="/lab" className="text-accent">Circuit Lab</Link> exports OpenQASM 2.0, and{" "}
        <a href="https://github.com/sadeqisaidmohaddes-star/pytest-qequiv" className="text-accent" target="_blank" rel="noopener noreferrer">pytest-qequiv</a>{" "}
        asserts Qiskit, Cirq and Braket circuits agree. Licenses and dates below come from the repositories themselves.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The frameworks</h2>
      <div className="mt-4 flex flex-col gap-4">
        {TOOLING.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/research/prior-art" className="text-accent underline-offset-2 hover:underline">Prior-art matrix — the testing tools, checked</Link></li>
          <li><Link href="/research/claims" className="text-accent underline-offset-2 hover:underline">Claim C14 — Benchpress</Link></li>
          <li><Link href="/field/hardware" className="text-accent underline-offset-2 hover:underline">Hardware scoreboard — where Stim&apos;s thresholds get tested</Link></li>
        </ul>
      </section>
    </>
  );
}
