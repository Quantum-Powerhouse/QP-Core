import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VqeSuiteStudio } from "@/components/vqe/VqeSuiteStudio";
import { softwareApplicationSchema } from "@/lib/jsonld";
import { SITE_URL, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "VQE Suite: Qiskit-Style H2 Variational Eigensolver + ZNE Playground",
  description:
    "Live VQE Suite playground — a real variational quantum eigensolver for the H2 molecule with a chemical-accuracy convergence curve, plus a Zero-Noise Extrapolation (ZNE) error-mitigation panel, both simulated in the browser.",
  path: "/playground/vqe-suite",
  keywords: [
    "Qiskit VQE benchmark suite",
    "Quantum Zero Noise Extrapolation toolkit",
    "variational quantum eigensolver",
    "Richardson extrapolation quantum",
    "NISQ error mitigation",
  ],
  ogTitle: "VQE Suite + ZNE Playground",
});

export default function VqeSuitePlaygroundPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 pt-16">
          <p className="mb-2 font-mono text-sm text-accent">Playground</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">VQE Suite</h1>
          <p className="mt-4 max-w-2xl text-muted">
            A hardware-efficient variational quantum eigensolver for molecular hydrogen, plus a
            NISQ error-mitigation panel demonstrating Zero-Noise Extrapolation — both running as
            real simulations in your browser.
          </p>
        </div>
        <VqeSuiteStudio />
      </main>
      <SiteFooter />
      <JsonLd
        data={softwareApplicationSchema({
          name: "Quantum Powerhouse VQE Suite",
          description:
            "A Qiskit-style variational quantum eigensolver for molecular ground-state energy estimation, with a Zero-Noise Extrapolation error-mitigation toolkit.",
          applicationCategory: "DeveloperApplication",
          url: `${SITE_URL}/playground/vqe-suite`,
          keywords: [
            "Qiskit VQE benchmark suite",
            "Quantum Zero Noise Extrapolation toolkit",
            "variational quantum eigensolver",
          ],
        })}
      />
    </div>
  );
}
