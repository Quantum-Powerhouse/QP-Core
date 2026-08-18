import type { Metadata } from "next";
import { DocTitle } from "@/components/docs/DocElements";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Documentation",
  description:
    "Technical documentation for Quantum Powerhouse: how QP-Core compiles OpenQASM to Amazon Braket IR, and the physics behind the VQE Suite's Hamiltonian, ansatz, and Zero-Noise Extrapolation.",
  path: "/docs",
});

const DOCS = [
  {
    href: "/docs/qp-core/transpiler-pipeline",
    title: "QP-Core: Transpiler Pipeline",
    description:
      "How an OpenQASM 2/3 circuit becomes Amazon Braket IR — parsing, Qiskit's optimization passes, and IR emission.",
  },
  {
    href: "/docs/vqe-suite/hamiltonian-and-ansatz",
    title: "VQE Suite: Hamiltonian & Ansatz",
    description:
      "The H2 second-quantized Hamiltonian, its Jordan-Wigner-reduced 2-qubit form, and why the minimal ansatz circuit is exact for this problem.",
  },
  {
    href: "/docs/vqe-suite/zero-noise-extrapolation",
    title: "VQE Suite: Zero-Noise Extrapolation",
    description:
      "Depolarizing noise, digital gate folding, and Richardson extrapolation — with real numbers from the shipped implementation.",
  },
];

export default function DocsIndexPage() {
  return (
    <>
      <DocTitle
        eyebrow="Documentation"
        title="How it actually works"
        dek="Written against the real, shipped source — every equation, code excerpt, and number here is either derived on the page or pulled directly from the repository it describes."
      />
      <div className="flex flex-col gap-4">
        {DOCS.map((doc) => (
          <a
            key={doc.href}
            href={doc.href}
            className="group rounded-xl border border-border bg-surface/60 p-5 transition-colors hover:border-accent/50"
          >
            <h2 className="text-lg font-semibold text-foreground group-hover:text-accent">{doc.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{doc.description}</p>
          </a>
        ))}
      </div>
    </>
  );
}
